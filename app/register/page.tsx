'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // اعتبارسنجی
    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیستند')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل 6 کاراکتر باشد')
      setIsLoading(false)
      return
    }

    try {
      const success = await register(formData.name, formData.email, formData.password)
      if (success) {
        router.push('/login?message=ثبت‌نام با موفقیت انجام شد')
      } else {
        setError('خطا در ثبت‌نام')
      }
    } catch (error) {
      setError('خطا در ثبت‌نام')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-header bg-success text-white text-center">
              <h4 className="mb-0">ثبت‌نام</h4>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">نام و نام خانوادگی</label>
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
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">ایمیل</label>
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
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">رمز عبور</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <div className="form-text">حداقل 6 کاراکتر</div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">تکرار رمز عبور</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      در حال ثبت‌نام...
                    </>
                  ) : (
                    'ثبت‌نام'
                  )}
                </button>
              </form>
              
              <div className="text-center mt-3">
                <p className="mb-0">
                  قبلاً ثبت‌نام کرده‌اید؟{' '}
                  <Link href="/login" className="text-decoration-none">
                    وارد شوید
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
