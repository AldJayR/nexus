import { describe, it, expect, beforeEach } from 'vitest'
import { authApi } from '@/lib/api/auth'
import { loginAsAdmin, clearAuth, SEED_CREDENTIALS } from './helpers'

// These tests require the backend server to be running at http://localhost:3001
// They will make REAL network requests.

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    clearAuth()
  })

  it('should reject invalid credentials with 401 from real server', async () => {
    try {
      await authApi.login('nonexistent@example.com', 'wrongpassword')
      expect.fail('Should have thrown an error')
    } catch (error: any) {
      // If server is not running, this might be ECONNREFUSED
      if (error.code === 'ECONNREFUSED') {
        console.warn('Skipping test: Backend server is not running at http://localhost:3001')
        return
      }
      // If server is running, we expect 401
      expect(error.response?.status).toBe(401)
    }
  })

  it('should login successfully with seed credentials', async () => {
    try {
      const response = await authApi.login(SEED_CREDENTIALS.email, SEED_CREDENTIALS.password)
      expect(response.token).toBeDefined()
      expect(response.user).toBeDefined()
      expect(response.user.email).toBe(SEED_CREDENTIALS.email)
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('Skipping test: Backend server is not running')
        return
      }
      throw error
    }
  })

  it('should get current user profile after login', async () => {
    try {
      await loginAsAdmin()
      const user = await authApi.getCurrentUser()
      expect(user).toBeDefined()
      expect(user.email).toBe(SEED_CREDENTIALS.email)
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('Skipping test: Backend server is not running')
        return
      }
      throw error
    }
  })
})
