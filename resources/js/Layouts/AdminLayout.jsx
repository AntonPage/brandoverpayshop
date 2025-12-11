import React from 'react';
import { Link } from '@inertiajs/react';

export default function AdminLayout({ user, children }) {
    const currentPath = window.location.pathname;

    return (
        <div className="d-flex min-vh-100">
            {/* Sidebar */}
            <div className="bg-dark text-white" style={{ width: '250px', minHeight: '100vh' }}>
                <div className="p-3 border-bottom border-secondary">
                    <h4 className="mb-0">
                        <i className="bi bi-speedometer2"></i> Адмін
                    </h4>
                </div>
                <ul className="nav flex-column p-2">
                    <li className="nav-item">
                        <Link 
                            href="/admin" 
                            className={`nav-link text-white ${currentPath === '/admin' ? 'active bg-primary' : ''}`}
                        >
                            <i className="bi bi-house-door"></i> Головна
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link 
                            href="/admin/products" 
                            className={`nav-link text-white ${currentPath === '/admin/products' ? 'active bg-primary' : ''}`}
                        >
                            <i className="bi bi-box-seam"></i> Товари
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link 
                            href="/admin/categories" 
                            className={`nav-link text-white ${currentPath === '/admin/categories' ? 'active bg-primary' : ''}`}
                        >
                            <i className="bi bi-tags"></i> Категорії
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link 
                            href="/admin/orders" 
                            className={`nav-link text-white ${currentPath === '/admin/orders' ? 'active bg-primary' : ''}`}
                        >
                            <i className="bi bi-cart-check"></i> Замовлення
                        </Link>
                    </li>
                    <li className="nav-item">
                        <hr className="border-secondary" />
                    </li>
                    <li className="nav-item">
                        <Link href="/" className="nav-link text-white">
                            <i className="bi bi-globe"></i> На сайт
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link href="/logout" method="post" as="button" className="nav-link text-white">
                            <i className="bi bi-box-arrow-right"></i> Вихід
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 bg-light">
                {children}
            </div>
        </div>
    );
}