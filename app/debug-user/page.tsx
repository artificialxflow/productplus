'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

export default function DebugUserPage() {
  const { user, isLoading } = useAuth()
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/verify')
        if (response.ok) {
          const data = await response.json()
          setUserInfo(data)
        }
      } catch (error) {
        console.error('Error fetching user info:', error)
      }
    }

    if (user) {
      fetchUserInfo()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          شما وارد نشده‌اید
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                اطلاعات کاربر
              </h4>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>اطلاعات پایه:</h6>
                  <ul className="list-unstyled">
                    <li><strong>نام:</strong> {user.name}</li>
                    <li><strong>ایمیل:</strong> {user.email}</li>
                    <li><strong>نقش:</strong> 
                      <span className={`badge ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'} ms-2`}>
                        {user.role}
                      </span>
                    </li>
                    <li><strong>شماره موبایل:</strong> {user.phone || 'ثبت نشده'}</li>
                    <li><strong>تایید موبایل:</strong> 
                      <span className={`badge ${user.isPhoneVerified ? 'bg-success' : 'bg-warning'} ms-2`}>
                        {user.isPhoneVerified ? 'تایید شده' : 'تایید نشده'}
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>اطلاعات تخفیف:</h6>
                  <ul className="list-unstyled">
                    <li><strong>سطح تخفیف:</strong> {user.discountPercentage || 0}%</li>
                    <li><strong>شناسه سطح:</strong> {user.levelId || 'تعیین نشده'}</li>
                  </ul>
                  
                  <h6 className="mt-3">دسترسی‌ها:</h6>
                  <ul className="list-unstyled">
                    <li>
                      <i className={`bi ${user.role === 'ADMIN' ? 'bi-check-circle text-success' : 'bi-x-circle text-danger'} me-2`}></i>
                      مدیریت دسته‌بندی‌ها
                    </li>
                    <li>
                      <i className={`bi ${user.role === 'ADMIN' ? 'bi-check-circle text-success' : 'bi-x-circle text-danger'} me-2`}></i>
                      مدیریت کاربران
                    </li>
                    <li>
                      <i className={`bi ${user.role === 'ADMIN' ? 'bi-check-circle text-success' : 'bi-x-circle text-danger'} me-2`}></i>
                      مدیریت سفارشات
                    </li>
                    <li>
                      <i className={`bi ${user.role === 'ADMIN' ? 'bi-check-circle text-success' : 'bi-x-circle text-danger'} me-2`}></i>
                      آپلود فایل
                    </li>
                  </ul>
                </div>
              </div>

              {userInfo && (
                <div className="mt-4">
                  <h6>اطلاعات کامل از API:</h6>
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify(userInfo, null, 2)}
                  </pre>
                </div>
              )}

              <div className="mt-4">
                <h6>عملیات:</h6>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-primary"
                    onClick={() => window.location.href = '/admin/categories'}
                  >
                    <i className="bi bi-tags me-2"></i>
                    مدیریت دسته‌بندی‌ها
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={() => window.location.href = '/add-product'}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    افزودن محصول
                  </button>
                  <button 
                    className="btn btn-info"
                    onClick={() => window.location.href = '/admin/users'}
                  >
                    <i className="bi bi-people me-2"></i>
                    مدیریت کاربران
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
