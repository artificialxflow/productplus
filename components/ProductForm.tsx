'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from './ImageUploader'

interface Category {
  id: number
  name: string
  description?: string
}

interface ProductFormProps {
  product?: {
    id: number
    name: string
    price: number
    description?: string
    stock: number
    categoryId?: number
  }
  mode: 'create' | 'edit'
}

export default function ProductForm({ product, mode }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    description: product?.description || '',
    stock: product?.stock || 0,
    categoryId: product?.categoryId || ''
  })
  
  const [productImages, setProductImages] = useState<any[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const router = useRouter()

  // دریافت دسته‌بندی‌ها
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const url = mode === 'create' ? '/api/products' : `/api/products/${product?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          categoryId: formData.categoryId ? parseInt(formData.categoryId as string) : null
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // اگر محصول جدید ایجاد شد و تصاویر انتخاب شده، آنها را آپلود کن
        if (mode === 'create' && uploadedFiles.length > 0) {
          const productId = data.product.id
          await uploadImages(productId)
        }
        
        setSuccess(data.message)
        
        if (mode === 'create') {
          // پاک کردن فرم بعد از ایجاد موفق
          setFormData({
            name: '',
            price: 0,
            description: '',
            stock: 0,
            categoryId: ''
          })
          setUploadedFiles([])
        }
        
        // هدایت به صفحه محصولات بعد از 2 ثانیه
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'خطا در ذخیره محصول')
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور')
    } finally {
      setIsLoading(false)
    }
  }

  // آپلود تصاویر محصول
  const uploadImages = async (productId: number) => {
    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]
        const formData = new FormData()
        formData.append('image', file)
        formData.append('alt', `تصویر ${i + 1} محصول`)
        formData.append('isPrimary', i === 0 ? 'true' : 'false') // اولین تصویر اصلی باشد

        const response = await fetch(`/api/products/${productId}/images`, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          console.error(`خطا در آپلود تصویر ${i + 1}:`, await response.text())
        }
      }
    } catch (error) {
      console.error('خطا در آپلود تصاویر:', error)
    }
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                {mode === 'create' ? 'افزودن محصول جدید' : 'ویرایش محصول'}
              </h4>
            </div>
            <div className="card-body p-4">
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

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">نام محصول *</label>
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
                      <label htmlFor="categoryId" className="form-label">دسته‌بندی</label>
                      <select
                        className="form-select"
                        id="categoryId"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        disabled={isLoading}
                      >
                        <option value="">انتخاب دسته‌بندی</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="price" className="form-label">قیمت (تومان) *</label>
                      <input
                        type="number"
                        className="form-control"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="1000"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="stock" className="form-label">موجودی *</label>
                      <input
                        type="number"
                        className="form-control"
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        min="0"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* مدیریت تصاویر محصول */}
                <div className="mb-4">
                  <h6 className="mb-3">
                    <i className="bi bi-images me-2"></i>
                    {mode === 'create' ? 'آپلود تصاویر محصول' : 'مدیریت تصاویر محصول'}
                  </h6>
                  {mode === 'create' ? (
                    <div>
                      <div className="mb-3">
                        <label className="form-label">آپلود تصاویر محصول</label>
                        <input
                          type="file"
                          className="form-control"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || [])
                            setUploadedFiles(files)
                          }}
                          disabled={isLoading}
                        />
                        <small className="text-muted">
                          می‌توانید چندین تصویر انتخاب کنید. فرمت‌های پشتیبانی شده: JPG, PNG, GIF
                        </small>
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div className="mb-3">
                          <h6>تصاویر انتخاب شده:</h6>
                          <div className="row g-2">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="col-md-3">
                                <div className="card">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`تصویر ${index + 1}`}
                                    className="card-img-top"
                                    style={{ height: '100px', objectFit: 'cover' }}
                                  />
                                  <div className="card-body p-2">
                                    <small className="text-muted">{file.name}</small>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger d-block w-100 mt-1"
                                      onClick={() => {
                                        setUploadedFiles(prev => prev.filter((_, i) => i !== index))
                                      }}
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <ImageUploader
                      productId={product!.id}
                      onImagesChange={setProductImages}
                      existingImages={productImages}
                    />
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">توضیحات</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
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
                      mode === 'create' ? 'افزودن محصول' : 'ویرایش محصول'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => router.push('/')}
                    disabled={isLoading}
                  >
                    انصراف
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
