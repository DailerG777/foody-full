<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{Cupon,Direccion,Notificacion,Pedido,PedidoItem,Producto,Restaurante};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PedidoController extends Controller {
    const DOMICILIO_BASE = 3500;

    public function store(Request $request): JsonResponse {
        $data = $request->validate([
            'restaurante_id'=>['required','exists:restaurantes,id'],
            'direccion_id'=>['nullable','exists:direcciones,id'],
            'direccion_texto'=>['required_without:direccion_id','string'],
            'items'=>['required','array','min:1'],
            'items.*.producto_id'=>['required','exists:productos,id'],
            'items.*.cantidad'=>['required','integer','min:1','max:20'],
            'metodo_pago'=>['required','in:efectivo,nequi,daviplata,tarjeta'],
            'nota'=>['nullable','string','max:300'],
            'codigo_cupon'=>['nullable','string','max:30'],
        ]);

        $restaurante = Restaurante::findOrFail($data['restaurante_id']);
        if (!$restaurante->abierto || !$restaurante->activo)
            return response()->json(['message'=>'Restaurante no disponible.'],422);

        // Dirección
        $dirTxt=$data['direccion_texto']??null; $dirLat=$dirLng=null;
        if (!empty($data['direccion_id'])) {
            $dir=Direccion::where('id',$data['direccion_id'])->where('user_id',$request->user()->id)->firstOrFail();
            $dirTxt=$dir->textoCompleto(); $dirLat=$dir->lat; $dirLng=$dir->lng;
        }

        // Calcular subtotal desde BD (nunca confiar precios del cliente)
        $subtotal=0; $itemsData=[];
        foreach ($data['items'] as $item) {
            $prod=Producto::where('id',$item['producto_id'])->where('restaurante_id',$restaurante->id)->where('disponible',true)->firstOrFail();
            $sub=$prod->precio*$item['cantidad']; $subtotal+=$sub;
            $itemsData[]=['producto_id'=>$prod->id,'nombre_snapshot'=>$prod->nombre,'precio_snapshot'=>$prod->precio,'cantidad'=>$item['cantidad'],'subtotal'=>$sub];
        }

        if ($subtotal < $restaurante->pedido_minimo)
            return response()->json(['message'=>'Pedido mínimo: $'.number_format($restaurante->pedido_minimo,0,',','.')],422);

        $domicilio=self::DOMICILIO_BASE;
        if ($restaurante->envio_gratis && $subtotal>=($restaurante->envio_gratis_desde??0)) $domicilio=0;

        $descuento=0; $codigoCupon=null;
        if (!empty($data['codigo_cupon'])) {
            $cupon=Cupon::where('codigo',strtoupper($data['codigo_cupon']))->first();
            if (!$cupon||!$cupon->esValido($subtotal)) return response()->json(['message'=>'Cupón inválido.'],422);
            $descuento=$cupon->calcularDescuento($subtotal,$domicilio);
            $codigoCupon=$cupon->codigo;
        }
        $total=max(0,$subtotal+$domicilio-$descuento);

        $pedido=DB::transaction(function() use ($request,$restaurante,$data,$itemsData,$subtotal,$domicilio,$descuento,$total,$dirTxt,$dirLat,$dirLng,$codigoCupon) {
            $p=Pedido::create(['user_id'=>$request->user()->id,'restaurante_id'=>$restaurante->id,
                'direccion_id'=>$data['direccion_id']??null,'direccion_texto'=>$dirTxt,
                'direccion_lat'=>$dirLat,'direccion_lng'=>$dirLng,'nota'=>$data['nota']??null,
                'subtotal'=>$subtotal,'costo_domicilio'=>$domicilio,'descuento'=>$descuento,
                'total'=>$total,'metodo_pago'=>$data['metodo_pago'],'estado'=>'pendiente','codigo_cupon'=>$codigoCupon]);
            foreach ($itemsData as $i) PedidoItem::create(array_merge($i,['pedido_id'=>$p->id]));
            if ($codigoCupon) Cupon::where('codigo',$codigoCupon)->increment('usos_actuales');
            Notificacion::create(['user_id'=>$restaurante->user_id,'titulo'=>'🔔 Nuevo pedido',
                'mensaje'=>"Pedido #{$p->referencia} — $".number_format($total,0,',','.')." COP",
                'tipo'=>'pedido','data'=>['pedido_id'=>$p->id]]);
            return $p;
        });

        return response()->json(['message'=>'¡Pedido creado!','pedido'=>$this->resource($pedido->load('items','restaurante'))],201);
    }

    public function index(Request $request): JsonResponse {
        $pedidos=Pedido::with(['restaurante:id,nombre,logo','items'])->where('user_id',$request->user()->id)->latest()->paginate(15);
        return response()->json($pedidos);
    }

    public function show(Request $request,Pedido $pedido): JsonResponse {
        $u=$request->user();
        $ok=$u->id===$pedido->user_id||$u->id===$pedido->repartidor_id
            ||($u->isRestaurante()&&$u->restaurante?->id===$pedido->restaurante_id)||$u->isAdmin();
        if (!$ok) return response()->json(['message'=>'No autorizado.'],403);
        $pedido->load(['items','restaurante','user','repartidor','pago','resena']);
        return response()->json(['pedido'=>$this->resource($pedido)]);
    }

    public function updateEstado(Request $request,Pedido $pedido): JsonResponse {
        $request->validate(['estado'=>['required','in:aceptado,preparando,listo,en_camino,entregado,cancelado']]);
        $u=$request->user(); $nuevo=$request->estado;
        if (!$this->transicionValida($pedido->estado,$nuevo,$u))
            return response()->json(['message'=>'Transición no permitida.'],422);
        $updates=['estado'=>$nuevo];
        match($nuevo){'aceptado'=>$updates['aceptado_at']=now(),'listo'=>$updates['listo_at']=now(),'entregado'=>$updates['entregado_at']=now(),default=>null};
        if ($nuevo==='en_camino'&&$u->isRepartidor()) $updates['repartidor_id']=$u->id;
        $pedido->update($updates);
        $msgs=['aceptado'=>"✅ Pedido #{$pedido->referencia} aceptado",'preparando'=>"👨‍🍳 Preparando #{$pedido->referencia}",'listo'=>"🛵 Listo para envío",'en_camino'=>"🛵 Tu repartidor va en camino",'entregado'=>"🎉 ¡Entregado! ¿Cómo estuvo?",'cancelado'=>"❌ Pedido cancelado"];
        if (isset($msgs[$nuevo])) Notificacion::create(['user_id'=>$pedido->user_id,'titulo'=>'Actualización','mensaje'=>$msgs[$nuevo],'tipo'=>'pedido','data'=>['pedido_id'=>$pedido->id]]);
        return response()->json(['message'=>'Estado actualizado.','pedido'=>$this->resource($pedido->fresh())]);
    }

    private function transicionValida(string $actual,string $nuevo,$user): bool {
        $flujo=['pendiente'=>['aceptado','cancelado'],'aceptado'=>['preparando','cancelado'],'preparando'=>['listo','cancelado'],'listo'=>['en_camino'],'en_camino'=>['entregado']];
        if (!isset($flujo[$actual])||!in_array($nuevo,$flujo[$actual])) return false;
        if (in_array($nuevo,['aceptado','preparando','listo'])&&!$user->isRestaurante()&&!$user->isAdmin()) return false;
        if (in_array($nuevo,['en_camino','entregado'])&&!$user->isRepartidor()&&!$user->isAdmin()) return false;
        return true;
    }

    private function resource(Pedido $pedido): array {
        return ['id'=>$pedido->id,'referencia'=>$pedido->referencia,'estado'=>$pedido->estado,
            'subtotal'=>$pedido->subtotal,'costo_domicilio'=>$pedido->costo_domicilio,
            'descuento'=>$pedido->descuento,'total'=>$pedido->total,'metodo_pago'=>$pedido->metodo_pago,
            'direccion_texto'=>$pedido->direccion_texto,'nota'=>$pedido->nota,
            'restaurante'=>$pedido->restaurante?['id'=>$pedido->restaurante->id,'nombre'=>$pedido->restaurante->nombre,'logo'=>$pedido->restaurante->logo]:null,
            'items'=>$pedido->items->map(fn($i)=>['nombre'=>$i->nombre_snapshot,'precio'=>$i->precio_snapshot,'cantidad'=>$i->cantidad,'subtotal'=>$i->subtotal]),
            'repartidor'=>$pedido->repartidor?->only(['id','nombre','apellido','telefono']),
            'created_at'=>$pedido->created_at?->toISOString(),'entregado_at'=>$pedido->entregado_at?->toISOString()];
    }
}
