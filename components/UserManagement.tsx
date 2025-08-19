'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface User {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
  _count: {
    orders: number
  }
}

interface UserFormData {
  name: string
  email: string
  password: string
  role: string
}

export default function UserManagement() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // بررسی دسترسی مدیر
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      setError('فقط مدیران می‌توانند به این بخش دسترسی داشته باشند')
      setIsLoading(false)
      return
    }
    fetchUsers()
  }, [user])

  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users?page=${page}`)
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setPagination(data.pagination)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'خطا در دریافت کاربران')
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
      const method = editingUser ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(data.message)
        
        if (!editingUser) {
          // پاک کردن فرم بعد از ایجاد موفق
          setFormData({
            name: '',
            email: '',
            password: '',
            role: 'USER'
          })
        }
        
        setShowForm(false)
        setEditingUser(null)
        fetchUsers(pagination.currentPage)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'خطا در ذخیره کاربر')
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    })
    setShowForm(true)
  }

  const handleDelete = async (userId: number) => {
    if (!confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('کاربر با موفقیت حذف شد')
        fetchUsers(pagination.currentPage)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'خطا در حذف کاربر')
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (userId: number, newRole: string) => {
    const roleText = newRole === 'ADMIN' ? 'مدیر' : 'کاربر عادی'
    if (!confirm(`آیا از تبدیل این کاربر به ${roleText} اطمینان دارید؟`)) {
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/users/change-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, newRole })
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(data.message)
        fetchUsers(pagination.currentPage)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'خطا در تغییر نقش کاربر')
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'USER'
    })
    setEditingUser(null)
    setShowForm(false)
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          شما دسترسی به این بخش را ندارید
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>مدیریت کاربران</h3>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={isLoading}
        >
          <i className="bi bi-person-plus me-2"></i>
          افزودن کاربر جدید
        </button>
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

      {/* فرم افزودن/ویرایش کاربر */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              {editingUser ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">نام و نام خانوادگی *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">ایمیل *</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      {editingUser ? 'رمز عبور جدید (اختیاری)' : 'رمز عبور *'}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required={!editingUser}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">نقش *</label>
                    <select
                      className="form-select"
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    >
                      <option value="USER">کاربر عادی</option>
                      <option value="ADMIN">مدیر</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      در حال ذخیره...
                    </>
                  ) : (
                    editingUser ? 'ویرایش کاربر' : 'افزودن کاربر'
                  )}
                </button>
                
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* جدول کاربران */}
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
                      <th>نام</th>
                      <th>ایمیل</th>
                      <th>نقش</th>
                      <th>تعداد سفارشات</th>
                      <th>تاریخ عضویت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                            {user.role === 'ADMIN' ? 'مدیر' : 'کاربر عادی'}
                          </span>
                        </td>
                        <td>{user._count.orders}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString('fa-IR')}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleEdit(user)}
                              disabled={isLoading}
                              title="ویرایش"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className={`btn ${user.role === 'ADMIN' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                              onClick={() => handleRoleChange(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                              disabled={isLoading}
                              title={user.role === 'ADMIN' ? 'تبدیل به کاربر عادی' : 'تبدیل به مدیر'}
                            >
                              <i className={`bi ${user.role === 'ADMIN' ? 'bi-person-down' : 'bi-person-up'}`}></i>
                            </button>
                            {user.role !== 'ADMIN' && (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(user.id)}
                                disabled={isLoading}
                                title="حذف"
                              >
                                <i className="bi bi-trash"></i>
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
                <nav aria-label="صفحه‌بندی کاربران">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => fetchUsers(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                      >
                        قبلی
                      </button>
                    </li>
                    
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${page === pagination.currentPage ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => fetchUsers(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => fetchUsers(pagination.currentPage + 1)}
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
    </div>
  )
}
