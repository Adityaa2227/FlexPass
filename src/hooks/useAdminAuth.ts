import { useState, useEffect } from 'react'

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if admin is already authenticated
    const adminAuth = localStorage.getItem('admin_authenticated')
    const authTime = localStorage.getItem('admin_auth_time')
    
    if (adminAuth === 'true' && authTime) {
      const authTimestamp = parseInt(authTime)
      const currentTime = Date.now()
      const sessionDuration = 24 * 60 * 60 * 1000 // 24 hours
      
      if (currentTime - authTimestamp < sessionDuration) {
        setIsAuthenticated(true)
      } else {
        // Session expired
        localStorage.removeItem('admin_authenticated')
        localStorage.removeItem('admin_auth_time')
      }
    }
    
    setIsLoading(false)
  }, [])

  const login = () => {
    localStorage.setItem('admin_authenticated', 'true')
    localStorage.setItem('admin_auth_time', Date.now().toString())
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('admin_authenticated')
    localStorage.removeItem('admin_auth_time')
    setIsAuthenticated(false)
  }

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  }
}
