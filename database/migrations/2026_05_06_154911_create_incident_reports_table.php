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
        Schema::create('incident_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('category', [
                'Fight/Altercation',
                'Uncollected Garbage',
                'Noise Complaint',
                'Illegal Parking',
                'Broken Street Light',
                'Flooding',
                'Other'
            ]);
            $table->string('location');
            $table->text('description');
            $table->string('photo')->nullable();
            $table->enum('status', ['Reported', 'Under Review', 'Resolved', 'Dismissed'])->default('Reported');
            $table->text('admin_response')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incident_reports');
    }
};
