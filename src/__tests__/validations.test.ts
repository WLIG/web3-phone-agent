import { describe, it, expect } from 'bun:test'
import { validate, registerSchema, loginSchema, withdrawalSchema, orderSchema } from '../lib/validations'

describe('Validations', () => {
  describe('registerSchema', () => {
    it('should pass with valid data', () => {
      const result = validate(registerSchema, {
        name: '张三',
        email: 'test@example.com',
        password: '123456'
      })
      expect(result.success).toBe(true)
    })

    it('should fail with short name', () => {
      const result = validate(registerSchema, {
        name: '张',
        email: 'test@example.com',
        password: '123456'
      })
      expect(result.success).toBe(false)
    })

    it('should fail with invalid email', () => {
      const result = validate(registerSchema, {
        name: '张三',
        email: 'invalid-email',
        password: '123456'
      })
      expect(result.success).toBe(false)
    })

    it('should fail with short password', () => {
      const result = validate(registerSchema, {
        name: '张三',
        email: 'test@example.com',
        password: '123'
      })
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('should pass with valid data', () => {
      const result = validate(loginSchema, {
        email: 'test@example.com',
        password: '123456'
      })
      expect(result.success).toBe(true)
    })

    it('should fail with empty password', () => {
      const result = validate(loginSchema, {
        email: 'test@example.com',
        password: ''
      })
      expect(result.success).toBe(false)
    })
  })

  describe('withdrawalSchema', () => {
    it('should pass with valid data', () => {
      const result = validate(withdrawalSchema, {
        amount: 1000,
        method: 'bank',
        account: '6222021234567890'
      })
      expect(result.success).toBe(true)
    })

    it('should fail with negative amount', () => {
      const result = validate(withdrawalSchema, {
        amount: -100,
        method: 'bank',
        account: '6222021234567890'
      })
      expect(result.success).toBe(false)
    })

    it('should fail with invalid method', () => {
      const result = validate(withdrawalSchema, {
        amount: 1000,
        method: 'invalid',
        account: '6222021234567890'
      })
      expect(result.success).toBe(false)
    })

    it('should fail with amount exceeding limit', () => {
      const result = validate(withdrawalSchema, {
        amount: 200000,
        method: 'bank',
        account: '6222021234567890'
      })
      expect(result.success).toBe(false)
    })
  })

  describe('orderSchema', () => {
    it('should pass with valid data', () => {
      const result = validate(orderSchema, {
        items: [
          { productId: 'prod_123', quantity: 2 }
        ]
      })
      expect(result.success).toBe(true)
    })

    it('should fail with empty items', () => {
      const result = validate(orderSchema, {
        items: []
      })
      expect(result.success).toBe(false)
    })

    it('should fail with invalid quantity', () => {
      const result = validate(orderSchema, {
        items: [
          { productId: 'prod_123', quantity: 0 }
        ]
      })
      expect(result.success).toBe(false)
    })
  })
})
