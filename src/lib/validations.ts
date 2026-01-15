import { z } from 'zod'

// 用户注册验证
export const registerSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符').max(50, '姓名最多50个字符'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位').max(100, '密码最多100位'),
  inviteCode: z.string().optional()
})

// 登录验证
export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '请输入密码')
})

// 提现验证
export const withdrawalSchema = z.object({
  amount: z.number().positive('金额必须大于0').max(100000, '单次提现最多10万'),
  method: z.enum(['bank', 'crypto', 'mobile_money'], { message: '请选择提现方式' }),
  account: z.string().min(5, '账号至少5个字符').max(100, '账号最多100个字符')
})

// 订单验证
export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, '产品ID不能为空'),
    quantity: z.number().int().positive('数量必须大于0')
  })).min(1, '订单项不能为空'),
  agentId: z.string().optional(),
  shippingAddr: z.string().optional(),
  remark: z.string().max(500, '备注最多500字符').optional()
})

// 产品验证
export const productSchema = z.object({
  name: z.string().min(2, '名称至少2个字符').max(100, '名称最多100个字符'),
  description: z.string().max(1000, '描述最多1000个字符').optional(),
  price: z.number().positive('价格必须大于0'),
  stock: z.number().int().min(0, '库存不能为负').optional(),
  image: z.string().url('图片URL格式不正确').optional()
})

// 代理审核验证
export const agentApprovalSchema = z.object({
  status: z.enum(['approved', 'rejected'], { message: '状态无效' }),
  commissionRate: z.number().min(0.01).max(0.50).optional(),
  referralRate: z.number().min(0.01).max(0.50).optional()
})

// 验证函数
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(e => e.message).join(', ')
      return { success: false, error: message }
    }
    return { success: false, error: '验证失败' }
  }
}
