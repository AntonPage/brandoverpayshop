<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        // Додаємо role до users (якщо таблиця вже існує від Breeze)
        Schema::table('users', function (Blueprint $table) {
            $table->string('full_name')->after('name');
            $table->string('phone', 20)->nullable()->after('email');
            $table->enum('role', ['user', 'admin'])->default('user')->after('password');
        });

        // Categories table
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Products table
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('image')->nullable();
            $table->integer('stock')->default(0);
            $table->timestamps();
            $table->index('category_id');
        });

        // Orders table
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('total_amount', 10, 2);
            $table->enum('status', ['pending', 'processing', 'completed', 'cancelled'])->default('pending');
            $table->text('delivery_address')->nullable();
            $table->string('phone', 20)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index('user_id');
            $table->index('status');
        });

        // Order items table
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity');
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });

        // Вставляємо тестові дані
        
        // Адміністратор
        DB::table('users')->insert([
            'name' => 'Admin',
            'full_name' => 'Адміністратор',
            'email' => 'admin@shop.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Звичайний користувач
        DB::table('users')->insert([
            'name' => 'User',
            'full_name' => 'Тестовий Користувач',
            'email' => 'user@test.com',
            'password' => Hash::make('user123'),
            'role' => 'user',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Категорії
        $categories = [
            ['name' => 'Електроніка', 'description' => 'Смартфони, ноутбуки, планшети'],
            ['name' => 'Одяг', 'description' => 'Чоловічий та жіночий одяг'],
            ['name' => 'Книги', 'description' => 'Художня та технічна література'],
            ['name' => 'Побутова техніка', 'description' => 'Техніка для дому'],
        ];

        foreach ($categories as $cat) {
            DB::table('categories')->insert([
                'name' => $cat['name'],
                'description' => $cat['description'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // Товари
        $products = [
            [
                'category_id' => 1,
                'name' => 'iPhone 15 Pro',
                'description' => 'Потужний смартфон від Apple з чіпом A17 Pro, титановим корпусом та камерою 48MP',
                'price' => 45999.00,
                'image' => 'iphone15.jpg',
                'stock' => 10
            ],
            [
                'category_id' => 1,
                'name' => 'Samsung Galaxy S24',
                'description' => 'Флагманський Android-смартфон з AI функціями та чудовим екраном',
                'price' => 38999.00,
                'image' => 'samsung_s24.jpg',
                'stock' => 15
            ],
            [
                'category_id' => 1,
                'name' => 'MacBook Air M3',
                'description' => 'Легкий та продуктивний ноутбук з чіпом M3 для роботи та творчості',
                'price' => 54999.00,
                'image' => 'macbook_air.jpg',
                'stock' => 8
            ],
            [
                'category_id' => 2,
                'name' => 'Футболка Nike',
                'description' => 'Спортивна футболка з бавовни для комфорту під час тренувань',
                'price' => 899.00,
                'image' => 'tshirt_nike.jpg',
                'stock' => 50
            ],
            [
                'category_id' => 2,
                'name' => 'Джинси Levi\'s',
                'description' => 'Класичні джинси синього кольору з міцної тканини',
                'price' => 2499.00,
                'image' => 'jeans_levis.jpg',
                'stock' => 30
            ],
            [
                'category_id' => 3,
                'name' => 'Clean Code',
                'description' => 'Книга про чистий код від Robert Martin - must read для програмістів',
                'price' => 599.00,
                'image' => 'clean_code.jpg',
                'stock' => 20
            ],
            [
                'category_id' => 4,
                'name' => 'Пилосос Dyson',
                'description' => 'Бездротовий пилосос преміум класу з потужним всмоктуванням',
                'price' => 18999.00,
                'image' => 'dyson_vacuum.jpg',
                'stock' => 5
            ]
        ];

        foreach ($products as $product) {
            DB::table('products')->insert([
                'category_id' => $product['category_id'],
                'name' => $product['name'],
                'description' => $product['description'],
                'price' => $product['price'],
                'image' => $product['image'],
                'stock' => $product['stock'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['full_name', 'phone', 'role']);
        });
    }
};