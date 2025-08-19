'use client'

import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'

export default function MyRolePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mt-4">
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">در حال بارگذاری...</span>
            </div>
            <p className="mt-2">در حال بارگذاری...</p>
          </div>
        </div>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="container mt-4">
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading">لطفاً وارد شوید!</h4>
            <p>برای مشاهده نقش و دسترسی‌های خود، ابتدا وارد شوید.</p>
            <hr />
            <a href="/login" className="btn btn-primary">ورود</a>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">
                  <i className="bi bi-person-badge me-2"></i>
                  نقش و دسترسی‌های من
                </h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-muted">اطلاعات کاربری:</h6>
                    <ul className="list-unstyled">
                      <li><strong>نام:</strong> {user.name}</li>
                      <li><strong>ایمیل:</strong> {user.email}</li>
                      <li><strong>نقش:</strong> 
                        <span className={`badge ms-2 ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                          {user.role === 'ADMIN' ? 'مدیر' : 'کاربر عادی'}
                        </span>
                      </li>
                      <li><strong>سطح تخفیف:</strong> {user.discountPercentage || 0}%</li>
                    </ul>
                  </div>
                  
                  <div className="col-md-6">
                    <h6 className="text-muted">دسترسی‌های شما:</h6>
                    <ul className="list-unstyled">
                      <li>
                        <i className="bi bi-check-circle text-success me-2"></i>
                        مشاهده محصولات
                      </li>
                      <li>
                        <i className="bi bi-check-circle text-success me-2"></i>
                        مشاهده قیمت‌ها با تخفیف شخصی
                      </li>
                      {user.role === 'ADMIN' ? (
                        <>
                          <li>
                            <i className="bi bi-check-circle text-success me-2"></i>
                            مدیریت محصولات
                          </li>
                          <li>
                            <i className="bi bi-check-circle text-success me-2"></i>
                            مدیریت دسته‌بندی‌ها
                          </li>
                          <li>
                            <i className="bi bi-check-circle text-success me-2"></i>
                            مدیریت کاربران
                          </li>
                          <li>
                            <i className="bi bi-check-circle text-success me-2"></i>
                            مدیریت سفارشات
                          </li>
                          <li>
                            <i className="bi bi-check-circle text-success me-2"></i>
                            تنظیم سطوح تخفیف
                          </li>
                        </>
                      ) : (
                        <>
                          <li>
                            <i className="bi bi-check-circle text-success me-2"></i>
                            افزودن محصولات
                          </li>
                          <li>
                            <i className="bi bi-x-circle text-muted me-2"></i>
                            مدیریت دسته‌بندی‌ها
                          </li>
                          <li>
                            <i className="bi bi-x-circle text-muted me-2"></i>
                            مدیریت کاربران
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                <hr />

                <div className="text-center">
                  <h6 className="text-muted mb-3">عملیات سریع:</h6>
                  <div className="d-flex gap-2 justify-content-center flex-wrap">
                    <a href="/" className="btn btn-outline-primary">
                      <i className="bi bi-box me-1"></i>
                      مشاهده محصولات
                    </a>
                    <a href="/add-product" className="btn btn-outline-success">
                      <i className="bi bi-plus-circle me-1"></i>
                      افزودن محصول
                    </a>
                    {user.role === 'ADMIN' && (
                      <>
                        <a href="/admin/categories" className="btn btn-outline-warning">
                          <i className="bi bi-tags me-1"></i>
                          مدیریت دسته‌ها
                        </a>
                        <a href="/admin/users" className="btn btn-outline-info">
                          <i className="bi bi-people me-1"></i>
                          مدیریت کاربران
                        </a>
                      </>
                    )}
                    <a href="/profile" className="btn btn-outline-secondary">
                      <i className="bi bi-person me-1"></i>
                      پروفایل
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
