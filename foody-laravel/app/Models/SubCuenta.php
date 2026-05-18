<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SubCuenta extends Model {
    use HasFactory;
    protected $table='sub_cuentas';
    protected $fillable=['restaurante_id','nombre','email','password','telefono','rol','pin','api_token','activo'];
    protected $casts=['activo'=>'boolean'];
    protected $hidden=['password','api_token','remember_token'];

    public function restaurante() { return $this->belongsTo(Restaurante::class); }

    public function generateApiToken(): string {
        $this->api_token = Str::random(80);
        $this->save();
        return $this->api_token;
    }
}
