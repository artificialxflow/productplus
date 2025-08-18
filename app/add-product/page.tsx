'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function AddProduct() {
  const [formData, setFormData] = useState({
    productName: '',
    serialNumber: '',
    quantity: 1,
    purchasePrice: '',
    category: 'دسته پیشفرض'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // در آینده به API ارسال می‌شود
    console.log('Form submitted:', formData);
    alert('محصول با موفقیت اضافه شد!');
  };

  const generateSerialNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    setFormData(prev => ({
      ...prev,
      serialNumber: `SW${timestamp}${random}`
    }));
  };

  return (
    <>
      <Header />
      
      {/* Page Header */}
      <div className="container-fluid px-3 mt-3">
        <div className="d-flex align-items-center mb-3">
          <Link href="/" className="btn btn-link text-dark p-0 me-3">
            <i className="bi bi-arrow-right fs-4"></i>
          </Link>
          <h5 className="mb-0 fw-bold">افزودن کالا</h5>
        </div>
      </div>

      <div className="container-fluid px-3">
        <form onSubmit={handleSubmit}>
          {/* Image Upload Section */}
          <div className="row mb-4">
            <div className="col-12">
              <h6 className="mb-3">تصویر اصلی</h6>
              <div className="image-upload-card">
                <label className="image-upload-label">
                  <input type="file" className="d-none" accept="image/*" />
                  <i className="bi bi-camera text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                  <p className="text-muted mb-0">برای انتخاب تصویر کلیک کنید</p>
                </label>
              </div>
            </div>
          </div>

          {/* Additional Images */}
          <div className="row mb-4">
            <div className="col-12">
              <h6 className="mb-3">تصاویر اضافی</h6>
              <div className="row g-2">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="col-3">
                    <div className="image-upload-card small-image">
                      <label className="image-upload-label">
                        <input type="file" className="d-none" accept="image/*" />
                        <i className="bi bi-images text-muted" style={{ fontSize: '1.5rem' }}></i>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-bold">نام کالا</label>
              <input
                type="text"
                className="form-control form-input"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-bold">شماره سریال</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control form-input"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={generateSerialNumber}
                >
                  <i className="bi bi-qr-code"></i>
                </button>
              </div>
            </div>

            <div className="col-6">
              <label className="form-label fw-bold">مقدار/عدد</label>
              <input
                type="number"
                className="form-control form-input"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className="col-6">
              <label className="form-label fw-bold">قیمت خرید</label>
              <input
                type="number"
                className="form-control form-input"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleInputChange}
                min="0"
                step="1000"
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-bold">دسته‌بندی</label>
              <div className="d-flex align-items-center gap-2">
                <select
                  className="form-select form-input"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="دسته پیشفرض">دسته پیشفرض</option>
                  <option value="الکترونیک">الکترونیک</option>
                  <option value="پوشاک">پوشاک</option>
                  <option value="کتاب">کتاب</option>
                </select>
                <button type="button" className="btn btn-outline-primary btn-sm">
                  افزودن دسته بندی
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="row mt-4">
            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100 py-3">
                <i className="bi bi-floppy me-2"></i>
                افزودن به لیست
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
