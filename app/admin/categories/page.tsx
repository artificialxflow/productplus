'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'

interface Category {
  id: number
  name: string
  description: string | null
  productCount: number
}

export default function AdminCategoriesPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        setError('خطا در دریافت دسته‌بندی‌ها')
      }
    } catch (err) {
      setError('خطا در اتصال به سرور')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // بررسی دسترسی مدیر
  if (user?.role !== 'ADMIN') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <i className="bi bi-exclamation-triangle me-2"></i>
          شما دسترسی به این صفحه را ندارید
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('نام دسته‌بندی الزامی است')
      return
    }

    try {
      const url = editingCategory 
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowForm(false)
        setEditingCategory(null)
        setFormData({ name: '', description: '' })
        fetchCategories()
        alert(editingCategory ? 'دسته‌بندی بروزرسانی شد' : 'دسته‌بندی اضافه شد')
      } else {
        const error = await response.json()
        alert(error.message || 'خطا در عملیات')
      }
    } catch (err) {
      alert('خطا در اتصال به سرور')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCategories()
        alert('دسته‌بندی حذف شد')
      } else {
        const error = await response.json()
        alert(error.message || 'خطا در حذف')
      }
    } catch (err) {
      alert('خطا در اتصال به سرور')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i className="bi bi-tags me-2"></i>
            مدیریت دسته‌بندی‌ها
          </h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            افزودن دسته‌بندی جدید
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* فرم افزودن/ویرایش */}
        {showForm && (
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                {editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">نام دسته‌بندی *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="نام دسته‌بندی"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">توضیحات</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="توضیحات (اختیاری)"
                      />
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check-circle me-2"></i>
                    {editingCategory ? 'بروزرسانی' : 'افزودن'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    انصراف
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* جدول دسته‌بندی‌ها */}
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">لیست دسته‌بندی‌ها</h5>
          </div>
          <div className="card-body">
            {categories.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-tags text-muted" style={{ fontSize: '3rem' }}></i>
                <p className="text-muted mt-2">هیچ دسته‌بندی یافت نشد</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  افزودن اولین دسته‌بندی
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>نام</th>
                      <th>توضیحات</th>
                      <th>تعداد محصولات</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>
                          <strong>{category.name}</strong>
                        </td>
                        <td>
                          {category.description || (
                            <span className="text-muted">بدون توضیحات</span>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {category.productCount} محصول
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleEdit(category)}
                              title="ویرایش"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(category.id)}
                              title="حذف"
                              disabled={category.productCount > 0}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
