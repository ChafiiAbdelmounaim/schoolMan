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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->text('message');
            $table->enum('user_type', ['admin', 'teacher', 'student'])->nullable();
            $table->unsignedBigInteger('user_id')->nullable(); // ID in the respective table
            $table->boolean('broadcast')->default(false); // Whether to broadcast to all users of a type
            $table->boolean('read')->default(false);
            $table->json('data')->nullable(); // For additional data
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
