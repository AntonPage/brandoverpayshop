import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Cart({ auth }) {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const response = await fetch('/api/cart');
            const data = await response.json();
            setCartItems(data.items || []);
            setTotal(data.total || 0);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }

        try {
            const response = await fetch('/api/cart/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ product_id: productId, quantity })
            });

            const data = await response.json();
            if (data.success) {
                fetchCart();
            } else {
                alert(data.message || 'Помилка оновлення');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const removeFromCart = async (productId) => {
        if (!confirm('Видалити товар з кошика?')) return;

        try {
            const response = await fetch('/api/cart/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ product_id: productId })
            });

            const data = await response.json();
            if (data.success) {
                fetchCart();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const clearCart = async () => {
        if (!confirm('Очистити кошик повністю?')) return;

        try {
            const response = await fetch('/api/cart/clear', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });

            const data = await response.json();
            if (data.success) {
                fetchCart();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const Layout = auth.user ? AuthenticatedLayout : GuestLayout;

    if (loading) {
        return (
            <Layout user={auth.user}>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Завантаження...</span>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout user={auth.user}>
            <Head title="Кошик" />

            <section className="py-5">
                <div className="container">
                    <h1 className="mb-4"><i className="bi bi-cart3"></i> Кошик</h1>

                    {cartItems.length === 0 ? (
                        <div className="alert alert-info text-center py-5">
                            <i className="bi bi-cart-x" style={{ fontSize: '3rem' }}></i>
                            <h4 className="mt-3">Ваш кошик порожній</h4>
                            <p className="text-muted">Додайте товари до кошика, щоб продовжити покупки</p>
                            <Link href="/" className="btn btn-warning mt-3">
                                <i className="bi bi-shop"></i> Перейти до каталогу
                            </Link>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {/* Cart Items */}
                            <div className="col-lg-8">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        {cartItems.map((item) => (
                                            <div key={item.product.id} className="border-bottom pb-3 mb-3">
                                                <div className="row align-items-center">
                                                    <div className="col-md-2">
                                                        <img 
                                                            src={item.product.image ? `/storage/${item.product.image}` : 'https://via.placeholder.com/100'}
                                                            className="img-fluid rounded"
                                                            alt={item.product.name}
                                                        />
                                                    </div>
                                                    
                                                    <div className="col-md-4">
                                                        <h5 className="mb-1">
                                                            <Link href={`/product/${item.product.id}`}>
                                                                {item.product.name}
                                                            </Link>
                                                        </h5>
                                                        <p className="text-muted small mb-0">
                                                            Ціна: {parseFloat(item.product.price).toFixed(2)} ₴
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="col-md-3">
                                                        <div className="input-group input-group-sm">
                                                            <button 
                                                                className="btn btn-outline-secondary" 
                                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                            >
                                                                <i className="bi bi-dash"></i>
                                                            </button>
                                                            <input 
                                                                type="text" 
                                                                className="form-control text-center" 
                                                                value={item.quantity} 
                                                                readOnly 
                                                            />
                                                            <button 
                                                                className="btn btn-outline-secondary"
                                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                            >
                                                                <i className="bi bi-plus"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="col-md-2 text-end">
                                                        <p className="fw-bold mb-0">
                                                            {parseFloat(item.subtotal).toFixed(2)} ₴
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="col-md-1 text-end">
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => removeFromCart(item.product.id)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <Link href="/" className="btn btn-outline-secondary">
                                        <i className="bi bi-arrow-left"></i> Продовжити покупки
                                    </Link>
                                    <button className="btn btn-outline-danger ms-2" onClick={clearCart}>
                                        <i className="bi bi-trash"></i> Очистити кошик
                                    </button>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="col-lg-4">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title mb-3">Разом</h5>
                                        
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Товарів:</span>
                                            <span>{cartItems.length}</span>
                                        </div>
                                        
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Сума:</span>
                                            <span>{parseFloat(total).toFixed(2)} ₴</span>
                                        </div>
                                        
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Доставка:</span>
                                            <span className="text-success">Безкоштовно</span>
                                        </div>
                                        
                                        <hr />
                                        
                                        <div className="d-flex justify-content-between mb-3">
                                            <strong>До сплати:</strong>
                                            <strong className="text-primary h5">
                                                {parseFloat(total).toFixed(2)} ₴
                                            </strong>
                                        </div>
                                        
                                        {auth.user ? (
                                            <div className="d-grid">
                                                <Link href="/checkout" className="btn btn-warning btn-lg">
                                                    <i className="bi bi-credit-card"></i> Оформити замовлення
                                                </Link>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="alert alert-warning small mb-3">
                                                    <i className="bi bi-exclamation-triangle"></i> 
                                                    Для оформлення замовлення необхідно увійти
                                                </div>
                                                <div className="d-grid gap-2">
                                                    <Link href="/login" className="btn btn-warning">
                                                        <i className="bi bi-box-arrow-in-right"></i> Увійти
                                                    </Link>
                                                    <Link href="/register" className="btn btn-outline-warning">
                                                        <i className="bi bi-person-plus"></i> Зареєструватися
                                                    </Link>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
}