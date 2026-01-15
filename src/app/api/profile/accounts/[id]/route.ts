import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 更新收款账户
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const account = await db.paymentAccount.findUnique({ where: { id } })
    if (!account || account.userId !== session.user.id) {
      return NextResponse.json({ error: '账户不存在' }, { status: 404 })
    }

    const body = await req.json()
    const { name, account: accountNo, bankName, isDefault } = body

    // 如果设为默认，先取消其他默认
    if (isDefault) {
      await db.paymentAccount.updateMany({
        where: { userId: session.user.id, id: { not: id } },
        data: { isDefault: false }
      })
    }

    const updated = await db.paymentAccount.update({
      where: { id },
      data: {
        name: name || account.name,
        account: accountNo || account.account,
        bankName: bankName !== undefined ? bankName : account.bankName,
        isDefault: isDefault !== undefined ? isDefault : account.isDefault
      }
    })

    return NextResponse.json({ success: true, account: updated })
  } catch (error) {
    console.error('Update account error:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}

// 删除收款账户
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const account = await db.paymentAccount.findUnique({ where: { id } })
    if (!account || account.userId !== session.user.id) {
      return NextResponse.json({ error: '账户不存在' }, { status: 404 })
    }

    await db.paymentAccount.delete({ where: { id } })

    // 如果删除的是默认账户，设置第一个为默认
    if (account.isDefault) {
      const first = await db.paymentAccount.findFirst({
        where: { userId: session.user.id }
      })
      if (first) {
        await db.paymentAccount.update({
          where: { id: first.id },
          data: { isDefault: true }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
