import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 素材数据（实际项目中应该存储在数据库）
const materialsData = [
  { 
    id: '1', 
    type: 'image', 
    title: 'Web3手机宣传海报', 
    description: '高清产品宣传海报，适合朋友圈分享',
    url: '/materials/poster1.jpg', 
    downloads: 1234,
    category: 'poster'
  },
  { 
    id: '2', 
    type: 'image', 
    title: '产品对比图', 
    description: '与竞品的功能对比图',
    url: '/materials/compare.jpg', 
    downloads: 856,
    category: 'compare'
  },
  { 
    id: '3', 
    type: 'image', 
    title: '功能介绍图', 
    description: '产品核心功能介绍',
    url: '/materials/features.jpg', 
    downloads: 1567,
    category: 'feature'
  },
  { 
    id: '4', 
    type: 'video', 
    title: '产品介绍视频', 
    description: '60秒产品介绍短视频',
    url: '/materials/intro.mp4', 
    downloads: 2341,
    duration: '60s',
    category: 'intro'
  },
  { 
    id: '5', 
    type: 'video', 
    title: '开箱体验视频', 
    description: '真实用户开箱体验',
    url: '/materials/unbox.mp4', 
    downloads: 1890,
    duration: '3min',
    category: 'review'
  },
  { 
    id: '6', 
    type: 'text', 
    title: '朋友圈话术模板', 
    content: '🔥非洲首款Web3智能手机震撼上市！\n\n✅ 内置加密钱包，资产安全有保障\n✅ 支持DApp应用，畅享Web3生态\n✅ 高性能配置，流畅体验\n\n限时优惠，私聊了解详情！',
    downloads: 3456,
    category: 'wechat'
  },
  { 
    id: '7', 
    type: 'text', 
    title: 'WhatsApp推广话术', 
    content: 'Hi! 👋\n\nHave you heard about the new Web3 smartphone? \n\n🔐 Built-in crypto wallet\n📱 DApp support\n💰 Special agent price available!\n\nInterested? Let me know!',
    downloads: 2890,
    category: 'whatsapp'
  },
  { 
    id: '8', 
    type: 'text', 
    title: '客户跟进话术', 
    content: '您好！上次给您介绍的Web3手机考虑得怎么样了？\n\n现在下单可享受：\n✨ 代理专属价\n🎁 价值$50配件礼包\n🚚 包邮到家\n\n活动截止本周日，需要帮您预留一台吗？',
    downloads: 2100,
    category: 'followup'
  },
  { 
    id: '9', 
    type: 'text', 
    title: '异议处理话术', 
    content: '【价格异议】\n"这个价格包含了完整的Web3功能和安全保障，市面上同类产品要贵30%以上。而且我们提供一年质保和终身技术支持。"\n\n【观望异议】\n"理解您想再考虑一下。不过现在是首发优惠期，过了这个月价格会上调15%。要不我先帮您锁定这个价格？"',
    downloads: 1876,
    category: 'objection'
  }
]

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')

    let filtered = materialsData
    if (type) {
      filtered = filtered.filter(m => m.type === type)
    }
    if (category) {
      filtered = filtered.filter(m => m.category === category)
    }

    const stats = {
      images: materialsData.filter(m => m.type === 'image').length,
      videos: materialsData.filter(m => m.type === 'video').length,
      texts: materialsData.filter(m => m.type === 'text').length
    }

    return NextResponse.json({ materials: filtered, stats })
  } catch (error) {
    console.error('Get materials error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
