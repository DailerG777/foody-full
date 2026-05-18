<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{CajaMovimiento,Pedido};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CajaController extends Controller {
    public function index(Request $request): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante) return response()->json(['message'=>'No tienes un restaurante.'],404);

        $periodo = $request->get('periodo','hoy');
        $categoria = $request->get('categoria');
        $desde = match($periodo){
            'semana'=>now()->startOfWeek(),
            'quincena'=>now()->subDays(15)->startOfDay(),
            'mes'=>now()->startOfMonth(),
            'personalizado'=>now()->parse($request->get('desde'))->startOfDay(),
            default=>now()->startOfDay()
        };
        $hasta = $periodo === 'personalizado' && $request->get('hasta')
            ? now()->parse($request->get('hasta'))->endOfDay()
            : now()->endOfDay();

        $query = CajaMovimiento::where('restaurante_id',$restaurante->id)
            ->whereBetween('created_at',[$desde,$hasta]);

        if ($categoria) $query->where('categoria',$categoria);

        $movimientos = $query->with('user')->latest()->get();

        $ingresos = CajaMovimiento::where('restaurante_id',$restaurante->id)
            ->where('tipo','ingreso')
            ->whereBetween('created_at',[$desde,$hasta])
            ->sum('monto');

        $egresos = CajaMovimiento::where('restaurante_id',$restaurante->id)
            ->where('tipo','egreso')
            ->whereBetween('created_at',[$desde,$hasta])
            ->sum('monto');

        $pedidosCount = Pedido::where('restaurante_id',$restaurante->id)
            ->where('created_at','>=',$desde)
            ->where('estado','!=','cancelado')
            ->count();

        $ventasTotal = Pedido::where('restaurante_id',$restaurante->id)
            ->where('created_at','>=',$desde)
            ->where('estado','!=','cancelado')
            ->sum('total');

        return response()->json([
            'periodo'=>$periodo,
            'movimientos'=>$movimientos,
            'ingresos'=>(float)$ingresos,
            'egresos'=>(float)$egresos,
            'balance'=>(float)($ingresos - $egresos),
            'ventas_total'=>(float)$ventasTotal,
            'pedidos'=>$pedidosCount,
        ]);
    }

    public function store(Request $request): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante) return response()->json(['message'=>'No tienes un restaurante.'],404);
        $data = $request->validate([
            'tipo'=>['required','in:ingreso,egreso'],
            'categoria'=>['required','in:venta,domicilio,compra_insumo,nomina,servicio,mantenimiento,otro'],
            'concepto'=>['required','string','max:200'],
            'monto'=>['required','numeric','min:100'],
            'referencia'=>['nullable','string','max:100'],
            'nota'=>['nullable','string','max:500'],
        ]);
        $data['restaurante_id'] = $restaurante->id;
        $data['user_id'] = $request->user()->id;
        $mov = CajaMovimiento::create($data);
        return response()->json($mov,201);
    }

    public function show(Request $request, CajaMovimiento $caja): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante || $caja->restaurante_id !== $restaurante->id)
            return response()->json(['message'=>'No autorizado.'],403);
        return response()->json($caja->load('user'));
    }

    public function destroy(Request $request, CajaMovimiento $caja): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante || $caja->restaurante_id !== $restaurante->id)
            return response()->json(['message'=>'No autorizado.'],403);
        $caja->delete();
        return response()->json(['message'=>'Movimiento eliminado.']);
    }
}
