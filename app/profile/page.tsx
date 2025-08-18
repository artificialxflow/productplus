'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'

interface Order {
  id: number
  status: string
  totalAmount: number
  createdAt: string
  orderItems: Array<{
    id: number
    quantity: number
    price: number
    product: {
      id: number
      name: string
      image: string
    }
  }>
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      fetchUserOrders()
    }
  }, [user])

  const fetchUserOrders = async () => {
    try {
      const response = await fetch(`/api/orders?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        setError('خطا در دریافت سفارشات')
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; class: string } } = {
      'PENDING': { text: 'در انتظار', class: 'bg-warning' },
      'PROCESSING': { text: 'در حال پردازش', class: 'bg-info' },
      'COMPLETED': { text: 'تکمیل شده', class: 'bg-success' },
      'CANCELLED': { text: 'لغو شده', class: 'bg-danger' }
    }
    
    return statusMap[status] || { text: status, class: 'bg-secondary' }
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="container mt-5">
          <div className="alert alert-warning">
            برای مشاهده پروفایل، ابتدا وارد سیستم شوید.
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <h1 className="mb-4 text-center">
              <i className="bi bi-person-circle me-2"></i>
              پروفایل کاربری
            </h1>
          </div>
        </div>

        <div className="row">
          {/* اطلاعات کاربر */}
          <div className="col-lg-4 mb-4">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-person-circle" style={{ fontSize: '4rem', color: '#007bff' }}></i>
                </div>
                <h4 className="card-title">{user.name}</h4>
                <p className="text-muted">{user.email}</p>
                <span className={`badge ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'} fs-6`}>
                  {user.role === 'ADMIN' ? 'مدیر سیستم' : 'کاربر عادی'}
                </span>
                
                <div className="mt-3">
                  <a href="/settings" className="btn btn-outline-primary me-2">
                    <i className="bi bi-gear me-1"></i>
                    تنظیمات
                  </a>
                  <a href="/add-product" className="btn btn-outline-success">
                    <i className="bi bi-plus-circle me-1"></i>
                    افزودن محصول
                  </a>
                </div>
              </div>
            </div>

            {/* آمار کلی */}
            <div className="card shadow-sm mt-3">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <i className="bi bi-graph-up me-2"></i>
                  آمار کلی
                </h6>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-6">
                    <h4 className="text-primary">{orders.length}</h4>
                    <small className="text-muted">تعداد سفارشات</small>
                  </div>
                  <div className="col-6">
                    <h4 className="text-success">
                      {orders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString('fa-IR')}
                    </h4>
                    <small className="text-muted">مجموع خرید (تومان)</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* سفارشات کاربر */}
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-cart-check me-2"></i>
                  تاریخچه سفارشات
                </h5>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">در حال بارگذاری...</span>
                    </div>
                    <p className="mt-2">در حال بارگذاری سفارشات...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">{error}</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-cart-x" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                    <p className="mt-2 text-muted">هنوز سفارشی ثبت نکرده‌اید</p>
                    <a href="/" className="btn btn-primary">
                      <i className="bi bi-shop me-1"></i>
                      مشاهده محصولات
                    </a>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>شماره سفارش</th>
                          <th>تاریخ</th>
                          <th>وضعیت</th>
                          <th>مبلغ کل</th>
                          <th>جزئیات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString('fa-IR')}</td>
                            <td>
                              <span className={`badge ${getStatusBadge(order.status).class}`}>
                                {getStatusBadge(order.status).text}
                              </span>
                            </td>
                            <td>{order.totalAmount.toLocaleString('fa-IR')} تومان</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-info"
                                data-bs-toggle="collapse"
                                data-bs-target={`#order-${order.id}`}
                              >
                                <i className="bi bi-eye me-1"></i>
                                مشاهده
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* جزئیات سفارشات */}
                {orders.map((order) => (
                  <div key={order.id} className="collapse mt-3" id={`order-${order.id}`}>
                    <div className="card card-body bg-light">
                      <h6 className="mb-3">جزئیات سفارش #{order.id}</h6>
                      <div className="row">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="col-md-6 mb-2">
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                                {item.product.image ? (
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="rounded"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div
                                    className="bg-secondary rounded d-flex align-items-center justify-content-center"
                                    style={{ width: '50px', height: '50px' }}
                                  >
                                    <i className="bi bi-image text-white"></i>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h6 className="mb-1">{item.product.name}</h6>
                                <small className="text-muted">
                                  تعداد: {item.quantity} | قیمت واحد: {item.price.toLocaleString('fa-IR')} تومان
                                </small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-top">
                        <strong>مجموع سفارش: {order.totalAmount.toLocaleString('fa-IR')} تومان</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
