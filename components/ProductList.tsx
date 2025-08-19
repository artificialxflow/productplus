'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from './ProductCard';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description?: string;
  images?: Array<{
    id: number;
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  category?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
}

export default function ProductList() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'description'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        setError('خطا در دریافت محصولات');
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleEdit = (id: number) => {
    console.log('Edit product:', id);
  };

  const handleDelete = (id: number) => {
    console.log('Delete product:', id);
  };

  const filteredAndSortedProducts = products
    .filter(product => {
              const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !selectedCategory || product.category?.id.toString() === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'description':
          aValue = a.description || '';
          bValue = b.description || '';
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field: 'name' | 'price' | 'description') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: 'name' | 'price' | 'description') => {
    if (sortBy !== field) return <i className="bi bi-arrow-down-up text-muted"></i>;
    return sortOrder === 'asc' ? 
      <i className="bi bi-arrow-up text-primary"></i> : 
      <i className="bi bi-arrow-down text-primary"></i>;
  };

  if (isLoading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <p className="mt-2">در حال بارگذاری محصولات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row align-items-center mb-4">
        <div className="col-md-6">
          <h2 className="mb-0">
            <i className="bi bi-box me-2"></i>
            لیست قیمت محصولات
          </h2>
          {user && (
            <small className="text-muted">
              سطح تخفیف شما: {user.discountPercentage || 0}%
            </small>
          )}
        </div>
        <div className="col-md-6 text-end">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-outline-primary ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <i className="bi bi-table me-1"></i>
              جدول
            </button>
            <button
              type="button"
              className={`btn btn-outline-primary ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <i className="bi bi-grid me-1"></i>
              کارت
            </button>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="جستجو در نام یا توضیحات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">همه دسته‌بندی‌ها</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'description')}
              >
                <option value="name">مرتب‌سازی بر اساس نام</option>
                <option value="price">مرتب‌سازی بر اساس قیمت</option>
                <option value="description">مرتب‌سازی بر اساس توضیحات</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSortBy('name');
                  setSortOrder('asc');
                }}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-search text-muted" style={{ fontSize: '3rem' }}></i>
          <h5 className="mt-3">محصولی یافت نشد</h5>
          <p className="text-muted">لطفاً فیلترهای جستجو را تغییر دهید</p>
        </div>
      ) : (
        <>
          <div className="row mb-3">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <h6 className="card-title">کل محصولات</h6>
                  <h4 className="mb-0">{filteredAndSortedProducts.length}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body text-center">
                  <h6 className="card-title">موجود</h6>
                  <h4 className="mb-0">
                    {filteredAndSortedProducts.filter(p => p.stock > 0).length}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body text-center">
                  <h6 className="card-title">محصولات فعال</h6>
                  <h4 className="mb-0">
                    {filteredAndSortedProducts.filter(p => p.stock > 0).length}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body text-center">
                  <h6 className="card-title">دسته‌بندی</h6>
                  <h4 className="mb-0">
                    {new Set(filteredAndSortedProducts.map(p => p.category?.id)).size}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {viewMode === 'table' ? (
            <div className="card">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '50px' }}>#</th>
                        <th 
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('name')}
                        >
                          نام محصول {getSortIcon('name')}
                        </th>
                        <th 
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('description')}
                        >
                          توضیحات {getSortIcon('description')}
                        </th>
                        <th>دسته‌بندی</th>
                        <th 
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('price')}
                        >
                          قیمت {getSortIcon('price')}
                        </th>
                        <th>موجودی</th>
                        <th>وضعیت</th>
                        {user?.role === 'ADMIN' && <th>عملیات</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedProducts.map((product, index) => {
                        const userDiscount = user?.discountPercentage || 0;
                        const finalPrice = product.price * (1 - userDiscount / 100);
                        const hasUserDiscount = userDiscount > 0;
                        
                        return (
                          <tr key={product.id}>
                            <td className="text-muted">{index + 1}</td>
                                                         <td>
                               <div className="d-flex align-items-center">
                                 {product.images && product.images.length > 0 ? (
                                   <img 
                                     src={product.images.find(img => img.isPrimary)?.url || product.images[0].url} 
                                     alt={product.name}
                                     className="rounded me-2"
                                     style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                   />
                                 ) : (
                                   <i className="bi bi-box text-muted me-2"></i>
                                 )}
                                 <div>
                                   <div className="fw-bold">{product.name}</div>
                                   {product.description && (
                                     <small className="text-muted">{product.description}</small>
                                   )}
                                 </div>
                               </div>
                             </td>
                            <td>
                              <small className="text-muted">
                                {product.description || 'بدون توضیحات'}
                              </small>
                            </td>
                            <td>
                              {product.category ? (
                                <span className="badge bg-secondary">
                                  {product.category.name}
                                </span>
                              ) : (
                                <span className="text-muted">بدون دسته</span>
                              )}
                            </td>
                            <td>
                              <div>
                                {hasUserDiscount ? (
                                  <>
                                                                      <div className="text-muted text-decoration-line-through">
                                    {new Intl.NumberFormat('fa-IR').format(product.price)} تومان
                                  </div>
                                    <div className="text-success fw-bold">
                                      {new Intl.NumberFormat('fa-IR').format(finalPrice)} تومان
                                    </div>
                                    <small className="text-success">
                                      تخفیف شما: {userDiscount}%
                                    </small>
                                  </>
                                ) : (
                                  <div className="fw-bold">
                                    {new Intl.NumberFormat('fa-IR').format(product.price)} تومان
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                                {product.stock > 0 ? `${product.stock} عدد` : 'ناموجود'}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex flex-column gap-1">
                                {product.stock > 0 && (
                                  <span className="badge bg-success">موجود</span>
                                )}
                                {hasUserDiscount && (
                                  <span className="badge bg-info">تخفیف کاربر</span>
                                )}
                              </div>
                            </td>
                            {user?.role === 'ADMIN' && (
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-outline-primary"
                                    onClick={() => handleEdit(product.id)}
                                    title="ویرایش"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    className="btn btn-outline-danger"
                                    onClick={() => handleDelete(product.id)}
                                    title="حذف"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              {filteredAndSortedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* منوی پایین صفحه */}
      <div className="mt-5 pt-4 border-top">
        <div className="row g-3">
          {/* بخش مدیریت محصولات */}
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-box-seam text-primary" style={{ fontSize: '2rem' }}></i>
                </div>
                <h6 className="card-title">مدیریت محصولات</h6>
                <p className="card-text small text-muted">افزودن، ویرایش و حذف محصولات</p>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => window.location.href = '/add-product'}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    افزودن محصول
                  </button>
                  {user?.role === 'ADMIN' && (
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => window.location.href = '/admin/bulk-import'}
                    >
                      <i className="bi bi-upload me-1"></i>
                      آپلود فایل
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* بخش مدیریت دسته‌بندی */}
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-tags text-success" style={{ fontSize: '2rem' }}></i>
                </div>
                <h6 className="card-title">دسته‌بندی‌ها</h6>
                <p className="card-text small text-muted">مدیریت دسته‌بندی محصولات</p>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={() => window.location.href = '/admin/categories'}
                  >
                    <i className="bi bi-gear me-1"></i>
                    مدیریت دسته‌ها
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* بخش مدیریت کاربران */}
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-people text-info" style={{ fontSize: '2rem' }}></i>
                </div>
                <h6 className="card-title">مدیریت کاربران</h6>
                <p className="card-text small text-muted">مدیریت کاربران و سطوح تخفیف</p>
                <div className="d-grid gap-2">
                  {user?.role === 'ADMIN' ? (
                    <>
                      <button 
                        className="btn btn-info btn-sm"
                        onClick={() => window.location.href = '/admin/users'}
                      >
                        <i className="bi bi-person-gear me-1"></i>
                        مدیریت کاربران
                      </button>
                      <button 
                        className="btn btn-outline-info btn-sm"
                        onClick={() => window.location.href = '/admin/discounts'}
                      >
                        <i className="bi bi-percent me-1"></i>
                        سطوح تخفیف
                      </button>
                    </>
                  ) : (
                    <button 
                      className="btn btn-info btn-sm"
                      onClick={() => window.location.href = '/profile'}
                    >
                      <i className="bi bi-person me-1"></i>
                      پروفایل من
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* بخش سفارشات */}
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-cart-check text-warning" style={{ fontSize: '2rem' }}></i>
                </div>
                <h6 className="card-title">سفارشات</h6>
                <p className="card-text small text-muted">مشاهده و مدیریت سفارشات</p>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-warning btn-sm"
                    onClick={() => window.location.href = '/orders'}
                  >
                    <i className="bi bi-eye me-1"></i>
                    مشاهده سفارشات
                  </button>
                  {user?.role === 'ADMIN' && (
                    <button 
                      className="btn btn-outline-warning btn-sm"
                      onClick={() => window.location.href = '/admin/orders'}
                    >
                      <i className="bi bi-gear me-1"></i>
                      مدیریت سفارشات
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* منوی سریع */}
        <div className="mt-4 pt-3 border-top">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h6 className="mb-2">
                <i className="bi bi-lightning text-warning me-2"></i>
                دسترسی سریع
              </h6>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-2 justify-content-md-end">
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => window.location.href = '/settings'}
                >
                  <i className="bi bi-gear me-1"></i>
                  تنظیمات
                </button>
                <button 
                  className="btn btn-outline-dark btn-sm"
                  onClick={() => window.location.href = '/profile'}
                >
                  <i className="bi bi-person-circle me-1"></i>
                  پروفایل
                </button>
                {user?.role === 'ADMIN' && (
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => window.location.href = '/admin'}
                  >
                    <i className="bi bi-speedometer2 me-1"></i>
                    پنل مدیریت
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
