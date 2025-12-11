import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Welcome({ auth, products, categories }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [filteredProducts, setFilteredProducts] = useState(products);

    useEffect(() => {
        if (selectedCategory === 'all') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(p => p.category_id == selectedCategory));
        }
    }, [selectedCategory, products]);

    const handleAddToCart = async (productId) => {
        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ product_id: productId, quantity: 1 })
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Товар додано до кошика!');
                window.location.reload();
            } else {
                alert(data.message || 'Помилка додавання');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Помилка з\'єднання');
        }
    };

    const Layout = auth.user ? AuthenticatedLayout : GuestLayout;

    return (
        <Layout user={auth.user}>
            <Head title="Головна" />

            {/* Hero Section */}
            <section className="bg-dark text-white py-5" style={{ 
                background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(/images/hero.jpg) center/cover',
                minHeight: '400px' 
            }}>
                <div className="container h-100">
                    <div className="row align-items-center h-100 py-5">
                        <div className="col-lg-8 mx-auto text-center">
                            <h1 className="display-3 fw-bold mb-3">BrandOverpay.com</h1>
                            <p className="lead mb-4" style={{ fontSize: '1.5rem', fontWeight: 300 }}>
                                Premium products, premium prices
                            </p>
                            <p className="mb-4" style={{ opacity: 0.9 }}>
                                Найдорожчі бренди за найвищими цінами. Переплачуйте зі стилем! 💎
                            </p>
                            <a href="#products" className="btn btn-warning btn-lg px-5 py-3 shadow">
                                <i className="bi bi-shop"></i> Переглянути товари
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section className="py-5 bg-light" id="products">
                <div className="container">
                    <h2 className="text-center mb-4 display-6">Наші товари</h2>
                    <p className="text-center text-muted mb-5">
                        Тільки перевірені бренди з максимальною націнкою
                    </p>
                    
                    {/* Filter */}
                    <div className="row mb-4">
                        <div className="col-md-12 text-center">
                            <div className="btn-group shadow-sm" role="group">
                                <button 
                                    type="button" 
                                    className={`btn btn-outline-dark ${selectedCategory === 'all' ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory('all')}
                                >
                                    <i className="bi bi-grid"></i> Всі
                                </button>
                                {categories.map(cat => (
                                    <button 
                                        key={cat.id}
                                        type="button" 
                                        className={`btn btn-outline-dark ${selectedCategory == cat.id ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat.id)}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="row g-4">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="col-md-6 col-lg-4 col-xl-3">
                                <div className="card h-100 shadow-sm border-0">
                                    <img 
                                        src={product.image ? `/storage/${product.image}` : `https://via.placeholder.com/300x220?text=${product.name}`}
                                        className="card-img-top" 
                                        alt={product.name}
                                        style={{ height: '220px', objectFit: 'cover' }}
                                    />
                                    
                                    <div className="card-body d-flex flex-column">
                                        <span className="badge bg-dark mb-2 align-self-start">
                                            {product.category?.name || 'Без категорії'}
                                        </span>
                                        <h5 className="card-title">{product.name}</h5>
                                        <p className="card-text text-muted small flex-grow-1">
                                            {product.description?.substring(0, 70)}...
                                        </p>
                                        <div className="mt-auto">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="h4 mb-0 text-warning fw-bold">
                                                    {parseFloat(product.price).toFixed(2)} ₴
                                                </span>
                                                <span className="text-muted small">
                                                    {product.stock > 0 ? (
                                                        <><i className="bi bi-check-circle-fill text-success"></i> Є в наявності</>
                                                    ) : (
                                                        <><i className="bi bi-x-circle-fill text-danger"></i> Немає</>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="d-grid gap-2">
                                                <Link 
                                                    href={`/product/${product.id}`} 
                                                    className="btn btn-outline-dark btn-sm"
                                                >
                                                    <i className="bi bi-eye"></i> Детальніше
                                                </Link>
                                                {product.stock > 0 && (
                                                    <button 
                                                        className="btn btn-warning btn-sm" 
                                                        onClick={() => handleAddToCart(product.id)}
                                                    >
                                                        <i className="bi bi-cart-plus"></i> До кошика
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-5">
                            <i className="bi bi-inbox" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                            <p className="text-muted mt-3">Товарів у цій категорії немає</p>
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
}