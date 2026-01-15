import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取收款账户列表
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const accounts = await db.paymentAccount.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Get accounts error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// 添加收款账户
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await req.json()
    const { type, name, account, bankName, isDefault } = body

    if (!type || !name || !account) {
      return NextResponse.json({ error: '请填写完整信息' }, { status: 400 })
    }

    // 如果设为默认，先取消其他默认
    if (isDefault) {
      await db.paymentAccount.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      })
    }

    // 检查是否是第一个账户，自动设为默认
    const existingCount = await db.paymentAccount.count({
      where: { userId: session.user.id }
    })

    const newAccount = await db.paymentAccount.create({
      data: {
        userId: session.user.id,
        type,
        name,
        account,
        bankName: bankName || null,
        isDefault: isDefault || existingCount === 0
      }
    })

    return NextResponse.json({ success: true, account: newAccount })
  } catch (error) {
    console.error('Create account error:', error)
    return NextResponse.json({ error: '添加失败' }, { status: 500 })
  }
}
