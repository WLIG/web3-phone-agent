import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取代理详情
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const agent = await db.agent.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        parent: { include: { user: { select: { name: true } } } },
        children: {
          include: { user: { select: { name: true, email: true } } },
          take: 10
        },
        _count: { select: { children: true, orders: true, commissions: true } }
      }
    })

    if (!agent) {
      return NextResponse.json({ error: '代理不存在' }, { status: 404 })
    }

    // 权限检查
    const isAdmin = session.user.role === 'admin'
    const isSelf = agent.userId === session.user.id
    const isParent = agent.parentId === session.user.agentId

    if (!isAdmin && !isSelf && !isParent) {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    return NextResponse.json(agent)
  } catch (error) {
    console.error('Get agent error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// 更新代理（审核、调整佣金等）
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    const body = await req.json()
    const updateData: any = {}

    if (body.status) updateData.status = body.status
    if (body.level) updateData.level = body.level
    if (body.commissionRate !== undefined) updateData.commissionRate = body.commissionRate
    if (body.referralRate !== undefined) updateData.referralRate = body.referralRate

    const agent = await db.agent.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { name: true, email: true } }
      }
    })

    return NextResponse.json(agent)
  } catch (error) {
    console.error('Update agent error:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}
