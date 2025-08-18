'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import Banner from './Banner';
import ProductCard from './ProductCard';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  serialNumber: string;
  quantity: number;
  salePrice: number;
  discount: number;
  image?: string;
  category: string;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - در آینده از API دریافت می‌شود
  useEffect(() => {
    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'لپ‌تاپ ایسوس',
        serialNumber: 'ASUS001',
        quantity: 5,
        salePrice: 18000000,
        discount: 10,
        category: 'الکترونیک',
        image: undefined
      },
      {
        id: '2',
        name: 'گوشی سامسونگ',
        serialNumber: 'SAM002',
        quantity: 10,
        salePrice: 9500000,
        discount: 5,
        category: 'الکترونیک',
        image: undefined
      },
      {
        id: '3',
        name: 'هدفون بلوتوثی Sony',
        serialNumber: 'SONY003',
        quantity: 15,
        salePrice: 2500000,
        discount: 0,
        category: 'الکترونیک',
        image: undefined
      }
    ];
    setProducts(sampleProducts);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesFilter = currentFilter === 'all' || product.category === currentFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleEdit = (id: string) => {
    // در آینده به صفحه ویرایش هدایت می‌شود
    console.log('Edit product:', id);
  };

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilter = (filter: string) => {
    setCurrentFilter(filter);
  };

  const handleViewChange = (view: 'grid' | 'list') => {
    setCurrentView(view);
  };

  return (
    <>
      <Header />
      <Banner />

      {/* Filters */}
      <div className="container-fluid px-3 mt-3">
        <div className="row g-2 filter-buttons">
          <div className="col-auto">
            <button 
              className={`btn btn-sm rounded-pill px-3 ${currentFilter === 'all' ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => handleFilter('all')}
            >
              همه
            </button>
          </div>
          <div className="col-auto">
            <button 
              className={`btn btn-sm rounded-pill px-3 ${currentFilter === 'الکترونیک' ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => handleFilter('الکترونیک')}
            >
              دسته پیشفرض
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container-fluid px-3 mt-3">
        <div className="search-container">
          <div className="input-group">
            <input 
              type="text" 
              className="form-control search-input" 
              placeholder="جست و جو کالا (Ctrl+K)" 
              value={searchTerm}
              onChange={handleSearch}
              autoComplete="off"
            />
            <span className="input-group-text bg-transparent border-0">
              <i className="bi bi-search text-muted"></i>
            </span>
          </div>
        </div>
      </div>

      {/* Action Icons */}
      <div className="container-fluid px-3 mt-3">
        <div className="row justify-content-center g-3 view-toggle">
          <div className="col-auto">
            <button 
              className="btn btn-outline-primary btn-sm rounded-circle p-2 qr-scanner-btn" 
              title="اسکن QR کد"
            >
              <i className="bi bi-qr-code-scan"></i>
            </button>
          </div>
          <div className="col-auto">
            <button 
              className={`btn btn-sm rounded-circle p-2 ${currentView === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleViewChange('list')}
              title="نمایش لیستی"
            >
              <i className="bi bi-list-ul"></i>
            </button>
          </div>
          <div className="col-auto">
            <button 
              className={`btn btn-sm rounded-circle p-2 ${currentView === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleViewChange('grid')}
              title="نمایش شبکه‌ای"
            >
              <i className="bi bi-grid-3x3-gap"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Products Container */}
      <div className="container-fluid px-3 mt-4">
        {filteredProducts.length === 0 ? (
          <div className="empty-state text-center py-5">
            <div className="empty-icon mb-3">
              <i className="bi bi-box text-muted" style={{ fontSize: '4rem' }}></i>
            </div>
            <h6 className="text-muted">کالایی یافت نشد</h6>
            <p className="text-muted small">برای افزودن کالای جدید روی دکمه زیر کلیک کنید</p>
            <Link href="/add-product" className="btn btn-outline-primary btn-sm">
              <i className="bi bi-plus me-2"></i>افزودن اولین کالا
            </Link>
          </div>
        ) : (
          <div className="row g-3">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="floating-btn">
        <Link href="/add-product" className="btn btn-primary btn-lg rounded-pill px-4 py-3 shadow">
          <i className="bi bi-plus-lg me-2"></i>افزودن کالا
        </Link>
      </div>
    </>
  );
}
