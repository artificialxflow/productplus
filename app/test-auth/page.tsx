'use client'

import { useState } from 'react'

export default function TestAuthPage() {
  const [token, setToken] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const testAuth = async () => {
    if (!token.trim()) {
      setError('لطفاً توکن را وارد کنید')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(`خطا: ${data.error} (کد: ${response.status})`)
      }
    } catch (err) {
      setError(`خطا در ارتباط: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const testLocalStorage = () => {
    const storedToken = localStorage.getItem('auth-token')
    if (storedToken) {
      setToken(storedToken)
      setResult({ message: 'توکن از Local Storage دریافت شد', token: storedToken.substring(0, 20) + '...' })
    } else {
      setError('توکنی در Local Storage یافت نشد')
    }
  }

  const clearToken = () => {
    localStorage.removeItem('auth-token')
    setToken('')
    setResult(null)
    setError('')
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-shield-check me-2"></i>
                تست احراز هویت
              </h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">توکن احراز هویت:</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="توکن JWT را اینجا وارد کنید..."
                />
              </div>

              <div className="d-flex gap-2 mb-3">
                <button
                  className="btn btn-primary"
                  onClick={testAuth}
                  disabled={loading || !token.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      در حال تست...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-play me-2"></i>
                      تست احراز هویت
                    </>
                  )}
                </button>

                <button
                  className="btn btn-success"
                  onClick={testLocalStorage}
                >
                  <i className="bi bi-database me-2"></i>
                  دریافت از Local Storage
                </button>

                <button
                  className="btn btn-warning"
                  onClick={clearToken}
                >
                  <i className="bi bi-trash me-2"></i>
                  پاک کردن
                </button>
              </div>

              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {result && (
                <div className="alert alert-success">
                  <h6>نتیجه:</h6>
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}

              <div className="mt-4">
                <h6>راهنمای تست:</h6>
                <ol>
                  <li>ابتدا وارد سیستم شوید</li>
                  <li>از Local Storage توکن را دریافت کنید</li>
                  <li>توکن را تست کنید</li>
                  <li>اگر خطا رخ داد، جزئیات را بررسی کنید</li>
                </ol>
              </div>

              <div className="mt-3">
                <h6>بررسی Local Storage:</h6>
                <button
                  className="btn btn-outline-info btn-sm"
                  onClick={() => {
                    const storedToken = localStorage.getItem('auth-token')
                    if (storedToken) {
                      alert(`توکن موجود است: ${storedToken.substring(0, 30)}...`)
                    } else {
                      alert('توکنی یافت نشد')
                    }
                  }}
                >
                  <i className="bi bi-search me-2"></i>
                  بررسی Local Storage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
