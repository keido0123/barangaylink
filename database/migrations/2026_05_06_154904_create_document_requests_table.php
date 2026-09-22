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
        Schema::create('document_requests', function (Blueprint $table) {
             $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('document_type', [
                'Barangay Clearance',
                'Certificate of Indigency',
                'Certificate of Residency',
                "Voters Certificate"
            ]);
            $table->string('purpose');
            $table->enum('status', ['Pending', 'Processing', 'Ready', 'Released', 'Rejected'])->default('Pending');
            $table->string('tracking_code')->unique();
            $table->text('remarks')->nullable();
            $table->string('or_number')->nullable();
            $table->decimal('fee', 8, 2)->default(0);
            $table->timestamp('released_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_requests');
    }
};
