<?php

namespace Tests;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Safety net: refuse to run tests against a real database. This runs before
     * RefreshDatabase, which would otherwise wipe the tables.
     */
    public function createApplication(): Application
    {
        $app = parent::createApplication();

        $default = $app['config']->get('database.default');
        if ($default !== 'sqlite' || $app['config']->get('database.connections.sqlite.database') !== ':memory:') {
            fwrite(STDERR, "Refusing to run tests: database is '{$default}', expected sqlite :memory:.\n");
            exit(1);
        }

        return $app;
    }
}
