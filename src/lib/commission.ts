import { db } from './db'

// 佣金比例配置
export const COMMISSION_CONFIG = {
  // 一级代理
  TIER1: {
    minRate: 0.15,  // 15%
    maxRate: 0.25,  // 25%
    referralRate: 0.20  // 推荐奖励20%
  },
  // 二级代理
  TIER2: {
    minRate: 0.08,  // 8%
    maxRate: 0.12,  // 12%
    referralRate: 0.10  // 推荐奖励10%
  },
  // 提现手续费
  WITHDRAWAL_FEE: 0.02,  // 2%
  // 最低提现金额
  MIN_WITHDRAWAL: 100
}

// 计算订单佣金
export async function calculateOrderCommission(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      agent: {
        include: { parent: true }
      }
    }
  })

  if (!order || !order.agent || order.agent.status !== 'approved') {
    return null
  }

  const commissions = []

  // 1. 直接销售佣金
  const directAmount = order.totalAmount * order.agent.commissionRate
  const directCommission = await db.commission.create({
    data: {
      agentId: order.agent.id,
      orderId: order.id,
      amount: directAmount,
      rate: order.agent.commissionRate,
      type: 'direct',
      status: 'pending'
    }
  })
  commissions.push(directCommission)

  // 更新代理统计
  await db.agent.update({
    where: { id: order.agent.id },
    data: {
      totalSales: { increment: order.totalAmount },
      totalCommission: { increment: directAmount },
      balance: { increment: directAmount }
    }
  })

  // 2. 上级推荐奖励
  if (order.agent.parent && order.agent.parent.status === 'approved') {
    const referralAmount = order.totalAmount * order.agent.parent.referralRate
    const referralCommission = await db.commission.create({
      data: {
        agentId: order.agent.parent.id,
        orderId: order.id,
        amount: referralAmount,
        rate: order.agent.parent.referralRate,
        type: 'referral',
        status: 'pending'
      }
    })
    commissions.push(referralCommission)

    // 更新上级代理统计
    await db.agent.update({
      where: { id: order.agent.parent.id },
      data: {
        totalCommission: { increment: referralAmount },
        balance: { increment: referralAmount }
      }
    })
  }

  return commissions
}

// 结算佣金
export async function settleCommissions(commissionIds: string[]) {
  const result = await db.commission.updateMany({
    where: {
      id: { in: commissionIds },
      status: 'pending'
    },
    data: {
      status: 'settled',
      settledAt: new Date()
    }
  })

  return result.count
}

// 处理提现
export async function processWithdrawal(withdrawalId: string, approve: boolean, remark?: string) {
  const withdrawal = await db.withdrawal.findUnique({
    where: { id: withdrawalId }
  })

  if (!withdrawal || withdrawal.status !== 'pending') {
    throw new Error('提现记录不存在或已处理')
  }

  if (approve) {
    // 批准提现
    await db.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'completed',
        processedAt: new Date(),
        remark
      }
    })
  } else {
    // 拒绝提现，退回余额
    const agent = await db.agent.findUnique({
      where: { userId: withdrawal.userId }
    })

    if (agent) {
      await db.agent.update({
        where: { id: agent.id },
        data: { balance: { increment: withdrawal.amount } }
      })
    }

    await db.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'rejected',
        processedAt: new Date(),
        remark
      }
    })
  }
}

// 获取代理佣金统计
export async function getAgentCommissionStats(agentId: string) {
  const [totalCommission, pendingCommission, settledCommission] = await Promise.all([
    db.commission.aggregate({
      where: { agentId },
      _sum: { amount: true }
    }),
    db.commission.aggregate({
      where: { agentId, status: 'pending' },
      _sum: { amount: true }
    }),
    db.commission.aggregate({
      where: { agentId, status: 'settled' },
      _sum: { amount: true }
    })
  ])

  return {
    total: totalCommission._sum.amount || 0,
    pending: pendingCommission._sum.amount || 0,
    settled: settledCommission._sum.amount || 0
  }
}

// 根据销售额调整佣金比例
export async function adjustCommissionRate(agentId: string) {
  const agent = await db.agent.findUnique({ where: { id: agentId } })
  if (!agent) return

  const config = agent.level === 1 ? COMMISSION_CONFIG.TIER1 : COMMISSION_CONFIG.TIER2

  // 根据销售额阶梯调整
  let newRate = config.minRate
  if (agent.totalSales >= 100000) {
    newRate = config.maxRate
  } else if (agent.totalSales >= 50000) {
    newRate = (config.minRate + config.maxRate) / 2
  }

  if (newRate !== agent.commissionRate) {
    await db.agent.update({
      where: { id: agentId },
      data: { commissionRate: newRate }
    })
  }

  return newRate
}
