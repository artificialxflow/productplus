'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: string
  isPhoneVerified?: boolean
  levelId?: number
  discountPercentage?: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginWithPhone: (phone: string) => Promise<boolean>
  verifyOTP: (phone: string, otpCode: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // بررسی وضعیت احراز هویت در ابتدای بارگذاری
  useEffect(() => {
    checkAuth()
  }, [])

  // بررسی وضعیت احراز هویت
  const checkAuth = async () => {
    try {
      // ابتدا از Local Storage بررسی کن
      const token = localStorage.getItem('auth-token')
      
      if (token) {
        // ارسال توکن به سرور برای تایید
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          // توکن نامعتبر است، حذف از Local Storage
          localStorage.removeItem('auth-token')
          setUser(null)
        }
      } else {
        // توکنی وجود ندارد
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth-token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  // ورود به سیستم با ایمیل
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        
        // ذخیره توکن در Local Storage
        if (data.token) {
          localStorage.setItem('auth-token', data.token)
        }
        
        return true
      } else {
        const errorData = await response.json()
        console.error('Login failed:', errorData.error)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  // ورود به سیستم با شماره موبایل
  const loginWithPhone = async (phone: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      })

      if (response.ok) {
        return true
      } else {
        const errorData = await response.json()
        console.error('Send OTP failed:', errorData.error)
        return false
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      return false
    }
  }

  // تایید کد OTP
  const verifyOTP = async (phone: string, otpCode: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otpCode }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        
        // ذخیره توکن در Local Storage
        if (data.token) {
          localStorage.setItem('auth-token', data.token)
        }
        
        return true
      } else {
        const errorData = await response.json()
        console.error('OTP verification failed:', errorData.error)
        return false
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      return false
    }
  }

  // ثبت‌نام
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (response.ok) {
        return true
      } else {
        const errorData = await response.json()
        console.error('Registration failed:', errorData.error)
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  // خروج از سیستم
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      // حذف توکن از Local Storage
      localStorage.removeItem('auth-token')
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      // حتی در صورت خطا، توکن را حذف کن
      localStorage.removeItem('auth-token')
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    loginWithPhone,
    verifyOTP,
    register,
    logout,
    checkAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
