import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Orders({ auth }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    const statusLabels = {
        pending: 'Очікує',
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
            const response = await fetch('/api/orders', {
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

    const handleStatusChange = async (orderId, newStatus) => {
        if (!confirm('Змінити статус замовлення?')) return;

        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                alert('Статус оновлено!');
                fetchOrders();
            } else {
                alert('Помилка оновлення статусу');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Помилка з\'єднання');
        }
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (loading) {
        return (
            <AdminLayout user={auth.user}>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Завантаження...</span>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout user={auth.user}>
            <Head title="Замовлення - Адмін" />

            <div className="container-fluid py-4">
                <h1 className="mb-4">
                    <i className="bi bi-cart-check"></i> Замовлення
                </h1>

                <div className="card shadow">
                    <div className="card-body">
                        {orders.length === 0 ? (
                            <p className="text-muted text-center py-5">
                                <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i><br />
                                Замовлень ще немає
                            </p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Клієнт</th>
                                            <th>Email</th>
                                            <th>Товарів</th>
                                            <th>Сума</th>
                                            <th>Статус</th>
                                            <th>Дата</th>
                                            <th>Дії</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <React.Fragment key={order.id}>
                                                <tr>
                                                    <td><strong>#{order.id}</strong></td>
                                                    <td>{order.user?.name || '-'}</td>
                                                    <td>{order.user?.email || '-'}</td>
                                                    <td>{order.items?.length || 0}</td>
                                                    <td><strong>{parseFloat(order.total_amount).toFixed(2)} ₴</strong></td>
                                                    <td>
                                                        <select 
                                                            className="form-select form-select-sm"
                                                            style={{ width: 'auto' }}
                                                            value={order.status}
                                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        >
                                                            {Object.keys(statusLabels).map((status) => (
                                                                <option key={status} value={status}>
                                                                    {statusLabels[status]}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        {new Date(order.created_at).toLocaleDateString('uk-UA')}
                                                        {' '}
                                                        {new Date(order.created_at).toLocaleTimeString('uk-UA', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })}
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => toggleOrderDetails(order.id)}
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                                
                                                {/* Деталі замовлення */}
                                                {expandedOrder === order.id && (
                                                    <tr>
                                                        <td colSpan="8" className="bg-light">
                                                            <div className="p-3">
                                                                <div className="row">
                                                                    <div className="col-md-6">
                                                                        <h6>
                                                                            <i className="bi bi-person"></i> Клієнт:
                                                                        </h6>
                                                                        <p className="ms-3">
                                                                            <strong>{order.user?.name || '-'}</strong><br />
                                                                            {order.user?.email || '-'}<br />
                                                                            {order.phone}
                                                                        </p>

                                                                        <h6>
                                                                            <i className="bi bi-geo-alt"></i> Адреса доставки:
                                                                        </h6>
                                                                        <p className="ms-3" style={{ whiteSpace: 'pre-line' }}>
                                                                            {order.delivery_address}
                                                                        </p>

                                                                        {order.notes && (
                                                                            <>
                                                                                <h6>
                                                                                    <i className="bi bi-chat-left-text"></i> Примітки:
                                                                                </h6>
                                                                                <p className="ms-3" style={{ whiteSpace: 'pre-line' }}>
                                                                                    {order.notes}
                                                                                </p>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    <div className="col-md-6">
                                                                        <h6>
                                                                            <i className="bi bi-box-seam"></i> Товари:
                                                                        </h6>
                                                                        <table className="table table-sm">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Товар</th>
                                                                                    <th>Кіл-ть</th>
                                                                                    <th>Ціна</th>
                                                                                    <th>Сума</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {order.items?.map((item) => (
                                                                                    <tr key={item.id}>
                                                                                        <td>{item.product?.name || 'Товар'}</td>
                                                                                        <td>{item.quantity}</td>
                                                                                        <td>{parseFloat(item.price).toFixed(2)} ₴</td>
                                                                                        <td>
                                                                                            <strong>
                                                                                                {parseFloat(item.quantity * item.price).toFixed(2)} ₴
                                                                                            </strong>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                            <tfoot>
                                                                                <tr>
                                                                                    <th colSpan="3">Разом:</th>
                                                                                    <th>
                                                                                        {parseFloat(order.total_amount).toFixed(2)} ₴
                                                                                    </th>
                                                                                </tr>
                                                                            </tfoot>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}