import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取提现记录
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

    const where: any = {}
    if (status) where.status = status

    // 非管理员只能看自己的提现
    if (session.user.role !== 'admin') {
      where.userId = session.user.id
    }

    const [withdrawals, total] = await Promise.all([
      db.withdrawal.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } }
        }
      }),
      db.withdrawal.count({ where })
    ])

    return NextResponse.json({ withdrawals, total, page, limit })
  } catch (error) {
    console.error('Get withdrawals error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// 申请提现
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await req.json()
    const { amount, method, account } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: '提现金额无效' }, { status: 400 })
    }

    if (!method || !account) {
      return NextResponse.json({ error: '请填写收款方式和账号' }, { status: 400 })
    }

    // 检查余额
    const agent = await db.agent.findUnique({
      where: { userId: session.user.id }
    })

    if (!agent) {
      return NextResponse.json({ error: '您还不是代理' }, { status: 400 })
    }

    if (agent.balance < amount) {
      return NextResponse.json({ error: '余额不足' }, { status: 400 })
    }

    // 计算手续费（2%）
    const fee = amount * 0.02
    const actualAmount = amount - fee

    // 创建提现记录
    const withdrawal = await db.withdrawal.create({
      data: {
        userId: session.user.id,
        amount,
        fee,
        actualAmount,
        method,
        account,
        status: 'pending'
      }
    })

    // 冻结余额
    await db.agent.update({
      where: { id: agent.id },
      data: { balance: { decrement: amount } }
    })

    return NextResponse.json({ success: true, withdrawal })
  } catch (error) {
    console.error('Create withdrawal error:', error)
    return NextResponse.json({ error: '申请失败' }, { status: 500 })
  }
}
