<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{Inventario,InventarioMovimiento};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventarioController extends Controller {
    public function index(Request $request): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante) return response()->json(['message'=>'No tienes un restaurante.'],404);
        $items = Inventario::where('restaurante_id',$restaurante->id)
            ->with('movimientos')
            ->orderBy('nombre')
            ->get();
        return response()->json($items);
    }

    public function store(Request $request): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante) return response()->json(['message'=>'No tienes un restaurante.'],404);
        $data = $request->validate([
            'nombre'=>['required','string','max:200'],
            'categoria'=>['nullable','string','max:100'],
            'unidad'=>['required','in:kg,litro,unidad,paquete'],
            'stock'=>['required','numeric','min:0'],
            'stock_minimo'=>['required','numeric','min:0'],
            'costo_unitario'=>['required','numeric','min:0'],
        ]);
        $data['restaurante_id'] = $restaurante->id;
        $item = Inventario::create($data);
        return response()->json($item,201);
    }

    public function update(Request $request, Inventario $inventario): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante || $inventario->restaurante_id !== $restaurante->id)
            return response()->json(['message'=>'No autorizado.'],403);
        $data = $request->validate([
            'nombre'=>['sometimes','string','max:200'],
            'categoria'=>['nullable','string','max:100'],
            'unidad'=>['sometimes','in:kg,litro,unidad,paquete'],
            'stock'=>['sometimes','numeric','min:0'],
            'stock_minimo'=>['sometimes','numeric','min:0'],
            'costo_unitario'=>['sometimes','numeric','min:0'],
        ]);
        $inventario->update($data);
        return response()->json($inventario);
    }

    public function destroy(Request $request, Inventario $inventario): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante || $inventario->restaurante_id !== $restaurante->id)
            return response()->json(['message'=>'No autorizado.'],403);
        $inventario->delete();
        return response()->json(['message'=>'Item de inventario eliminado.']);
    }

    public function alertas(Request $request): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante) return response()->json(['message'=>'No tienes un restaurante.'],404);
        $bajo = Inventario::where('restaurante_id',$restaurante->id)
            ->where('stock','<=','stock_minimo') // raw db: we need whereColumn
            ->get();
        $bajo = Inventario::where('restaurante_id',$restaurante->id)
            ->get()
            ->filter(fn($i)=>$i->stockBajo())
            ->values();
        return response()->json($bajo);
    }

    public function movimientos(Request $request, Inventario $inventario): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante || $inventario->restaurante_id !== $restaurante->id)
            return response()->json(['message'=>'No autorizado.'],403);
        return response()->json($inventario->movimientos()->with('user')->latest()->get());
    }

    public function registrarMovimiento(Request $request, Inventario $inventario): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante || $inventario->restaurante_id !== $restaurante->id)
            return response()->json(['message'=>'No autorizado.'],403);
        $data = $request->validate([
            'tipo'=>['required','in:entrada,salida,ajuste,merma'],
            'cantidad'=>['required','numeric','min:0.01'],
            'motivo'=>['nullable','string','max:500'],
        ]);
        $data['inventario_id'] = $inventario->id;
        $data['user_id'] = $request->user()->id;

        if ($data['tipo'] === 'entrada') {
            $inventario->increment('stock',$data['cantidad']);
        } elseif (in_array($data['tipo'],['salida','merma'])) {
            $inventario->decrement('stock',$data['cantidad']);
        } else {
            // ajuste: reemplazar stock completamente
            $inventario->update(['stock'=>$data['cantidad']]);
            $data['cantidad'] = $inventario->stock; // guardar el nuevo valor
        }
        $mov = InventarioMovimiento::create($data);
        return response()->json($mov,201);
    }
}
