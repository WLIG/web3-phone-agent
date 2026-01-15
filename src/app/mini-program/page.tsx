'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  Smartphone, Wallet, TrendingUp, Users, ShoppingCart, 
  ArrowRight, Copy, RefreshCw, LogOut, DollarSign, Clock,
  CheckCircle, AlertCircle, Share2, BookOpen,
  Image, FileText, Video, Download, ChevronRight, Star,
  Trophy, Target, BarChart3, Bell, Gift, Zap, Shield,
  Building, Phone, UserPlus, Network, Play, MessageSquare, Award,
  User, Settings, CreditCard, HelpCircle, Edit, Plus, Trash2,
  ChevronLeft, Eye, MousePointer, UserCheck, Package, Sun, Moon
} from 'lucide-react'

interface Stats {
  level?: number
  totalSales?: number
  totalCommission?: number
  balance?: number
  pendingCommission?: number
  childrenCount?: number
  ordersCount?: number
  commissionRate?: number
  referralRate?: number
}

interface TeamMember {
  id: string
  name: string
  email: string
  level: number
  totalSales: number
  status: string
  childrenCount: number
  ordersCount: number
}

interface TeamData {
  team: TeamMember[]
  total: number
  indirectCount: number
  teamSales: number
}

interface Commission {
  id: string
  amount: number
  rate: number
  type: string
  status: string
  createdAt: string
  order?: { orderNo: string }
}

interface Order {
  id: string
  orderNo: string
  totalAmount: number
  status: string
  createdAt: string
}

interface Withdrawal {
  id: string
  amount: number
  method: string
  status: string
  createdAt: string
}

interface Material {
  id: string
  type: string
  title: string
  description?: string
  content?: string
  downloads: number
  category: string
}

interface Tutorial {
  id: string
  title: string
  category: string
  duration: string
  completed: boolean
}

interface PaymentAccount {
  id: string
  type: string
  name: string
  account: string
  bankName?: string
  isDefault: boolean
}

interface FinanceData {
  isAgent: boolean
  balance: number
  totalCommission: number
  totalSales: number
  todayCommission: number
  weekCommission: number
  monthCommission: number
  pendingCommission: number
  settledCommission: number
  directCommission: number
  teamCommission: number
  pendingWithdrawal: number
  completedWithdrawal: number
  totalWithdrawn: number
}

interface ProfileData {
  id: string
  name?: string
  email: string
  phone?: string
  avatar?: string
  createdAt: string
  agent?: {
    id: string
    level: number
    status: string
    parent?: { user: { name?: string; email: string } }
  }
}

interface FunnelData {
  exposure: number
  clicks: number
  registers: number
  orders: number
}

interface RankItem {
  rank: number
  name: string
  sales: number
  avatar?: string
}

