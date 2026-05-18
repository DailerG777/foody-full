<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::dropIfExists('inventario');
        Schema::dropIfExists('meseros');
        Schema::dropIfExists('gastos_caja');

        Schema::create('sub_cuentas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurante_id')->constrained()->cascadeOnDelete();
            $table->string('nombre');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('telefono',20)->nullable();
            $table->string('rol',20)->default('mesero');
            $table->string('pin',6)->nullable();
            $table->string('api_token',80)->nullable()->unique();
            $table->boolean('activo')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('inventario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurante_id')->constrained()->cascadeOnDelete();
            $table->string('nombre');
            $table->string('categoria')->nullable();
            $table->string('unidad',20)->default('unidad');
            $table->decimal('stock',10,2)->default(0);
            $table->decimal('stock_minimo',10,2)->default(0);
            $table->decimal('costo_unitario',10,2)->default(0);
            $table->timestamps();
        });

        Schema::create('inventario_movimientos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventario_id')->constrained('inventario')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('tipo',20);
            $table->decimal('cantidad',10,2);
            $table->text('motivo')->nullable();
            $table->timestamps();
        });

        Schema::create('caja_movimientos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurante_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('tipo',10);
            $table->string('categoria',30);
            $table->string('concepto');
            $table->decimal('monto',15,2);
            $table->string('referencia')->nullable();
            $table->text('nota')->nullable();
            $table->timestamps();
        });

        Schema::create('nominas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurante_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sub_cuenta_id')->nullable()->constrained('sub_cuentas')->nullOnDelete();
            $table->string('empleado_nombre');
            $table->string('empleado_cedula',20)->nullable();
            $table->string('cargo')->nullable();
            $table->string('tipo_contrato',30)->default('fijo');
            $table->decimal('salario_base',15,2)->default(0);
            $table->decimal('bonificaciones',15,2)->default(0);
            $table->decimal('deducciones',15,2)->default(0);
            $table->decimal('total',15,2)->default(0);
            $table->string('periodo',7)->nullable();
            $table->date('fecha_pago')->nullable();
            $table->boolean('pagado')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('nominas');
        Schema::dropIfExists('caja_movimientos');
        Schema::dropIfExists('inventario_movimientos');
        Schema::dropIfExists('inventario');
        Schema::dropIfExists('sub_cuentas');
    }
};
