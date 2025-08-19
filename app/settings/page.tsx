'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'

interface SettingsForm {
  name: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface SystemSettings {
  notifications: boolean
  language: string
  theme: string
}

export default function SettingsPage() {
  const { user, checkAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const [settingsForm, setSettingsForm] = useState<SettingsForm>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    notifications: true,
    language: 'fa',
    theme: 'light'
  })

  useEffect(() => {
    if (user) {
      setSettingsForm(prev => ({
        ...prev,
        name: (user as any).name || '',
        email: (user as any).email || ''
      }))
    }
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(`/api/users/${(user as any)?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: settingsForm.name,
          email: settingsForm.email
        })
      })

      if (response.ok) {
        setMessage('اطلاعات پروفایل با موفقیت بروزرسانی شد')
        await checkAuth() // بروزرسانی اطلاعات کاربر
      } else {
        const data = await response.json()
        setError(data.error || 'خطا در بروزرسانی اطلاعات')
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (settingsForm.newPassword !== settingsForm.confirmPassword) {
      setError('رمز عبور جدید و تکرار آن یکسان نیستند')
      return
    }

    if (settingsForm.newPassword.length < 6) {
      setError('رمز عبور جدید باید حداقل 6 کاراکتر باشد')
      return
    }

    setLoading(true)
    setMessage('')
    setError('')

    try {
      // ابتدا رمز عبور فعلی را تایید می‌کنیم
      const verifyResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: (user as any)?.email,
          password: settingsForm.currentPassword
        })
      })

      if (!verifyResponse.ok) {
        setError('رمز عبور فعلی اشتباه است')
        setLoading(false)
        return
      }

      // حالا رمز عبور جدید را تنظیم می‌کنیم
      const updateResponse = await fetch(`/api/users/${(user as any)?.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: settingsForm.currentPassword,
          newPassword: settingsForm.newPassword
        })
      })

      if (updateResponse.ok) {
        setMessage('رمز عبور با موفقیت تغییر یافت')
        setSettingsForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        const data = await updateResponse.json()
        setError(data.error || 'خطا در تغییر رمز عبور')
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  const handleSystemSettingsChange = (key: keyof SystemSettings, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }))
    
    // ذخیره در localStorage
    localStorage.setItem('systemSettings', JSON.stringify({
      ...systemSettings,
      [key]: value
    }))
  }

  useEffect(() => {
    // بارگذاری تنظیمات سیستم از localStorage
    const savedSettings = localStorage.getItem('systemSettings')
    if (savedSettings) {
      setSystemSettings(JSON.parse(savedSettings))
    }
  }, [])

  if (!user) {
    return (
      <>
        <Header />
        <div className="container mt-5">
          <div className="alert alert-warning">
            برای دسترسی به تنظیمات، ابتدا وارد سیستم شوید.
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
              <i className="bi bi-gear me-2"></i>
              تنظیمات سیستم
            </h1>
          </div>
        </div>

        {message && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
          </div>
        )}

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        <div className="row">
          {/* تنظیمات پروفایل */}
          <div className="col-lg-6 mb-4">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-person-gear me-2"></i>
                  تنظیمات پروفایل
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleProfileUpdate}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">نام کامل</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">ایمیل</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        در حال بروزرسانی...
                      </>
                    ) : (
                      'بروزرسانی پروفایل'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* تغییر رمز عبور */}
          <div className="col-lg-6 mb-4">
            <div className="card shadow-sm">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">
                  <i className="bi bi-key me-2"></i>
                  تغییر رمز عبور
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handlePasswordChange}>
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">رمز عبور فعلی</label>
                    <input
                      type="password"
                      className="form-control"
                      id="currentPassword"
                      value={settingsForm.currentPassword}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">رمز عبور جدید</label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      value={settingsForm.newPassword}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">تکرار رمز عبور جدید</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      value={settingsForm.confirmPassword}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-warning w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        در حال تغییر...
                      </>
                    ) : (
                      'تغییر رمز عبور'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* تنظیمات سیستم */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <i className="bi bi-sliders me-2"></i>
                  تنظیمات سیستم
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="notifications"
                        checked={systemSettings.notifications}
                        onChange={(e) => handleSystemSettingsChange('notifications', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="notifications">
                        اعلان‌ها
                      </label>
                    </div>
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label htmlFor="language" className="form-label">زبان</label>
                    <select
                      className="form-select"
                      id="language"
                      value={systemSettings.language}
                      onChange={(e) => handleSystemSettingsChange('language', e.target.value)}
                    >
                      <option value="fa">فارسی</option>
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label htmlFor="theme" className="form-label">تم</label>
                    <select
                      className="form-select"
                      id="theme"
                      value={systemSettings.theme}
                      onChange={(e) => handleSystemSettingsChange('theme', e.target.value)}
                    >
                      <option value="light">روشن</option>
                      <option value="dark">تیره</option>
                      <option value="auto">خودکار</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* اطلاعات حساب کاربری */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-secondary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  اطلاعات حساب کاربری
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>نام:</strong> {(user as any).name}</p>
                    <p><strong>ایمیل:</strong> {(user as any).email}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>نقش:</strong> 
                      <span className={`badge ${(user as any).role === 'ADMIN' ? 'bg-danger' : 'bg-primary'} ms-2`}>
                        {(user as any).role === 'ADMIN' ? 'مدیر' : 'کاربر'}
                      </span>
                    </p>
                    <p><strong>تاریخ عضویت:</strong> {new Date((user as any).createdAt).toLocaleDateString('fa-IR')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}