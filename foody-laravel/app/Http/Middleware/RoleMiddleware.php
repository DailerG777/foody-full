<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware {
    public function handle(Request $request, Closure $next, string ...$roles): Response {
        $user = $request->user();
        if (!$user)         return response()->json(['message'=>'No autenticado.'], 401);
        if (!$user->activo) return response()->json(['message'=>'Tu cuenta está desactivada.'], 403);
        if (!in_array($user->role, $roles))
            return response()->json(['message'=>'No tienes permisos.','role'=>$user->role,'required'=>$roles], 403);
        return $next($request);
    }
}
