<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{Cupon,Pago,Pedido,Restaurante,User};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller {
    public function dashboard(Request $request): JsonResponse {
        $hoy=now()->startOfDay();
        return response()->json([
            'kpis'=>[
                'ingresos_hoy'=>Pedido::where('created_at','>=',$hoy)->where('estado','!=','cancelado')->sum('total'),
                'pedidos_hoy'=>Pedido::where('created_at','>=',$hoy)->count(),
                'usuarios_total'=>User::count(),
                'restaurantes_activos'=>Restaurante::where('activo',true)->count(),
            ],
            'ultimos_pedidos'=>Pedido::with(['user:id,nombre,apellido','restaurante:id,nombre'])->latest()->limit(10)->get(),
            'ingresos_semana'=>$this->ingresosPorDia(7),
        ]);
    }

    public function usuarios(Request $request): JsonResponse {
        $q=User::query();
        if($request->filled('role')) $q->where('role',$request->role);
        if($request->filled('q'))    $q->where(fn($sq)=>$sq->where('nombre','like',"%{$request->q}%")->orWhere('email','like',"%{$request->q}%"));
        return response()->json($q->latest()->paginate(30));
    }

    public function toggleUsuario(Request $request,int $id): JsonResponse {
        $user=User::findOrFail($id);
        if($user->isAdmin()) return response()->json(['message'=>'No se puede desactivar un admin.'],422);
        $user->update(['activo'=>!$user->activo]);
        return response()->json(['activo'=>$user->fresh()->activo,'message'=>$user->activo?'Usuario activado':'Usuario desactivado']);
    }

    public function restaurantes(Request $request): JsonResponse {
        return response()->json(Restaurante::with('user:id,nombre,apellido,email')->latest()->paginate(20));
    }

    public function aprobarRestaurante(Request $request,int $id): JsonResponse {
        $r=Restaurante::findOrFail($id);
        $r->update(['activo'=>!$r->activo]);
        return response()->json(['activo'=>$r->fresh()->activo]);
    }

    public function pedidos(Request $request): JsonResponse {
        $q=Pedido::with(['user:id,nombre,apellido','restaurante:id,nombre']);
        if($request->filled('estado')) $q->where('estado',$request->estado);
        if($request->filled('q'))      $q->whereHas('user',fn($sq)=>$sq->where('nombre','like',"%{$request->q}%"));
        return response()->json($q->latest()->paginate(30));
    }

    public function pagos(Request $request): JsonResponse {
        $desde=match($request->get('periodo','hoy')){
            'semana'=>now()->startOfWeek(),'mes'=>now()->startOfMonth(),default=>now()->startOfDay()};
        $pagos=Pago::with(['pedido.user:id,nombre,apellido'])->where('created_at','>=',$desde)->latest()->paginate(30);
        $stats=Pago::where('created_at','>=',$desde)->where('estado','aprobado');
        return response()->json(['pagos'=>$pagos,'stats'=>['total'=>$stats->sum('monto'),'count'=>$stats->count(),'comision'=>round($stats->sum('monto')*0.12)]]);
    }

    public function estadisticas(Request $request): JsonResponse {
        return response()->json([
            'ventas_mes'=>Pedido::where('created_at','>=',now()->startOfMonth())->where('estado','!=','cancelado')->sum('total'),
            'pedidos_mes'=>Pedido::where('created_at','>=',now()->startOfMonth())->count(),
            'usuarios_nuevos_mes'=>User::where('created_at','>=',now()->startOfMonth())->count(),
            'restaurantes_activos'=>Restaurante::where('activo',true)->count(),
        ]);
    }

    public function cupones(): JsonResponse { return response()->json(Cupon::latest()->get()); }

    public function crearCupon(Request $request): JsonResponse {
        $data=$request->validate(['codigo'=>['required','string','max:30','unique:cupones'],'descripcion'=>['required','string'],'tipo'=>['required','in:porcentaje,fijo,domicilio_gratis'],'valor'=>['required','integer','min:0'],'minimo_pedido'=>['sometimes','integer','min:0'],'maximo_usos'=>['nullable','integer','min:1'],'valido_desde'=>['nullable','date'],'valido_hasta'=>['nullable','date'],'activo'=>['sometimes','boolean']]);
        $data['codigo']=strtoupper($data['codigo']);
        return response()->json(['cupon'=>Cupon::create($data)],201);
    }

    public function actualizarCupon(Request $request,int $id): JsonResponse {
        $cupon=Cupon::findOrFail($id);
        $data=$request->validate(['descripcion'=>['sometimes','string'],'valor'=>['sometimes','integer','min:0'],'minimo_pedido'=>['sometimes','integer','min:0'],'activo'=>['sometimes','boolean'],'valido_hasta'=>['nullable','date']]);
        $cupon->update($data);
        return response()->json(['cupon'=>$cupon->fresh()]);
    }

    public function eliminarCupon(Request $request,int $id): JsonResponse {
        Cupon::findOrFail($id)->delete();
        return response()->json(['message'=>'Cupón eliminado.']);
    }

    private function ingresosPorDia(int $dias): array {
        $result=[];
        for($i=$dias-1;$i>=0;$i--){
            $dia=now()->subDays($i)->startOfDay();
            $result[]=[ 'fecha'=>$dia->format('d/m'), 'total'=>Pedido::whereBetween('created_at',[$dia,$dia->copy()->endOfDay()])->where('estado','!=','cancelado')->sum('total')];
        }
        return $result;
    }
}
