import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 结算佣金（管理员）
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    const body = await req.json()
    const { commissionIds } = body

    if (!commissionIds || commissionIds.length === 0) {
      return NextResponse.json({ error: '请选择要结算的佣金' }, { status: 400 })
    }

    // 批量结算
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

    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    console.error('Settle commissions error:', error)
    return NextResponse.json({ error: '结算失败' }, { status: 500 })
  }
}
