import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 生成订单号
function generateOrderNo() {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD${y}${m}${d}${random}`
}

// 获取订单列表
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

    // 非管理员只能看自己的订单或代理的订单
    if (session.user.role !== 'admin') {
      if (session.user.agentId) {
        where.OR = [
          { userId: session.user.id },
          { agentId: session.user.agentId }
        ]
      } else {
        where.userId = session.user.id
      }
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          agent: { include: { user: { select: { name: true } } } },
          items: { include: { product: true } },
          _count: { select: { commissions: true } }
        }
      }),
      db.order.count({ where })
    ])

    return NextResponse.json({ orders, total, page, limit })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// 创建订单
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await req.json()
    const { items, agentId, shippingAddr, remark } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: '订单项不能为空' }, { status: 400 })
    }

    // 计算总金额
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.productId } })
      if (!product) {
        return NextResponse.json({ error: `产品不存在: ${item.productId}` }, { status: 400 })
      }
      totalAmount += product.price * item.quantity
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      })
    }

    // 创建订单
    const order = await db.order.create({
      data: {
        orderNo: generateOrderNo(),
        userId: session.user.id,
        agentId: agentId || null,
        totalAmount,
        shippingAddr,
        remark,
        items: { create: orderItems }
      },
      include: {
        items: { include: { product: true } }
      }
    })

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: '创建失败' }, { status: 500 })
  }
}
