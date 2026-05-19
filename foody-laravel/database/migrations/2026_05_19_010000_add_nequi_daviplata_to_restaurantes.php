<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurantes', function (Blueprint $table) {
            $table->string('nequi', 20)->nullable()->after('whatsapp');
            $table->string('daviplata', 20)->nullable()->after('nequi');
        });
    }

    public function down(): void
    {
        Schema::table('restaurantes', function (Blueprint $table) {
            $table->dropColumn(['nequi', 'daviplata']);
        });
    }
};
