<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CajaController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\InventarioController;
use App\Http\Controllers\Api\NominaController;
use App\Http\Controllers\Api\PedidoController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\RepartidorController;
use App\Http\Controllers\Api\ResenaController;
use App\Http\Controllers\Api\RestauranteController;
use App\Http\Controllers\Api\SubCuentaController;
use App\Http\Controllers\Api\WompiController;
use Illuminate\Support\Facades\Route;

// PÚBLICAS
Route::prefix('auth')->group(function () {
    Route::post('register',  [AuthController::class,'register']);
    Route::post('login',     [AuthController::class,'login']);
    Route::post('email/resend',[AuthController::class,'resendVerification']);
    Route::get('email/verify/{id}/{hash}',[AuthController::class,'verifyEmail'])->name('verification.verify');
});
Route::get('restaurantes',       [RestauranteController::class,'index']);
Route::get('restaurantes/{slug}',[RestauranteController::class,'show']);
Route::get('explorar',              [RestauranteController::class,'index']);
Route::get('resenas/{slug}',        [ResenaController::class,'restaurante']);
Route::post('pagos/webhook',        [WompiController::class,'webhook']);

// Subcuenta login (pública con PIN)
Route::post('subcuenta/login',   [SubCuentaController::class,'login']);

// PROTEGIDAS
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class,'logout']);
        Route::get('me',      [AuthController::class,'me']);
        Route::put('profile', [AuthController::class,'updateProfile']);
        Route::put('password',[AuthController::class,'changePassword']);
    });

    // Pedidos
    Route::apiResource('pedidos', PedidoController::class)->only(['index','store','show']);
    Route::put('pedidos/{pedido}/estado',[PedidoController::class,'updateEstado']);

    // Pagos
    Route::post('pagos/iniciar',          [WompiController::class,'iniciarPago']);
    Route::get('pagos/{ref}/estado',      [WompiController::class,'consultarEstado']);
    Route::post('pagos/subir-comprobante',[WompiController::class,'subirComprobante']);

    // Repartidor
    Route::get('repartidor/pedidos-disponibles', [RepartidorController::class,'pedidosDisponibles']);
    Route::post('repartidor/pedidos/{pedido}/tomar', [RepartidorController::class,'tomarPedido']);
    Route::put('repartidor/ubicacion', [RepartidorController::class,'actualizarUbicacion']);
    Route::get('repartidor/estadisticas', [RepartidorController::class,'estadisticas']);
    Route::put('repartidor/disponibilidad', [RepartidorController::class,'toggleDisponibilidad']);
    Route::get('pedidos/{pedidoId}/repartidor-ubicacion', [RepartidorController::class,'obtenerUbicacionPorPedido']);

    // Reseñas
    Route::post('resenas',              [ResenaController::class,'store']);

    // Chat
    Route::prefix('chat')->group(function () {
        Route::get('conversaciones',    [ChatController::class,'conversaciones']);
        Route::post('conversaciones',   [ChatController::class,'crearConversacion']);
        Route::get('conversaciones/{conversacion}',[ChatController::class,'mensajes']);
        Route::post('conversaciones/{id}/mensajes',[ChatController::class,'enviarMensaje']);
        Route::put('mensajes/{id}/leer',[ChatController::class,'marcarLeido']);
    });

    // Restaurante panel
    Route::prefix('restaurante')->middleware('role:restaurante,admin')->group(function () {
        Route::get('mi-restaurante',  [RestauranteController::class,'miRestaurante']);
        Route::put('mi-restaurante',  [RestauranteController::class,'update']);
        Route::get('pedidos',         [RestauranteController::class,'pedidos']);
        Route::get('estadisticas',    [RestauranteController::class,'estadisticas']);

        // Productos
        Route::post('productos',      [ProductoController::class,'store']);
        Route::put('productos/{id}',  [ProductoController::class,'update']);
        Route::delete('productos/{id}',[ProductoController::class,'destroy']);
        Route::patch('productos/{id}/disponibilidad',[ProductoController::class,'toggleDisponibilidad']);

        // Inventario v2
        Route::get('inventario',              [InventarioController::class,'index']);
        Route::post('inventario',             [InventarioController::class,'store']);
        Route::put('inventario/{inventario}', [InventarioController::class,'update']);
        Route::delete('inventario/{inventario}',[InventarioController::class,'destroy']);
        Route::get('inventario/alertas',      [InventarioController::class,'alertas']);
        Route::get('inventario/{inventario}/movimientos',[InventarioController::class,'movimientos']);
        Route::post('inventario/{inventario}/movimientos',[InventarioController::class,'registrarMovimiento']);

        // Caja v2
        Route::get('caja',            [CajaController::class,'index']);
        Route::post('caja',           [CajaController::class,'store']);
        Route::get('caja/{caja}',     [CajaController::class,'show']);
        Route::delete('caja/{caja}',  [CajaController::class,'destroy']);

        // Subcuentas (reemplaza meseros)
        Route::get('subcuentas',                [SubCuentaController::class,'index']);
        Route::post('subcuentas',               [SubCuentaController::class,'store']);
        Route::put('subcuentas/{subcuenta}',    [SubCuentaController::class,'update']);
        Route::delete('subcuentas/{subcuenta}', [SubCuentaController::class,'destroy']);
        Route::patch('subcuentas/{subcuenta}/toggle',[SubCuentaController::class,'toggleActivo']);

        // Nómina
        Route::get('nomina',         [NominaController::class,'index']);
        Route::post('nomina',        [NominaController::class,'store']);
        Route::put('nomina/{nomina}',[NominaController::class,'update']);
        Route::delete('nomina/{nomina}',[NominaController::class,'destroy']);
        Route::post('nomina/{nomina}/pagar',[NominaController::class,'pagar']);
    });

    // Admin panel
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('dashboard',   [\App\Http\Controllers\Api\AdminController::class,'dashboard']);
        Route::get('usuarios',    [\App\Http\Controllers\Api\AdminController::class,'usuarios']);
        Route::get('pedidos',     [\App\Http\Controllers\Api\AdminController::class,'pedidos']);
        Route::get('estadisticas',[\App\Http\Controllers\Api\AdminController::class,'estadisticas']);
        Route::put('usuarios/{id}/estado',[\App\Http\Controllers\Api\AdminController::class,'toggleUsuario']);
        Route::get('restaurantes',[\App\Http\Controllers\Api\AdminController::class,'restaurantes']);
        Route::put('restaurantes/{id}/aprobar',[\App\Http\Controllers\Api\AdminController::class,'aprobarRestaurante']);
        Route::get('pagos',       [\App\Http\Controllers\Api\AdminController::class,'pagos']);
        Route::get('cupones',     [\App\Http\Controllers\Api\AdminController::class,'cupones']);
        Route::post('cupones',    [\App\Http\Controllers\Api\AdminController::class,'crearCupon']);
        Route::put('cupones/{id}',[\App\Http\Controllers\Api\AdminController::class,'actualizarCupon']);
        Route::delete('cupones/{id}',[\App\Http\Controllers\Api\AdminController::class,'eliminarCupon']);
    });
});
