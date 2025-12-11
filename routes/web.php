<?php

use App\Http\Controllers\ProfileController;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Головна сторінка
Route::get('/', function () {
    $products = Product::with('category')->orderBy('created_at', 'desc')->get();
    $categories = Category::orderBy('name')->get();
    
    return Inertia::render('Welcome', [
        'products' => $products,
        'categories' => $categories,
    ]);
})->name('home');

// Сторінка товару
Route::get('/product/{id}', function ($id) {
    $product = Product::with('category')->findOrFail($id);
    $relatedProducts = Product::where('category_id', $product->category_id)
        ->where('id', '!=', $id)
        ->limit(4)
        ->get();
    
    return Inertia::render('Product', [
        'product' => $product,
        'relatedProducts' => $relatedProducts,
    ]);
})->name('product.show');

// Кошик
Route::get('/cart', function () {
    return Inertia::render('Cart');
})->name('cart');

// Оформлення замовлення (тільки для авторизованих)
Route::middleware('auth')->group(function () {
    Route::get('/checkout', function () {
        return Inertia::render('Checkout');
    })->name('checkout');
    
    Route::get('/orders', function () {
        return Inertia::render('Orders');
    })->name('orders');
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Адмін панель (тільки для адмінів)
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');
    
    Route::get('/products', function () {
        return Inertia::render('Admin/Products');
    })->name('admin.products');
    
    Route::get('/categories', function () {
        return Inertia::render('Admin/Categories');
    })->name('admin.categories');
    
    Route::get('/orders', function () {
        return Inertia::render('Admin/Orders');
    })->name('admin.orders');
});

require __DIR__.'/auth.php';