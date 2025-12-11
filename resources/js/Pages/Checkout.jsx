import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Checkout({ auth }) {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        delivery_address: '',
        phone: auth.user?.phone || '',
        notes: ''
    });

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const response = await fetch('/api/cart');
            const data = await response.json();
            
            if (data.count === 0) {
                router.visit('/cart');
                return;
            }
            
            setCartItems(data.items || []);
            setTotal(data.total || 0);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                alert('Замовлення успішно оформлено!');
                router.visit('/orders');
            } else {
                alert(data.message || 'Помилка оформлення замовлення');
                setSubmitting(false);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Помилка з\'єднання');
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Завантаження...</span>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Оформлення замовлення" />

            <section className="py-5">
                <div className="container">
                    <h1 className="mb-4">
                        <i className="bi bi-credit-card"></i> Оформлення замовлення
                    </h1>

                    <div className="row g-4">
                        {/* Форма замовлення */}
                        <div className="col-lg-7">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title mb-4">Дані доставки</h5>

                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Адреса доставки <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                name="delivery_address"
                                                className="form-control"
                                                rows="3"
                                                value={formData.delivery_address}
                                                onChange={handleChange}
                                                placeholder="Вкажіть повну адресу доставки"
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Телефон <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                className="form-control"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+380..."
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Примітки до замовлення</label>
                                            <textarea
                                                name="notes"
                                                className="form-control"
                                                rows="2"
                                                value={formData.notes}
                                                onChange={handleChange}
                                                placeholder="Додаткова інформація (необов'язково)"
                                            />
                                        </div>

                                        <div className="alert alert-info">
                                            <i className="bi bi-info-circle"></i> 
                                            <strong> Увага!</strong> Після оформлення замовлення з вами зв'яжеться наш менеджер для підтвердження.
                                        </div>

                                        <div className="d-grid">
                                            <button 
                                                type="submit" 
                                                className="btn btn-warning btn-lg"
                                                disabled={submitting}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Оформлення...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-check-circle"></i> Підтвердити замовлення
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Деталі замовлення */}
                        <div className="col-lg-5">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title mb-3">Ваше замовлення</h5>

                                    <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {cartItems.map((item) => (
                                            <div key={item.product.id} className="d-flex mb-3 pb-3 border-bottom">
                                                <img
                                                    src={item.product.image ? `/storage/${item.product.image}` : 'https://via.placeholder.com/60'}
                                                    alt={item.product.name}
                                                    className="rounded me-3"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                />
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1">{item.product.name}</h6>
                                                    <small className="text-muted">
                                                        {item.quantity} × {parseFloat(item.product.price).toFixed(2)} ₴
                                                    </small>
                                                </div>
                                                <div className="text-end">
                                                    <strong>{parseFloat(item.subtotal).toFixed(2)} ₴</strong>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <hr />

                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Товарів:</span>
                                        <span>{cartItems.length}</span>
                                    </div>

                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Вартість товарів:</span>
                                        <span>{parseFloat(total).toFixed(2)} ₴</span>
                                    </div>

                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Доставка:</span>
                                        <span className="text-success">Безкоштовно</span>
                                    </div>

                                    <hr />

                                    <div className="d-flex justify-content-between mb-3">
                                        <strong className="h5">До сплати:</strong>
                                        <strong className="h5 text-warning">
                                            {parseFloat(total).toFixed(2)} ₴
                                        </strong>
                                    </div>

                                    <div className="alert alert-light small mb-0">
                                        <i className="bi bi-shield-check"></i> 
                                        <strong> Безпечна оплата</strong><br />
                                        Оплата при отриманні або онлайн
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}