import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Products({ auth }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category_id: '',
        stock: '',
        image: null
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/categories')
            ]);
            
            const productsData = await productsRes.json();
            const categoriesData = await categoriesRes.json();
            
            setProducts(productsData);
            setCategories(categoriesData);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== '') {
                formDataToSend.append(key, formData[key]);
            }
        });

        try {
            const url = editingProduct 
                ? `/api/products/${editingProduct.id}`
                : '/api/products';
            
            const method = editingProduct ? 'PUT' : 'POST';
            
            // Для PUT використовуємо _method
            if (editingProduct) {
                formDataToSend.append('_method', 'PUT');
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: formDataToSend
            });

            if (response.ok) {
                alert('Товар збережено!');
                setShowModal(false);
                resetForm();
                fetchData();
            } else {
                alert('Помилка збереження');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Помилка з\'єднання');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Видалити товар?')) return;

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });

            if (response.ok) {
                alert('Товар видалено!');
                fetchData();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const openAddModal = () => {
        resetForm();
        setEditingProduct(null);
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            category_id: product.category_id || '',
            stock: product.stock,
            image: null
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category_id: '',
            stock: '',
            image: null
        });
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({
            ...formData,
            [name]: files ? files[0] : value
        });
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
            <Head title="Товари - Адмін" />

            <div className="container-fluid py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>
                        <i className="bi bi-box-seam"></i> Товари
                    </h1>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <i className="bi bi-plus-circle"></i> Додати товар
                    </button>
                </div>

                <div className="card shadow">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Фото</th>
                                        <th>Назва</th>
                                        <th>Категорія</th>
                                        <th>Ціна</th>
                                        <th>Залишок</th>
                                        <th>Дії</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id}>
                                            <td>{product.id}</td>
                                            <td>
                                                <img 
                                                    src={product.image ? `/storage/${product.image}` : 'https://via.placeholder.com/50'}
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }}
                                                    alt={product.name}
                                                />
                                            </td>
                                            <td><strong>{product.name}</strong></td>
                                            <td>{product.category?.name || '-'}</td>
                                            <td><strong>{parseFloat(product.price).toFixed(2)} ₴</strong></td>
                                            <td>
                                                {product.stock > 10 ? (
                                                    <span className="badge bg-success">{product.stock}</span>
                                                ) : product.stock > 0 ? (
                                                    <span className="badge bg-warning">{product.stock}</span>
                                                ) : (
                                                    <span className="badge bg-danger">Немає</span>
                                                )}
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-warning me-2"
                                                    onClick={() => openEditModal(product)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {editingProduct ? 'Редагувати товар' : 'Додати товар'}
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Назва *</label>
                                        <input 
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Опис</label>
                                        <textarea 
                                            name="description"
                                            className="form-control"
                                            rows="3"
                                            value={formData.description}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Ціна *</label>
                                                <input 
                                                    type="number"
                                                    name="price"
                                                    className="form-control"
                                                    step="0.01"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Кількість</label>
                                                <input 
                                                    type="number"
                                                    name="stock"
                                                    className="form-control"
                                                    value={formData.stock}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Категорія</label>
                                        <select 
                                            name="category_id"
                                            className="form-select"
                                            value={formData.category_id}
                                            onChange={handleChange}
                                        >
                                            <option value="">Без категорії</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Фото</label>
                                        <input 
                                            type="file"
                                            name="image"
                                            className="form-control"
                                            accept="image/*"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Скасувати
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Зберегти
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}