export default function MiniProgramPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [profileSubPage, setProfileSubPage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isDark, setIsDark] = useState(true) // 主题状态：true=暗色，false=亮色
  
  const [stats, setStats] = useState<Stats | null>(null)
  const [teamData, setTeamData] = useState<TeamData | null>(null)
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [materialStats, setMaterialStats] = useState({ images: 0, videos: 0, texts: 0 })
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [tutorialProgress, setTutorialProgress] = useState(0)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [financeData, setFinanceData] = useState<FinanceData | null>(null)
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([])
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [accountForm, setAccountForm] = useState({ type: 'mobile_money', name: '', account: '', bankName: '' })
  
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'mobile_money', account: '' })
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [withdrawErr, setWithdrawErr] = useState('')

  // 模拟转化漏斗数据
  const [funnelData] = useState<FunnelData>({ exposure: 10000, clicks: 2500, registers: 500, orders: 125 })
  // 模拟排行榜数据
  const [rankData] = useState<RankItem[]>([
    { rank: 1, name: '张三', sales: 158000 },
    { rank: 2, name: '李四', sales: 142000 },
    { rank: 3, name: '王五', sales: 98000 },
  ])

  const fetchJson = useCallback(async (url: string) => {
    try {
      const res = await fetch(url)
      if (!res.ok) return null
      return await res.json()
    } catch { return null }
  }, [])

  const fetchAllData = useCallback(async () => {
    if (!session) return
    setLoading(true)
    
    const [statsData, teamRes, commissionsData, ordersData, withdrawalsData, materialsData, tutorialsData, profileData, financeRes, accountsRes] = await Promise.all([
      fetchJson('/api/stats'),
      fetchJson('/api/team'),
      fetchJson('/api/commissions?limit=50'),
      fetchJson('/api/orders?limit=20'),
      fetchJson('/api/withdrawals?limit=10'),
      fetchJson('/api/materials'),
      fetchJson('/api/tutorials'),
      fetchJson('/api/profile'),
      fetchJson('/api/profile/finance'),
      fetchJson('/api/profile/accounts')
    ])

    if (statsData) setStats(statsData)
    if (teamRes) setTeamData(teamRes)
    if (commissionsData) setCommissions(commissionsData.commissions || [])
    if (ordersData) setOrders(ordersData.orders || [])
    if (withdrawalsData) setWithdrawals(withdrawalsData.withdrawals || [])
    if (materialsData) {
      setMaterials(materialsData.materials || [])
      setMaterialStats(materialsData.stats || { images: 0, videos: 0, texts: 0 })
    }
    if (tutorialsData) {
      setTutorials(tutorialsData.tutorials || [])
      setTutorialProgress(tutorialsData.progress || 0)
    }
    if (profileData) {
      setProfile(profileData)
      setProfileForm({ name: profileData.name || '', phone: profileData.phone || '' })
    }
    if (financeRes) setFinanceData(financeRes)
    if (accountsRes) setPaymentAccounts(accountsRes.accounts || [])
    setLoading(false)
  }, [session, fetchJson])

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (mounted && status === 'unauthenticated') router.push('/login') }, [mounted, status, router])
  useEffect(() => { if (mounted && session) fetchAllData() }, [mounted, session, fetchAllData])
  
  // 主题初始化和持久化
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setIsDark(savedTheme === 'dark')
    }
  }, [])
  
  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setWithdrawErr('')
    setWithdrawLoading(true)
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(withdrawForm.amount), method: withdrawForm.method, account: withdrawForm.account })
      })
      const data = await res.json()
      if (!res.ok) { setWithdrawErr(data.error || '提现失败'); return }
      setWithdrawForm({ amount: '', method: 'mobile_money', account: '' })
      fetchAllData()
      alert('提现申请已提交')
    } catch { setWithdrawErr('提现失败') }
    finally { setWithdrawLoading(false) }
  }

  const applyAgent = async () => {
    const res = await fetch('/api/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    if (res.ok) { alert('申请已提交'); window.location.reload() }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profileForm) })
      if (res.ok) { setShowEditProfile(false); fetchAllData(); alert('更新成功') }
    } catch { alert('更新失败') }
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/profile/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(accountForm) })
      if (res.ok) { setShowAddAccount(false); setAccountForm({ type: 'mobile_money', name: '', account: '', bankName: '' }); fetchAllData(); alert('添加成功') }
    } catch { alert('添加失败') }
  }

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('确定删除此账户？')) return
    try { const res = await fetch(`/api/profile/accounts/${id}`, { method: 'DELETE' }); if (res.ok) fetchAllData() } catch { alert('删除失败') }
  }

  const handleSetDefaultAccount = async (id: string) => {
    try { const res = await fetch(`/api/profile/accounts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDefault: true }) }); if (res.ok) fetchAllData() } catch { alert('设置失败') }
  }

  // 防止 hydration 错误：服务端始终返回空，客户端挂载后再渲染
  if (!mounted) {
    return null
  }
  
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
          <p className="text-slate-400 mt-2 text-sm">加载中...</p>
        </div>
      </div>
    )
  }
  
  if (!session) return null

  const isAgent = session.user.agentId && session.user.agentLevel
  const now = new Date()
  const todayCommission = commissions.filter(c => new Date(c.createdAt).toDateString() === now.toDateString()).reduce((s, c) => s + c.amount, 0)
  const weekCommission = commissions.filter(c => new Date(c.createdAt) >= new Date(now.getTime() - 7*24*60*60*1000)).reduce((s, c) => s + c.amount, 0)
  const monthCommission = commissions.filter(c => { const d = new Date(c.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }).reduce((s, c) => s + c.amount, 0)
  const directCommission = commissions.filter(c => c.type === 'direct').reduce((s, c) => s + c.amount, 0)
  const teamCommission = commissions.filter(c => c.type === 'referral').reduce((s, c) => s + c.amount, 0)

  // 主题样式
  const theme = {
    bg: isDark ? 'bg-slate-900' : 'bg-gray-50',
    text: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-slate-400' : 'text-gray-500',
    card: isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm',
    cardInner: isDark ? 'bg-slate-700/50' : 'bg-gray-100',
    input: isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300',
    nav: isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200',
    tabList: isDark ? 'bg-slate-800' : 'bg-gray-100',
  }

  // 我的页面子页面渲染
  const renderProfileSubPage = () => {
    if (!profileSubPage) return null
    
    const backButton = (
      <Button variant="ghost" size="sm" className="text-cyan-400 mb-4" onClick={() => setProfileSubPage(null)}>
        <ChevronLeft className="w-4 h-4 mr-1" />返回
      </Button>
    )

    // 提现页面
    if (profileSubPage === 'withdraw') {
      return (
        <div className="space-y-4">
          {backButton}
          <Card className={theme.card}>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Wallet className="w-5 h-5 text-orange-400" />申请提现</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleWithdraw} className="space-y-4">
                {withdrawErr && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{withdrawErr}</div>}
                <div className="p-4 bg-orange-500/20 rounded-lg border border-orange-500/30"><p className={`text-sm ${theme.textMuted}`}>可提现余额</p><p className="text-3xl font-bold text-orange-400">¥{(stats?.balance || 0).toLocaleString()}</p></div>
                <div><Label className={theme.textMuted}>提现金额</Label><Input type="number" placeholder="请输入提现金额" className={`${theme.input} mt-1`} value={withdrawForm.amount} onChange={e => setWithdrawForm({...withdrawForm, amount: e.target.value})} required /></div>
                <div><Label className={theme.textMuted}>提现方式</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[{v:'mobile_money',l:'Mobile Money',i:Phone},{v:'bank',l:'银行卡',i:Building},{v:'crypto',l:'加密货币',i:Wallet}].map(m => (
                      <button key={m.v} type="button" onClick={() => setWithdrawForm({...withdrawForm, method: m.v})} className={`p-3 rounded-lg border text-center ${withdrawForm.method === m.v ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : theme.cardInner + ' border-transparent ' + theme.textMuted}`}>
                        <m.i className="w-5 h-5 mx-auto mb-1" /><p className="text-xs">{m.l}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div><Label className={theme.textMuted}>收款账号</Label><Input placeholder="请输入收款账号" className={`${theme.input} mt-1`} value={withdrawForm.account} onChange={e => setWithdrawForm({...withdrawForm, account: e.target.value})} required /></div>
                <div className={`p-3 ${theme.cardInner} rounded-lg text-xs ${theme.textMuted}`}><p>• 手续费：2% • 最低提现：¥100 • 到账时间：24小时内</p></div>
                <Button type="submit" className="w-full bg-orange-500" disabled={withdrawLoading}>{withdrawLoading ? '提交中...' : '申请提现'}</Button>
              </form>
            </CardContent>
          </Card>
          {/* 提现记录 */}
          <Card className={theme.card}>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Clock className="w-5 h-5" />提现记录</CardTitle></CardHeader>
            <CardContent>
              {withdrawals.length > 0 ? withdrawals.map(w => (
                <div key={w.id} className="flex justify-between p-3 bg-slate-700/50 rounded-lg mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${w.method === 'mobile_money' ? 'bg-green-500/20' : w.method === 'bank' ? 'bg-blue-500/20' : 'bg-orange-500/20'}`}>
                      {w.method === 'mobile_money' ? <Phone className="w-5 h-5 text-green-400" /> : w.method === 'bank' ? <Building className="w-5 h-5 text-blue-400" /> : <Wallet className="w-5 h-5 text-orange-400" />}
                    </div>
                    <div><p className="font-medium text-sm">{w.method === 'mobile_money' ? 'Mobile Money' : w.method === 'bank' ? '银行卡' : '加密货币'}</p><p className="text-xs text-slate-400">{new Date(w.createdAt).toLocaleDateString()}</p></div>
                  </div>
                  <div className="text-right"><p className="font-bold">¥{w.amount.toLocaleString()}</p><Badge variant={w.status === 'completed' ? 'default' : 'secondary'} className="text-xs">{w.status === 'completed' ? '已完成' : '处理中'}</Badge></div>
                </div>
              )) : <p className="text-center text-slate-500 py-4">暂无提现记录</p>}
            </CardContent>
          </Card>
        </div>
      )
    }

    // 收款账户页面
    if (profileSubPage === 'accounts') {
      return (
        <div className="space-y-4">
          {backButton}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-400" />收款账户</CardTitle>
                <Button size="sm" variant="ghost" className="text-cyan-400" onClick={() => setShowAddAccount(true)}><Plus className="w-4 h-4 mr-1" />添加</Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddAccount && (
                <form onSubmit={handleAddAccount} className="space-y-3 mb-4 p-3 bg-slate-700/50 rounded-lg">
                  <div><Label className="text-slate-300 text-sm">账户类型</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {[{v:'mobile_money',l:'Mobile Money'},{v:'bank',l:'银行卡'},{v:'crypto',l:'加密货币'}].map(t => (
                        <button key={t.v} type="button" onClick={() => setAccountForm({...accountForm, type: t.v})} className={`p-2 rounded text-xs ${accountForm.type === t.v ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-slate-300'}`}>{t.l}</button>
                      ))}
                    </div>
                  </div>
                  <div><Label className="text-slate-300 text-sm">账户名称</Label><Input placeholder="持卡人/账户名" className="bg-slate-600 border-slate-500 mt-1 h-9" value={accountForm.name} onChange={e => setAccountForm({...accountForm, name: e.target.value})} required /></div>
                  <div><Label className="text-slate-300 text-sm">账号</Label><Input placeholder="账号/卡号/地址" className="bg-slate-600 border-slate-500 mt-1 h-9" value={accountForm.account} onChange={e => setAccountForm({...accountForm, account: e.target.value})} required /></div>
                  {accountForm.type === 'bank' && <div><Label className="text-slate-300 text-sm">银行名称</Label><Input placeholder="银行名称" className="bg-slate-600 border-slate-500 mt-1 h-9" value={accountForm.bankName} onChange={e => setAccountForm({...accountForm, bankName: e.target.value})} /></div>}
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" className="flex-1" onClick={() => setShowAddAccount(false)}>取消</Button>
                    <Button type="submit" size="sm" className="flex-1 bg-cyan-500">保存</Button>
                  </div>
                </form>
              )}
              {paymentAccounts.length > 0 ? paymentAccounts.map(acc => (
                <div key={acc.id} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${acc.type === 'mobile_money' ? 'bg-green-500/20' : acc.type === 'bank' ? 'bg-blue-500/20' : 'bg-orange-500/20'}`}>
                      {acc.type === 'mobile_money' ? <Phone className="w-5 h-5 text-green-400" /> : acc.type === 'bank' ? <Building className="w-5 h-5 text-blue-400" /> : <Wallet className="w-5 h-5 text-orange-400" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">{acc.name} {acc.isDefault && <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">默认</Badge>}</p>
                      <p className="text-xs text-slate-400">{acc.account.slice(0, 4)}****{acc.account.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!acc.isDefault && <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400" onClick={() => handleSetDefaultAccount(acc.id)}><Star className="w-4 h-4" /></Button>}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDeleteAccount(acc.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              )) : <p className="text-center text-slate-500 py-4">暂无收款账户</p>}
            </CardContent>
          </Card>
        </div>
      )
    }

    // 培训中心页面
    if (profileSubPage === 'training') {
      return (
        <div className="space-y-4">
          {backButton}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-400" />培训中心</CardTitle></CardHeader>
            <CardContent>
              {tutorials.map(t => (
                <div key={t.id} className="flex justify-between p-3 bg-slate-700/50 rounded-lg mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.completed ? 'bg-green-500/20' : 'bg-slate-600'}`}>
                      {t.completed ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Play className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div><p className="font-medium text-sm">{t.title}</p><p className="text-xs text-slate-400">{t.category} · {t.duration}</p></div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-cyan-400">{t.completed ? '复习' : '学习'}</Button>
                </div>
              ))}
              <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="flex justify-between items-center"><div><p className="text-sm font-medium text-blue-400">学习进度</p><p className="text-xs text-slate-400">{tutorials.filter(t => t.completed).length}/{tutorials.length} 已完成</p></div><p className="text-2xl font-bold text-blue-400">{tutorialProgress}%</p></div>
                <Progress value={tutorialProgress} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // 订单追踪页面
    if (profileSubPage === 'orders') {
      return (
        <div className="space-y-4">
          {backButton}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-blue-400" />我推广的订单</CardTitle></CardHeader>
            <CardContent>
              {orders.length > 0 ? orders.map(o => (
                <div key={o.id} className="flex justify-between p-3 bg-slate-700/50 rounded-lg mb-2">
                  <div><p className="font-mono text-sm">{o.orderNo}</p><p className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</p></div>
                  <div className="text-right"><p className="font-bold text-green-400">¥{o.totalAmount}</p><Badge variant={o.status === 'completed' ? 'default' : 'secondary'} className="text-xs">{o.status === 'completed' ? '已完成' : o.status === 'pending' ? '待付款' : '进行中'}</Badge></div>
                </div>
              )) : <p className="text-center text-slate-500 py-4">暂无订单</p>}
            </CardContent>
          </Card>
        </div>
      )
    }

    // 数据看板页面
    if (profileSubPage === 'dashboard') {
      return (
        <div className="space-y-4">
          {backButton}
          {/* 转化漏斗 */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Target className="w-5 h-5 text-purple-400" />转化漏斗</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="relative">
                  <div className="flex items-center justify-between p-3 bg-purple-500/20 rounded-lg">
                    <div className="flex items-center gap-2"><Eye className="w-5 h-5 text-purple-400" /><span>曝光</span></div>
                    <span className="font-bold text-purple-400">{funnelData.exposure.toLocaleString()}</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-lg ml-4">
                    <div className="flex items-center gap-2"><MousePointer className="w-5 h-5 text-blue-400" /><span>点击</span></div>
                    <div className="text-right"><span className="font-bold text-blue-400">{funnelData.clicks.toLocaleString()}</span><span className="text-xs text-slate-400 ml-2">{((funnelData.clicks/funnelData.exposure)*100).toFixed(1)}%</span></div>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex items-center justify-between p-3 bg-cyan-500/20 rounded-lg ml-8">
                    <div className="flex items-center gap-2"><UserCheck className="w-5 h-5 text-cyan-400" /><span>注册</span></div>
                    <div className="text-right"><span className="font-bold text-cyan-400">{funnelData.registers.toLocaleString()}</span><span className="text-xs text-slate-400 ml-2">{((funnelData.registers/funnelData.clicks)*100).toFixed(1)}%</span></div>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg ml-12">
                    <div className="flex items-center gap-2"><Package className="w-5 h-5 text-green-400" /><span>成交</span></div>
                    <div className="text-right"><span className="font-bold text-green-400">{funnelData.orders.toLocaleString()}</span><span className="text-xs text-slate-400 ml-2">{((funnelData.orders/funnelData.registers)*100).toFixed(1)}%</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* 排行榜 */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" />销售排行榜</CardTitle></CardHeader>
            <CardContent>
              {rankData.map(r => (
                <div key={r.rank} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${r.rank === 1 ? 'bg-amber-500 text-white' : r.rank === 2 ? 'bg-slate-400 text-white' : r.rank === 3 ? 'bg-orange-600 text-white' : 'bg-slate-600 text-slate-300'}`}>{r.rank}</div>
                    <span className="font-medium">{r.name}</span>
                  </div>
                  <span className="font-bold text-green-400">¥{r.sales.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )
    }

    // 设置页面
    if (profileSubPage === 'settings') {
      return (
        <div className="space-y-4">
          {backButton}
          {showEditProfile ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Edit className="w-5 h-5 text-cyan-400" />编辑资料</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div><Label className="text-slate-300">昵称</Label><Input placeholder="请输入昵称" className="bg-slate-700 border-slate-600 mt-1" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} /></div>
                  <div><Label className="text-slate-300">手机号</Label><Input placeholder="请输入手机号" className="bg-slate-700 border-slate-600 mt-1" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} /></div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditProfile(false)}>取消</Button>
                    <Button type="submit" className="flex-1 bg-cyan-500">保存</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Settings className="w-5 h-5 text-slate-400" />设置</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <button onClick={() => setShowEditProfile(true)} className="w-full flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700"><div className="flex items-center gap-3"><Edit className="w-5 h-5 text-cyan-400" /><span>编辑资料</span></div><ChevronRight className="w-5 h-5 text-slate-500" /></button>
                <button className="w-full flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700"><div className="flex items-center gap-3"><Bell className="w-5 h-5 text-red-400" /><span>消息通知</span></div><ChevronRight className="w-5 h-5 text-slate-500" /></button>
                <button className="w-full flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700"><div className="flex items-center gap-3"><HelpCircle className="w-5 h-5 text-blue-400" /><span>帮助中心</span></div><ChevronRight className="w-5 h-5 text-slate-500" /></button>
              </CardContent>
            </Card>
          )}
          <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => signOut()}><LogOut className="w-4 h-4 mr-2" />退出登录</Button>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <header className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><Smartphone className="w-7 h-7" /></div>
            <div><h1 className="font-bold text-lg">Web3手机代理</h1><p className="text-cyan-200 text-sm">{session.user.name || session.user.email}</p></div>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={toggleTheme}>
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={fetchAllData}><RefreshCw className="w-5 h-5" /></Button>
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => signOut()}><LogOut className="w-5 h-5" /></Button>
          </div>
        </div>
        {isAgent && stats && (
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <div><p className="text-cyan-200 text-sm">可提现余额</p><p className="text-3xl font-bold">¥{(stats.balance || 0).toLocaleString()}</p></div>
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">{stats.level === 1 ? '⭐ 一级代理' : '二级代理'}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/10 rounded-lg p-2"><p className="text-lg font-bold text-cyan-300">¥{todayCommission.toFixed(0)}</p><p className="text-xs text-slate-300">今日佣金</p></div>
              <div className="bg-white/10 rounded-lg p-2"><p className="text-lg font-bold text-green-300">¥{weekCommission.toFixed(0)}</p><p className="text-xs text-slate-300">本周佣金</p></div>
              <div className="bg-white/10 rounded-lg p-2"><p className="text-lg font-bold text-purple-300">¥{monthCommission.toFixed(0)}</p><p className="text-xs text-slate-300">本月佣金</p></div>
            </div>
          </div>
        )}
      </header>

      <main className="px-4 py-4 pb-24">
        {!isAgent ? (
          <Card className={theme.card}>
            <CardContent className="p-6 text-center">
              <UserPlus className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
              <h3 className="text-xl font-bold mb-2">成为代理</h3>
              <p className={`${theme.textMuted} mb-4`}>加入我们，享受高达25%的销售佣金</p>
              <Button className="w-full bg-cyan-500" onClick={applyAgent}>立即申请 <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setProfileSubPage(null) }}>
            <TabsList className={`grid w-full grid-cols-5 ${theme.tabList} p-1 h-auto`}>
              <TabsTrigger value="home" className="flex flex-col gap-1 py-2 data-[state=active]:bg-cyan-600"><TrendingUp className="w-4 h-4" /><span className="text-xs">首页</span></TabsTrigger>
              <TabsTrigger value="team" className="flex flex-col gap-1 py-2 data-[state=active]:bg-cyan-600"><Users className="w-4 h-4" /><span className="text-xs">团队</span></TabsTrigger>
              <TabsTrigger value="commission" className="flex flex-col gap-1 py-2 data-[state=active]:bg-cyan-600"><DollarSign className="w-4 h-4" /><span className="text-xs">佣金</span></TabsTrigger>
              <TabsTrigger value="materials" className="flex flex-col gap-1 py-2 data-[state=active]:bg-cyan-600"><Image className="w-4 h-4" /><span className="text-xs">素材</span></TabsTrigger>
              <TabsTrigger value="profile" className="flex flex-col gap-1 py-2 data-[state=active]:bg-cyan-600"><User className="w-4 h-4" /><span className="text-xs">我的</span></TabsTrigger>
            </TabsList>

            {/* 首页 */}
            <TabsContent value="home" className="space-y-4 mt-4">
              <div className="grid grid-cols-4 gap-3">
                <button onClick={() => setActiveTab('team')} className={`${theme.card} rounded-xl p-3 text-center`}><Users className="w-8 h-8 mx-auto mb-1 text-blue-400" /><p className="text-xs">团队</p></button>
                <button onClick={() => copyToClipboard(`${window.location.origin}/register?ref=${session.user.agentId}`)} className={`${theme.card} rounded-xl p-3 text-center`}><Share2 className="w-8 h-8 mx-auto mb-1 text-green-400" /><p className="text-xs">邀请</p></button>
                <button onClick={() => setActiveTab('materials')} className={`${theme.card} rounded-xl p-3 text-center`}><Image className="w-8 h-8 mx-auto mb-1 text-purple-400" /><p className="text-xs">素材</p></button>
                <button onClick={() => { setActiveTab('profile'); setProfileSubPage('withdraw') }} className={`${theme.card} rounded-xl p-3 text-center`}><Wallet className="w-8 h-8 mx-auto mb-1 text-orange-400" /><p className="text-xs">提现</p></button>
              </div>

              <Card className="bg-gradient-to-r from-orange-500 to-amber-500 border-0">
                <CardContent className="p-4 flex justify-between items-center">
                  <div><p className="text-orange-100 text-sm">我的邀请码</p><p className="font-mono font-bold text-xl">{session.user.agentId}</p></div>
                  <Button size="sm" variant="secondary" onClick={() => copyToClipboard(session.user.agentId || '')} className="bg-white/20 text-white border-0">
                    {copied ? <CheckCircle className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? '已复制' : '复制'}
                  </Button>
                </CardContent>
              </Card>

              <Card className={theme.card}>
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-5 h-5 text-cyan-400" />数据概览</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`${theme.cardInner} rounded-lg p-3`}><DollarSign className="w-4 h-4 text-green-400 mb-1" /><p className="text-xl font-bold text-green-400">¥{(stats?.totalCommission || 0).toLocaleString()}</p><p className={`text-xs ${theme.textMuted}`}>总佣金</p></div>
                    <div className={`${theme.cardInner} rounded-lg p-3`}><ShoppingCart className="w-4 h-4 text-blue-400 mb-1" /><p className="text-xl font-bold text-blue-400">{stats?.ordersCount || 0}</p><p className={`text-xs ${theme.textMuted}`}>总订单</p></div>
                    <div className={`${theme.cardInner} rounded-lg p-3`}><Users className="w-4 h-4 text-purple-400 mb-1" /><p className="text-xl font-bold text-purple-400">{teamData?.total || 0}</p><p className={`text-xs ${theme.textMuted}`}>团队人数</p></div>
                    <div className={`${theme.cardInner} rounded-lg p-3`}><TrendingUp className="w-4 h-4 text-cyan-400 mb-1" /><p className="text-xl font-bold text-cyan-400">{((stats?.commissionRate || 0.08) * 100).toFixed(0)}%</p><p className={`text-xs ${theme.textMuted}`}>佣金比例</p></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-blue-400" />最近订单</CardTitle></CardHeader>
                <CardContent>
                  {orders.length > 0 ? orders.slice(0, 3).map(o => (
                    <div key={o.id} className="flex justify-between p-2 bg-slate-700/50 rounded-lg mb-2">
                      <div><p className="font-mono text-sm">{o.orderNo}</p><p className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</p></div>
                      <div className="text-right"><p className="font-bold text-green-400">¥{o.totalAmount}</p><Badge variant={o.status === 'completed' ? 'default' : 'secondary'} className="text-xs">{o.status === 'completed' ? '已完成' : '进行中'}</Badge></div>
                    </div>
                  )) : <p className="text-center text-slate-500 py-4">暂无订单</p>}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 团队 */}
            <TabsContent value="team" className="space-y-4 mt-4">
              <Card className="bg-gradient-to-br from-blue-600 to-purple-600 border-0">
                <CardContent className="p-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2"><Network className="w-5 h-5" />团队业绩</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 rounded-lg p-3 text-center"><p className="text-2xl font-bold">{teamData?.total || 0}</p><p className="text-xs text-blue-200">直属下级</p></div>
                    <div className="bg-white/10 rounded-lg p-3 text-center"><p className="text-2xl font-bold">{teamData?.indirectCount || 0}</p><p className="text-xs text-blue-200">间接下级</p></div>
                    <div className="bg-white/10 rounded-lg p-3 text-center"><p className="text-2xl font-bold">¥{((teamData?.teamSales || 0) / 1000).toFixed(1)}k</p><p className="text-xs text-blue-200">团队销售</p></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Users className="w-5 h-5 text-blue-400" />我的团队 ({teamData?.total || 0}人)</CardTitle></CardHeader>
                <CardContent>
                  {teamData && teamData.team.length > 0 ? teamData.team.map(m => (
                    <div key={m.id} className="flex justify-between p-3 bg-slate-700/50 rounded-lg mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center font-bold">{(m.name || m.email || '?').charAt(0)}</div>
                        <div><p className="font-medium">{m.name || m.email}</p><p className="text-xs text-slate-400">{m.level === 1 ? '一级' : '二级'}代理 · 下级{m.childrenCount}人</p></div>
                      </div>
                      <div className="text-right"><p className="font-bold text-green-400">¥{m.totalSales.toLocaleString()}</p><Badge variant={m.status === 'approved' ? 'default' : 'secondary'} className="text-xs">{m.status === 'approved' ? '活跃' : '待审'}</Badge></div>
                    </div>
                  )) : <div className="text-center py-6"><Users className="w-12 h-12 mx-auto mb-2 text-slate-600" /><p className="text-slate-500">暂无团队成员</p><Button size="sm" className="mt-2 bg-cyan-500" onClick={() => copyToClipboard(`${window.location.origin}/register?ref=${session.user.agentId}`)}><UserPlus className="w-4 h-4 mr-1" />邀请成员</Button></div>}
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2"><CardTitle className="text-base">代理层级说明</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30"><Star className="w-6 h-6 text-amber-400" /><div><p className="font-bold text-amber-400">一级代理</p><p className="text-sm text-slate-400">佣金15-25% · 可发展下级</p></div></div>
                  <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30"><Award className="w-6 h-6 text-blue-400" /><div><p className="font-bold text-blue-400">二级代理</p><p className="text-sm text-slate-400">佣金8-12% · 直接销售</p></div></div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 佣金 */}
            <TabsContent value="commission" className="space-y-4 mt-4">
              <Card className="bg-gradient-to-br from-green-600 to-emerald-600 border-0">
                <CardContent className="p-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2"><DollarSign className="w-5 h-5" />佣金看板</h3>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-white/10 rounded-lg p-3 text-center"><p className="text-2xl font-bold">¥{todayCommission.toFixed(0)}</p><p className="text-xs text-green-200">今日</p></div>
                    <div className="bg-white/10 rounded-lg p-3 text-center"><p className="text-2xl font-bold">¥{weekCommission.toFixed(0)}</p><p className="text-xs text-green-200">本周</p></div>
                    <div className="bg-white/10 rounded-lg p-3 text-center"><p className="text-2xl font-bold">¥{monthCommission.toFixed(0)}</p><p className="text-xs text-green-200">本月</p></div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 flex justify-between"><span>累计总佣金</span><span className="font-bold text-xl">¥{(stats?.totalCommission || 0).toLocaleString()}</span></div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-slate-800 border-slate-700"><CardContent className="p-4 text-center"><ShoppingCart className="w-10 h-10 mx-auto mb-2 text-cyan-400" /><p className="text-xl font-bold text-cyan-400">¥{directCommission.toFixed(0)}</p><p className="text-sm text-slate-400">直推佣金</p></CardContent></Card>
                <Card className="bg-slate-800 border-slate-700"><CardContent className="p-4 text-center"><Users className="w-10 h-10 mx-auto mb-2 text-purple-400" /><p className="text-xl font-bold text-purple-400">¥{teamCommission.toFixed(0)}</p><p className="text-sm text-slate-400">团队佣金</p></CardContent></Card>
              </div>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Shield className="w-5 h-5 text-amber-400" />佣金规则</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-slate-700/50 rounded"><span className="text-slate-400">一级代理佣金</span><span className="text-green-400 font-bold">15% - 25%</span></div>
                  <div className="flex justify-between p-2 bg-slate-700/50 rounded"><span className="text-slate-400">二级代理佣金</span><span className="text-blue-400 font-bold">8% - 12%</span></div>
                  <div className="flex justify-between p-2 bg-slate-700/50 rounded"><span className="text-slate-400">推荐奖励</span><span className="text-purple-400 font-bold">20% - 30%</span></div>
                  <div className="flex justify-between p-2 bg-slate-700/50 rounded"><span className="text-slate-400">结算周期</span><span className="text-cyan-400 font-bold">T+1 (24小时)</span></div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><FileText className="w-5 h-5 text-green-400" />佣金明细 ({commissions.length}条)</CardTitle></CardHeader>
                <CardContent>
                  {commissions.length > 0 ? commissions.slice(0, 10).map(c => (
                    <div key={c.id} className="flex justify-between p-3 bg-slate-700/50 rounded-lg mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${c.type === 'direct' ? 'bg-cyan-500/20' : 'bg-purple-500/20'}`}>
                          {c.type === 'direct' ? <ShoppingCart className="w-5 h-5 text-cyan-400" /> : <Users className="w-5 h-5 text-purple-400" />}
                        </div>
                        <div><p className="font-medium text-sm">{c.type === 'direct' ? '直推佣金' : '团队奖励'}</p><p className="text-xs text-slate-400">{c.order?.orderNo || '-'} · {(c.rate * 100).toFixed(0)}%</p></div>
                      </div>
                      <div className="text-right"><p className="font-bold text-green-400">+¥{c.amount.toFixed(2)}</p><Badge variant={c.status === 'settled' ? 'default' : 'secondary'} className="text-xs">{c.status === 'settled' ? '已结算' : '待结算'}</Badge></div>
                    </div>
                  )) : <p className="text-center text-slate-500 py-4">暂无佣金记录</p>}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 素材 */}
            <TabsContent value="materials" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700"><Image className="w-8 h-8 mx-auto mb-2 text-pink-400" /><p className="text-sm font-medium">图片素材</p><p className="text-xs text-slate-400">{materialStats.images}个</p></div>
                <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700"><Video className="w-8 h-8 mx-auto mb-2 text-red-400" /><p className="text-sm font-medium">视频素材</p><p className="text-xs text-slate-400">{materialStats.videos}个</p></div>
                <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700"><MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-400" /><p className="text-sm font-medium">话术模板</p><p className="text-xs text-slate-400">{materialStats.texts}个</p></div>
              </div>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Zap className="w-5 h-5 text-amber-400" />推广素材</CardTitle></CardHeader>
                <CardContent>
                  {materials.filter(m => m.type !== 'text').map(m => (
                    <div key={m.id} className="flex justify-between p-3 bg-slate-700/50 rounded-lg mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${m.type === 'image' ? 'bg-pink-500/20' : 'bg-red-500/20'}`}>
                          {m.type === 'image' ? <Image className="w-6 h-6 text-pink-400" /> : <Video className="w-6 h-6 text-red-400" />}
                        </div>
                        <div><p className="font-medium text-sm">{m.title}</p><p className="text-xs text-slate-400">{m.downloads}次下载</p></div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-cyan-400"><Download className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="w-5 h-5 text-green-400" />话术模板</CardTitle></CardHeader>
                <CardContent>
                  {materials.filter(m => m.type === 'text').map(m => (
                    <div key={m.id} className="p-4 bg-slate-700/50 rounded-lg mb-2">
                      <div className="flex justify-between mb-2">
                        <Badge className="bg-green-500/20 text-green-400">{m.category}</Badge>
                        <Button size="sm" variant="ghost" className="text-cyan-400 h-6" onClick={() => copyToClipboard(m.content || '')}><Copy className="w-3 h-3 mr-1" />复制</Button>
                      </div>
                      <p className="text-sm text-slate-300 whitespace-pre-line">{m.content}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 我的 - 个人中心主页 */}
            <TabsContent value="profile" className="space-y-4 mt-4">
              {profileSubPage ? renderProfileSubPage() : (
                <>
                  {/* 个人信息卡片 */}
                  <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center text-2xl font-bold">
                          {(profile?.name || profile?.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{profile?.name || '未设置昵称'}</h3>
                          <p className="text-slate-400 text-sm">{profile?.email}</p>
                          {profile?.agent && (
                            <div className="flex gap-2 mt-1">
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">{profile.agent.level === 1 ? '一级代理' : '二级代理'}</Badge>
                              <Badge className={profile.agent.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>{profile.agent.status === 'approved' ? '已认证' : '待审核'}</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 财务概览 */}
                  {financeData?.isAgent && (
                    <Card className="bg-gradient-to-br from-green-600 to-emerald-600 border-0">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/10 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold">¥{(financeData.balance || 0).toLocaleString()}</p>
                            <p className="text-xs text-green-200">可提现余额</p>
                          </div>
                          <div className="bg-white/10 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold">¥{(financeData.totalCommission || 0).toLocaleString()}</p>
                            <p className="text-xs text-green-200">累计佣金</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 功能菜单 */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 space-y-2">
                      <button onClick={() => setProfileSubPage('withdraw')} className="w-full flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700">
                        <div className="flex items-center gap-3"><Wallet className="w-5 h-5 text-orange-400" /><span>提现管理</span></div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </button>
                      <button onClick={() => setProfileSubPage('accounts')} className="w-full flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700">
                        <div className="flex items-center gap-3"><CreditCard className="w-5 h-5 text-blue-400" /><span>收款账户</span></div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </button>
                      <button onClick={() => setProfileSubPage('orders')} className="w-full flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700">
                        <div className="flex items-center gap-3"><ShoppingCart className="w-5 h-5 text-cyan-400" /><span>订单追踪</span></div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </button>
                      <button onClick={() => setProfileSubPage('training')} className="w-full flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700">
                        <div className="flex items-center gap-3"><BookOpen className="w-5 h-5 text-purple-400" /><span>培训中心</span></div>
                        <div className="flex items-center gap-2"><span className="text-xs text-slate-400">{tutorialProgress}%</span><ChevronRight className="w-5 h-5 text-slate-500" /></div>
                      </button>
                      <button onClick={() => setProfileSubPage('dashboard')} className="w-full flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700">
                        <div className="flex items-center gap-3"><BarChart3 className="w-5 h-5 text-green-400" /><span>数据看板</span></div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </button>
                      <button onClick={() => setProfileSubPage('settings')} className="w-full flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700">
                        <div className="flex items-center gap-3"><Settings className="w-5 h-5 text-slate-400" /><span>设置</span></div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </button>
                    </CardContent>
                  </Card>

                  {/* 快捷入口 */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700"><Bell className="w-6 h-6 mx-auto mb-1 text-red-400" /><p className="text-xs">消息</p></div>
                    <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700"><Gift className="w-6 h-6 mx-auto mb-1 text-pink-400" /><p className="text-xs">活动</p></div>
                    <div className={`${theme.card} rounded-xl p-3 text-center`}><Trophy className="w-6 h-6 mx-auto mb-1 text-amber-400" /><p className="text-xs">排行榜</p></div>
                    <div className={`${theme.card} rounded-xl p-3 text-center`}><HelpCircle className="w-6 h-6 mx-auto mb-1 text-blue-400" /><p className="text-xs">帮助</p></div>
                  </div>

                  {/* 退出登录 */}
                  <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => signOut()}>
                    <LogOut className="w-4 h-4 mr-2" />退出登录
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* 底部导航 */}
      {isAgent && (
        <nav className={`fixed bottom-0 left-0 right-0 ${theme.nav} border-t px-4 py-2`}>
          <div className="flex justify-around">
            {[
              {id:'home',icon:TrendingUp,label:'首页'},
              {id:'team',icon:Users,label:'团队'},
              {id:'commission',icon:DollarSign,label:'佣金'},
              {id:'materials',icon:Image,label:'素材'},
              {id:'profile',icon:User,label:'我的'}
            ].map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setProfileSubPage(null) }} className={`flex flex-col items-center py-1 px-3 ${activeTab === item.id ? 'text-cyan-400' : theme.textMuted}`}>
                <item.icon className="w-5 h-5 mb-1" /><span className="text-xs">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
