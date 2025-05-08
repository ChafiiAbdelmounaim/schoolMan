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
        Schema::table('teachers', function (Blueprint $table) {
            $table->rememberToken(); // Adds remember_token VARCHAR(100) NULL
            $table->timestamp('email_verified_at')->nullable(); // Adds email_verified_at TIMESTAMP NULL
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn(['remember_token', 'email_verified_at']);
        });
    }
};
