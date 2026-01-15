// 简单的速率限制
const requests = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000 // 1分钟
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = defaultConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = requests.get(identifier)
  
  // 如果没有记录或已过期，创建新记录
  if (!record || now > record.resetTime) {
    const resetTime = now + config.windowMs
    requests.set(identifier, { count: 1, resetTime })
    return { allowed: true, remaining: config.maxRequests - 1, resetTime }
  }
  
  // 检查是否超过限制
  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }
  
  // 增加计数
  record.count++
  return { allowed: true, remaining: config.maxRequests - record.count, resetTime: record.resetTime }
}

// 清理过期记录
export function cleanupRateLimits(): void {
  const now = Date.now()
  for (const [key, record] of requests.entries()) {
    if (now > record.resetTime) {
      requests.delete(key)
    }
  }
}

// 定期清理（每5分钟）
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000)
}

// API路由速率限制配置
export const API_RATE_LIMITS = {
  default: { maxRequests: 100, windowMs: 60 * 1000 },
  auth: { maxRequests: 10, windowMs: 60 * 1000 },
  withdrawal: { maxRequests: 5, windowMs: 60 * 1000 }
}
