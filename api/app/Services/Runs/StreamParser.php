<?php

namespace App\Services\Runs;

/**
 * Turns Claude Code `--output-format stream-json` lines into short, readable events
 * and keeps the facts the job needs (session id, final result).
 */
class StreamParser
{
    public ?string $sessionId = null;

    /** @var array<string, mixed>|null the final {"type":"result"} message */
    public ?array $result = null;

    /** Friendly step names for the commands Claude runs. Order matters: first match wins. */
    private const STEPS = [
        'import-voice' => 'Importing voice',
        'splice-words' => 'Fixing captions',
        'align-captions' => 'Aligning captions',
        'npm run new' => 'Creating project',
        'typecheck' => 'Checking code',
        'npx tsc' => 'Checking code',
        'remotion still' => 'Making thumbnail',
        'thumbs:' => 'Making thumbnail',
        'npm run render' => 'Rendering',
        'remotion render' => 'Rendering',
        'npm run frames' => 'Checking frames',
        'extract-frames' => 'Checking frames',
        'ebur128' => 'Checking loudness',
        'zip ' => 'Packing source',
        'ffprobe' => 'Reading audio',
    ];

    /**
     * @return list<array{type: string, message: ?string, step: ?string, payload: ?array<string, mixed>}>
     */
    public function parse(string $line): array
    {
        $line = trim($line);
        if ($line === '') {
            return [];
        }

        $data = json_decode($line, true);
        if (! is_array($data)) {
            return [$this->make('stderr', $line)];
        }

        return match ($data['type'] ?? null) {
            'system' => $this->system($data),
            'assistant' => $this->assistant($data),
            'user' => $this->toolResults($data),
            'result' => $this->finalResult($data),
            default => [],
        };
    }

    /** @param array<string, mixed> $data */
    private function system(array $data): array
    {
        if (($data['subtype'] ?? null) === 'init') {
            $this->sessionId = $data['session_id'] ?? $this->sessionId;

            return [$this->make('status', 'Claude started', null, ['model' => $data['model'] ?? null])];
        }

        if (($data['subtype'] ?? null) === 'permission_denied') {
            return [$this->make('denied', 'A tool call was blocked by the allowlist')];
        }

        return [];
    }

    /** @param array<string, mixed> $data */
    private function assistant(array $data): array
    {
        $events = [];
        foreach ($data['message']['content'] ?? [] as $block) {
            if (($block['type'] ?? null) === 'text' && trim($block['text'] ?? '') !== '') {
                $events[] = $this->make('text', trim($block['text']));
            }
            if (($block['type'] ?? null) === 'tool_use') {
                [$summary, $step] = $this->describeTool($block['name'] ?? 'tool', $block['input'] ?? []);
                $events[] = $this->make('tool', $summary, $step);
            }
        }

        return $events;
    }

    /** @param array<string, mixed> $data */
    private function toolResults(array $data): array
    {
        $events = [];
        foreach ($data['message']['content'] ?? [] as $block) {
            if (! is_array($block) || ($block['type'] ?? null) !== 'tool_result') {
                continue;
            }
            $content = $block['content'] ?? '';
            if (is_array($content)) {
                $content = collect($content)->map(fn ($c) => $c['text'] ?? '['.($c['type'] ?? 'data').']')->implode("\n");
            }
            $events[] = $this->make(
                ($block['is_error'] ?? false) ? 'tool_error' : 'tool_result',
                mb_substr(trim((string) $content), -1500), // the end of the output is the useful part
            );
        }

        return $events;
    }

    /** @param array<string, mixed> $data */
    private function finalResult(array $data): array
    {
        $this->result = $data;
        $this->sessionId = $data['session_id'] ?? $this->sessionId;

        return [$this->make('result', (string) ($data['result'] ?? ''), null, [
            'subtype' => $data['subtype'] ?? null,
            'is_error' => $data['is_error'] ?? false,
            'num_turns' => $data['num_turns'] ?? null,
            'total_cost_usd' => $data['total_cost_usd'] ?? null,
            'permission_denials' => count($data['permission_denials'] ?? []),
        ])];
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array{0: string, 1: ?string}
     */
    private function describeTool(string $name, array $input): array
    {
        if ($name === 'Bash') {
            $command = (string) ($input['command'] ?? '');
            foreach (self::STEPS as $needle => $step) {
                if (str_contains($command, $needle)) {
                    return ["$ {$command}", $step];
                }
            }

            return ["$ {$command}", null];
        }

        $path = (string) ($input['file_path'] ?? $input['path'] ?? $input['pattern'] ?? '');
        $step = match (true) {
            in_array($name, ['Write', 'Edit'], true) && str_contains($path, 'src/') => 'Writing scenes',
            in_array($name, ['Write', 'Edit'], true) && str_contains($path, 'plan.md') => 'Writing plan',
            $name === 'Read' && preg_match('/\.(png|jpe?g)$/i', $path) === 1 => 'Checking frames',
            default => null,
        };

        return [trim("{$name} {$path}"), $step];
    }

    /**
     * @param  array<string, mixed>|null  $payload
     * @return array{type: string, message: ?string, step: ?string, payload: ?array<string, mixed>}
     */
    private function make(string $type, ?string $message, ?string $step = null, ?array $payload = null): array
    {
        return ['type' => $type, 'message' => $message, 'step' => $step, 'payload' => $payload];
    }

    /** The RESULT {...} line Claude prints at the end of a build. */
    public static function extractResult(?string $text): ?array
    {
        if ($text === null || ! preg_match_all('/^\s*RESULT\s+(\{.*\})\s*$/m', $text, $m)) {
            return null;
        }

        $json = json_decode(end($m[1]), true);

        return is_array($json) && is_string($json['mp4'] ?? null) ? $json : null;
    }
}
