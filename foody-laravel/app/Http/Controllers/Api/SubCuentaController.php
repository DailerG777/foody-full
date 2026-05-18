<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\SubCuenta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SubCuentaController extends Controller {
    public function index(Request $request): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante) return response()->json(['message'=>'No tienes un restaurante.'],404);
        return response()->json(SubCuenta::where('restaurante_id',$restaurante->id)->get());
    }

    public function store(Request $request): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante) return response()->json(['message'=>'No tienes un restaurante.'],404);
        $data = $request->validate([
            'nombre'=>['required','string','max:100'],
            'email'=>['required','email','max:100','unique:sub_cuentas'],
            'password'=>['required','string','min:6'],
            'telefono'=>['nullable','string','max:20'],
            'rol'=>['required','in:mesero,cajero,cocinero,supervisor'],
            'pin'=>['nullable','string','min:4','max:6'],
        ]);
        $data['password'] = Hash::make($data['password']);
        $data['restaurante_id'] = $restaurante->id;
        $sub = SubCuenta::create($data);
        return response()->json($sub,201);
    }

    public function update(Request $request, SubCuenta $subcuenta): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante || $subcuenta->restaurante_id !== $restaurante->id)
            return response()->json(['message'=>'No autorizado.'],403);
        $data = $request->validate([
            'nombre'=>['sometimes','string','max:100'],
            'email'=>['sometimes','email','max:100','unique:sub_cuentas,email,'.$subcuenta->id],
            'password'=>['sometimes','string','min:6'],
            'telefono'=>['nullable','string','max:20'],
            'rol'=>['sometimes','in:mesero,cajero,cocinero,supervisor'],
            'pin'=>['nullable','string','min:4','max:6'],
        ]);
        if (isset($data['password'])) $data['password'] = Hash::make($data['password']);
        $subcuenta->update($data);
        return response()->json($subcuenta);
    }

    public function destroy(Request $request, SubCuenta $subcuenta): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante || $subcuenta->restaurante_id !== $restaurante->id)
            return response()->json(['message'=>'No autorizado.'],403);
        $subcuenta->delete();
        return response()->json(['message'=>'Subcuenta eliminada.']);
    }

    public function toggleActivo(Request $request, SubCuenta $subcuenta): JsonResponse {
        $restaurante = $request->user()->restaurante;
        if (!$restaurante || $subcuenta->restaurante_id !== $restaurante->id)
            return response()->json(['message'=>'No autorizado.'],403);
        $subcuenta->update(['activo'=>!$subcuenta->activo]);
        return response()->json($subcuenta);
    }

    public function login(Request $request): JsonResponse {
        $data = $request->validate([
            'email'=>['required','email'],
            'pin'=>['required','string','min:4','max:6'],
        ]);
        $sub = SubCuenta::where('email',$data['email'])->first();
        if (!$sub || $sub->pin !== $data['pin'] || !$sub->activo)
            return response()->json(['message'=>'Credenciales inválidas o cuenta inactiva.'],401);
        return response()->json([
            'subcuenta' => $sub,
            'token' => $sub->generateApiToken(),
        ]);
    }
}
