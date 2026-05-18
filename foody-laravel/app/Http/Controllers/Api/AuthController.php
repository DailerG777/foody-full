<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller {
    public function register(Request $request): JsonResponse {
        $data = $request->validate([
            'nombre'   => ['required','string','max:80'],
            'apellido' => ['required','string','max:80'],
            'email'    => ['required','email','max:180','unique:users'],
            'telefono' => ['nullable','string','max:20'],
            'password' => ['required','confirmed', Password::min(8)->mixedCase()->numbers()],
            'role'     => ['required','in:cliente,restaurante,repartidor'],
            'cedula'   => ['required_if:role,repartidor','nullable','string','max:20'],
            'tipo_vehiculo'=>['required_if:role,repartidor','nullable','in:moto,bicicleta,a_pie'],
            'placa'    => ['nullable','string','max:10'],
        ]);
        $extra = ['role'=>$data['role']];
        if ($data['role'] === 'repartidor') {
            $extra['cedula'] = $data['cedula'] ?? null;
            $extra['tipo_vehiculo'] = $data['tipo_vehiculo'] ?? null;
            $extra['placa'] = $data['placa'] ?? null;
            $extra['estado_verificacion'] = 'pendiente';
        }
        $user = User::create(array_merge([
            'nombre'=>$data['nombre'],'apellido'=>$data['apellido'],
            'email'=>$data['email'],'telefono'=>$data['telefono']??null,
            'password'=>Hash::make($data['password']),
            'email_verified_at'=>now(),
        ], $extra));
        return response()->json(['message'=>'Cuenta creada.','user'=>$this->resource($user)],201);
    }

    public function login(Request $request): JsonResponse {
        $request->validate(['email'=>['required','email'],'password'=>['required','string']]);
        $user = User::where('email',$request->email)->first();
        if (!$user || !Hash::check($request->password,$user->password))
            throw ValidationException::withMessages(['email'=>['Credenciales incorrectas.']]);
        if (!$user->activo) return response()->json(['message'=>'Cuenta desactivada.'],403);
        if (!$user->hasVerifiedEmail())
            return response()->json(['message'=>'Verifica tu correo.','email_unverified'=>true],403);
        $user->tokens()->delete();
        $token = $user->createToken('foody-token',$this->abilities($user->role));
        return response()->json(['token'=>$token->plainTextToken,'user'=>$this->resource($user)]);
    }

    public function logout(Request $request): JsonResponse {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message'=>'Sesión cerrada.']);
    }

    public function me(Request $request): JsonResponse {
        return response()->json(['user'=>$this->resource($request->user()->load('restaurante','direcciones'),true)]);
    }

    public function updateProfile(Request $request): JsonResponse {
        $data = $request->validate([
            'nombre'=>['sometimes','string','max:80'],
            'apellido'=>['sometimes','string','max:80'],
            'telefono'=>['sometimes','string','max:20'],
            'foto'=>['sometimes','image','max:2048'],
        ]);
        if ($request->hasFile('foto'))
            $data['foto'] = $request->file('foto')->store('usuarios','public');
        $request->user()->update($data);
        return response()->json(['user'=>$this->resource($request->user()->fresh())]);
    }

    public function changePassword(Request $request): JsonResponse {
        $request->validate([
            'current_password'=>['required','current_password'],
            'password'=>['required','confirmed',Password::min(8)->mixedCase()->numbers()],
        ]);
        $request->user()->update(['password'=>Hash::make($request->password)]);
        $request->user()->tokens()->delete();
        return response()->json(['message'=>'Contraseña actualizada.']);
    }

    public function resendVerification(Request $request): JsonResponse {
        $request->validate(['email'=>['required','email']]);
        $user = User::where('email',$request->email)->first();
        if (!$user) return response()->json(['message'=>'Correo no encontrado.'],404);
        if ($user->hasVerifiedEmail()) return response()->json(['message'=>'Ya verificado.']);
        $user->sendEmailVerificationNotification();
        return response()->json(['message'=>'Email reenviado.']);
    }

    public function verifyEmail(Request $request,$id,$hash): JsonResponse {
        $user = User::findOrFail($id);
        if (!hash_equals(sha1($user->getEmailForVerification()),$hash))
            return response()->json(['message'=>'Enlace inválido.'],400);
        if (!$user->hasVerifiedEmail()) $user->markEmailAsVerified();
        return response()->json(['message'=>'¡Email verificado!']);
    }

    private function resource(User $user,bool $full=false): array {
        $base = ['id'=>$user->id,'nombre'=>$user->nombre,'apellido'=>$user->apellido,
            'nombre_completo'=>$user->nombreCompleto(),'email'=>$user->email,
            'telefono'=>$user->telefono,'cedula'=>$user->cedula,
            'tipo_vehiculo'=>$user->tipo_vehiculo,'placa'=>$user->placa,
            'estado_verificacion'=>$user->estado_verificacion,
            'role'=>$user->role,'plan'=>$user->plan,
            'foto'=>$user->foto?asset('storage/'.$user->foto):null,
            'verificado'=>(bool)$user->email_verified_at];
        if ($full) {
            $base['restaurante']=$user->restaurante?->only(['id','nombre','slug','abierto','activo']);
            $base['direcciones']=$user->direcciones;
        }
        return $base;
    }

    private function abilities(string $role): array {
        return match($role) {
            'admin'=>['*'],
            'restaurante'=>['restaurante:*','pedido:read','pedido:update'],
            'repartidor'=>['repartidor:*','pedido:read','pedido:update','ubicacion:update'],
            default=>['pedido:create','pedido:read','perfil:update'],
        };
    }
}
