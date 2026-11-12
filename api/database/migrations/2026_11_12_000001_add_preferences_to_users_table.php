<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('locale', 10)->default('en')->after('password');
            $table->string('theme', 10)->default('system')->after('locale');
            $table->string('timezone', 64)->default('Asia/Dhaka')->after('theme');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['locale', 'theme', 'timezone']);
        });
    }
};
