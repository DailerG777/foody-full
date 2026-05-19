<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Restaurante extends Model {
    use HasFactory;
    protected $fillable=['user_id','nombre','slug','descripcion','categoria','telefono','whatsapp','nequi','daviplata','direccion','lat','lng','foto_portada','logo','menu_pdf','tiempo_min','tiempo_max','pedido_minimo','radio_km','envio_gratis','envio_gratis_desde','abierto','activo','rating','total_resenas','plan'];
    protected $casts=['abierto'=>'boolean','activo'=>'boolean','envio_gratis'=>'boolean','rating'=>'float','lat'=>'float','lng'=>'float'];
    protected $appends=['foto_portada_url','logo_url','menu_pdf_url'];

    public function getFotoPortadaUrlAttribute(): ?string {
        if (!$this->foto_portada) return null;
        if (str_starts_with($this->foto_portada, 'http')) return $this->foto_portada;
        $path = ltrim($this->foto_portada, '/');
        $relPath = str_starts_with($path, 'storage/') ? substr($path, 8) : $path;
        if (file_exists(public_path('images/'.$relPath))) {
            return asset('images/'.$relPath);
        }
        $path = str_starts_with($path, 'storage/') ? $path : 'storage/'.$path;
        return asset($path);
    }
    public function getLogoUrlAttribute(): ?string {
        if (!$this->logo) return null;
        if (str_starts_with($this->logo, 'http')) return $this->logo;
        $path = ltrim($this->logo, '/');
        $relPath = str_starts_with($path, 'storage/') ? substr($path, 8) : $path;
        if (file_exists(public_path('images/'.$relPath))) {
            return asset('images/'.$relPath);
        }
        $path = str_starts_with($path, 'storage/') ? $path : 'storage/'.$path;
        return asset($path);
    }
    public function getMenuPdfUrlAttribute(): ?string {
        if (!$this->menu_pdf) return null;
        if (str_starts_with($this->menu_pdf, 'http')) return $this->menu_pdf;
        $path = ltrim($this->menu_pdf, '/');
        $relPath = str_starts_with($path, 'storage/') ? substr($path, 8) : $path;
        if (file_exists(public_path('images/'.$relPath))) {
            return asset('images/'.$relPath);
        }
        $path = str_starts_with($path, 'storage/') ? $path : 'storage/'.$path;
        return asset($path);
    }
    protected static function booted(): void { static::creating(fn($r)=>$r->slug??=Str::slug($r->nombre).'-'.Str::random(5)); }
    public function user()                 { return $this->belongsTo(User::class); }
    public function productos()            { return $this->hasMany(Producto::class); }
    public function productosDisponibles() { return $this->hasMany(Producto::class)->where('disponible',true); }
    public function categorias()           { return $this->hasMany(MenuCategoria::class)->orderBy('orden'); }
    public function horarios()             { return $this->hasMany(Horario::class); }
    public function pedidos()              { return $this->hasMany(Pedido::class); }
    public function resenas()              { return $this->hasMany(Resena::class)->latest(); }
    public function recalcularRating(): void { $this->update(['rating'=>round($this->resenas()->avg('estrellas')??0,2),'total_resenas'=>$this->resenas()->count()]); }
    public function posts()                { return $this->hasMany(Post::class)->latest(); }
    public function fotos()                { return $this->hasMany(Foto::class)->orderBy('orden'); }
    public function inventario()           { return $this->hasMany(\App\Models\Inventario::class); }
    public function subcuentas()           { return $this->hasMany(\App\Models\SubCuenta::class); }
    public function cajaMovimientos()      { return $this->hasMany(\App\Models\CajaMovimiento::class); }
    public function inventarioMovimientos() { return $this->hasManyThrough(\App\Models\InventarioMovimiento::class, \App\Models\Inventario::class); }
    public function nominas()              { return $this->hasMany(\App\Models\Nomina::class); }
}

class Producto extends Model {
    use HasFactory;
    protected $fillable=['restaurante_id','menu_categoria_id','nombre','descripcion','precio','costo','foto','emoji','disponible','orden'];
    protected $casts=['disponible'=>'boolean','costo'=>'integer'];
    protected $appends=['foto_url'];

    public function getFotoUrlAttribute(): ?string {
        if (!$this->foto) return null;
        if (str_starts_with($this->foto, 'http')) return $this->foto;
        $path = ltrim($this->foto, '/');
        $relPath = str_starts_with($path, 'storage/') ? substr($path, 8) : $path;
        if (file_exists(public_path('images/'.$relPath))) {
            return asset('images/'.$relPath);
        }
        $path = str_starts_with($path, 'storage/') ? $path : 'storage/'.$path;
        return asset($path);
    }

    public function restaurante() { return $this->belongsTo(Restaurante::class); }
    public function categoria()   { return $this->belongsTo(MenuCategoria::class,'menu_categoria_id'); }
}

class MenuCategoria extends Model {
    use HasFactory;
    protected $table='menu_categorias';
    protected $fillable=['restaurante_id','nombre','orden'];
    public function restaurante() { return $this->belongsTo(Restaurante::class); }
    public function productos()   { return $this->hasMany(Producto::class)->orderBy('orden'); }
}

