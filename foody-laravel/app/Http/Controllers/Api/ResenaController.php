<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{Pedido,Resena,Restaurante};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResenaController extends Controller {
    public function store(Request $request): JsonResponse {
        $data = $request->validate([
            'pedido_id' => 'required|exists:pedidos,id',
            'estrellas' => 'required|integer|min:1|max:5',
            'comentario' => 'nullable|string|max:500',
        ]);

        $pedido = Pedido::with('restaurante')->findOrFail($data['pedido_id']);

        if ($pedido->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Este pedido no te pertenece.'], 403);
        }
        if ($pedido->estado !== 'entregado') {
            return response()->json(['message' => 'Solo puedes calificar pedidos entregados.'], 422);
        }
        if ($pedido->resena) {
            return response()->json(['message' => 'Ya calificaste este pedido.'], 422);
        }

        $resena = Resena::create([
            'pedido_id' => $pedido->id,
            'user_id' => $request->user()->id,
            'restaurante_id' => $pedido->restaurante_id,
            'estrellas' => $data['estrellas'],
            'comentario' => $data['comentario'] ?? null,
        ]);

        $pedido->restaurante->recalcularRating();

        return response()->json(['resena' => $resena], 201);
    }

    public function restaurante(string $slug): JsonResponse {
        $restaurante = Restaurante::where('slug', $slug)->firstOrFail();
        $resenas = Resena::with('user:id,nombre,apellido')
            ->where('restaurante_id', $restaurante->id)
            ->latest()
            ->get();
        return response()->json(['resenas' => $resenas]);
    }
}
