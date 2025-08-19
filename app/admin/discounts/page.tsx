'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'

interface UserLevel {
  id: number
  name: string
  discountPercentage: number
  description?: string
  createdAt: string
  updatedAt: string
  _count: {
    users: number
  }
}

interface UserLevelForm {
  name: string
  discountPercentage: number
  description: string
}

export default function AdminDiscountsPage() {
  const { user } = useAuth()
  const [levels, setLevels] = useState<UserLevel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingLevel, setEditingLevel] = useState<UserLevel | null>(null)
  const [formData, setUserLevelForm] = useState<UserLevelForm>({
    name: '',
    discountPercentage: 0,
    description: ''
  })

  // بررسی دسترسی مدیر
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      setError('فقط مدیران می‌توانند به این بخش دسترسی داشته باشند')
      setIsLoading(false)
      return
    }
    fetchLevels()
  }, [user])

  const fetchLevels = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user-levels')
      
      if (response.ok) {
        const data = await response.json()
        setLevels(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'خطا در دریافت سطوح تخفیف')
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setUserLevelForm(prev => ({
      ...prev,
      [name]: name === 'discountPercentage' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const url = editingLevel ? `/api/user-levels/${editingLevel.id}` : '/api/user-levels'
      const method = editingLevel ? 'PUT' : 'POST'

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
        
        if (!editingLevel) {
          // پاک کردن فرم بعد از ایجاد موفق
          setUserLevelForm({
            name: '',
            discountPercentage: 0,
            description: ''
          })
        }
        
        setShowForm(false)
        setEditingLevel(null)
        fetchLevels()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'خطا در ذخیره سطح تخفیف')
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (level: UserLevel) => {
    setEditingLevel(level)
    setUserLevelForm({
      name: level.name,
      discountPercentage: level.discountPercentage,
      description: level.description || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (levelId: number) => {
    if (!confirm('آیا از حذف این سطح تخفیف اطمینان دارید؟')) {
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/user-levels/${levelId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('سطح تخفیف با موفقیت حذف شد')
        fetchLevels()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'خطا در حذف سطح تخفیف')
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setUserLevelForm({
      name: '',
      discountPercentage: 0,
      description: ''
    })
    setEditingLevel(null)
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
    <>
      <Header />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>مدیریت سطوح تخفیف</h3>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={isLoading}
          >
            <i className="bi bi-plus-circle me-2"></i>
            افزودن سطح تخفیف جدید
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

        {/* فرم افزودن/ویرایش سطح تخفیف */}
        {showForm && (
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                {editingLevel ? 'ویرایش سطح تخفیف' : 'افزودن سطح تخفیف جدید'}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">نام سطح تخفیف *</label>
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
                      <label htmlFor="discountPercentage" className="form-label">درصد تخفیف *</label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          id="discountPercentage"
                          name="discountPercentage"
                          value={formData.discountPercentage}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          required
                          disabled={isLoading}
                        />
                        <span className="input-group-text">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">توضیحات</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    disabled={isLoading}
                  />
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
                      editingLevel ? 'ویرایش سطح تخفیف' : 'افزودن سطح تخفیف'
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

        {/* جدول سطوح تخفیف */}
        <div className="card">
          <div className="card-body">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">در حال بارگذاری...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>نام سطح</th>
                      <th>درصد تخفیف</th>
                      <th>تعداد کاربران</th>
                      <th>توضیحات</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levels.map(level => (
                      <tr key={level.id}>
                        <td>
                          <span className="fw-bold">{level.name}</span>
                        </td>
                        <td>
                          <span className={`badge ${level.discountPercentage > 0 ? 'bg-success' : 'bg-secondary'}`}>
                            {level.discountPercentage}%
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {level._count.users} کاربر
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {level.description || 'بدون توضیح'}
                          </small>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleEdit(level)}
                              disabled={isLoading}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            {level._count.users === 0 && (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(level.id)}
                                disabled={isLoading}
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
            )}

            {levels.length === 0 && !isLoading && (
              <div className="text-center py-4">
                <i className="bi bi-percent text-muted" style={{ fontSize: '3rem' }}></i>
                <p className="mt-2 text-muted">هنوز سطح تخفیفی تعریف نشده است</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  افزودن اولین سطح تخفیف
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
