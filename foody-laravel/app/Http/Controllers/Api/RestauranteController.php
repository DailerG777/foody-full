<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{Pedido,Restaurante};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RestauranteController extends Controller {
    public function index(Request $request): JsonResponse {
        $q=Restaurante::where('activo',true);
        if($request->filled('categoria')) $q->where('categoria',$request->categoria);
        if($request->filled('q')) $q->where('nombre','like',"%{$request->q}%");
        if($request->boolean('abiertos')) $q->where('abierto',true);
        return response()->json($q->orderByDesc('rating')->paginate(50));
    }
    public function show(string $slug): JsonResponse {
        $r=Restaurante::with(['categorias.productos'=>fn($q)=>$q->where('disponible',true)->orderBy('orden'),'horarios'])->where('slug',$slug)->where('activo',true)->firstOrFail();
        return response()->json(['restaurante'=>$r]);
    }
    public function miRestaurante(Request $request): JsonResponse {
        $r=$request->user()->restaurante()->with(['categorias.productos','horarios'])->firstOrFail();
        return response()->json(['restaurante'=>$r]);
    }
    public function update(Request $request): JsonResponse {
        $r=$request->user()->restaurante()->firstOrFail();
        $data=$request->validate(['nombre'=>['sometimes','string','max:120'],'descripcion'=>['sometimes','string','max:500'],'categoria'=>['sometimes','string'],'telefono'=>['sometimes','string','max:20'],'tiempo_min'=>['sometimes','integer','min:5','max:120'],'tiempo_max'=>['sometimes','integer','min:5','max:180'],'pedido_minimo'=>['sometimes','integer','min:0'],'abierto'=>['sometimes','boolean'],'foto_portada'=>['sometimes','image','max:4096'],'logo'=>['sometimes','image','max:2048'],'menu_pdf'=>['sometimes','file','mimes:pdf,jpeg,jpg,png','max:10240']]);
        if($request->hasFile('foto_portada')){if($r->foto_portada)Storage::disk('public')->delete($r->foto_portada);$data['foto_portada']=$request->file('foto_portada')->store('restaurantes/portadas','public');}
        if($request->hasFile('logo')){if($r->logo)Storage::disk('public')->delete($r->logo);$data['logo']=$request->file('logo')->store('restaurantes/logos','public');}
        if($request->hasFile('menu_pdf')){if($r->menu_pdf)Storage::disk('public')->delete(ltrim($r->menu_pdf,'/storage/'));$data['menu_pdf']='/storage/'.$request->file('menu_pdf')->store('menus','public');}
        $r->update($data);
        return response()->json(['restaurante'=>$r->fresh()]);
    }
    public function pedidos(Request $request): JsonResponse {
        $r=$request->user()->restaurante()->firstOrFail();
        $p=Pedido::with(['user:id,nombre,apellido,telefono','items'])->where('restaurante_id',$r->id)->when($request->filled('estado'),fn($q)=>$q->where('estado',$request->estado))->latest()->paginate(30);
        return response()->json($p);
    }
    public function estadisticas(Request $request): JsonResponse {
        $r=$request->user()->restaurante()->firstOrFail();
        $desde=match($request->get('periodo','hoy')){
            'semana'=>now()->startOfWeek(),'mes'=>now()->startOfMonth(),default=>now()->startOfDay()};
        $p=Pedido::where('restaurante_id',$r->id)->where('created_at','>=',$desde)->where('estado','!=','cancelado')->get();
        $ventas=$p->sum('total'); $total=$p->count();
        return response()->json(['ventas'=>$ventas,'pedidos'=>$total,'ticket_promedio'=>$total>0?round($ventas/$total):0,'comision_foody'=>round($ventas*0.12)]);
    }
}
