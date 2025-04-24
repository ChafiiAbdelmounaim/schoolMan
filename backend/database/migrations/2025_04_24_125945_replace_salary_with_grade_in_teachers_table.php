<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('teachers', function (Blueprint $table) {
            // Drop the salary column
            $table->dropColumn('salary');

            // Add the grade column with enum type
            $table->enum('grade', ['PA', 'PH', 'PES'])
                ->default('PA')
                ->after('dateEmbauche');
        });
    }

    public function down()
    {
        Schema::table('teachers', function (Blueprint $table) {
            // Reverse the changes if needed
            $table->dropColumn('grade');
            $table->decimal('salary', 10, 2)->nullable();
        });
    }
};
