<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // Add columns to users
        Schema::table('users', function (Blueprint $table) {
            $table->string('cedula',20)->nullable()->after('telefono');
            $table->string('tipo_vehiculo',20)->nullable()->after('cedula');
            $table->string('placa',10)->nullable()->after('tipo_vehiculo');
            $table->string('foto_cedula')->nullable()->after('placa');
            $table->string('foto_cara')->nullable()->after('foto_cedula');
            $table->string('estado_verificacion',30)->default('pendiente')->after('plan');
        });

        // Add columns to pedidos
        Schema::table('pedidos', function (Blueprint $table) {
            $table->string('tipo_servicio',20)->default('comida')->after('nota');
            $table->text('descripcion_servicio')->nullable()->after('tipo_servicio');
            $table->string('contacto_nombre')->nullable()->after('descripcion_servicio');
            $table->string('contacto_telefono',20)->nullable()->after('contacto_nombre');
        });

        // Add columns to pagos
        Schema::table('pagos', function (Blueprint $table) {
            $table->string('captura_pago')->nullable()->after('metodo');
            $table->string('comprobante_path')->nullable()->after('captura_pago');
            $table->timestamp('verificado_at')->nullable()->after('pagado_at');
            $table->foreignId('verificado_por')->nullable()->constrained('users')->after('verificado_at');
            // Columnas metodo/estado ya son string desde la migración original
        });

        // Conversaciones
        Schema::create('conversaciones', function (Blueprint $table) {
            $table->id();
            $table->string('tipo',40);
            $table->foreignId('participante_1_id')->constrained('users');
            $table->foreignId('participante_2_id')->constrained('users');
            $table->foreignId('pedido_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('archivada')->default(false);
            $table->timestamps();
        });

        // Mensajes
        Schema::create('mensajes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversacion_id')->constrained('conversaciones')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users');
            $table->string('tipo',20)->default('texto');
            $table->text('contenido');
            $table->string('imagen_path')->nullable();
            $table->string('estado',20)->default('enviado');
            $table->timestamps();
        });

        // Posts del restaurante
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurante_id')->constrained()->cascadeOnDelete();
            $table->text('contenido');
            $table->string('imagen')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // Fotos galería restaurante
        Schema::create('fotos_restaurante', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurante_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('descripcion')->nullable();
            $table->integer('orden')->default(0);
            $table->timestamps();
        });

        // Inventario / stock
        Schema::create('inventario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurante_id')->constrained()->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained()->cascadeOnDelete();
            $table->integer('stock')->default(0);
            $table->integer('stock_minimo')->default(0);
            $table->timestamps();
            $table->unique(['restaurante_id','producto_id']);
        });

        // Meseros (sub-cuentas)
        Schema::create('meseros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurante_id')->constrained()->cascadeOnDelete();
            $table->string('nombre');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('telefono',20)->nullable();
            $table->boolean('activo')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });

        // Gastos de caja
        Schema::create('gastos_caja', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurante_id')->constrained()->cascadeOnDelete();
            $table->string('concepto');
            $table->integer('monto');
            $table->string('categoria')->nullable();
            $table->text('nota')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('gastos_caja');
        Schema::dropIfExists('meseros');
        Schema::dropIfExists('inventario');
        Schema::dropIfExists('fotos_restaurante');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('mensajes');
        Schema::dropIfExists('conversaciones');
        Schema::table('pagos', function (Blueprint $table) {
            $table->dropColumn(['captura_pago','comprobante_path','verificado_at','verificado_por']);
        });
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn(['tipo_servicio','descripcion_servicio','contacto_nombre','contacto_telefono']);
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['cedula','tipo_vehiculo','placa','foto_cedula','foto_cara','estado_verificacion']);
        });
    }
};
