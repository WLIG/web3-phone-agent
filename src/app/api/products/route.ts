import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取产品列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'active'

    const where: any = {}
    if (status !== 'all') where.status = status

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.product.count({ where })
    ])

    return NextResponse.json({ products, total, page, limit })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// 创建产品（管理员）
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, price, stock, image } = body

    if (!name || !price) {
      return NextResponse.json({ error: '名称和价格必填' }, { status: 400 })
    }

    const product = await db.product.create({
      data: { name, description, price, stock: stock || 0, image }
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: '创建失败' }, { status: 500 })
  }
}
