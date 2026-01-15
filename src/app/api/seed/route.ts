import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // 检查是否已有数据
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@web3phone.com' }
    })
    
    if (existingAdmin) {
      return NextResponse.json({ message: '数据已存在，无需重复初始化' })
    }

    const adminPwd = await bcrypt.hash('admin123', 10)
    const agentPwd = await bcrypt.hash('123456', 10)

    // 创建管理员
    await db.user.create({
      data: {
        email: 'admin@web3phone.com',
        password: adminPwd,
        name: 'Admin',
        role: 'admin',
        status: 'active'
      }
    })

    // 创建一级代理
    const agent1User = await db.user.create({
      data: {
        email: 'agent1@web3phone.com',
        password: agentPwd,
        name: '一级代理张三',
        role: 'agent',
        status: 'active'
      }
    })

    await db.agent.create({
      data: {
        userId: agent1User.id,
        level: 1,
        commissionRate: 0.20,
        referralRate: 0.20,
        totalSales: 50000,
        totalCommission: 10000,
        balance: 5000,
        status: 'approved'
      }
    })

    // 创建产品
    await db.product.createMany({
      data: [
        { id: 'prod_basic', name: 'Web3 Phone Basic', description: '入门级Web3智能手机', price: 2999, stock: 1000, status: 'active' },
        { id: 'prod_pro', name: 'Web3 Phone Pro', description: '专业级Web3智能手机', price: 4999, stock: 500, status: 'active' },
        { id: 'prod_max', name: 'Web3 Phone Max', description: '旗舰级Web3智能手机', price: 7999, stock: 200, status: 'active' }
      ]
    })

    // 创建系统配置
    await db.systemConfig.createMany({
      data: [
        { key: 'tier1_min_rate', value: '0.15', desc: '一级代理最低佣金比例' },
        { key: 'tier1_max_rate', value: '0.25', desc: '一级代理最高佣金比例' },
        { key: 'tier2_min_rate', value: '0.08', desc: '二级代理最低佣金比例' },
        { key: 'tier2_max_rate', value: '0.12', desc: '二级代理最高佣金比例' },
        { key: 'withdrawal_fee', value: '0.02', desc: '提现手续费比例' },
        { key: 'min_withdrawal', value: '100', desc: '最低提现金额' }
      ]
    })

    return NextResponse.json({ 
      success: true, 
      message: '初始化成功！',
      accounts: [
        { role: '管理员', email: 'admin@web3phone.com', password: 'admin123' },
        { role: '一级代理', email: 'agent1@web3phone.com', password: '123456' }
      ]
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: '初始化失败', details: String(error) }, { status: 500 })
  }
}
