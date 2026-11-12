<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('series', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique();
            $table->string('name', 120);
            $table->string('folder', 64);          // engine folder, e.g. design-patterns, hizibizi
            $table->string('logo_path')->nullable(); // engine public path, e.g. brand/hizibizi-logo.png
            $table->string('outro', 32)->nullable(); // devdiary | hizibizi
            $table->json('theme')->nullable();       // scenes.json theme defaults
            $table->text('rules')->nullable();       // markdown house rules passed to Claude
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('series');
    }
};
