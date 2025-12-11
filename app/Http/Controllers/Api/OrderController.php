<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['user', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($orders);
    }

    public function myOrders(Request $request)
    {
        $orders = Order::with('items.product')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with(['user', 'items.product'])->findOrFail($id);
        return response()->json($order);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'delivery_address' => 'required',
            'phone' => 'required',
            'notes' => 'nullable'
        ]);

        $cart = session()->get('cart', []);
        
        if (empty($cart)) {
            return response()->json([
                'success' => false,
                'message' => 'Кошик порожній'
            ], 400);
        }

        DB::beginTransaction();
        
        try {
            $products = Product::whereIn('id', array_keys($cart))->get();
            $total = 0;

            $order = Order::create([
                'user_id' => $request->user()->id,
                'total_amount' => 0,
                'delivery_address' => $validated['delivery_address'],
                'phone' => $validated['phone'],
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending'
            ]);

            foreach ($products as $product) {
                $quantity = $cart[$product->id];
                
                if ($quantity > $product->stock) {
                    throw new \Exception("Недостатньо товару: {$product->name}");
                }

                $subtotal = $product->price * $quantity;
                $total += $subtotal;

                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'price' => $product->price
                ]);

                // Зменшуємо кількість товару на складі
                $product->decrement('stock', $quantity);
            }

            $order->update(['total_amount' => $total]);
            
            // Очищаємо кошик
            session()->forget('cart');
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'order_id' => $order->id,
                'message' => 'Замовлення оформлено успішно'
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled'
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'order' => $order
        ]);
    }
}