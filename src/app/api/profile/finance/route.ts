import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取个人财务概览
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const agent = await db.agent.findUnique({
      where: { userId: session.user.id }
    })

    if (!agent) {
      return NextResponse.json({ 
        isAgent: false,
        message: '您还不是代理' 
      })
    }

    // 获取各类统计数据
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      todayCommissions,
      weekCommissions,
      monthCommissions,
      pendingCommissions,
      settledCommissions,
      pendingWithdrawals,
      completedWithdrawals,
      totalWithdrawn
    ] = await Promise.all([
      // 今日佣金
      db.commission.aggregate({
        where: { agentId: agent.id, createdAt: { gte: startOfToday } },
        _sum: { amount: true }
      }),
      // 本周佣金
      db.commission.aggregate({
        where: { agentId: agent.id, createdAt: { gte: startOfWeek } },
        _sum: { amount: true }
      }),
      // 本月佣金
      db.commission.aggregate({
        where: { agentId: agent.id, createdAt: { gte: startOfMonth } },
        _sum: { amount: true }
      }),
      // 待结算佣金
      db.commission.aggregate({
        where: { agentId: agent.id, status: 'pending' },
        _sum: { amount: true }
      }),
      // 已结算佣金
      db.commission.aggregate({
        where: { agentId: agent.id, status: 'settled' },
        _sum: { amount: true }
      }),
      // 待处理提现
      db.withdrawal.aggregate({
        where: { userId: session.user.id, status: { in: ['pending', 'processing'] } },
        _sum: { amount: true }
      }),
      // 已完成提现
      db.withdrawal.aggregate({
        where: { userId: session.user.id, status: 'completed' },
        _sum: { actualAmount: true }
      }),
      // 累计提现金额
      db.withdrawal.aggregate({
        where: { userId: session.user.id, status: 'completed' },
        _sum: { amount: true }
      })
    ])

    // 获取直推和团队佣金
    const [directCommissions, teamCommissions] = await Promise.all([
      db.commission.aggregate({
        where: { agentId: agent.id, type: 'direct' },
        _sum: { amount: true }
      }),
      db.commission.aggregate({
        where: { agentId: agent.id, type: 'referral' },
        _sum: { amount: true }
      })
    ])

    return NextResponse.json({
      isAgent: true,
      balance: agent.balance,
      totalCommission: agent.totalCommission,
      totalSales: agent.totalSales,
      commissionRate: agent.commissionRate,
      referralRate: agent.referralRate,
      
      // 时间维度佣金
      todayCommission: todayCommissions._sum.amount || 0,
      weekCommission: weekCommissions._sum.amount || 0,
      monthCommission: monthCommissions._sum.amount || 0,
      
      // 佣金状态
      pendingCommission: pendingCommissions._sum.amount || 0,
      settledCommission: settledCommissions._sum.amount || 0,
      
      // 佣金类型
      directCommission: directCommissions._sum.amount || 0,
      teamCommission: teamCommissions._sum.amount || 0,
      
      // 提现相关
      pendingWithdrawal: pendingWithdrawals._sum.amount || 0,
      completedWithdrawal: completedWithdrawals._sum.actualAmount || 0,
      totalWithdrawn: totalWithdrawn._sum.amount || 0
    })
  } catch (error) {
    console.error('Get finance error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
