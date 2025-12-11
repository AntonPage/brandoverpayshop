<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function get()
    {
        $cart = session()->get('cart', []);
        $items = [];
        $total = 0;

        if (!empty($cart)) {
            $products = Product::with('category')->whereIn('id', array_keys($cart))->get();
            
            foreach ($products as $product) {
                $quantity = $cart[$product->id];
                $subtotal = $product->price * $quantity;
                $total += $subtotal;
                
                $items[] = [
                    'product' => $product,
                    'quantity' => $quantity,
                    'subtotal' => $subtotal
                ];
            }
        }

        return response()->json([
            'items' => $items,
            'total' => $total,
            'count' => count($cart)
        ]);
    }

    public function add(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $product = Product::findOrFail($validated['product_id']);
        
        $cart = session()->get('cart', []);
        $currentQty = $cart[$product->id] ?? 0;
        $newQty = $currentQty + $validated['quantity'];

        if ($newQty > $product->stock) {
            return response()->json([
                'success' => false,
                'message' => 'Недостатньо товару на складі'
            ], 400);
        }

        $cart[$product->id] = $newQty;
        session()->put('cart', $cart);

        return response()->json([
            'success' => true,
            'cartCount' => count($cart),
            'message' => 'Товар додано до кошика'
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:0'
        ]);

        $cart = session()->get('cart', []);
        
        if ($validated['quantity'] == 0) {
            unset($cart[$validated['product_id']]);
        } else {
            $product = Product::findOrFail($validated['product_id']);
            
            if ($validated['quantity'] > $product->stock) {
                return response()->json([
                    'success' => false,
                    'message' => 'Недостатньо товару на складі'
                ], 400);
            }
            
            $cart[$validated['product_id']] = $validated['quantity'];
        }

        session()->put('cart', $cart);

        return response()->json([
            'success' => true,
            'cartCount' => count($cart)
        ]);
    }

    public function remove(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $cart = session()->get('cart', []);
        unset($cart[$validated['product_id']]);
        session()->put('cart', $cart);

        return response()->json([
            'success' => true,
            'cartCount' => count($cart)
        ]);
    }

    public function clear()
    {
        session()->forget('cart');
        
        return response()->json([
            'success' => true,
            'message' => 'Кошик очищено'
        ]);
    }
}