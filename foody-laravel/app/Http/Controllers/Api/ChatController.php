<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{Conversacion,Mensaje,Notificacion};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ChatController extends Controller {
    public function conversaciones(Request $request): JsonResponse {
        $user = $request->user();
        $conversaciones = Conversacion::with(['participante1:id,nombre,apellido,foto','participante2:id,nombre,apellido,foto','ultimoMensaje'])
            ->where(function($q) use ($user) {
                $q->where('participante_1_id',$user->id)->orWhere('participante_2_id',$user->id);
            })
            ->where('archivada',false)
            ->latest()
            ->get();
        return response()->json($conversaciones);
    }

    public function crearConversacion(Request $request): JsonResponse {
        $data = $request->validate([
            'tipo'=>['required','in:cliente_restaurante,cliente_repartidor,repartidor_restaurante,soporte'],
            'participante_2_id'=>['required','exists:users,id','different:'.auth()->id()],
            'pedido_id'=>['nullable','exists:pedidos,id'],
        ]);
        $existente = Conversacion::where('tipo',$data['tipo'])
            ->where(function($q) use ($data) {
                $q->where(function($sq) use ($data) {
                    $sq->where('participante_1_id',auth()->id())->where('participante_2_id',$data['participante_2_id']);
                })->orWhere(function($sq) use ($data) {
                    $sq->where('participante_1_id',$data['participante_2_id'])->where('participante_2_id',auth()->id());
                });
            })
            ->where('pedido_id',$data['pedido_id']??null)
            ->first();
        if ($existente) return response()->json($existente->load(['participante1:id,nombre,apellido','participante2:id,nombre,apellido']));
        $conv = Conversacion::create([
            'tipo'=>$data['tipo'],
            'participante_1_id'=>auth()->id(),
            'participante_2_id'=>$data['participante_2_id'],
            'pedido_id'=>$data['pedido_id']??null,
        ]);
        return response()->json($conv->load(['participante1:id,nombre,apellido','participante2:id,nombre,apellido']),201);
    }

    public function mensajes(Request $request, Conversacion $conversacion): JsonResponse {
        $user = $request->user();
        if ($conversacion->participante_1_id !== $user->id && $conversacion->participante_2_id !== $user->id)
            return response()->json(['message'=>'No autorizado.'],403);
        $conversacion->mensajes()->where('sender_id','!=',$user->id)->where('estado','enviado')->update(['estado'=>'entregado']);
        $mensajes = $conversacion->mensajes()->with('sender:id,nombre,apellido')->oldest()->get();
        return response()->json(['conversacion'=>$conversacion,'mensajes'=>$mensajes]);
    }

    public function enviarMensaje(Request $request, Conversacion $conversacion): JsonResponse {
        $user = $request->user();
        if ($conversacion->participante_1_id !== $user->id && $conversacion->participante_2_id !== $user->id)
            return response()->json(['message'=>'No autorizado.'],403);
        if ($conversacion->archivada)
            return response()->json(['message'=>'Conversación archivada.'],422);

        $data = $request->validate([
            'tipo'=>['sometimes','in:texto,imagen'],
            'contenido'=>['required_without:imagen','string','max:2000'],
            'imagen'=>['required_without:contenido','image','max:5120'],
        ]);

        $imagenPath = null;
        if ($request->hasFile('imagen')) {
            $imagenPath = $request->file('imagen')->store('chat','public');
        }

        $mensaje = Mensaje::create([
            'conversacion_id'=>$conversacion->id,
            'sender_id'=>$user->id,
            'tipo'=>$data['tipo']??'texto',
            'contenido'=>$data['contenido']??'',
            'imagen_path'=>$imagenPath,
            'estado'=>'enviado',
        ]);

        $receptorId = $conversacion->participante_1_id === $user->id
            ? $conversacion->participante_2_id
            : $conversacion->participante_1_id;
        Notificacion::create([
            'user_id'=>$receptorId,
            'titulo'=>'💬 Nuevo mensaje',
            'mensaje'=>mb_substr($mensaje->contenido,0,80),
            'tipo'=>'chat',
            'data'=>['conversacion_id'=>$conversacion->id],
        ]);

        return response()->json($mensaje->load('sender:id,nombre,apellido'),201);
    }

    public function marcarLeido(Request $request, Mensaje $mensaje): JsonResponse {
        $user = $request->user();
        $conv = $mensaje->conversacion;
        if ($conv->participante_1_id !== $user->id && $conv->participante_2_id !== $user->id)
            return response()->json(['message'=>'No autorizado.'],403);
        if ($mensaje->sender_id === $user->id)
            return response()->json(['message'=>'No puedes marcar tus propios mensajes.'],422);
        $mensaje->update(['estado'=>'leido']);
        return response()->json(['message'=>'OK']);
    }
}
