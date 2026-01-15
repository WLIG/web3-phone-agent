import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, inviteCode } = await req.json()

    // 验证必填字段
    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码必填' }, { status: 400 })
    }

    // 检查邮箱是否已存在
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: '邮箱已被注册' }, { status: 400 })
    }

    // 查找邀请人（如果有邀请码）
    let parentAgent = null
    if (inviteCode) {
      parentAgent = await db.agent.findFirst({
        where: { id: inviteCode }
      })
    }

    // 创建用户
    const user = await db.user.create({
      data: {
        name: name || email.split('@')[0],
        email,
        password, // 生产环境应使用bcrypt加密
        role: 'user'
      }
    })

    // 如果有邀请码，自动创建代理申请
    if (parentAgent) {
      await db.agent.create({
        data: {
          userId: user.id,
          level: 2, // 被邀请的默认为二级代理
          parentId: parentAgent.id,
          commissionRate: 0.08,
          referralRate: 0.10,
          status: 'pending'
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: '注册成功',
      userId: user.id
    })
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json({ error: '注册失败' }, { status: 500 })
  }
}
