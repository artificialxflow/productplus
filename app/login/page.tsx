'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import Link from 'next/link'

type AuthMethod = 'email' | 'phone'

function LoginForm() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email')
  
  // Email authentication
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Phone authentication
  const [phone, setPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { login, loginWithPhone, verifyOTP } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const success = await login(email, password)
      if (success) {
        router.push(callbackUrl)
      } else {
        setError('ایمیل یا رمز عبور اشتباه است')
      }
    } catch (error) {
      setError('خطا در ورود به سیستم')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const success = await loginWithPhone(phone)
      if (success) {
        setOtpSent(true)
        setSuccess('کد تایید ارسال شد')
      } else {
        setError('خطا در ارسال کد تایید')
      }
    } catch (error) {
      setError('خطا در ارسال کد تایید')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const success = await verifyOTP(phone, otpCode)
      if (success) {
        router.push(callbackUrl)
      } else {
        setError('کد تایید اشتباه است')
      }
    } catch (error) {
      setError('خطا در تایید کد')
    } finally {
      setIsLoading(false)
    }
  }

  const resetPhoneForm = () => {
    setPhone('')
    setOtpCode('')
    setOtpSent(false)
    setError('')
    setSuccess('')
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center">
              <h4 className="mb-0">ورود به سیستم</h4>
            </div>
            <div className="card-body p-4">
              {/* Tab Navigation */}
              <ul className="nav nav-tabs nav-fill mb-3" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${authMethod === 'email' ? 'active' : ''}`}
                    onClick={() => {
                      setAuthMethod('email')
                      setError('')
                      setSuccess('')
                    }}
                    type="button"
                  >
                    <i className="bi bi-envelope me-2"></i>
                    ورود با ایمیل
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${authMethod === 'phone' ? 'active' : ''}`}
                    onClick={() => {
                      setAuthMethod('phone')
                      resetPhoneForm()
                    }}
                    type="button"
                  >
                    <i className="bi bi-phone me-2"></i>
                    ورود با موبایل
                  </button>
                </li>
              </ul>

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

              {/* Email Authentication Tab */}
              {authMethod === 'email' && (
                <form onSubmit={handleEmailSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">ایمیل</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        در حال ورود...
                      </>
                    ) : (
                      'ورود'
                    )}
                  </button>
                </form>
              )}

              {/* Phone Authentication Tab */}
              {authMethod === 'phone' && (
                <>
                  {!otpSent ? (
                    <form onSubmit={handleSendOTP}>
                      <div className="mb-3">
                        <label htmlFor="phone" className="form-label">شماره موبایل</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="09xxxxxxxxx"
                          required
                          disabled={isLoading}
                        />
                        <div className="form-text">شماره موبایل خود را بدون صفر ابتدا وارد کنید</div>
                      </div>
                      
                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            در حال ارسال...
                          </>
                        ) : (
                          'ارسال کد تایید'
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOTP}>
                      <div className="mb-3">
                        <label htmlFor="otpCode" className="form-label">کد تایید</label>
                        <input
                          type="text"
                          className="form-control text-center"
                          id="otpCode"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="000000"
                          maxLength={6}
                          required
                          disabled={isLoading}
                        />
                        <div className="form-text">کد 6 رقمی ارسال شده را وارد کنید</div>
                      </div>
                      
                      <div className="d-grid gap-2">
                        <button
                          type="submit"
                          className="btn btn-success"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              در حال تایید...
                            </>
                          ) : (
                            'تایید کد'
                          )}
                        </button>
                        
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={resetPhoneForm}
                          disabled={isLoading}
                        >
                          تغییر شماره موبایل
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
              
              <div className="text-center mt-3">
                <p className="mb-0">
                  حساب کاربری ندارید؟{' '}
                  <Link href="/register" className="text-decoration-none">
                    ثبت‌نام کنید
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
