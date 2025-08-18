'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <header className="header-gradient">
        <div className="container-fluid">
          <div className="row align-items-center py-3">
            <div className="col-2">
              <button 
                className="btn btn-link text-white p-0" 
                onClick={() => setIsMenuOpen(true)}
              >
                <i className="bi bi-list fs-4"></i>
              </button>
            </div>
            <div className="col-8 text-center">
              <h1 className="h5 text-white mb-0 fw-bold">PRICE LIST</h1>
            </div>
            <div className="col-2 text-end">
              <div className="dropdown">
                <button className="btn btn-link text-white p-0" data-bs-toggle="dropdown">
                  <i className="bi bi-three-dots-vertical fs-5"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><a className="dropdown-item" href="#"><i className="bi bi-printer me-2"></i>چاپ</a></li>
                  <li><Link className="dropdown-item" href="/settings"><i className="bi bi-gear me-2"></i>تنظیمات</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Side Menu */}
      <div className={`offcanvas offcanvas-end ${isMenuOpen ? 'show' : ''}`} tabIndex={-1} id="sideMenu">
        <div className="offcanvas-header header-gradient">
          <h5 className="offcanvas-title text-white">منو</h5>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={() => setIsMenuOpen(false)}
          ></button>
        </div>
        <div className="offcanvas-body">
          <ul className="nav nav-pills flex-column">
            <li className="nav-item">
              <Link className="nav-link active" href="/" onClick={() => setIsMenuOpen(false)}>
                <i className="bi bi-house me-2"></i>صفحه اصلی
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/add-product" onClick={() => setIsMenuOpen(false)}>
                <i className="bi bi-plus-circle me-2"></i>افزودن کالا
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/settings" onClick={() => setIsMenuOpen(false)}>
                <i className="bi bi-gear me-2"></i>تنظیمات
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/profile" onClick={() => setIsMenuOpen(false)}>
                <i className="bi bi-person me-2"></i>پروفایل
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Backdrop */}
      {isMenuOpen && (
        <div 
          className="offcanvas-backdrop fade show" 
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </>
  );
}
