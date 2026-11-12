<?php

namespace App\Services\Runs;

use Closure;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;

/**
 * Runs `claude -p` headless in the engine and streams its stdout line by line.
 * The process gets its own process group (setsid) so cancel/timeout also stop
 * everything it started (npm, Remotion, Chromium, ffmpeg).
 */
class ClaudeProcess
{
    /**
     * @param  Closure(string): void  $onLine  called for every stdout/stderr line
     * @param  Closure(): bool  $shouldCancel  polled every ~2 s
     * @return array{exit_code: ?int, cancelled: bool, timed_out: bool}
     */
    public function run(string $prompt, ?string $resumeSession, int $maxTurns, Closure $onLine, Closure $shouldCancel): array
    {
        $config = config('yumetuli.claude');

        $command = [$config['bin'], '-p', $prompt,
            '--output-format', 'stream-json', '--verbose',
            '--max-turns', (string) $maxTurns,
            '--allowedTools', implode(',', $config['allowed_tools']),
            '--append-system-prompt', file_get_contents(resource_path('prompts/system.md')),
        ];
        if ($config['model']) {
            array_push($command, '--model', $config['model']);
        }
        if ($resumeSession) {
            array_push($command, '--resume', $resumeSession);
        }
        if (is_executable('/usr/bin/setsid')) {
            array_unshift($command, '/usr/bin/setsid');
        }

        $process = new Process($command, config('yumetuli.engine_path'), $this->environment(), '', $config['timeout']);
        $process->start();

        $out = '';
        $err = '';
        $cancelled = false;
        $timedOut = false;
        $lastCheck = microtime(true);

        try {
            while ($process->isRunning()) {
                $this->drain($process->getIncrementalOutput(), $out, $onLine);
                $this->drain($process->getIncrementalErrorOutput(), $err, $onLine);

                if (microtime(true) - $lastCheck >= 2) {
                    $lastCheck = microtime(true);
                    if ($shouldCancel()) {
                        $cancelled = true;
                        $this->killGroup($process);
                        break;
                    }
                }

                $process->checkTimeout();
                usleep(200_000);
            }
        } catch (ProcessTimedOutException) {
            $timedOut = true;
            $this->killGroup($process);
        }

        $this->drain($process->getIncrementalOutput(), $out, $onLine, flush: true);
        $this->drain($process->getIncrementalErrorOutput(), $err, $onLine, flush: true);

        return ['exit_code' => $process->getExitCode(), 'cancelled' => $cancelled, 'timed_out' => $timedOut];
    }

    /**
     * Claude gets a clean environment: no database, JWT, app or Reverb secrets from the worker.
     * Symfony merges with the parent environment, so every other variable is unset with `false`.
     *
     * @return array<string, string|false>
     */
    private function environment(): array
    {
        $keep = ['PATH', 'HOME', 'LANG', 'LC_ALL', 'TZ', 'TERM', 'CLAUDE_CODE_OAUTH_TOKEN', 'CLAUDE_CONFIG_DIR'];
        $env = [];
        foreach (array_keys(getenv()) as $name) {
            $env[$name] = in_array($name, $keep, true) ? getenv($name) : false;
        }
        $env['CI'] = '1';
        $env['LANG'] = getenv('LANG') ?: 'C.UTF-8';

        return $env;
    }

    /** @param Closure(string): void $onLine */
    private function drain(string $chunk, string &$buffer, Closure $onLine, bool $flush = false): void
    {
        $buffer .= $chunk;
        while (($pos = strpos($buffer, "\n")) !== false) {
            $onLine(substr($buffer, 0, $pos));
            $buffer = substr($buffer, $pos + 1);
        }
        if ($flush && $buffer !== '') {
            $onLine($buffer);
            $buffer = '';
        }
    }

    private function killGroup(Process $process): void
    {
        $pid = $process->getPid();
        if ($pid && function_exists('posix_kill')) {
            @posix_kill(-$pid, SIGTERM);
            for ($i = 0; $i < 50 && $process->isRunning(); $i++) {
                usleep(200_000);
            }
            if ($process->isRunning()) {
                @posix_kill(-$pid, SIGKILL);
            }
        }
        $process->stop(1);
    }
}
