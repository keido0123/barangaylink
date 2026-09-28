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
        Schema::create('residents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->onDelete('set null');

            // Basic Information
            $table->string('full_name');
            $table->date('birthdate');
            $table->unsignedInteger('age')->nullable();
            $table->enum('gender', ['Male', 'Female', 'Other']);

            // Family Information
            $table->string('mother_name')->nullable();
            $table->string('father_name')->nullable();

            // Contact / Address Information
            $table->string('address');
            $table->string('purok');
            $table->string('phone')->nullable();

            // Personal Information
            $table->enum(
                'civil_status',
                ['Single', 'Married', 'Widowed', 'Separated']
            );
            $table->string('occupation')->nullable();

            // Financial Information
            $table->enum(
                'income_class',
                ['Lower Class', 'Middle Class', 'Upper Class']
            );

            // Voter Information
            $table->boolean('is_voter')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('residents');
    }
};