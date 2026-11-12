<?php
// Strategy Pattern — পর্ব ২ (plain PHP 8+, no framework)
// Run: php strategy.php

declare(strict_types=1);

// Strategy interface
interface FlyBehavior
{
    public function fly(): string;
}

// Concrete strategies
class FlyWithWings implements FlyBehavior
{
    public function fly(): string
    {
        return "ডানা দিয়ে উড়ছি!";
    }
}

class FlyNoWay implements FlyBehavior
{
    public function fly(): string
    {
        return "আমি উড়তে পারি না।";
    }
}

// Context: Duck HAS-A FlyBehavior and delegates to it
class Duck
{
    private FlyBehavior $flyBehavior;

    public function __construct(FlyBehavior $flyBehavior)
    {
        $this->flyBehavior = $flyBehavior;
    }

    public function performFly(): string
    {
        return $this->flyBehavior->fly(); // delegation
    }

    public function setFlyBehavior(FlyBehavior $flyBehavior): void
    {
        $this->flyBehavior = $flyBehavior; // swap strategy at runtime
    }

    public function swim(): string
    {
        return "সাঁতার কাটছি";
    }
}

class MallardDuck extends Duck
{
}

class RubberDuck extends Duck
{
}

$mallard = new MallardDuck(new FlyWithWings());
$rubber = new RubberDuck(new FlyNoWay());

echo $mallard->performFly(), PHP_EOL; // ডানা দিয়ে উড়ছি!
echo $rubber->performFly(), PHP_EOL;  // আমি উড়তে পারি না।

// Same object, different behavior
$mallard->setFlyBehavior(new FlyNoWay());
echo $mallard->performFly(), PHP_EOL; // আমি উড়তে পারি না।
