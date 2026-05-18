<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{Notificacion,Pago,Pedido};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Http,Log};
use Illuminate\Support\Str;

class WompiController extends Controller {
    private string $publicKey,$privateKey,$integrityKey,$baseUrl;
    public function __construct() {
        $env=config('services.wompi.env','sandbox');
        $this->publicKey=config('services.wompi.public_key');
        $this->privateKey=config('services.wompi.private_key');
        $this->integrityKey=config('services.wompi.integrity_key');
        $this->baseUrl=$env==='production'?'https://production.wompi.co/v1':'https://sandbox.wompi.co/v1';
    }

    public function iniciarPago(Request $request): JsonResponse {
        $request->validate(['pedido_id'=>['required','exists:pedidos,id']]);
        $pedido=Pedido::findOrFail($request->pedido_id);
        if($pedido->user_id!==$request->user()->id) return response()->json(['message'=>'No autorizado.'],403);
        if($pedido->estado!=='pendiente') return response()->json(['message'=>'Pedido ya procesado.'],422);
        $ref=$pedido->referencia.'-'.strtoupper(Str::random(4));
        $firma=$this->firma($ref,$pedido->total*100,'COP');
        Pago::updateOrCreate(['pedido_id'=>$pedido->id],['referencia_wompi'=>$ref,'metodo'=>$pedido->metodo_pago,'monto'=>$pedido->total,'estado'=>'pendiente']);
        return response()->json(['public_key'=>$this->publicKey,'referencia'=>$ref,'monto_en_centavos'=>$pedido->total*100,'moneda'=>'COP','firma_integridad'=>$firma,'redirect_url'=>config('app.frontend_url').'/pedido/'.$pedido->referencia,'pedido'=>['referencia'=>$pedido->referencia,'total'=>$pedido->total,'restaurante'=>$pedido->restaurante->nombre]]);
    }

    public function webhook(Request $request): JsonResponse {
        if(!$this->verificarWebhook($request)){Log::warning('Wompi webhook firma inválida',$request->all());return response()->json(['message'=>'Firma inválida.'],401);}
        $evento=$request->input('event'); $data=$request->input('data.transaction',[]);
        if($evento!=='transaction.updated') return response()->json(['message'=>'Ignorado.']);
        $ref=$data['reference']??null;
        if(!$ref) return response()->json(['message'=>'Sin referencia.'],400);
        $parts=explode('-',$ref); $refPedido=$parts[0].'-'.$parts[1];
        $pedido=Pedido::where('referencia',$refPedido)->first();
        if(!$pedido) return response()->json(['message'=>'Pedido no encontrado.'],404);
        $pago=Pago::where('pedido_id',$pedido->id)->first();
        if(!$pago) return response()->json(['message'=>'Pago no encontrado.'],404);
        $estado=match($data['status']??''){'APPROVED'=>'aprobado','DECLINED','VOIDED'=>'rechazado','ERROR'=>'error',default=>'pendiente'};
        $pago->update(['id_transaccion_wompi'=>$data['id']??null,'estado'=>$estado,'respuesta_wompi'=>$data,'pagado_at'=>$estado==='aprobado'?now():null]);
        if($estado==='aprobado'){
            Notificacion::create(['user_id'=>$pedido->restaurante->user_id,'titulo'=>'💳 Pago confirmado','mensaje'=>"Pago aprobado #{$pedido->referencia}",'tipo'=>'pago','data'=>['pedido_id'=>$pedido->id]]);
            Notificacion::create(['user_id'=>$pedido->user_id,'titulo'=>'✅ Pago exitoso','mensaje'=>'Tu pago fue aprobado.','tipo'=>'pago','data'=>['pedido_id'=>$pedido->id]]);
        }
        return response()->json(['message'=>'OK']);
    }

    public function subirComprobante(Request $request): JsonResponse {
        $request->validate([
            'pedido_id'=>['required','exists:pedidos,id'],
            'comprobante'=>['required','image','max:5120'],
        ]);
        $pedido = Pedido::findOrFail($request->pedido_id);
        if ($pedido->user_id !== $request->user()->id)
            return response()->json(['message'=>'No autorizado.'],403);
        $path = $request->file('comprobante')->store('comprobantes','public');
        $pago = Pago::updateOrCreate(
            ['pedido_id'=>$pedido->id],
            ['metodo'=>$pedido->metodo_pago,'monto'=>$pedido->total,'estado'=>'pendiente_verificacion','captura_pago'=>$path,'comprobante_path'=>$path]
        );
        Notificacion::create([
            'user_id'=>$pedido->restaurante->user_id,
            'titulo'=>'📷 Comprobante subido',
            'mensaje'=>"Comprobante de pago para #{$pedido->referencia}",
            'tipo'=>'pago',
            'data'=>['pedido_id'=>$pedido->id,'pago_id'=>$pago->id],
        ]);
        return response()->json(['message'=>'Comprobante recibido, pendiente de verificación.','pago'=>$pago]);
    }

    public function consultarEstado(Request $request,string $ref): JsonResponse {
        $pedido=Pedido::where('referencia',$ref)->where('user_id',$request->user()->id)->firstOrFail();
        $pago=$pedido->pago;
        if(!$pago) return response()->json(['estado'=>'sin_pago']);
        return response()->json(['estado'=>$pago->estado,'monto'=>$pago->monto,'metodo'=>$pago->metodo,'pagado_at'=>$pago->pagado_at?->toISOString()]);
    }

    private function firma(string $ref,int $monto,string $moneda): string {
        return hash('sha256',$ref.$monto.$moneda.$this->integrityKey);
    }
    private function verificarWebhook(Request $request): bool {
        $secret=config('services.wompi.webhook_secret');
        $ts=$request->header('X-Wompi-Timestamp'); $sig=$request->header('X-Wompi-Signature');
        if(!$ts||!$sig) return false;
        return hash_equals(hash_hmac('sha256',$ts.'.'.$request->getContent(),$secret),$sig);
    }
}
