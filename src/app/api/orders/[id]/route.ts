import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取订单详情
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const order = await db.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        agent: { include: { user: { select: { name: true } } } },
        items: { include: { product: true } },
        commissions: {
          include: { agent: { include: { user: { select: { name: true } } } } }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 })
    }

    // 权限检查
    const isAdmin = session.user.role === 'admin'
    const isOwner = order.userId === session.user.id
    const isAgent = order.agentId === session.user.agentId

    if (!isAdmin && !isOwner && !isAgent) {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// 更新订单状态
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    const order = await db.order.findUnique({ where: { id } })
    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 })
    }

    // 权限检查
    const isAdmin = session.user.role === 'admin'
    const isOwner = order.userId === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    const updateData: any = { status }

    // 根据状态更新时间
    if (status === 'paid') updateData.paidAt = new Date()
    if (status === 'shipped') updateData.shippedAt = new Date()
    if (status === 'completed') {
      updateData.completedAt = new Date()
      // 订单完成时计算佣金
      await calculateCommission(order)
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}

// 计算佣金
async function calculateCommission(order: any) {
  if (!order.agentId) return

  const agent = await db.agent.findUnique({
    where: { id: order.agentId },
    include: { parent: true }
  })

  if (!agent || agent.status !== 'approved') return

  // 直接销售佣金
  const directCommission = order.totalAmount * agent.commissionRate
  await db.commission.create({
    data: {
      agentId: agent.id,
      orderId: order.id,
      amount: directCommission,
      rate: agent.commissionRate,
      type: 'direct',
      status: 'pending'
    }
  })

  // 更新代理统计
  await db.agent.update({
    where: { id: agent.id },
    data: {
      totalSales: { increment: order.totalAmount },
      totalCommission: { increment: directCommission },
      balance: { increment: directCommission }
    }
  })

  // 上级推荐奖励
  if (agent.parent && agent.parent.status === 'approved') {
    const referralCommission = order.totalAmount * agent.parent.referralRate
    await db.commission.create({
      data: {
        agentId: agent.parent.id,
        orderId: order.id,
        amount: referralCommission,
        rate: agent.parent.referralRate,
        type: 'referral',
        status: 'pending'
      }
    })

    await db.agent.update({
      where: { id: agent.parent.id },
      data: {
        totalCommission: { increment: referralCommission },
        balance: { increment: referralCommission }
      }
    })
  }
}
