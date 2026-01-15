import { describe, it, expect } from 'bun:test'
import { COMMISSION_CONFIG } from '../lib/commission'

describe('Commission Config', () => {
  it('should have correct tier1 rates', () => {
    expect(COMMISSION_CONFIG.TIER1.minRate).toBe(0.15)
    expect(COMMISSION_CONFIG.TIER1.maxRate).toBe(0.25)
    expect(COMMISSION_CONFIG.TIER1.referralRate).toBe(0.20)
  })

  it('should have correct tier2 rates', () => {
    expect(COMMISSION_CONFIG.TIER2.minRate).toBe(0.08)
    expect(COMMISSION_CONFIG.TIER2.maxRate).toBe(0.12)
    expect(COMMISSION_CONFIG.TIER2.referralRate).toBe(0.10)
  })

  it('should have correct withdrawal fee', () => {
    expect(COMMISSION_CONFIG.WITHDRAWAL_FEE).toBe(0.02)
  })

  it('should have correct minimum withdrawal', () => {
    expect(COMMISSION_CONFIG.MIN_WITHDRAWAL).toBe(100)
  })
})

describe('Commission Calculation', () => {
  it('should calculate tier1 direct commission correctly', () => {
    const orderAmount = 10000
    const rate = COMMISSION_CONFIG.TIER1.minRate
    const commission = orderAmount * rate
    expect(commission).toBe(1500)
  })

  it('should calculate tier2 direct commission correctly', () => {
    const orderAmount = 10000
    const rate = COMMISSION_CONFIG.TIER2.minRate
    const commission = orderAmount * rate
    expect(commission).toBe(800)
  })

  it('should calculate referral commission correctly', () => {
    const orderAmount = 10000
    const rate = COMMISSION_CONFIG.TIER1.referralRate
    const commission = orderAmount * rate
    expect(commission).toBe(2000)
  })

  it('should calculate withdrawal fee correctly', () => {
    const amount = 1000
    const fee = amount * COMMISSION_CONFIG.WITHDRAWAL_FEE
    const actualAmount = amount - fee
    expect(fee).toBe(20)
    expect(actualAmount).toBe(980)
  })
})
