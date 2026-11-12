<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('videos', function (Blueprint $table) {
            $table->longText('plan')->nullable()->after('script');
        });

        // Versions point at their files through assets.
        Schema::table('video_versions', function (Blueprint $table) {
            $table->dropColumn(['mp4_path', 'zip_path', 'thumb_path']);
        });

        Schema::table('assets', function (Blueprint $table) {
            $table->foreignId('video_version_id')->nullable()->after('video_id')->constrained()->cascadeOnDelete();
        });

        Schema::create('runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('video_id')->constrained()->cascadeOnDelete();
            $table->foreignId('video_version_id')->nullable()->constrained()->nullOnDelete();
            $table->string('kind', 16);                 // plan | build | feedback
            $table->string('status', 16)->index();      // queued | running | succeeded | failed | cancelled
            $table->text('input')->nullable();          // feedback text
            $table->string('current_step', 64)->nullable();
            $table->string('session_id', 64)->nullable();
            $table->boolean('cancel_requested')->default(false);
            $table->integer('exit_code')->nullable();
            $table->text('error')->nullable();
            $table->unsignedInteger('num_turns')->nullable();
            $table->decimal('cost_usd', 10, 4)->nullable(); // estimate reported by Claude
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });

        Schema::create('run_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('run_id')->constrained()->cascadeOnDelete();
            $table->string('type', 24);                 // status | step | text | tool | tool_result | result | stderr
            $table->string('step', 64)->nullable();
            $table->text('message')->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['run_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('run_events');
        Schema::dropIfExists('runs');
        Schema::table('assets', function (Blueprint $table) {
            $table->dropConstrainedForeignId('video_version_id');
        });
        Schema::table('video_versions', function (Blueprint $table) {
            $table->string('mp4_path')->nullable();
            $table->string('zip_path')->nullable();
            $table->string('thumb_path')->nullable();
        });
        Schema::table('videos', function (Blueprint $table) {
            $table->dropColumn('plan');
        });
    }
};
