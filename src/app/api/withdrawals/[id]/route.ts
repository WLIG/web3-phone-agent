import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 处理提现（管理员）
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    const body = await req.json()
    const { status, remark } = body

    const withdrawal = await db.withdrawal.findUnique({ where: { id } })
    if (!withdrawal) {
      return NextResponse.json({ error: '提现记录不存在' }, { status: 404 })
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json({ error: '该提现已处理' }, { status: 400 })
    }

    const updateData: any = { status, remark }
    if (status === 'completed' || status === 'rejected') {
      updateData.processedAt = new Date()
    }

    // 如果拒绝，退回余额
    if (status === 'rejected') {
      const agent = await db.agent.findUnique({
        where: { userId: withdrawal.userId }
      })
      if (agent) {
        await db.agent.update({
          where: { id: agent.id },
          data: { balance: { increment: withdrawal.amount } }
        })
      }
    }

    const updated = await db.withdrawal.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Process withdrawal error:', error)
    return NextResponse.json({ error: '处理失败' }, { status: 500 })
  }
}
