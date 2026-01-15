import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取佣金记录
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    // 非管理员只能看自己的佣金
    if (session.user.role !== 'admin') {
      if (!session.user.agentId) {
        return NextResponse.json({ commissions: [], total: 0, page, limit })
      }
      where.agentId = session.user.agentId
    }

    const [commissions, total] = await Promise.all([
      db.commission.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          agent: { include: { user: { select: { name: true } } } },
          order: { select: { orderNo: true, totalAmount: true } }
        }
      }),
      db.commission.count({ where })
    ])

    return NextResponse.json({ commissions, total, page, limit })
  } catch (error) {
    console.error('Get commissions error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
