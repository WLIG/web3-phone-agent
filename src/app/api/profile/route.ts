import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

interface ProfileUpdateBody {
  name?: string
  phone?: string
  avatar?: string
  currentPassword?: string
  newPassword?: string
}

// 获取个人资料
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        agent: {
          select: {
            id: true,
            level: true,
            commissionRate: true,
            referralRate: true,
            totalSales: true,
            totalCommission: true,
            balance: true,
            status: true,
            createdAt: true,
            parent: {
              select: {
                id: true,
                user: { select: { name: true, email: true } }
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// 更新个人资料
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await req.json() as ProfileUpdateBody
    const { name, phone, avatar, currentPassword, newPassword } = body

    const updateData: { name?: string; phone?: string; avatar?: string; password?: string } = {}
    
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (avatar !== undefined) updateData.avatar = avatar

    // 修改密码
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: '请输入当前密码' }, { status: 400 })
      }

      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { password: true }
      })

      if (!user) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 })
      }

      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json({ error: '当前密码错误' }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: '新密码至少6位' }, { status: 400 })
      }

      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}
