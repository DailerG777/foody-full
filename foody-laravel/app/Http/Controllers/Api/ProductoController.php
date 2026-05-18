<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductoController extends Controller {
    public function store(Request $request): JsonResponse {
        $r=$request->user()->restaurante()->firstOrFail();
        $data=$request->validate(['nombre'=>['required','string','max:120'],'descripcion'=>['nullable','string','max:300'],'precio'=>['required','integer','min:500'],'menu_categoria_id'=>['nullable','exists:menu_categorias,id'],'emoji'=>['nullable','string','max:10'],'disponible'=>['sometimes','boolean'],'foto'=>['nullable','image','max:2048']]);
        if($request->hasFile('foto'))$data['foto']=$request->file('foto')->store('productos','public');
        return response()->json(['producto'=>$r->productos()->create($data)],201);
    }
    public function update(Request $request,int $id): JsonResponse {
        $r=$request->user()->restaurante()->firstOrFail();
        $p=$r->productos()->findOrFail($id);
        $data=$request->validate(['nombre'=>['sometimes','string','max:120'],'descripcion'=>['sometimes','string','max:300'],'precio'=>['sometimes','integer','min:500'],'emoji'=>['sometimes','string','max:10'],'disponible'=>['sometimes','boolean'],'foto'=>['sometimes','image','max:2048']]);
        if($request->hasFile('foto')){if($p->foto)Storage::disk('public')->delete($p->foto);$data['foto']=$request->file('foto')->store('productos','public');}
        $p->update($data);
        return response()->json(['producto'=>$p->fresh()]);
    }
    public function destroy(Request $request,int $id): JsonResponse {
        $r=$request->user()->restaurante()->firstOrFail();
        $p=$r->productos()->findOrFail($id);
        if($p->foto)Storage::disk('public')->delete($p->foto);
        $p->delete();
        return response()->json(['message'=>'Producto eliminado.']);
    }
    public function toggleDisponibilidad(Request $request,int $id): JsonResponse {
        $r=$request->user()->restaurante()->firstOrFail();
        $p=$r->productos()->findOrFail($id);
        $p->update(['disponible'=>!$p->disponible]);
        return response()->json(['disponible'=>$p->fresh()->disponible]);
    }
}
