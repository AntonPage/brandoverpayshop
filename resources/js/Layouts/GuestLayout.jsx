import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        fetchCartCount();
    }, []);

    const fetchCartCount = async () => {
        try {
            const response = await fetch('/api/cart');
            const data = await response.json();
            setCartCount(data.count || 0);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    return (
        <div className="min-vh-100 d-flex flex-column">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
                <div className="container">
                    <Link href="/" className="navbar-brand fw-bold d-flex align-items-center">
                        <div>
                            <span style={{ fontSize: '1.3rem' }}>BrandOverpay.com</span>
                            <small className="d-block" style={{ fontSize: '0.65rem', opacity: 0.75, marginTop: '-3px' }}>
                                Premium products, premium prices
                            </small>
                        </div>
                    </Link>
                    
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <Link href="/" className="nav-link">
                                    <i className="bi bi-house"></i> Головна
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/cart" className="nav-link">
                                    <i className="bi bi-cart3"></i> Кошик
                                    {cartCount > 0 && (
                                        <span className="badge bg-danger ms-1">{cartCount}</span>
                                    )}
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/login" className="nav-link">
                                    <i className="bi bi-box-arrow-in-right"></i> Вхід
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/register" className="nav-link">
                                    <i className="bi bi-person-plus"></i> Реєстрація
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-dark text-white py-4 mt-5">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6">
                            <h5 className="mb-0">BrandOverpay.com</h5>
                            <p className="text-muted small">Premium products, premium prices</p>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <p className="text-muted mb-1 small">© 2024 BrandOverpay.com. Всі права захищені</p>
                            <p className="text-muted small">Курсова робота (Laravel + React)</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}