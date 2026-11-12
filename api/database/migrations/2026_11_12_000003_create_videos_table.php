<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('series_id')->constrained()->restrictOnDelete();
            $table->string('title', 160);
            $table->string('slug', 120)->unique();   // engine project slug, e.g. hizibizi/rainbow-bn
            $table->string('language', 5);
            $table->text('context')->nullable();
            $table->longText('script');
            $table->unsignedSmallInteger('target_seconds')->nullable();
            $table->string('mode', 16)->default('agent');
            $table->string('status', 32)->default('draft')->index();
            $table->unsignedBigInteger('current_version_id')->nullable();
            $table->string('claude_session_id', 64)->nullable();
            $table->timestamps();
        });

        Schema::create('video_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('video_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('number');
            $table->text('feedback')->nullable();
            $table->string('mp4_path')->nullable();
            $table->string('zip_path')->nullable();
            $table->string('thumb_path')->nullable();
            $table->decimal('duration_sec', 8, 2)->nullable();
            $table->timestamps();
            $table->unique(['video_id', 'number']);
        });

        Schema::table('videos', function (Blueprint $table) {
            $table->foreign('current_version_id')->references('id')->on('video_versions')->nullOnDelete();
        });

        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('video_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('kind', 16);
            $table->string('disk', 32);
            $table->string('path');
            $table->string('original_name')->nullable();
            $table->unsignedBigInteger('size');
            $table->string('mime', 100)->nullable();
            $table->timestamps();
            $table->index(['video_id', 'kind']);
        });
    }

    public function down(): void
    {
        Schema::table('videos', function (Blueprint $table) {
            $table->dropForeign(['current_version_id']);
        });
        Schema::dropIfExists('assets');
        Schema::dropIfExists('video_versions');
        Schema::dropIfExists('videos');
    }
};
