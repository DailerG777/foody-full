<?php
namespace App\Models;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail {
    use HasApiTokens, HasFactory, Notifiable;
    protected $fillable = ['nombre','apellido','email','telefono','cedula','tipo_vehiculo','placa','foto_cedula','foto_cara','password','role','plan','estado_verificacion','foto','activo'];
    protected $hidden   = ['password','remember_token'];
    protected $casts    = ['email_verified_at'=>'datetime','password'=>'hashed','activo'=>'boolean'];

    public function isAdmin():       bool { return $this->role === 'admin'; }
    public function isCliente():     bool { return $this->role === 'cliente'; }
    public function isRestaurante(): bool { return $this->role === 'restaurante'; }
    public function isRepartidor():  bool { return $this->role === 'repartidor'; }
    public function isPremium():     bool { return $this->plan === 'premium'; }
    public function nombreCompleto():string { return "{$this->nombre} {$this->apellido}"; }

    public function restaurante()           { return $this->hasOne(Restaurante::class); }
    public function pedidos()               { return $this->hasMany(Pedido::class); }
    public function pedidosComoRepartidor() { return $this->hasMany(Pedido::class,'repartidor_id'); }
    public function direcciones()           { return $this->hasMany(Direccion::class); }
    public function notificaciones()        { return $this->hasMany(Notificacion::class); }
    public function ubicacion()             { return $this->hasOne(UbicacionRepartidor::class); }
    public function conversaciones()        { return $this->hasMany(Conversacion::class,'participante_1_id')->orWhere('participante_2_id',$this->id); }
    public function mensajesEnviados()      { return $this->hasMany(Mensaje::class,'sender_id'); }
}
