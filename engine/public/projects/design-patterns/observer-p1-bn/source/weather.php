<?php
// Observer Pattern in PHP — Part 1 (plain PHP 8.1+, no framework)
// Run: php weather.php   → Current: 33°C, History: [30, 32]

declare(strict_types=1);

interface Observer
{
    public function update(float $temperature): void;
}

class CurrentDisplay implements Observer
{
    public float $temperature = 0;

    public function update(float $temperature): void
    {
        $this->temperature = $temperature; // show the latest number
    }
}

class HistoryDisplay implements Observer
{
    /** @var float[] */
    public array $readings = [];

    public function update(float $temperature): void
    {
        $this->readings[] = $temperature; // append a point to the graph
    }
}

class WeatherStation // the Subject
{
    /** @var Observer[] */
    private array $observers = [];

    public function subscribe(Observer $observer): void
    {
        $this->observers[] = $observer;
    }

    public function unsubscribe(Observer $observer): void
    {
        $this->observers = array_values(
            array_filter($this->observers, fn (Observer $o) => $o !== $observer)
        );
    }

    public function setTemperature(float $temperature): void
    {
        foreach ($this->observers as $observer) {
            $observer->update($temperature);
        }
    }
}

$station = new WeatherStation();
$currentDisplay = new CurrentDisplay();
$historyDisplay = new HistoryDisplay();

$station->subscribe($currentDisplay);
$station->subscribe($historyDisplay);

$station->setTemperature(30);  // both get 30
$station->setTemperature(32);  // both get 32

$station->unsubscribe($historyDisplay);
$station->setTemperature(33);  // only CurrentDisplay gets 33

echo 'Current: ', $currentDisplay->temperature, "°C\n";
echo 'History: [', implode(', ', $historyDisplay->readings), "]\n";

// Verify the numbers shown in the video
assert($currentDisplay->temperature === 33.0);
assert($historyDisplay->readings === [30.0, 32.0]);
if ($currentDisplay->temperature !== 33.0 || $historyDisplay->readings !== [30.0, 32.0]) {
    fwrite(STDERR, "FAIL\n");
    exit(1);
}
echo "PASS: current 33, history [30, 32]\n";
