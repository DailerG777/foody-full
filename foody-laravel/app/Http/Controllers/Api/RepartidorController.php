<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{Pedido,UbicacionRepartidor};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RepartidorController extends Controller {
    public function pedidosDisponibles(Request $request): JsonResponse {
        $user = $request->user();
        if ($user->estado_verificacion !== 'aprobado')
            return response()->json(['message'=>'Tu cuenta está pendiente de aprobación.'],403);
        $pedidos = Pedido::with(['restaurante:id,nombre,direccion,foto_portada','items'])
            ->whereIn('estado',['listo','en_camino'])
            ->where(function($q) use ($user) {
                $q->whereNull('repartidor_id')->orWhere('repartidor_id',$user->id);
            })
            ->whereIn('tipo_servicio',['comida','transporte','compra'])
            ->latest()
            ->get();
        return response()->json(['pedidos'=>$pedidos]);
    }

    public function tomarPedido(Request $request,Pedido $pedido): JsonResponse {
        $user = $request->user();
        if ($user->estado_verificacion !== 'aprobado')
            return response()->json(['message'=>'Tu cuenta está pendiente de aprobación.'],403);
        if (!in_array($pedido->estado,['listo','pendiente']) || $pedido->repartidor_id)
            return response()->json(['message'=>'Pedido no disponible.'],422);
        $pedido->update(['repartidor_id'=>$user->id,'estado'=>'en_camino','aceptado_at'=>now()]);
        return response()->json(['message'=>'Pedido tomado.','pedido'=>$pedido->fresh()]);
    }

    public function actualizarUbicacion(Request $request): JsonResponse {
        $data = $request->validate([
            'lat'=>['required','numeric'],
            'lng'=>['required','numeric'],
            'pedido_id'=>['nullable','exists:pedidos,id'],
        ]);
        UbicacionRepartidor::updateOrCreate(
            ['user_id'=>$request->user()->id],
            ['lat'=>$data['lat'],'lng'=>$data['lng'],'en_linea'=>true,'pedido_id'=>$data['pedido_id']??null,'actualizado_at'=>now()]
        );
        return response()->json(['message'=>'Ubicación actualizada.']);
    }

    public function obtenerUbicacionPorPedido(Request $request, int $pedidoId): JsonResponse {
        $pedido = Pedido::findOrFail($pedidoId);
        if ($pedido->user_id !== $request->user()->id)
            return response()->json(['message'=>'No autorizado.'],403);
        if (!$pedido->repartidor_id)
            return response()->json(['message'=>'Sin repartidor asignado.'],404);
        $ubicacion = UbicacionRepartidor::where('user_id',$pedido->repartidor_id)->first();
        if (!$ubicacion)
            return response()->json(['message'=>'Ubicación no disponible.'],404);
        return response()->json([
            'lat'=>$ubicacion->lat,
            'lng'=>$ubicacion->lng,
            'actualizado'=>$ubicacion->actualizado_at,
            'hace_segundos'=>now()->diffInSeconds($ubicacion->actualizado_at),
        ]);
    }

    public function toggleDisponibilidad(Request $request): JsonResponse {
        $request->validate(['en_linea'=>['required','boolean']]);
        UbicacionRepartidor::updateOrCreate(
            ['user_id'=>$request->user()->id],
            ['en_linea'=>$request->en_linea,'actualizado_at'=>now()]
        );
        return response()->json(['en_linea'=>$request->en_linea]);
    }

    public function estadisticas(Request $request): JsonResponse {
        $user = $request->user();
        $hoy = Pedido::where('repartidor_id',$user->id)
            ->where('created_at','>=',now()->startOfDay())
            ->where('estado','entregado');
        return response()->json([
            'pedidos_hoy'=>$hoy->count(),
            'ganancias_hoy'=>$hoy->count()*4200,
            'pedidos_total'=>Pedido::where('repartidor_id',$user->id)->where('estado','entregado')->count(),
        ]);
    }
}
