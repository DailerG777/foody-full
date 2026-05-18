<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Nomina;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NominaController extends Controller {
    public function index(Request $request): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante) return response()->json(['message'=>'No tienes un restaurante.'],404);
        $nominas = Nomina::where('restaurante_id',$restaurante->id)
            ->with('subCuenta')
            ->orderBy('created_at','desc')
            ->get();
        return response()->json($nominas);
    }

    public function store(Request $request): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante) return response()->json(['message'=>'No tienes un restaurante.'],404);
        $data = $request->validate([
            'sub_cuenta_id'=>['nullable','exists:sub_cuentas,id'],
            'empleado_nombre'=>['required','string','max:200'],
            'empleado_cedula'=>['nullable','string','max:20'],
            'cargo'=>['nullable','string','max:100'],
            'tipo_contrato'=>['required','in:fijo,tiempo_completo,medio_tiempo,por_horas,destajo'],
            'salario_base'=>['required','numeric','min:0'],
            'bonificaciones'=>['nullable','numeric','min:0'],
            'deducciones'=>['nullable','numeric','min:0'],
            'periodo'=>['required','string','max:7'],
        ]);
        $data['restaurante_id'] = $restaurante->id;
        $data['bonificaciones'] ??= 0;
        $data['deducciones'] ??= 0;
        $nomina = new Nomina($data);
        $nomina->calcularTotal();
        $nomina->save();
        return response()->json($nomina,201);
    }

    public function update(Request $request, Nomina $nomina): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante || $nomina->restaurante_id !== $restaurante->id)
            return response()->json(['message'=>'No autorizado.'],403);
        $data = $request->validate([
            'sub_cuenta_id'=>['nullable','exists:sub_cuentas,id'],
            'empleado_nombre'=>['sometimes','string','max:200'],
            'empleado_cedula'=>['nullable','string','max:20'],
            'cargo'=>['nullable','string','max:100'],
            'tipo_contrato'=>['sometimes','in:fijo,tiempo_completo,medio_tiempo,por_horas,destajo'],
            'salario_base'=>['sometimes','numeric','min:0'],
            'bonificaciones'=>['nullable','numeric','min:0'],
            'deducciones'=>['nullable','numeric','min:0'],
            'periodo'=>['sometimes','string','max:7'],
        ]);
        $nomina->update($data);
        $nomina->calcularTotal();
        $nomina->save();
        return response()->json($nomina);
    }

    public function destroy(Request $request, Nomina $nomina): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante || $nomina->restaurante_id !== $restaurante->id)
            return response()->json(['message'=>'No autorizado.'],403);
        $nomina->delete();
        return response()->json(['message'=>'Nómina eliminada.']);
    }

    public function pagar(Request $request, Nomina $nomina): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante || $nomina->restaurante_id !== $restaurante->id)
            return response()->json(['message'=>'No autorizado.'],403);
        $nomina->update([
            'pagado'=>true,
            'fecha_pago'=>now()->toDateString(),
        ]);
        return response()->json($nomina);
    }
}
