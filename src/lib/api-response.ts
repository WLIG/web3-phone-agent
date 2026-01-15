import { NextResponse } from 'next/server'

// 统一API响应格式
export function successResponse<T>(data: T, message?: string) {
  return NextResponse.json({
    success: true,
    message: message || 'ok',
    data
  })
}

export function errorResponse(error: string, status: number = 400) {
  return NextResponse.json({
    success: false,
    error
  }, { status })
}

export function unauthorizedResponse(message: string = '未登录') {
  return NextResponse.json({
    success: false,
    error: message
  }, { status: 401 })
}

export function forbiddenResponse(message: string = '无权限') {
  return NextResponse.json({
    success: false,
    error: message
  }, { status: 403 })
}

export function notFoundResponse(message: string = '资源不存在') {
  return NextResponse.json({
    success: false,
    error: message
  }, { status: 404 })
}

export function serverErrorResponse(message: string = '服务器错误') {
  return NextResponse.json({
    success: false,
    error: message
  }, { status: 500 })
}

// API错误处理包装器
export function withErrorHandler(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error: any) {
      console.error('API Error:', error)
      
      // Prisma错误处理
      if (error.code === 'P2002') {
        return errorResponse('数据已存在', 409)
      }
      if (error.code === 'P2025') {
        return notFoundResponse('记录不存在')
      }
      
      return serverErrorResponse(error.message || '服务器错误')
    }
  }
}
