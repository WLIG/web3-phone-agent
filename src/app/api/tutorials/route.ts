import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 培训课程数据
const tutorialsData = [
  { 
    id: '1', 
    title: '新手入门指南', 
    description: '了解代理系统基本操作',
    category: '入门', 
    duration: '10分钟',
    videoUrl: '/tutorials/intro.mp4',
    order: 1
  },
  { 
    id: '2', 
    title: '产品知识培训', 
    description: '深入了解Web3手机功能特点',
    category: '产品', 
    duration: '20分钟',
    videoUrl: '/tutorials/product.mp4',
    order: 2
  },
  { 
    id: '3', 
    title: '销售技巧基础', 
    description: '掌握基本销售话术和技巧',
    category: '销售', 
    duration: '15分钟',
    videoUrl: '/tutorials/sales-basic.mp4',
    order: 3
  },
  { 
    id: '4', 
    title: '客户异议处理', 
    description: '学会处理常见客户异议',
    category: '销售', 
    duration: '12分钟',
    videoUrl: '/tutorials/objection.mp4',
    order: 4
  },
  { 
    id: '5', 
    title: '团队管理方法', 
    description: '如何发展和管理下级代理',
    category: '管理', 
    duration: '18分钟',
    videoUrl: '/tutorials/team.mp4',
    order: 5
  },
  { 
    id: '6', 
    title: '社交媒体营销', 
    description: '利用社交媒体获取客户',
    category: '营销', 
    duration: '25分钟',
    videoUrl: '/tutorials/social.mp4',
    order: 6
  },
  { 
    id: '7', 
    title: '提现与结算', 
    description: '了解佣金结算和提现流程',
    category: '入门', 
    duration: '8分钟',
    videoUrl: '/tutorials/withdraw.mp4',
    order: 7
  }
]

// 模拟用户学习进度（实际应存储在数据库）
const userProgress: Record<string, string[]> = {}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const userId = session.user.id
    const completedIds = userProgress[userId] || ['1', '2'] // 默认完成前两个

    const tutorials = tutorialsData.map(t => ({
      ...t,
      completed: completedIds.includes(t.id)
    }))

    const completedCount = completedIds.length
    const totalCount = tutorialsData.length
    const progress = Math.round((completedCount / totalCount) * 100)

    return NextResponse.json({ 
      tutorials, 
      progress,
      completedCount,
      totalCount
    })
  } catch (error) {
    console.error('Get tutorials error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// 标记课程完成
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { tutorialId } = await req.json()
    const userId = session.user.id

    if (!userProgress[userId]) {
      userProgress[userId] = ['1', '2']
    }

    if (!userProgress[userId].includes(tutorialId)) {
      userProgress[userId].push(tutorialId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update tutorial progress error:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}
