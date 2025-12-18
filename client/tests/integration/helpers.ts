import { authApi } from '@/lib/api/auth'
import { setMockCookie, resetMockCookies } from './mock-store'

export const SEED_CREDENTIALS = {
  email: process.env.SEED_EMAIL || 'admin@nexus.local',
  password: process.env.SEED_PASSWORD || 'admin123'
}

export const loginAsAdmin = async () => {
  try {
    const response = await authApi.login(SEED_CREDENTIALS.email, SEED_CREDENTIALS.password)
    if (response.token) {
      setMockCookie('auth_token', response.token)
    }
    return response
  } catch (error) {
    console.error('Failed to login as admin:', error)
    throw error
  }
}

export const clearAuth = () => {
  resetMockCookies()
}
