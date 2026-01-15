import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取代理列表
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
    const level = searchParams.get('level')

    const where: any = {}
    if (status) where.status = status
    if (level) where.level = parseInt(level)

    // 非管理员只能看自己的下级
    if (session.user.role !== 'admin' && session.user.agentId) {
      where.parentId = session.user.agentId
    }

    const [agents, total] = await Promise.all([
      db.agent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          parent: { include: { user: { select: { name: true } } } },
          _count: { select: { children: true, orders: true } }
        }
      }),
      db.agent.count({ where })
    ])

    return NextResponse.json({ agents, total, page, limit })
  } catch (error) {
    console.error('Get agents error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// 申请成为代理
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 检查是否已经是代理
    const existingAgent = await db.agent.findUnique({
      where: { userId: session.user.id }
    })
    if (existingAgent) {
      return NextResponse.json({ error: '已经是代理' }, { status: 400 })
    }

    const body = await req.json()

    // 查找邀请人
    let parentId = null
    let level = 1
    let commissionRate = 0.15
    let referralRate = 0.20

    if (body.inviteCode) {
      const parentAgent = await db.agent.findFirst({
        where: { id: body.inviteCode, status: 'approved' }
      })
      if (parentAgent) {
        parentId = parentAgent.id
        level = 2
        commissionRate = 0.08
        referralRate = 0.10
      }
    }

    const agent = await db.agent.create({
      data: {
        userId: session.user.id,
        level,
        parentId,
        commissionRate,
        referralRate,
        status: 'pending'
      }
    })

    // 更新用户角色
    await db.user.update({
      where: { id: session.user.id },
      data: { role: 'agent' }
    })

    return NextResponse.json({ success: true, agent })
  } catch (error) {
    console.error('Create agent error:', error)
    return NextResponse.json({ error: '申请失败' }, { status: 500 })
  }
}
