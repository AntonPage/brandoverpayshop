import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Orders({ auth }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    const statusLabels = {
        pending: 'Очікує обробки',
        processing: 'В обробці',
        completed: 'Завершено',
        cancelled: 'Скасовано'
    };

    const statusColors = {
        pending: 'warning',
        processing: 'info',
        completed: 'success',
        cancelled: 'danger'
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders/my', {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });
            const data = await response.json();
            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
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
            <Head title="Мої замовлення" />

            <section className="py-5">
                <div className="container">
                    <h1 className="mb-4">
                        <i className="bi bi-list-ul"></i> Мої замовлення
                    </h1>

                    {orders.length === 0 ? (
                        <div className="alert alert-info text-center py-5">
                            <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                            <h4 className="mt-3">У вас ще немає замовлень</h4>
                            <p className="text-muted">Оформіть своє перше замовлення прямо зараз!</p>
                            <a href="/" className="btn btn-warning mt-3">
                                <i className="bi bi-shop"></i> До каталогу
                            </a>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {orders.map((order) => (
                                <div key={order.id} className="col-12">
                                    <div className="card shadow-sm">
                                        <div className="card-body">
                                            <div className="row align-items-center">
                                                <div className="col-md-2">
                                                    <small className="text-muted">Замовлення</small>
                                                    <h5 className="mb-0">#{order.id}</h5>
                                                </div>
                                                
                                                <div className="col-md-2">
                                                    <small className="text-muted">Дата</small>
                                                    <p className="mb-0">
                                                        {new Date(order.created_at).toLocaleDateString('uk-UA')}
                                                    </p>
                                                </div>
                                                
                                                <div className="col-md-2">
                                                    <small className="text-muted">Товарів</small>
                                                    <p className="mb-0">{order.items?.length || 0} шт.</p>
                                                </div>
                                                
                                                <div className="col-md-2">
                                                    <small className="text-muted">Сума</small>
                                                    <p className="mb-0 fw-bold">
                                                        {parseFloat(order.total_amount).toFixed(2)} ₴
                                                    </p>
                                                </div>
                                                
                                                <div className="col-md-2">
                                                    <small className="text-muted">Статус</small>
                                                    <p className="mb-0">
                                                        <span className={`badge bg-${statusColors[order.status]}`}>
                                                            {statusLabels[order.status]}
                                                        </span>
                                                    </p>
                                                </div>
                                                
                                                <div className="col-md-2 text-end">
                                                    <button 
                                                        className="btn btn-sm btn-outline-dark"
                                                        onClick={() => toggleOrderDetails(order.id)}
                                                    >
                                                        <i className="bi bi-eye"></i> Деталі
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Деталі замовлення */}
                                            {expandedOrder === order.id && (
                                                <div className="mt-3 pt-3 border-top">
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <h6>Адреса доставки:</h6>
                                                            <p className="text-muted">
                                                                {order.delivery_address}
                                                            </p>
                                                            
                                                            <h6>Телефон:</h6>
                                                            <p className="text-muted">{order.phone}</p>
                                                            
                                                            {order.notes && (
                                                                <>
                                                                    <h6>Примітки:</h6>
                                                                    <p className="text-muted">{order.notes}</p>
                                                                </>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="col-md-6">
                                                            <h6>Товари:</h6>
                                                            <ul className="list-unstyled">
                                                                {order.items?.map((item) => (
                                                                    <li key={item.id} className="mb-2">
                                                                        <strong>{item.product?.name || 'Товар'}</strong><br />
                                                                        <small className="text-muted">
                                                                            {item.quantity} × {parseFloat(item.price).toFixed(2)} ₴ = 
                                                                            {' '}{parseFloat(item.quantity * item.price).toFixed(2)} ₴
                                                                        </small>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </AuthenticatedLayout>
    );
}