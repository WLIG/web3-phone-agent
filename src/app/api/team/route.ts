import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取团队成员列表
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    if (!session.user.agentId) {
      return NextResponse.json({ team: [], total: 0 })
    }

    // 获取直属下级
    const directChildren = await db.agent.findMany({
      where: { parentId: session.user.agentId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { children: true, orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // 获取间接下级数量
    const indirectChildrenCount = await db.agent.count({
      where: {
        parent: { parentId: session.user.agentId }
      }
    })

    // 计算团队总销售额
    const teamSales = directChildren.reduce((sum, child) => sum + child.totalSales, 0)

    const team = directChildren.map(child => ({
      id: child.id,
      name: child.user.name || child.user.email,
      email: child.user.email,
      phone: child.user.phone,
      level: child.level,
      totalSales: child.totalSales,
      totalCommission: child.totalCommission,
      status: child.status,
      childrenCount: child._count.children,
      ordersCount: child._count.orders,
      createdAt: child.createdAt
    }))

    return NextResponse.json({
      team,
      total: directChildren.length,
      indirectCount: indirectChildrenCount,
      teamSales
    })
  } catch (error) {
    console.error('Get team error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
