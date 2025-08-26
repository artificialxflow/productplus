'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface OrderItem {
  id: number
  quantity: number
  price: number
  product: {
    id: number
    name: string
    price: number
    images?: Array<{
      id: number
      url: string
      alt: string
      isPrimary: boolean
    }>
  }
}

interface Order {
  id: number
  status: string
  totalAmount: number
  createdAt: string
  updatedAt: string
  user: {
    id: number
    name: string
    email: string
  }
  orderItems: OrderItem[]
}

export default function OrderManagement() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async (page = 1) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/orders?page=${page}`)
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setPagination(data.pagination)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'خطا در دریافت سفارشات')
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setSuccess('وضعیت سفارش با موفقیت تغییر کرد')
        fetchOrders(pagination.currentPage)
        setSelectedOrder(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'خطا در تغییر وضعیت سفارش')
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { class: 'bg-warning', text: 'در انتظار' },
      'CONFIRMED': { class: 'bg-info', text: 'تایید شده' },
      'PROCESSING': { class: 'bg-primary', text: 'در حال پردازش' },
      'SHIPPED': { class: 'bg-success', text: 'ارسال شده' },
      'DELIVERED': { class: 'bg-success', text: 'تحویل داده شده' },
      'CANCELLED': { class: 'bg-danger', text: 'لغو شده' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { class: 'bg-secondary', text: status }
    return <span className={`badge ${config.class}`}>{config.text}</span>
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>مدیریت سفارشات</h3>
        <div className="d-flex gap-2">
          <select 
            className="form-select form-select-sm w-auto"
            onChange={(e) => {
              if (e.target.value) {
                fetchOrders(1)
              }
            }}
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="PENDING">در انتظار</option>
            <option value="CONFIRMED">تایید شده</option>
            <option value="PROCESSING">در حال پردازش</option>
            <option value="SHIPPED">ارسال شده</option>
            <option value="DELIVERED">تحویل داده شده</option>
            <option value="CANCELLED">لغو شده</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      {/* جدول سفارشات */}
      <div className="card">
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">در حال بارگذاری...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>شماره سفارش</th>
                      <th>مشتری</th>
                      <th>وضعیت</th>
                      <th>مبلغ کل</th>
                      <th>تاریخ سفارش</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>
                          <div>
                            <div className="fw-bold">{order.user.name}</div>
                            <small className="text-muted">{order.user.email}</small>
                          </div>
                        </td>
                        <td>{getStatusBadge(order.status)}</td>
                        <td className="fw-bold">{formatPrice(order.totalAmount)}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => setSelectedOrder(order)}
                              disabled={isLoading}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            {order.status === 'PENDING' && (
                              <button
                                className="btn btn-outline-success"
                                onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
                                disabled={isLoading}
                              >
                                <i className="bi bi-check"></i>
                              </button>
                            )}
                            {['PENDING', 'CONFIRMED'].includes(order.status) && (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                                disabled={isLoading}
                              >
                                <i className="bi bi-x"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <nav aria-label="صفحه‌بندی سفارشات">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => fetchOrders(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                      >
                        قبلی
                      </button>
                    </li>
                    
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${page === pagination.currentPage ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => fetchOrders(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => fetchOrders(pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                      >
                        بعدی
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal جزئیات سفارش */}
      {selectedOrder && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">جزئیات سفارش #{selectedOrder.id}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedOrder(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6>اطلاعات مشتری</h6>
                    <p><strong>نام:</strong> {selectedOrder.user.name}</p>
                    <p><strong>ایمیل:</strong> {selectedOrder.user.email}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>اطلاعات سفارش</h6>
                    <p><strong>وضعیت:</strong> {getStatusBadge(selectedOrder.status)}</p>
                    <p><strong>تاریخ سفارش:</strong> {formatDate(selectedOrder.createdAt)}</p>
                    <p><strong>مبلغ کل:</strong> {formatPrice(selectedOrder.totalAmount)}</p>
                  </div>
                </div>

                <h6>محصولات سفارش</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>محصول</th>
                        <th>قیمت واحد</th>
                        <th>تعداد</th>
                        <th>قیمت کل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.orderItems.map(item => (
                        <tr key={item.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {item.product.images && item.product.images.length > 0 && (
                                <img 
                                  src={item.product.images.find(img => img.isPrimary)?.url || item.product.images[0].url} 
                                  alt={item.product.name}
                                  className="me-2"
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                              )}
                              <span>{item.product.name}</span>
                            </div>
                          </td>
                          <td>{formatPrice(item.price)}</td>
                          <td>{item.quantity}</td>
                          <td>{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <strong>تعداد کل محصولات:</strong> {selectedOrder.orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </div>
                  <div>
                    <strong>مبلغ کل:</strong> {formatPrice(selectedOrder.totalAmount)}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
