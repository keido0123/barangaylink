<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            $table->unsignedInteger('age')
                ->nullable()
                ->after('birthdate');

            $table->string('mother_name')
                ->nullable()
                ->after('gender');

            $table->string('father_name')
                ->nullable()
                ->after('mother_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            $table->dropColumn([
                'age',
                'mother_name',
                'father_name',
            ]);
        });
    }
};