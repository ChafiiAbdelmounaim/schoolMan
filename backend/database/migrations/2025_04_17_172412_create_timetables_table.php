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
        Schema::create('timetables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('subjects')->onDelete('cascade'); // Foreign key to subjects table
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade'); // Foreign key to teachers table
            $table->foreignId('classroom_id')->constrained('classrooms')->onDelete('cascade'); // Foreign key to classrooms table
            $table->foreignId('semester_id')->constrained('semesters')->onDelete('cascade'); // Foreign key to semesters table
            $table->string('day'); // Day of the week
            $table->time('start_time'); // Start time of the class
            $table->time('end_time'); // End time of the class
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timetables');
    }
};
