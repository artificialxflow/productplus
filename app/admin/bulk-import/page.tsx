'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'

interface Category {
  id: number
  name: string
}

interface ImportResult {
  importedCount: number
  totalCount: number
  message: string
}

export default function AdminBulkImportPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // بررسی دسترسی مدیر
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      setError('فقط مدیران می‌توانند به این بخش دسترسی داشته باشند')
      return
    }
    fetchCategories()
  }, [user])

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

  const handleFileSelect = (file: File) => {
    // بررسی نوع فایل
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword' // .doc
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('نوع فایل پشتیبانی نمی‌شود. فقط فایل‌های Excel و Word مجاز هستند')
      setSelectedFile(null)
      return
    }

    // بررسی اندازه فایل
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setError('حجم فایل نباید بیشتر از 10 مگابایت باشد')
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    setError('')
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setError('لطفاً فایلی انتخاب کنید')
      return
    }

    if (!selectedCategory) {
      setError('لطفاً دسته‌بندی را انتخاب کنید')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('categoryId', selectedCategory)

      const response = await fetch('/api/bulk-import', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(data.message)
        setImportResult({
          importedCount: data.importedCount,
          totalCount: data.totalCount,
          message: data.message
        })
        
        // پاک کردن فرم
        setSelectedFile(null)
        setSelectedCategory('')
        
        // پاک کردن input file
        const fileInput = document.getElementById('fileInput') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'خطا در آپلود فایل')
        
        if (errorData.details) {
          setError(prev => prev + '\n' + errorData.details.join('\n'))
        }
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setSelectedCategory('')
    setError('')
    setSuccess('')
    setImportResult(null)
    const fileInput = document.getElementById('fileInput') as HTMLInputElement
    if (fileInput) fileInput.value = ''
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
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">
                  <i className="bi bi-upload me-2"></i>
                  آپلود فایل Excel/Word برای وارد کردن محصولات
                </h4>
              </div>
              <div className="card-body p-4">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <pre className="mb-0">{error}</pre>
                  </div>
                )}
                
                {success && (
                  <div className="alert alert-success" role="alert">
                    {success}
                  </div>
                )}

                {/* فرم آپلود */}
                <form onSubmit={handleSubmit}>
                  {/* انتخاب دسته‌بندی */}
                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">دسته‌بندی محصولات *</label>
                    <select
                      className="form-select"
                      id="category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      required
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

                  {/* آپلود فایل */}
                  <div className="mb-3">
                    <label className="form-label">انتخاب فایل *</label>
                    <div
                      className={`border-2 border-dashed rounded p-4 text-center ${
                        dragActive ? 'border-primary bg-light' : 'border-secondary'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {selectedFile ? (
                        <div>
                          <i className="bi bi-file-earmark-check text-success" style={{ fontSize: '2rem' }}></i>
                          <p className="mb-2 mt-2 fw-bold">{selectedFile.name}</p>
                          <p className="text-muted small">
                            حجم: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setSelectedFile(null)}
                            disabled={isLoading}
                          >
                            حذف فایل
                          </button>
                        </div>
                      ) : (
                        <div>
                          <i className="bi bi-cloud-upload text-muted" style={{ fontSize: '2rem' }}></i>
                          <p className="mb-2 mt-2">فایل را اینجا بکشید یا کلیک کنید</p>
                          <p className="text-muted small mb-2">
                            فرمت‌های پشتیبانی شده: Excel (.xlsx, .xls) و Word (.docx, .doc)
                          </p>
                          <input
                            type="file"
                            id="fileInput"
                            className="d-none"
                            accept=".xlsx,.xls,.docx,.doc"
                            onChange={handleFileInput}
                          />
                          <label htmlFor="fileInput" className="btn btn-outline-primary">
                            انتخاب فایل
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* راهنمای فرمت فایل */}
                  <div className="mb-3">
                    <div className="accordion" id="formatHelp">
                      <div className="accordion-item">
                        <h2 className="accordion-header">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#formatHelpContent"
                          >
                            <i className="bi bi-info-circle me-2"></i>
                            راهنمای فرمت فایل
                          </button>
                        </h2>
                        <div
                          id="formatHelpContent"
                          className="accordion-collapse collapse"
                          data-bs-parent="#formatHelp"
                        >
                          <div className="accordion-body">
                            <h6>فایل Excel:</h6>
                            <ul className="small">
                              <li>ستون اول: نام محصول</li>
                              <li>ستون دوم: شماره سریال</li>
                              <li>ستون سوم: قیمت فروش</li>
                              <li>ستون چهارم: موجودی</li>
                              <li>ستون پنجم: درصد تخفیف (اختیاری)</li>
                              <li>ستون ششم: توضیحات (اختیاری)</li>
                            </ul>
                            
                            <h6>فایل Word:</h6>
                            <p className="small">
                              هر خط باید شامل: نام محصول، شماره سریال، قیمت فروش و موجودی باشد
                            </p>
                            
                            <div className="alert alert-warning small">
                              <strong>نکته:</strong> سطر اول فایل Excel به عنوان هدر در نظر گرفته می‌شود
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* دکمه‌های عملیات */}
                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!selectedFile || !selectedCategory || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          در حال آپلود...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-upload me-2"></i>
                          آپلود و وارد کردن محصولات
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={resetForm}
                      disabled={isLoading}
                    >
                      پاک کردن
                    </button>
                  </div>
                </form>

                {/* نمایش نتیجه */}
                {importResult && (
                  <div className="mt-4">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          نتیجه آپلود
                        </h6>
                        <div className="row text-center">
                          <div className="col-6">
                            <div className="border-end">
                              <h4 className="text-success mb-1">{importResult.importedCount}</h4>
                              <small className="text-muted">محصول وارد شده</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <h4 className="text-primary mb-1">{importResult.totalCount}</h4>
                            <small className="text-muted">کل محصولات فایل</small>
                          </div>
                        </div>
                        <p className="text-center mt-2 mb-0 small text-muted">
                          {importResult.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
