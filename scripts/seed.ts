import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 加密密码
  const adminPwd = await bcrypt.hash('admin123', 10)
  const agentPwd = await bcrypt.hash('123456', 10)

  // 创建管理员
  const admin = await prisma.user.upsert({
    where: { email: 'admin@web3phone.com' },
    update: { password: adminPwd },
    create: {
      email: 'admin@web3phone.com',
      password: adminPwd,
      name: 'Admin',
      role: 'admin',
      status: 'active'
    }
  })
  console.log('✅ Admin created:', admin.email)

  // 创建一级代理
  const agent1User = await prisma.user.upsert({
    where: { email: 'agent1@web3phone.com' },
    update: { password: agentPwd },
    create: {
      email: 'agent1@web3phone.com',
      password: agentPwd,
      name: '一级代理张三',
      role: 'agent',
      status: 'active'
    }
  })

  const agent1 = await prisma.agent.upsert({
    where: { userId: agent1User.id },
    update: {},
    create: {
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
  console.log('✅ Tier 1 Agent created:', agent1User.email)

  // 创建二级代理
  const agent2User = await prisma.user.upsert({
    where: { email: 'agent2@web3phone.com' },
    update: { password: agentPwd },
    create: {
      email: 'agent2@web3phone.com',
      password: agentPwd,
      name: '二级代理李四',
      role: 'agent',
      status: 'active'
    }
  })

  const agent2 = await prisma.agent.upsert({
    where: { userId: agent2User.id },
    update: {},
    create: {
      userId: agent2User.id,
      level: 2,
      parentId: agent1.id,
      commissionRate: 0.10,
      referralRate: 0.10,
      totalSales: 20000,
      totalCommission: 2000,
      balance: 1500,
      status: 'approved'
    }
  })
  console.log('✅ Tier 2 Agent created:', agent2User.email)

  // 创建产品
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 'prod_web3phone_basic' },
      update: {},
      create: {
        id: 'prod_web3phone_basic',
        name: 'Web3 Phone Basic',
        description: '入门级Web3智能手机，支持基础加密功能',
        price: 2999,
        stock: 1000,
        status: 'active'
      }
    }),
    prisma.product.upsert({
      where: { id: 'prod_web3phone_pro' },
      update: {},
      create: {
        id: 'prod_web3phone_pro',
        name: 'Web3 Phone Pro',
        description: '专业级Web3智能手机，内置硬件钱包',
        price: 4999,
        stock: 500,
        status: 'active'
      }
    }),
    prisma.product.upsert({
      where: { id: 'prod_web3phone_max' },
      update: {},
      create: {
        id: 'prod_web3phone_max',
        name: 'Web3 Phone Max',
        description: '旗舰级Web3智能手机，全功能加密套件',
        price: 7999,
        stock: 200,
        status: 'active'
      }
    })
  ])
  console.log('✅ Products created:', products.length)

  // 创建系统配置
  const configs = await Promise.all([
    prisma.systemConfig.upsert({
      where: { key: 'tier1_min_rate' },
      update: {},
      create: { key: 'tier1_min_rate', value: '0.15', desc: '一级代理最低佣金比例' }
    }),
    prisma.systemConfig.upsert({
      where: { key: 'tier1_max_rate' },
      update: {},
      create: { key: 'tier1_max_rate', value: '0.25', desc: '一级代理最高佣金比例' }
    }),
    prisma.systemConfig.upsert({
      where: { key: 'tier2_min_rate' },
      update: {},
      create: { key: 'tier2_min_rate', value: '0.08', desc: '二级代理最低佣金比例' }
    }),
    prisma.systemConfig.upsert({
      where: { key: 'tier2_max_rate' },
      update: {},
      create: { key: 'tier2_max_rate', value: '0.12', desc: '二级代理最高佣金比例' }
    }),
    prisma.systemConfig.upsert({
      where: { key: 'withdrawal_fee' },
      update: {},
      create: { key: 'withdrawal_fee', value: '0.02', desc: '提现手续费比例' }
    }),
    prisma.systemConfig.upsert({
      where: { key: 'min_withdrawal' },
      update: {},
      create: { key: 'min_withdrawal', value: '100', desc: '最低提现金额' }
    })
  ])
  console.log('✅ System configs created:', configs.length)

  console.log('🎉 Seeding completed!')
  console.log('')
  console.log('📝 Test accounts:')
  console.log('   Admin: admin@web3phone.com / admin123')
  console.log('   Agent1: agent1@web3phone.com / 123456')
  console.log('   Agent2: agent2@web3phone.com / 123456')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
