<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A project is one channel/page (e.g. "Dev Diary by Afridi", "hizibizi"): logo + outro, many series.
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique();
            $table->string('name', 120);
            $table->string('logo_path')->nullable();       // media disk
            $table->string('logo_alt_path')->nullable();   // optional variant for light backgrounds
            $table->decimal('logo_ratio', 8, 4)->nullable(); // width / height of the main logo
            $table->string('outro_mode', 16)->default('none'); // none | common | custom | video
            $table->string('outro_key', 64)->nullable();     // custom outro key in engine/src/brand/custom (or devdiary/hizibizi)
            $table->text('outro_brief')->nullable();         // what the owner asked Claude for
            $table->string('outro_video_path')->nullable();  // uploaded outro (media disk)
            $table->decimal('outro_duration_sec', 6, 2)->nullable();
            $table->string('outro_preview_vertical')->nullable();
            $table->string('outro_preview_landscape')->nullable();
            $table->string('outro_status', 16)->default('idle'); // idle | rendering | generating | failed
            $table->text('outro_error')->nullable();
            $table->timestamps();
        });

        Schema::table('series', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->after('id')->constrained()->restrictOnDelete();
        });

        // Existing series become their own project (logo/outro move up), so nothing is orphaned.
        foreach (DB::table('series')->get() as $series) {
            $projectId = DB::table('projects')->insertGetId([
                'slug' => $series->slug,
                'name' => $series->name,
                'outro_mode' => in_array($series->outro, ['devdiary', 'hizibizi'], true) ? 'custom' : 'none',
                'outro_key' => in_array($series->outro, ['devdiary', 'hizibizi'], true) ? $series->outro : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('series')->where('id', $series->id)->update(['project_id' => $projectId]);
        }

        Schema::table('series', function (Blueprint $table) {
            $table->dropColumn(['logo_path', 'outro']);
        });
    }

    public function down(): void
    {
        Schema::table('series', function (Blueprint $table) {
            $table->string('logo_path')->nullable();
            $table->string('outro', 32)->nullable();
            $table->dropConstrainedForeignId('project_id');
        });
        Schema::dropIfExists('projects');
    }
};
