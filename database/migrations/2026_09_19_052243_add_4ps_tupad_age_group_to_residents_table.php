<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            $table->boolean('is_4ps')->default(false)->after('is_voter');
            $table->boolean('is_tupad')->default(false)->after('is_4ps');
            $table->string('age_group')->nullable()->after('is_tupad'); // Minor, Teenager, Adult, Senior
        });

        // Also add to users table if you want
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_4ps')->default(false)->after('is_voter');
            $table->boolean('is_tupad')->default(false)->after('is_4ps');
            $table->string('age_group')->nullable()->after('is_tupad');
        });
    }

    public function down(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            $table->dropColumn(['is_4ps', 'is_tupad', 'age_group']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_4ps', 'is_tupad', 'age_group']);
        });
    }
};