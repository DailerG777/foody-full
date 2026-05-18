<?php
namespace Database\Seeders;
use App\Models\{CajaMovimiento, Cupon, Direccion, Inventario, InventarioMovimiento, MenuCategoria, Nomina, Pedido, PedidoItem, Pago, Producto, Restaurante, SubCuenta, User};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder {
    public function run(): void {
        $admin = User::create(['nombre'=>'Super','apellido'=>'Admin','email'=>'admin@foody.co','password'=>Hash::make('Admin123!'),'role'=>'admin','email_verified_at'=>now()]);
        $cliente = User::create(['nombre'=>'Jorge','apellido'=>'González','email'=>'jorge@foody.co','password'=>Hash::make('Cliente123!'),'role'=>'cliente','telefono'=>'3009876543','email_verified_at'=>now()]);
        Direccion::create(['user_id'=>$cliente->id,'etiqueta'=>'Casa','barrio'=>'Centro','calle'=>'Calle 12 #8-45','principal'=>true]);
        $repartidor = User::create([
            'nombre'=>'Carlos','apellido'=>'Méndez','email'=>'carlos@foody.co','password'=>Hash::make('Rep123!'),
            'role'=>'repartidor','telefono'=>'3005551234','cedula'=>'1234567890','tipo_vehiculo'=>'moto','placa'=>'ABC-123',
            'estado_verificacion'=>'aprobado','email_verified_at'=>now(),
        ]);

        $restaurants = [
            // 1
            ['nombre'=>'La Mansión','slug'=>'la-mansion','categoria'=>'Gourmet','direccion'=>'Calle 11 #10-64, Barrio Centro','lat'=>8.2325641,'lng'=>-73.3543133,'dueno'=>['nombre'=>'Andrés','apellido'=>'Martínez','email'=>'lamansion@foody.co'],'productos'=>[['Entradas',[['Ceviche de camarón',28000,'🦐'],['Langostinos al ajillo',32000,'🦐'],['Croquetas de jamón',18000,'🧆']]],['Platos Fuertes',[['Lomo al trapo',52000,'🥩'],['Salmón glaseado',48000,'🐟'],['Risotto de hongos',38000,'🍚'],['Pasta Alfredo con pollo',32000,'🍝']]],['Bebidas',[['Limonada natural',6000,'🍋'],['Mojito clásico',15000,'🍹'],['Vino tinto copa',18000,'🍷']]]],'inventario'=>[['Lomo fino','Carnes','kg',10,3,45000],['Salmón fresco','Carnes','kg',5,2,38000],['Arroz','Despensa','kg',20,5,4000],['Crema de leche','Lácteos','litro',8,2,5500],['Limón','Verduras','kg',6,2,3000]]],
            // 2
            ['nombre'=>'La Provincia','slug'=>'la-provincia','categoria'=>'Peruana','direccion'=>'Carrera 13 #10-10, Barrio San Francisco','lat'=>8.25803,'lng'=>-73.35976,'dueno'=>['nombre'=>'Carmen','apellido'=>'Ríos','email'=>'laprovincia@foody.co'],'productos'=>[['Entradas',[['Causa limeña',16000,'🥔'],['Tequeños (6 und)',14000,'🧀'],['Papa rellena',10000,'🥟']]],['Platos Fuertes',[['Lomo saltado',32000,'🥩'],['Ají de gallina',28000,'🍗'],['Ceviche clásico',30000,'🐟'],['Arroz con mariscos',35000,'🍚']]],['Bebidas',[['Chicha morada',5000,'🍷'],['Maracuyá natural',6000,'🍹'],['Inca Kola',3500,'🥤']]]],'inventario'=>[['Papa amarilla','Verduras','kg',15,5,3500],['Pescado tilapia','Carnes','kg',8,3,18000],['Ají amarillo','Verduras','kg',3,1,8000],['Limón','Verduras','kg',10,3,3000],['Arroz','Despensa','kg',25,5,4000]]],
            // 3
            ['nombre'=>'Amaretto','slug'=>'amaretto','categoria'=>'Italiana','direccion'=>'Calle 11 #12-25, Barrio Martinete','lat'=>8.2352713,'lng'=>-73.3533339,'dueno'=>['nombre'=>'Luis','apellido'=>'Ferro','email'=>'amaretto@foody.co'],'productos'=>[['Entradas',[['Bruschetta clásica',14000,'🍞'],['Carpaccio de res',22000,'🥩'],['Ensalada César',16000,'🥗']]],['Pastas',[['Spaghetti carbonara',28000,'🍝'],['Lasagna boloñesa',30000,'🧀'],['Raviolis de ricotta',32000,'🥟']]],['Bebidas',[['Agua mineral',3000,'💧'],['Copa de vino tinto',16000,'🍷'],['Café espresso',3500,'☕']]]],'inventario'=>[['Harina','Despensa','kg',15,5,2500],['Queso parmesano','Lácteos','kg',5,2,22000],['Crema de leche','Lácteos','litro',8,2,5500],['Aceite de oliva','Despensa','litro',5,1,15000],['Tomate','Verduras','kg',10,3,3000]]],
            // 4
            ['nombre'=>'Tributo Restaurante','slug'=>'tributo','categoria'=>'Criolla','direccion'=>'Carrera 13 #12-45, Barrio San Francisco','lat'=>8.233979,'lng'=>-73.354806,'dueno'=>['nombre'=>'Diego','apellido'=>'Castaño','email'=>'tributo@foody.co'],'productos'=>[['Entradas',[['Patacón con hogao',10000,'🍌'],['Empanadas (4 und)',10000,'🥟'],['Arepa de huevo',8000,'🫓']]],['Platos Fuertes',[['Bandeja paisa',35000,'🍽️'],['Sancocho de gallina',28000,'🥘'],['Carne desmechada',25000,'🥩'],['Pechuga gratinada',22000,'🍗']]],['Bebidas',[['Limonada natural',5000,'🍋'],['Jugo de mango',5000,'🧃'],['Gaseosa',3000,'🥤']]]],'inventario'=>[['Carne de res','Carnes','kg',15,5,28000],['Pollo','Carnes','kg',12,4,12000],['Plátano','Verduras','kg',20,5,2000],['Frijol','Despensa','kg',10,3,3500],['Arroz','Despensa','kg',30,5,4000]]],
            // 5
            ['nombre'=>'Bisonte Food & Drinks','slug'=>'bisonte','categoria'=>'Bar & Grill','direccion'=>'Calle 12 #13-05, Barrio San Francisco','lat'=>8.2591503,'lng'=>-73.3611758,'dueno'=>['nombre'=>'Felipe','apellido'=>'Ortiz','email'=>'bisonte@foody.co'],'productos'=>[['Hamburguesas',[['Hamburguesa clásica',22000,'🍔'],['Hamburguesa bisonte',32000,'🍔'],['Hamburguesa BBQ',28000,'🍔']]],['Perros',[['Perro caliente sencillo',12000,'🌭'],['Perro caliente especial',18000,'🌭']]],['Bebidas',[['Cerveza artesanal',8000,'🍺'],['Gaseosa litro',5000,'🥤'],['Limonada con hierbabuena',7000,'🍹']]]],'inventario'=>[['Pan de hamburguesa','Despensa','unidad',40,10,1500],['Carne molida','Carnes','kg',10,3,22000],['Tocino','Carnes','kg',4,1,18000],['Queso americano','Lácteos','kg',5,2,14000],['Papa francesa','Despensa','kg',15,5,3500]]],
            // 6
            ['nombre'=>'Monos Cocina Fusión','slug'=>'monos-fusion','categoria'=>'Fusión','direccion'=>'Carrera 12 #11-40, Barrio Martinete','lat'=>8.2574729,'lng'=>-73.3597605,'dueno'=>['nombre'=>'Mónica','apellido'=>'Suárez','email'=>'monosfusion@foody.co'],'productos'=>[['Entradas',[['Spring rolls asiáticos',14000,'🥟'],['Tartar de atún',24000,'🐟'],['Nachos con guacamole',16000,'🫓']]],['Platos Fuertes',[['Ramen de cerdo',28000,'🍜'],['Curry de pollo',26000,'🍛'],['Wok de verduras',22000,'🥬']]],['Cócteles',[['Mojito frutal',15000,'🍹'],['Margarita de maracuyá',16000,'🍸'],['Cóctel de la casa',18000,'🍷']]]],'inventario'=>[['Arroz','Despensa','kg',20,5,4000],['Fideos asiáticos','Despensa','kg',8,2,5000],['Pollo','Carnes','kg',10,3,12000],['Cilantro','Verduras','kg',2,1,3000],['Salsa de soya','Despensa','litro',3,1,6000]]],
            // 7
            ['nombre'=>"Arepería La Ocañerita",'slug'=>'areperia-ocanerita','categoria'=>'Comida Típica','direccion'=>'Calle 10 #12-15, Sector del Mercado (Centro)','lat'=>8.2367498,'lng'=>-73.3527075,'dueno'=>['nombre'=>'Rosa','apellido'=>'Contreras','email'=>'areperiaocanerita@foody.co'],'productos'=>[['Arepas',[['Arepa paisa',8000,'🫓'],['Arepa de choclo',10000,'🫓'],['Arepa rellena de carne',12000,'🫓'],['Arepa rellena de pollo',12000,'🫓']]],['Desayunos',[['Calentado paisa',15000,'🍲'],['Huevos pericos con arepa',12000,'🍳']]],['Bebidas',[['Chocolate caliente',3500,'🍫'],['Café con leche',2500,'☕'],['Jugo de naranja',4000,'🍊']]]],'inventario'=>[['Harina de maíz','Despensa','kg',25,10,2500],['Huevos','Despensa','unidad',60,30,500],['Carne de res','Carnes','kg',8,3,28000],['Queso costeño','Lácteos','kg',6,2,16000],['Aceite','Despensa','litro',5,2,6000]]],
            // 8
            ['nombre'=>'Restaurante Boyacá','slug'=>'restaurante-boyaca','categoria'=>'Comida Típica','direccion'=>'Calle 11 #11-20, Barrio Centro','lat'=>8.2240801,'lng'=>-73.3364962,'dueno'=>['nombre'=>'Jairo','apellido'=>'Cifuentes','email'=>'restboyaca@foody.co'],'productos'=>[['Entradas',[['Arepa boyacense',8000,'🫓'],['Longaniza con papa',12000,'🌭'],['Mazorca asada',8000,'🌽']]],['Platos Fuertes',[['Cocido boyacense',28000,'🥘'],['Mute santandereano',30000,'🥣'],['Carne oreada',26000,'🥩'],['Tamal tol semanas',12000,'🫔']]],['Bebidas',[['Chicha',5000,'🍷'],['Agua de panela con limón',4000,'🍵'],['Gaseosa',3000,'🥤']]]],'inventario'=>[['Carne de res','Carnes','kg',10,3,28000],['Papa criolla','Verduras','kg',15,5,3000],['Mazorca','Verduras','kg',12,3,2500],['Arroz','Despensa','kg',20,5,4000],['Longaniza','Carnes','kg',5,2,15000]]],
            // 9
            ['nombre'=>'Restaurante Leo','slug'=>'restaurante-leo','categoria'=>'Criolla','direccion'=>'Carrera 11 #10-30, Barrio Centro','lat'=>8.2382731,'lng'=>-73.3552287,'dueno'=>['nombre'=>'Leonardo','apellido'=>'Páez','email'=>'restleo@foody.co'],'productos'=>[['Entradas',[['Ceviche de camarón',30000,'🦐'],['Patacón con guacamole',12000,'🥑'],['Empanadas de carne',10000,'🥟']]],['Platos Fuertes',[['Lomo al trapo',48000,'🥩'],['Pechuga a la plancha',22000,'🍗'],['Pescado frito con patacón',28000,'🐟'],['Sobrebarriega',25000,'🥩']]],['Bebidas',[['Limonada natural',5000,'🍋'],['Jugo de lulo',5000,'🧃'],['Cerveza',5000,'🍺']]]],'inventario'=>[['Lomo fino','Carnes','kg',8,2,45000],['Pescado tilapia','Carnes','kg',6,2,18000],['Plátano','Verduras','kg',15,4,2000],['Yuca','Verduras','kg',12,4,2500],['Arroz','Despensa','kg',25,5,4000]]],
            // 10
            ['nombre'=>'Nigiri Sushi Bar','slug'=>'nigiri-sushi','categoria'=>'Japonesa','direccion'=>'Vía a la Universidad (UFPSO)','lat'=>8.2623786,'lng'=>-73.3585253,'dueno'=>['nombre'=>'Takashi','apellido'=>'Yamamoto','email'=>'nigiri@foody.co'],'productos'=>[['Entradas',[['Edamame',12000,'🫘'],['Wakame salad',10000,'🥗'],['Gyozas (6 und)',16000,'🥟'],['Tempura vegetal',14000,'🍤']]],['Rollos',[['Philadelphia Roll',18000,'🍣'],['California Roll',18000,'🍣'],['Dragon Roll',22000,'🐉'],['Nigiri especial (8 und)',28000,'🍣'],['Spicy Tuna Roll',20000,'🌊']]],['Platos Fuertes',[['Teriyaki Chicken',24000,'🍗'],['Salmón teriyaki',32000,'🐟'],['Yakisoba de pollo',22000,'🍜'],['Arroz oriental',18000,'🍚']]],['Bebidas',[['Té verde',4000,'🍵'],['Ramune japonés',8000,'🥤'],['Agua',3000,'💧'],['Cerveza Asahi',10000,'🍺']]]],'inventario'=>[['Arroz japonés','Despensa','kg',20,5,5000],['Salmón fresco','Carnes','kg',8,2,38000],['Alga nori','Despensa','unidad',100,20,500],['Queso crema','Lácteos','kg',5,2,12000],['Salsa de soya','Despensa','litro',5,2,6000]]],
            // 11
            ['nombre'=>'La Convención 1828','slug'=>'la-convencion-1828','categoria'=>'Gourmet','direccion'=>'Calle 10 #9-45, Complejo Histórico de San Francisco','lat'=>8.2318827,'lng'=>-73.355133,'dueno'=>['nombre'=>'Fernando','apellido'=> 'Silva','email'=>'convencion1828@foody.co'],'productos'=>[['Entradas',[['Tabla de quesos',28000,'🧀'],['Ceviche de camarón',32000,'🦐'],['Crema de auyama',18000,'🎃']]],['Platos Fuertes',[['Filete mignon',58000,'🥩'],['Salmón al romero',48000,'🐟'],['Risotto de langostinos',42000,'🍚']]],['Postres',[['Tiramisú',16000,'🍰'],['Crème brûlée',18000,'🍮'],['Helado artesanal',12000,'🍨']]]],'inventario'=>[['Lomo fino','Carnes','kg',8,2,45000],['Salmón fresco','Carnes','kg',4,1,38000],['Queso brie','Lácteos','kg',3,1,30000],['Crema de leche','Lácteos','litro',6,2,5500],['Huevos','Despensa','unidad',40,10,500]]],
            // 12
            ['nombre'=>'Restaurante El Futuro','slug'=>'el-futuro','categoria'=>'Criolla','direccion'=>'Sector Agua de la Virgen','lat'=>8.2347,'lng'=>-73.3626,'dueno'=>['nombre'=>'Alberto','apellido'=>'Mora','email'=>'elfuturo@foody.co'],'productos'=>[['Entradas',[['Arepa asada',6000,'🫓'],['Empanadas de pollo',10000,'🥟'],['Chicharrón con yuca',14000,'🥓']]],['Platos Fuertes',[['Mondongo',28000,'🥣'],['Sancocho trifásico',30000,'🥘'],['Sobrebarriega',25000,'🥩'],['Pollo sudado',22000,'🍗']]],['Bebidas',[['Limonada',5000,'🍋'],['Gaseosa',3000,'🥤'],['Agua de panela',4000,'🍵']]]],'inventario'=>[['Carne de res','Carnes','kg',10,3,28000],['Pollo','Carnes','kg',12,4,12000],['Yuca','Verduras','kg',15,4,2500],['Arroz','Despensa','kg',25,5,4000],['Panela','Despensa','kg',8,2,4000]]],
            // 13
            ['nombre'=>'Cuestarica','slug'=>'cuestarica','categoria'=>'Mariscos','direccion'=>'Carrera 12 #7-10, Sector El Carretero','lat'=>8.2318421,'lng'=>-73.3499938,'dueno'=>['nombre'=>'Ricardo','apellido'=>'Marín','email'=>'cuestarica@foody.co'],'productos'=>[['Entradas',[['Ceviche mixto',28000,'🦐'],['Ostiones gratinados',32000,'🦪'],['Patacón con camarón',18000,'🍤']]],['Platos Fuertes',[['Pescado frito entero',35000,'🐟'],['Arroz con camarones',32000,'🍚'],['Langosta al ajillo',55000,'🦞'],['Cazuela de mariscos',38000,'🥘']]],['Bebidas',[['Limonada de coco',6000,'🥥'],['Cerveza fría',5000,'🍺'],['Agua',2500,'💧']]]],'inventario'=>[['Camarón','Carnes','kg',8,2,35000],['Pescado tilapia','Carnes','kg',10,3,18000],['Limón','Verduras','kg',12,3,3000],['Arroz','Despensa','kg',20,5,4000],['Coco','Despensa','unidad',10,3,3000]]],
            // 14
            ['nombre'=>'El Burro Burger','slug'=>'el-burro-burger','categoria'=>'Fast Food','direccion'=>'Calle 11 #14-20, Barrio San Francisco','lat'=>8.2346264,'lng'=>-73.3546026,'dueno'=>['nombre'=>'Julián','apellido'=>'Rincón','email'=>'elburroburger@foody.co'],'productos'=>[['Hamburguesas',[['Hamburguesa sencilla',16000,'🍔'],['Hamburguesa doble carne',24000,'🍔'],['Hamburguesa ahumada',28000,'🍔']]],['Perros y Salchipapas',[['Perro caliente',10000,'🌭'],['Salchipapa familiar',22000,'🍟'],['Salchipapa personal',12000,'🍟']]],['Bebidas',[['Gaseosa personal',3000,'🥤'],['Malteada',8000,'🥤'],['Limonada',5000,'🍋']]]],'inventario'=>[['Pan de hamburguesa','Despensa','unidad',50,15,1200],['Carne molida','Carnes','kg',12,4,22000],['Papas congeladas','Despensa','kg',20,5,4000],['Salchicha','Carnes','kg',8,2,12000],['Queso','Lácteos','kg',5,2,14000]]],
            // 15
            ['nombre'=>'The Social Food & Drinks','slug'=>'the-social','categoria'=>'Fusión','direccion'=>'Calle 12 #12-50, Barrio Martinete','lat'=>8.2568616,'lng'=>-73.3598625,'dueno'=>['nombre'=>'Camila','apellido'=>'Andrade','email'=>'thesocial@foody.co'],'productos'=>[['Entradas',[['Alitas BBQ',22000,'🍗'],['Nachos con queso',16000,'🫓'],['Aros de cebolla',12000,'🧅']]],['Platos Fuertes',[['Wrap de pollo',22000,'🌯'],['Sándwich club',20000,'🥪'],['Ensalada César con pollo',18000,'🥗']]],['Cócteles',[['Mojito',15000,'🍹'],['Margarita',16000,'🍸'],['Cerveza artesanal',8000,'🍺']]]],'inventario'=>[['Pollo','Carnes','kg',10,3,12000],['Pan de sándwich','Despensa','unidad',30,10,2000],['Lechuga','Verduras','kg',5,2,3000],['Queso cheddar','Lácteos','kg',4,1,16000],['Salsa BBQ','Despensa','litro',3,1,8000]]],
            // 16
            ['nombre'=>'Wicho Wings','slug'=>'wicho-wings','categoria'=>'Fast Food','direccion'=>'Carrera 13 con Calle 11, Barrio San Francisco','lat'=>8.2408202,'lng'=>-73.3539092,'dueno'=>['nombre'=>'Wilson','apellido'=>'Chávez','email'=>'wichowings@foody.co'],'productos'=>[['Alitas',[['Alitas BBQ (6 und)',18000,'🍗'],['Alitas BBQ (12 und)',32000,'🍗'],['Alitas picantes (6 und)',18000,'🌶️'],['Alitas BBQ (24 und)',55000,'🍗']]],['Acompañantes',[['Papas a la francesa',8000,'🍟'],['Yuca frita',8000,'🫒'],['Aros de cebolla',10000,'🧅']]],['Bebidas',[['Gaseosa',3000,'🥤'],['Cerveza',5000,'🍺'],['Limonada',5000,'🍋']]]],'inventario'=>[['Alitas de pollo','Carnes','kg',15,5,15000],['Salsa BBQ','Despensa','litro',5,1,8000],['Salsa picante','Despensa','litro',3,1,12000],['Papa','Verduras','kg',20,5,3000],['Aceite','Despensa','litro',8,2,6000]]],
            // 17
            ['nombre'=>'Vacanos','slug'=>'vacanos','categoria'=>'Parrilla','direccion'=>'Avenida Circunvalar, Sector El Llano','lat'=>8.2315364,'lng'=>-73.3548879,'dueno'=>['nombre'=>'Óscar','apellido'=>'Guerra','email'=>'vacanos@foody.co'],'productos'=>[['Entradas',[['Chorizo parrillero',12000,'🌭'],['Morcilla',10000,'🌭'],['Arepa de asado',8000,'🫓']]],['Parrillada',[['Parrillada para 1 persona',32000,'🥩'],['Parrillada para 2 personas',58000,'🥩'],['Parrillada para 4 personas',110000,'🥩'],['Costillas BBQ',35000,'🍖']]],['Bebidas',[['Cerveza',5000,'🍺'],['Gaseosa litro',5000,'🥤'],['Limonada',5000,'🍋']]]],'inventario'=>[['Carne de res para parrilla','Carnes','kg',15,5,32000],['Chorizo','Carnes','kg',6,2,15000],['Costillas de cerdo','Carnes','kg',8,2,22000],['Arroz','Despensa','kg',20,5,4000],['Carbón','Despensa','kg',30,10,2000]]],
            // 18
            ['nombre'=>'Pascual Food','slug'=>'pascual-food','categoria'=>'Criolla','direccion'=>'Carrera 13 #10-80, Barrio San Francisco','lat'=>8.2338449,'lng'=>-73.3548599,'dueno'=>['nombre'=>'Pascual','apellido'=>'Gómez','email'=>'pascualfood@foody.co'],'productos'=>[['Desayunos',[['Huevos al gusto',10000,'🍳'],['Calentado',14000,'🍲'],['Tamal con chocolate',12000,'🫔']]],['Almuerzos',[['Bandeja típica',28000,'🍽️'],['Pechuga grillé',22000,'🍗'],['Pescado frito',26000,'🐟'],['Lomo cerdo',24000,'🥩']]],['Bebidas',[['Café',2500,'☕'],['Chocolate',3500,'🍫'],['Jugo natural',5000,'🧃']]]],'inventario'=>[['Huevos','Despensa','unidad',50,20,500],['Carne de res','Carnes','kg',8,3,28000],['Pollo','Carnes','kg',10,3,12000],['Arroz','Despensa','kg',25,5,4000],['Plátano','Verduras','kg',15,4,2000]]],
            // 19
            ['nombre'=>'La Casona de Don Alfredo','slug'=>'casona-don-alfredo','categoria'=>'Criolla','direccion'=>'Carrera 11 #12-15, Barrio Centro','lat'=>8.2335,'lng'=>-73.3548,'dueno'=>['nombre'=>'Alfredo','apellido'=>'Quintero','email'=>'casonadonalfredo@foody.co'],'productos'=>[['Entradas',[['Arepa de choclo',8000,'🫓'],['Empanadas (4 und)',10000,'🥟'],['Chorizo con papa',12000,'🌭']]],['Platos Fuertes',[['Bandeja paisa',38000,'🍽️'],['Mute',30000,'🥣'],['Sancocho de res',28000,'🥘'],['Carne a la llanera',35000,'🥩']]],['Bebidas',[['Limonada',5000,'🍋'],['Jugo de mango',5000,'🧃'],['Gaseosa',3000,'🥤']]]],'inventario'=>[['Carne de res','Carnes','kg',12,4,28000],['Frijol','Despensa','kg',10,3,3500],['Plátano','Verduras','kg',18,5,2000],['Arroz','Despensa','kg',30,5,4000],['Papa','Verduras','kg',20,5,2500]]],
            // 20
            ['nombre'=>'El Dicho Broaster','slug'=>'el-dicho-broaster','categoria'=>'Fast Food','direccion'=>'Calle 11 #13-30, Barrio San Francisco','lat'=>8.2499383,'lng'=>-73.3584061,'dueno'=>['nombre'=>'Javier','apellido'=>'Moreno','email'=>'eldichobroaster@foody.co'],'productos'=>[['Broaster',[['Pollo broaster 1 presa',10000,'🍗'],['Pollo broaster 4 presas',32000,'🍗'],['Pollo broaster 8 presas',55000,'🍗'],['Alitas broaster (6 und)',18000,'🍗']]],['Acompañantes',[['Papas broaster',8000,'🍟'],['Yuca broaster',8000,'🫒'],['Arroz con pollo',10000,'🍚']]],['Bebidas',[['Gaseosa',3000,'🥤'],['Limonada',5000,'🍋'],['Agua',2500,'💧']]]],'inventario'=>[['Pollo','Carnes','kg',20,8,12000],['Harina de trigo','Despensa','kg',10,3,2500],['Papa','Verduras','kg',25,5,3000],['Yuca','Verduras','kg',15,4,2500],['Aceite','Despensa','litro',10,3,6000]]],
            // 21
            ['nombre'=>'Pizzería Sapienza','slug'=>'pizzeria-sapienza','categoria'=>'Pizza','direccion'=>'Calle 12 #11-15, Barrio Centro','lat'=>8.2380956,'lng'=>-73.3533018,'dueno'=>['nombre'=>'Giovanni','apellido'=>'Rossi','email'=>'sapienza@foody.co'],'productos'=>[['Pizzas Clásicas',[['Pizza Margarita',22000,'🍕'],['Pizza Pepperoni',26000,'🍕'],['Pizza Hawaiana',26000,'🍕'],['Pizza Napolitana',28000,'🍕']]],['Pizzas Especiales',[['Pizza Sapienza (la casa)',32000,'🍕'],['Pizza Vegetariana',24000,'🥬'],['Pizza Carnes',32000,'🥩']]],['Bebidas',[['Gaseosa',3000,'🥤'],['Cerveza',5000,'🍺'],['Agua mineral',3000,'💧']]]],'inventario'=>[['Harina','Despensa','kg',25,5,2500],['Queso mozzarella','Lácteos','kg',10,3,18000],['Pepperoni','Carnes','kg',6,2,25000],['Salsa de tomate','Despensa','litro',12,3,3500],['Aceite de oliva','Despensa','litro',5,1,15000]]],
            // 22
            ['nombre'=>'Pizzería El Parque','slug'=>'pizzeria-el-parque','categoria'=>'Pizza','direccion'=>'Calle 11 frente al Parque 29 de Mayo','lat'=>8.2343,'lng'=>-73.3538,'dueno'=>['nombre'=>'Manuel','apellido'=>'Cruz','email'=>'pizzeriaelparque@foody.co'],'productos'=>[['Pizzas',[['Pizza personal',15000,'🍕'],['Pizza mediana',24000,'🍕'],['Pizza familiar',38000,'🍕'],['Pizza cuadrada',28000,'🍕']]],['Pastas',[['Spaghetti al pesto',20000,'🍝'],['Lasagna mixta',26000,'🧀'],['Fettuccine Alfredo',22000,'🍝']]],['Bebidas',[['Gaseosa',3000,'🥤'],['Cerveza',5000,'🍺'],['Limonada',5000,'🍋']]]],'inventario'=>[['Harina','Despensa','kg',20,5,2500],['Queso mozzarella','Lácteos','kg',8,2,18000],['Tocineta','Carnes','kg',4,1,16000],['Salsa napolitana','Despensa','litro',10,2,4000],['Champiñones','Verduras','kg',3,1,8000]]],
            // 23
            ['nombre'=>'MATTIA Restaurante','slug'=>'mattia','categoria'=>'Italiana','direccion'=>'Carrera 13 #11-05, Barrio San Francisco','lat'=>8.2579042,'lng'=>-73.359801,'dueno'=>['nombre'=>'Mateo','apellido'=>'Cavalli','email'=>'mattia@foody.co'],'productos'=>[['Entradas',[['Bruschetta',14000,'🍞'],['Provolone a la parrilla',18000,'🧀'],['Jamón serrano',22000,'🥩']]],['Pastas',[['Spaghetti carbonara',28000,'🍝'],['Risotto ai funghi',34000,'🍚'],['Penne arrabiata',25000,'🍝'],['Lasagna clásica',30000,'🧀']]],['Postres',[['Panna cotta',14000,'🍮'],['Tiramisú',16000,'🍰'],['Gelato artesanal',12000,'🍨']]]],'inventario'=>[['Harina','Despensa','kg',12,3,2500],['Queso parmesano','Lácteos','kg',5,2,22000],['Crema de leche','Lácteos','litro',6,2,5500],['Jamón serrano','Carnes','kg',3,1,35000],['Aceite de oliva','Despensa','litro',4,1,15000]]],
            // 24
            ['nombre'=>'Haoma Café Bar','slug'=>'haoma-cafe','categoria'=>'Café','direccion'=>'Calle 10 #10-10, Barrio Centro','lat'=>8.2595758,'lng'=>-73.3581958,'dueno'=>['nombre'=>'Santiago','apellido'=>'Vega','email'=>'haoma@foody.co'],'productos'=>[['Cafés',[['Espresso simple',3000,'☕'],['Espresso doble',5000,'☕'],['Cappuccino',7000,'☕'],['Latte',7000,'☕']]],['Desayunos',[['Croissant con jamón',12000,'🥐'],['Huevos benedictinos',16000,'🥚'],['Pan tostado con aguacate',12000,'🥑']]],['Bebidas',[['Smoothie de frutas',10000,'🥤'],['Frappé de café',12000,'🧊'],['Agua aromática',4000,'🌿']]]],'inventario'=>[['Café grano','Despensa','kg',5,2,30000],['Leche','Lácteos','litro',12,4,3500],['Harina','Despensa','kg',8,2,2500],['Aguacate','Verduras','kg',5,2,6000],['Huevos','Despensa','unidad',40,10,500]]],
            // 25
            ['nombre'=>'El Tinto Terraza','slug'=>'el-tinto-terraza','categoria'=>'Bar','direccion'=>'Calle 11 #10-05 (Piso superior), Barrio Centro','lat'=>8.2374121,'lng'=>-73.3528111,'dueno'=>['nombre'=>'David','apellido'=>'Lara','email'=>'eltintoterraza@foody.co'],'productos'=>[['Cócteles',[['Mojito clásico',15000,'🍹'],['Margarita',16000,'🍸'],['Piña colada',18000,'🍍'],['Cóctel de la casa',20000,'🍷']]],['Cervezas',[['Cerveza nacional',5000,'🍺'],['Cerveza importada',10000,'🍺'],['Cerveza artesanal',8000,'🍺']]],['Comidas',[['Tabla de carnes',35000,'🥩'],['Hamburguesa tinto',24000,'🍔'],['Alitas BBQ',20000,'🍗'],['Nachos con guacamole',15000,'🫓']]]],'inventario'=>[['Carne de res','Carnes','kg',5,2,28000],['Pollo','Carnes','kg',6,2,12000],['Aguacate','Verduras','kg',3,1,6000],['Papas','Verduras','kg',10,3,3000],['Queso','Lácteos','kg',3,1,14000]]],
            // 26
            ['nombre'=>'The Beer House','slug'=>'the-beer-house','categoria'=>'Bar','direccion'=>'Avenida Circunvalar, Sector Norte','lat'=>8.2555238,'lng'=>-73.3527672,'dueno'=>['nombre'=>'Andrés','apellido'=>'Mendoza','email'=>'thebeerhouse@foody.co'],'productos'=>[['Cervezas',[['Cerveza nacional',5000,'🍺'],['Cerveza importada',10000,'🍺'],['Cerveza artesanal IPA',9000,'🍺'],['Miclada',12000,'🍻']]],['Comidas',[['Hamburguesa beer house',26000,'🍔'],['Alitas BBQ (12 und)',32000,'🍗'],['Costillas BBQ',38000,'🍖'],['Papa rellena gigante',16000,'🥔']]],['Bebidas',[['Gaseosa',3000,'🥤'],['Agua',2500,'💧'],['Limonada',5000,'🍋']]]],'inventario'=>[['Carne de res','Carnes','kg',8,2,28000],['Pollo','Carnes','kg',10,3,12000],['Papas','Verduras','kg',15,4,3000],['Queso','Lácteos','kg',4,1,14000],['Salsa BBQ','Despensa','litro',4,1,8000]]],
            // 27
            ['nombre'=>'El Carajo','slug'=>'el-carajo','categoria'=>'Bar','direccion'=>'Carrera 14 #11-20, Barrio San Francisco','lat'=>8.2534233,'lng'=>-73.3592837,'dueno'=>['nombre'=>'Gabriel','apellido'=>'Torres','email'=>'elcarajo@foody.co'],'productos'=>[['Cócteles',[['Mojito',15000,'🍹'],['Tequila sunrise',18000,'🍸'],['Cubalibre',14000,'🥃'],['Michelada',12000,'🍻']]],['Comidas',[['Hamburguesa carajo',25000,'🍔'],['Perro caliente especial',15000,'🌭'],['Alitas (6 und)',18000,'🍗'],['Tabla de fritos',22000,'🍟']]],['Cervezas',[['Cerveza nacional',4000,'🍺'],['Cerveza importada',9000,'🍺']]]],'inventario'=>[['Carne molida','Carnes','kg',8,2,22000],['Pollo','Carnes','kg',6,2,12000],['Salchicha','Carnes','kg',5,2,12000],['Papas','Verduras','kg',12,3,3000],['Queso','Lácteos','kg',3,1,14000]]],
            // 28
            ['nombre'=>'Calabongas','slug'=>'calabongas','categoria'=>'Parrilla','direccion'=>'Vía alterna al corregimiento de Aguas Claras','lat'=>8.2300916,'lng'=>-73.3274077,'dueno'=>['nombre'=>'Esteban','apellido'=>'Pardo','email'=>'calabongas@foody.co'],'productos'=>[['Entradas',[['Chorizo parrillero',12000,'🌭'],['Arepa parrillera',8000,'🫓'],['Morcilla',10000,'🌭'],['Patacón con hogao',10000,'🍌']]],['Parrillada',[['Parrillada personal',35000,'🥩'],['Parrillada para 2',65000,'🥩'],['Costilla de cerdo',38000,'🍖'],['Sobrebarriega',28000,'🥩']]],['Bebidas',[['Cerveza',5000,'🍺'],['Gaseosa litro',5000,'🥤'],['Limonada',5000,'🍋']]]],'inventario'=>[['Carne de res','Carnes','kg',15,5,32000],['Costilla de cerdo','Carnes','kg',8,3,22000],['Chorizo','Carnes','kg',6,2,15000],['Plátano','Verduras','kg',10,3,2000],['Arroz','Despensa','kg',20,5,4000]]],
            // 29
            ['nombre'=>'Pizzas y Pastas Don Juan','slug'=>'don-juan','categoria'=>'Pizza','direccion'=>'Calle 7 #12-40, Barrio El Carretero','lat'=>8.2621042,'lng'=>-73.3591229,'dueno'=>['nombre'=>'Juan','apellido'=>'Rojas','email'=>'donjuanpizza@foody.co'],'productos'=>[['Pizzas',[['Pizza personal',14000,'🍕'],['Pizza mediana',22000,'🍕'],['Pizza familiar',36000,'🍕'],['Pizza Don Juan (especial)',30000,'🍕']]],['Pastas',[['Spaghetti boloñesa',20000,'🍝'],['Fettuccine Alfredo',22000,'🍝'],['Lasagna de carne',28000,'🧀']]],['Bebidas',[['Gaseosa',3000,'🥤'],['Cerveza',5000,'🍺'],['Agua',2500,'💧']]]],'inventario'=>[['Harina','Despensa','kg',20,5,2500],['Queso mozzarella','Lácteos','kg',8,2,18000],['Carne molida','Carnes','kg',6,2,22000],['Salsa de tomate','Despensa','litro',10,3,3500],['Aceite','Despensa','litro',4,1,6000]]],
            // 30
            ['nombre'=>'Empanadas de la 12','slug'=>'empanadas-de-la-12','categoria'=>'Fast Food','direccion'=>'Esquina Calle 12 con Carrera 11, Barrio Centro','lat'=>8.2339,'lng'=>-73.3547,'dueno'=>['nombre'=>'Lucía','apellido'=>'Carrascal','email'=>'empanadas12@foody.co'],'productos'=>[['Empanadas',[['Empanada de carne (und)',2500,'🥟'],['Empanada de pollo (und)',2500,'🥟'],['Empanada de queso (und)',3000,'🧀'],['Empanada mixta (und)',3500,'🥟']]],['Combos',[['6 empanadas + gaseosa',15000,'🥟'],['12 empanadas + gaseosa',25000,'🥟'],['24 empanadas + gaseosa litro',40000,'🥟']]],['Bebidas',[['Gaseosa personal',2500,'🥤'],['Limonada',4000,'🍋'],['Café',2000,'☕']]]],'inventario'=>[['Harina de maíz','Despensa','kg',30,10,2500],['Carne de res','Carnes','kg',10,3,28000],['Pollo','Carnes','kg',8,2,12000],['Queso costeño','Lácteos','kg',5,2,16000],['Aceite','Despensa','litro',10,3,6000]]],
        ];

        $paleta = ['40E0D0','FF6B6B','4ECDC4','FFD93D','6BCB77','4D96FF','C9B1FF','FF8C42','E84855','2D936C','FFC857','6A4C93','FF6B35','00B4D8','F72585'];
        $pedidoRef = 1;
        $imagenes = [
            'la-mansion'=>'restaurantes/la-mansion.jpeg',
            'la-provincia'=>'restaurantes/la-provincia.jpeg',
            'amaretto'=>'restaurantes/amaretto.jpeg',
            'tributo'=>'restaurantes/tributo.jpeg',
            'nigiri-sushi'=>'restaurantes/nigiri.jpeg',
        ];
        $menus = [
            'la-mansion'=>'menus/la-mansion.pdf',
            'la-provincia'=>'menus/la-provincia.pdf',
            'amaretto'=>'menus/amaretto.pdf',
            'tributo'=>'menus/tributo.pdf',
            'nigiri-sushi'=>'menus/nigiri.pdf',
        ];
        foreach ($restaurants as $rIdx => $r) {
            $dueno = User::create([
                'nombre'=>$r['dueno']['nombre'], 'apellido'=>$r['dueno']['apellido'],
                'email'=>$r['dueno']['email'], 'password'=>Hash::make('Rest123!'),
                'role'=>'restaurante', 'plan'=>'gratis', 'email_verified_at'=>now(),
            ]);
            $color = $paleta[$rIdx % count($paleta)];
            $nombreUrl = urlencode($r['nombre']);
            if (isset($imagenes[$r['slug']])) {
                $logoUrl = '/storage/'.$imagenes[$r['slug']];
                $portadaUrl = '/storage/'.$imagenes[$r['slug']];
            } else {
                $logoUrl = "https://ui-avatars.com/api/?name={$nombreUrl}&background={$color}&color=fff&size=128&bold=true";
                $portadaUrl = "https://ui-avatars.com/api/?name={$nombreUrl}&background={$color}&color=fff&size=512&bold=true";
            }
            $menuPdf = isset($menus[$r['slug']]) ? '/storage/'.$menus[$r['slug']] : null;
            $rest = Restaurante::create([
                'user_id'=>$dueno->id, 'nombre'=>$r['nombre'], 'slug'=>$r['slug'],
                'descripcion'=>'Descubre la mejor experiencia en '.$r['nombre'].'.',
                'categoria'=>$r['categoria'], 'telefono'=>'300'.str_pad((string)random_int(1000000,9999999),7,'0',STR_PAD_LEFT),
                'direccion'=>$r['direccion'], 'lat'=>$r['lat'], 'lng'=>$r['lng'],
                'tiempo_min'=>random_int(15,35), 'tiempo_max'=>random_int(35,60),
                'pedido_minimo'=>15000, 'abierto'=>true, 'activo'=>true, 'rating'=>4.0+($rIdx%5)*0.2,
                'envio_gratis'=>(bool)random_int(0,1),
                'logo'=>$logoUrl, 'foto_portada'=>$portadaUrl, 'menu_pdf'=>$menuPdf,
            ]);

            $productosPorCat = [];
            foreach ($r['productos'] as [$catNombre, $items]) {
                $cat = MenuCategoria::create(['restaurante_id'=>$rest->id,'nombre'=>$catNombre,'orden'=>array_search([$catNombre,$items],$r['productos'])+1]);
                $productosPorCat[$cat->id] = [];
                foreach ($items as [$pNombre, $pPrecio, $pEmoji]) {
                    $prod = Producto::create([
                        'restaurante_id'=>$rest->id, 'menu_categoria_id'=>$cat->id,
                        'nombre'=>$pNombre, 'descripcion'=>'Delicioso '.$pNombre.' preparado con los mejores ingredientes.',
                        'precio'=>$pPrecio, 'emoji'=>$pEmoji, 'disponible'=>true,
                    ]);
                    $productosPorCat[$cat->id][] = $prod;
                }
            }

            // Subcuentas
            $subRoles = [
                ['Carlos Mesero','mesero','mesero'.$r['slug'].'@foody.co','1234'],
                ['Ana Cajera','cajero','cajero'.$r['slug'].'@foody.co','1234'],
                ['José Cocinero','cocinero','cocina'.$r['slug'].'@foody.co','1234'],
                ['Sofía Supervisora','supervisor','super'.$r['slug'].'@foody.co','1234'],
            ];
            $subcuentas = [];
            foreach ($subRoles as [$sNombre, $sRol, $sEmail, $sPin]) {
                $sub = SubCuenta::create([
                    'restaurante_id'=>$rest->id, 'nombre'=>$sNombre, 'email'=>$sEmail,
                    'password'=>Hash::make($sPin), 'telefono'=>'300'.str_pad((string)random_int(1000000,9999999),7,'0',STR_PAD_LEFT),
                    'rol'=>$sRol, 'pin'=>$sPin, 'activo'=>true,
                ]);
                $subcuentas[] = $sub;
            }

            // Nóminas
            foreach ($subcuentas as $sub) {
                $base = match($sub->rol){'mesero'=>1200000,'cajero'=>1300000,'cocinero'=>1500000,'supervisor'=>1800000};
                $nom = Nomina::create([
                    'restaurante_id'=>$rest->id, 'sub_cuenta_id'=>$sub->id,
                    'empleado_nombre'=>$sub->nombre, 'cargo'=>ucfirst($sub->rol),
                    'tipo_contrato'=>'fijo', 'salario_base'=>$base,
                    'bonificaciones'=>100000, 'deducciones'=>50000,
                    'periodo'=>now()->format('Y-m'),
                ]);
                $nom->calcularTotal();
                $nom->save();
            }

            // Inventario
            $invItems = [];
            foreach ($r['inventario'] as [$iNombre, $iCat, $iUnidad, $iStock, $iMin, $iCosto]) {
                $inv = Inventario::create([
                    'restaurante_id'=>$rest->id, 'nombre'=>$iNombre, 'categoria'=>$iCat,
                    'unidad'=>$iUnidad, 'stock'=>$iStock, 'stock_minimo'=>$iMin, 'costo_unitario'=>$iCosto,
                ]);
                $invItems[] = $inv;
            }

            // Pedidos históricos (3-4 por restaurante)
            $metodosPedido = ['efectivo','nequi','daviplata'];
            $metodosPago = ['efectivo','nequi_manual','daviplata_manual'];
            $estadosPedido = ['entregado','entregado','entregado','cancelado'];
            $numPedidos = random_int(3,4);
            for ($i=0; $i<$numPedidos; $i++) {
                $allProds = collect($productosPorCat)->flatten();
                $numItems = random_int(1,3);
                $itemsPedido = $allProds->random($numItems);
                $subtotal = $itemsPedido->sum('precio');
                $domicilio = 3500;
                $total = $subtotal + $domicilio;
                $estado = $estadosPedido[$i] ?? 'entregado';
                $diasAtras = random_int(1,30);

                $pedido = Pedido::create([
                    'referencia'=>'F-'.strtoupper(Str::random(6)).'-'.$pedidoRef++,
                    'user_id'=>$cliente->id, 'restaurante_id'=>$rest->id,
                    'repartidor_id'=>$repartidor->id,
                    'direccion_texto'=>'Calle 12 #8-45, Centro',
                    'subtotal'=>$subtotal, 'costo_domicilio'=>$domicilio,
                    'total'=>$total, 'metodo_pago'=>$metodosPedido[$i%count($metodosPedido)],
                    'estado'=>$estado, 'created_at'=>now()->subDays($diasAtras),
                    'aceptado_at'=>now()->subDays($diasAtras)->addMinutes(2),
                    'listo_at'=>now()->subDays($diasAtras)->addMinutes(15),
                    'entregado_at'=>$estado==='entregado'?now()->subDays($diasAtras)->addMinutes(35):null,
                ]);

                foreach ($itemsPedido as $ip) {
                    PedidoItem::create([
                        'pedido_id'=>$pedido->id, 'producto_id'=>$ip->id,
                        'nombre_snapshot'=>$ip->nombre, 'precio_snapshot'=>$ip->precio,
                        'cantidad'=>1, 'subtotal'=>$ip->precio,
                    ]);
                }

                Pago::create([
                    'pedido_id'=>$pedido->id, 'metodo'=>$metodosPago[$i%count($metodosPago)],
                    'monto'=>$total, 'estado'=>'aprobado',
                    'pagado_at'=>$estado==='entregado'?now()->subDays($diasAtras)->addMinutes(40):null,
                    'created_at'=>now()->subDays($diasAtras),
                ]);

                if ($estado === 'entregado') {
                    CajaMovimiento::create([
                        'restaurante_id'=>$rest->id, 'user_id'=>$dueno->id,
                        'tipo'=>'ingreso', 'categoria'=>'venta',
                        'concepto'=>'Venta #'.$pedido->referencia, 'monto'=>$total,
                        'created_at'=>now()->subDays($diasAtras),
                    ]);
                }
            }

            // Caja: gastos varios
            foreach (['Compra de insumos','Pago servicios','Mantenimiento'] as $gConcepto) {
                CajaMovimiento::create([
                    'restaurante_id'=>$rest->id, 'user_id'=>$dueno->id,
                    'tipo'=>'egreso', 'categoria'=>match($gConcepto){'Compra de insumos'=>'compra_insumo','Pago servicios'=>'servicio','Mantenimiento'=>'mantenimiento',default=>'otro'},
                    'concepto'=>$gConcepto.' - '.$rest->nombre, 'monto'=>random_int(50000,300000),
                    'created_at'=>now()->subDays(random_int(1,30)),
                ]);
            }

            // Movimientos de inventario
            if (count($invItems) > 0) {
                $invSample = $invItems[array_rand($invItems)];
                InventarioMovimiento::create([
                    'inventario_id'=>$invSample->id, 'user_id'=>$dueno->id,
                    'tipo'=>'entrada', 'cantidad'=>random_int(5,20),
                    'motivo'=>'Compra inicial',
                    'created_at'=>now()->subDays(15),
                ]);
            }
        }

        // ── CUPONES ──
        Cupon::insert([
            ['codigo'=>'FOODY10','descripcion'=>'10% descuento','tipo'=>'porcentaje','valor'=>10,'minimo_pedido'=>20000,'maximo_usos'=>null,'usos_actuales'=>0,'activo'=>true,'created_at'=>now(),'updated_at'=>now()],
            ['codigo'=>'BIENVENIDO','descripcion'=>'$5.000 descuento','tipo'=>'fijo','valor'=>5000,'minimo_pedido'=>25000,'maximo_usos'=>1,'usos_actuales'=>0,'activo'=>true,'created_at'=>now(),'updated_at'=>now()],
            ['codigo'=>'GRATIS','descripcion'=>'Domicilio gratis','tipo'=>'domicilio_gratis','valor'=>0,'minimo_pedido'=>0,'maximo_usos'=>null,'usos_actuales'=>0,'activo'=>true,'created_at'=>now(),'updated_at'=>now()],
        ]);

        $this->command->info('✅ Foody seed OK — 30 restaurantes de Ocaña');
        $tableRows = [['Admin','admin@foody.co','Admin123!'],['Cliente','jorge@foody.co','Cliente123!'],['Repartidor','carlos@foody.co','Rep123!']];
        foreach ($restaurants as $r) {
            $tableRows[] = [$r['nombre'],$r['dueno']['email'],'Rest123!'];
        }
        $tableRows[] = ['Subcuentas (c/rest)','meseroX@ / cajeroX@ / cocinaX@ / superX@','PIN: 1234'];
        $this->command->table(['Restaurante / Rol','Email','Password'],$tableRows);
    }
}
