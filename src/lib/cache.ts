// 简单的内存缓存
const cache = new Map<string, { data: any; expiry: number }>()

export function getCache<T>(key: string): T | null {
  const item = cache.get(key)
  if (!item) return null
  
  if (Date.now() > item.expiry) {
    cache.delete(key)
    return null
  }
  
  return item.data as T
}

export function setCache<T>(key: string, data: T, ttlSeconds: number = 60): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000
  })
}

export function deleteCache(key: string): void {
  cache.delete(key)
}

export function clearCache(): void {
  cache.clear()
}

// 缓存装饰器
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  const cached = getCache<T>(key)
  if (cached) return Promise.resolve(cached)
  
  return fetcher().then(data => {
    setCache(key, data, ttlSeconds)
    return data
  })
}

// 常用缓存键
export const CACHE_KEYS = {
  STATS: 'stats',
  PRODUCTS: 'products',
  AGENT_STATS: (id: string) => `agent:${id}:stats`
}
