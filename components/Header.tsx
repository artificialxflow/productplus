'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
  };

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
            <div className="col-6 text-center">
              <h1 className="h5 text-white mb-0 fw-bold">PRODUCTPLUS</h1>
            </div>
            <div className="col-4 text-end">
              {isLoading ? (
                <div className="spinner-border spinner-border-sm text-white" role="status">
                  <span className="visually-hidden">در حال بارگذاری...</span>
                </div>
              ) : user ? (
                <div className="dropdown">
                  <button className="btn btn-link text-white p-0" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle fs-5 me-1"></i>
                    <span className="d-none d-sm-inline">{user.name}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" href="/profile">
                        <i className="bi bi-person me-2"></i>پروفایل
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" href="/settings">
                        <i className="bi bi-gear me-2"></i>تنظیمات
                      </Link>
                    </li>
                    {user.role === 'ADMIN' && (
                      <>
                        <li>
                          <Link className="dropdown-item" href="/admin/users">
                            <i className="bi bi-people me-2"></i>مدیریت کاربران
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" href="/admin/orders">
                            <i className="bi bi-cart me-2"></i>مدیریت سفارشات
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" href="/admin/discounts">
                            <i className="bi bi-percent me-2"></i>مدیریت تخفیف‌ها
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" href="/admin/bulk-import">
                            <i className="bi bi-upload me-2"></i>آپلود فایل
                          </Link>
                        </li>
                      </>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleSignOut}>
                        <i className="bi bi-box-arrow-right me-2"></i>خروج
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="d-flex gap-2">
                  <Link href="/login" className="btn btn-outline-light btn-sm">
                    ورود
                  </Link>
                  <Link href="/register" className="btn btn-light btn-sm">
                    ثبت‌نام
                  </Link>
                </div>
              )}
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
            {user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/add-product" onClick={() => setIsMenuOpen(false)}>
                    <i className="bi bi-plus-circle me-2"></i>افزودن کالا
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/profile" onClick={() => setIsMenuOpen(false)}>
                    <i className="bi bi-person me-2"></i>پروفایل
                  </Link>
                </li>
                {user.role === 'ADMIN' && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" href="/admin/users" onClick={() => setIsMenuOpen(false)}>
                        <i className="bi bi-people me-2"></i>مدیریت کاربران
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" href="/admin/orders" onClick={() => setIsMenuOpen(false)}>
                        <i className="bi bi-cart me-2"></i>مدیریت سفارشات
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" href="/admin/discounts" onClick={() => setIsMenuOpen(false)}>
                        <i className="bi bi-percent me-2"></i>مدیریت تخفیف‌ها
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" href="/admin/bulk-import" onClick={() => setIsMenuOpen(false)}>
                        <i className="bi bi-upload me-2"></i>آپلود فایل
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" href="/admin/categories" onClick={() => setIsMenuOpen(false)}>
                        <i className="bi bi-tags me-2"></i>مدیریت دسته‌ها
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}
            <li className="nav-item">
              <Link className="nav-link" href="/settings" onClick={() => setIsMenuOpen(false)}>
                <i className="bi bi-gear me-2"></i>تنظیمات
              </Link>
            </li>
            {!user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/login" onClick={() => setIsMenuOpen(false)}>
                    <i className="bi bi-box-arrow-in-right me-2"></i>ورود
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/register" onClick={() => setIsMenuOpen(false)}>
                    <i className="bi bi-person-plus me-2"></i>ثبت‌نام
                  </Link>
                </li>
              </>
            )}
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
