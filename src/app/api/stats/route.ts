import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取统计数据
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const isAdmin = session.user.role === 'admin'

    if (isAdmin) {
      // 管理员统计
      const [
        totalUsers,
        totalAgents,
        totalOrders,
        pendingWithdrawals,
        orders,
        commissions
      ] = await Promise.all([
        db.user.count(),
        db.agent.count({ where: { status: 'approved' } }),
        db.order.count(),
        db.withdrawal.count({ where: { status: 'pending' } }),
        db.order.aggregate({ _sum: { totalAmount: true } }),
        db.commission.aggregate({ _sum: { amount: true } })
      ])

      return NextResponse.json({
        totalUsers,
        totalAgents,
        totalOrders,
        pendingWithdrawals,
        totalSales: orders._sum.totalAmount || 0,
        totalCommission: commissions._sum.amount || 0
      })
    } else if (session.user.agentId) {
      // 代理统计
      const agent = await db.agent.findUnique({
        where: { id: session.user.agentId },
        include: {
          _count: { select: { children: true, orders: true, commissions: true } }
        }
      })

      if (!agent) {
        return NextResponse.json({ error: '代理不存在' }, { status: 404 })
      }

      const pendingCommissions = await db.commission.aggregate({
        where: { agentId: agent.id, status: 'pending' },
        _sum: { amount: true }
      })

      return NextResponse.json({
        level: agent.level,
        totalSales: agent.totalSales,
        totalCommission: agent.totalCommission,
        balance: agent.balance,
        pendingCommission: pendingCommissions._sum.amount || 0,
        childrenCount: agent._count.children,
        ordersCount: agent._count.orders,
        commissionRate: agent.commissionRate,
        referralRate: agent.referralRate
      })
    }

    return NextResponse.json({ message: '无统计数据' })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