class Horario extends Model {
    use HasFactory;
    protected $fillable=['restaurante_id','dia','hora_apertura','hora_cierre','activo'];
    protected $casts=['activo'=>'boolean'];
    public function restaurante() { return $this->belongsTo(Restaurante::class); }
}

class Direccion extends Model {
    use HasFactory;
    protected $table='direcciones';
    protected $fillable=['user_id','etiqueta','barrio','calle','detalle','indicaciones','lat','lng','principal'];
    protected $casts=['principal'=>'boolean','lat'=>'float','lng'=>'float'];
    public function user() { return $this->belongsTo(User::class); }
    public function textoCompleto(): string { return trim("{$this->barrio} — {$this->calle}".($this->detalle?", {$this->detalle}":'')); }
}

class Pedido extends Model {
    use HasFactory;
    protected $fillable=['referencia','user_id','restaurante_id','repartidor_id','direccion_id','direccion_texto','direccion_lat','direccion_lng','nota','tipo_servicio','descripcion_servicio','contacto_nombre','contacto_telefono','subtotal','costo_domicilio','descuento','total','paga_con','codigo_entrega','metodo_pago','estado','codigo_cupon','aceptado_at','listo_at','entregado_at'];
    protected $casts=['aceptado_at'=>'datetime','listo_at'=>'datetime','entregado_at'=>'datetime'];
    protected static function booted(): void {
        static::creating(function($p){ if(empty($p->referencia)){ do{$r='F-'.strtoupper(Str::random(6));}while(static::where('referencia',$r)->exists()); $p->referencia=$r; } });
    }
    public function user()        { return $this->belongsTo(User::class); }
    public function restaurante() { return $this->belongsTo(Restaurante::class); }
    public function repartidor()  { return $this->belongsTo(User::class,'repartidor_id'); }
    public function direccion()   { return $this->belongsTo(Direccion::class); }
    public function items()       { return $this->hasMany(PedidoItem::class); }
    public function pago()        { return $this->hasOne(Pago::class); }
    public function resena()      { return $this->hasOne(Resena::class); }
    public function totalFormateado(): string { return '$'.number_format($this->total,0,',','.'); }
}

class PedidoItem extends Model {
    use HasFactory;
    protected $table='pedido_items';
    protected $fillable=['pedido_id','producto_id','nombre_snapshot','precio_snapshot','cantidad','subtotal'];
    public function pedido()   { return $this->belongsTo(Pedido::class); }
    public function producto() { return $this->belongsTo(Producto::class); }
}

class Pago extends Model {
    use HasFactory;
    protected $fillable=['pedido_id','referencia_wompi','id_transaccion_wompi','metodo','monto','estado','captura_pago','comprobante_path','respuesta_wompi','pagado_at','verificado_at','verificado_por'];
    protected $casts=['respuesta_wompi'=>'array','pagado_at'=>'datetime','verificado_at'=>'datetime'];
    public function pedido()     { return $this->belongsTo(Pedido::class); }
    public function verificador(){ return $this->belongsTo(User::class,'verificado_por'); }
}

class Cupon extends Model {
    use HasFactory;
    protected $table='cupones';
    protected $fillable=['codigo','descripcion','tipo','valor','minimo_pedido','maximo_usos','usos_actuales','valido_desde','valido_hasta','activo'];
    protected $casts=['activo'=>'boolean','valido_desde'=>'datetime','valido_hasta'=>'datetime'];
    public function esValido(int $total): bool {
        if(!$this->activo) return false;
        if($this->maximo_usos&&$this->usos_actuales>=$this->maximo_usos) return false;
        if($this->valido_desde&&now()->lt($this->valido_desde)) return false;
        if($this->valido_hasta&&now()->gt($this->valido_hasta)) return false;
        if($total<$this->minimo_pedido) return false;
        return true;
    }
    public function calcularDescuento(int $subtotal,int $domicilio): int {
        return match($this->tipo){'porcentaje'=>(int)round($subtotal*$this->valor/100),'fijo'=>min($this->valor,$subtotal),'domicilio_gratis'=>$domicilio,default=>0};
    }
}

class Resena extends Model {
    use HasFactory;
    protected $table='resenas';
    protected $fillable=['pedido_id','user_id','restaurante_id','estrellas','comentario'];
    public function user()        { return $this->belongsTo(User::class); }
    public function restaurante() { return $this->belongsTo(Restaurante::class); }
    public function pedido()      { return $this->belongsTo(Pedido::class); }
}

class Notificacion extends Model {
    use HasFactory;
    protected $table='notificaciones';
    protected $fillable=['user_id','titulo','mensaje','tipo','icono','leida','data'];
    protected $casts=['leida'=>'boolean','data'=>'array'];
    public function user() { return $this->belongsTo(User::class); }
}

class UbicacionRepartidor extends Model {
    use HasFactory;
    protected $table='ubicaciones_repartidor';
    protected $fillable=['user_id','pedido_id','lat','lng','en_linea','actualizado_at'];
    protected $casts=['en_linea'=>'boolean','lat'=>'float','lng'=>'float'];
    public function user()   { return $this->belongsTo(User::class); }
    public function pedido() { return $this->belongsTo(Pedido::class); }
}
// Conversacion, Mensaje, Post, Foto moved to individual files
