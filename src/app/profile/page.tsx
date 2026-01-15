'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Wallet, RefreshCw, LogOut, DollarSign, Clock,
  CheckCircle, AlertCircle, BookOpen, ChevronLeft,
  Star, Bell, Gift, Shield, Building, Phone,
  Play, User, Settings, CreditCard, HelpCircle, Edit, Plus, Trash2
} from 'lucide-react'

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
    balance: number
    parent?: { user: { name?: string; email: string } }
  }
}

interface Withdrawal {
  id: string
  amount: number
  method: string
  status: string
  createdAt: string
}

interface Tutorial {
  id: string
  title: string
  category: string
  duration: string
  completed: boolean
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [financeData, setFinanceData] = useState<FinanceData | null>(null)
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [tutorialProgress, setTutorialProgress] = useState(0)

  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [accountForm, setAccountForm] = useState({ type: 'mobile_money', name: '', account: '', bankName: '' })

  const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'mobile_money', account: '' })
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [withdrawErr, setWithdrawErr] = useState('')

  const fetchJson = useCallback(async (url: string) => {
    try {
      const res = await fetch(url)
      if (!res.ok) return null
      return await res.json()
    } catch { return null }
  }, [])

  const fetchAllData = useCallback(async () => {
    if (!session) {
      setLoading(false)
      return
    }
    setLoading(true)

    try {
      const [profileData, financeRes, accountsRes, withdrawalsData, tutorialsData] = await Promise.all([
        fetchJson('/api/profile'),
        fetchJson('/api/profile/finance'),
        fetchJson('/api/profile/accounts'),
        fetchJson('/api/withdrawals?limit=10'),
        fetchJson('/api/tutorials')
      ])

      if (profileData && !profileData.error) {
        setProfile(profileData)
        setProfileForm({ name: profileData.name || '', phone: profileData.phone || '' })
      }
      if (financeRes) setFinanceData(financeRes)
      if (accountsRes) setPaymentAccounts(accountsRes.accounts || [])
      if (withdrawalsData) setWithdrawals(withdrawalsData.withdrawals || [])
      if (tutorialsData) {
        setTutorials(tutorialsData.tutorials || [])
        setTutorialProgress(tutorialsData.progress || 0)
      }
    } catch (err) {
      console.error('Fetch error:', err)
    }
    setLoading(false)
  }, [session, fetchJson])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      router.push('/login')
    }
  }, [mounted, status, router])

  useEffect(() => {
    if (mounted && status === 'authenticated' && session) {
      fetchAllData()
    } else if (mounted && status !== 'loading') {
      setLoading(false)
    }
  }, [mounted, status, session, fetchAllData])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      })
      if (res.ok) {
        setShowEditProfile(false)
        fetchAllData()
        alert('更新成功')
      }
    } catch { alert('更新失败') }
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

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/profile/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountForm)
      })
      if (res.ok) {
        setShowAddAccount(false)
        setAccountForm({ type: 'mobile_money', name: '', account: '', bankName: '' })
        fetchAllData()
        alert('添加成功')
      }
    } catch { alert('添加失败') }
  }

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('确定删除此账户？')) return
    try {
      const res = await fetch(`/api/profile/accounts/${id}`, { method: 'DELETE' })
      if (res.ok) fetchAllData()
    } catch { alert('删除失败') }
  }

  const handleSetDefaultAccount = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true })
      })
      if (res.ok) fetchAllData()
    } catch { alert('设置失败') }
  }

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <p>请先登录</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  const isAgent = profile?.agent

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" className="text-white" onClick={() => router.back()}>
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <h1 className="font-bold text-lg">我的</h1>
          </div>
          <Button size="icon" variant="ghost" className="text-white" onClick={fetchAllData}>
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="px-4 py-4 pb-8 space-y-4">
        {/* 个人信息卡片 */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center text-2xl font-bold">
                  {(profile?.name || profile?.email || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{profile?.name || '未设置昵称'}</h3>
                  <p className="text-slate-400 text-sm">{profile?.email}</p>
                  {profile?.phone && <p className="text-slate-400 text-sm">{profile.phone}</p>}
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-cyan-400" onClick={() => setShowEditProfile(true)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            {isAgent && (
              <div className="flex gap-2">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                  {profile.agent?.level === 1 ? '一级代理' : '二级代理'}
                </Badge>
                <Badge className={profile.agent?.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                  {profile.agent?.status === 'approved' ? '已认证' : '待审核'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 编辑资料 */}
        {showEditProfile && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Edit className="w-5 h-5 text-cyan-400" />编辑资料
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label className="text-slate-300">昵称</Label>
                  <Input placeholder="请输入昵称" className="bg-slate-700 border-slate-600 mt-1" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
                </div>
                <div>
                  <Label className="text-slate-300">手机号</Label>
                  <Input placeholder="请输入手机号" className="bg-slate-700 border-slate-600 mt-1" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditProfile(false)}>取消</Button>
                  <Button type="submit" className="flex-1 bg-cyan-500">保存</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 财务概览 */}
        {financeData?.isAgent && (
          <Card className="bg-gradient-to-br from-green-600 to-emerald-600 border-0">
            <CardContent className="p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2"><Wallet className="w-5 h-5" />财务概览</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">¥{(financeData.balance || 0).toLocaleString()}</p>
                  <p className="text-xs text-green-200">可提现余额</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">¥{(financeData.pendingCommission || 0).toFixed(0)}</p>
                  <p className="text-xs text-green-200">待结算佣金</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <p className="font-bold">¥{(financeData.todayCommission || 0).toFixed(0)}</p>
                  <p className="text-xs text-green-200">今日</p>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <p className="font-bold">¥{(financeData.weekCommission || 0).toFixed(0)}</p>
                  <p className="text-xs text-green-200">本周</p>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <p className="font-bold">¥{(financeData.monthCommission || 0).toFixed(0)}</p>
                  <p className="text-xs text-green-200">本月</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 提现申请 */}
        {isAgent && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="w-5 h-5 text-orange-400" />申请提现
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdraw} className="space-y-4">
                {withdrawErr && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />{withdrawErr}
                  </div>
                )}
                <div className="p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                  <p className="text-sm text-slate-400">可提现余额</p>
                  <p className="text-3xl font-bold text-orange-400">¥{(profile?.agent?.balance || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-slate-300">提现金额</Label>
                  <Input type="number" placeholder="请输入提现金额" className="bg-slate-700 border-slate-600 mt-1" value={withdrawForm.amount} onChange={e => setWithdrawForm({...withdrawForm, amount: e.target.value})} required />
                </div>
                <div>
                  <Label className="text-slate-300">提现方式</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[{v:'mobile_money',l:'Mobile Money',i:Phone},{v:'bank',l:'银行卡',i:Building},{v:'crypto',l:'加密货币',i:Wallet}].map(m => (
                      <button key={m.v} type="button" onClick={() => setWithdrawForm({...withdrawForm, method: m.v})} className={`p-3 rounded-lg border text-center ${withdrawForm.method === m.v ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-700 border-slate-600 text-slate-400'}`}>
                        <m.i className="w-5 h-5 mx-auto mb-1" /><p className="text-xs">{m.l}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">收款账号</Label>
                  <Input placeholder="请输入收款账号" className="bg-slate-700 border-slate-600 mt-1" value={withdrawForm.account} onChange={e => setWithdrawForm({...withdrawForm, account: e.target.value})} required />
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg text-xs text-slate-400">
                  <p>• 手续费：2% • 最低提现：¥100 • 到账时间：24小时内</p>
                </div>
                <Button type="submit" className="w-full bg-orange-500" disabled={withdrawLoading}>
                  {withdrawLoading ? '提交中...' : '申请提现'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 收款账户管理 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-400" />收款账户
              </CardTitle>
              <Button size="sm" variant="ghost" className="text-cyan-400" onClick={() => setShowAddAccount(true)}>
                <Plus className="w-4 h-4 mr-1" />添加
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddAccount && (
              <form onSubmit={handleAddAccount} className="space-y-3 mb-4 p-3 bg-slate-700/50 rounded-lg">
                <div>
                  <Label className="text-slate-300 text-sm">账户类型</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[{v:'mobile_money',l:'Mobile Money'},{v:'bank',l:'银行卡'},{v:'crypto',l:'加密货币'}].map(t => (
                      <button key={t.v} type="button" onClick={() => setAccountForm({...accountForm, type: t.v})} className={`p-2 rounded text-xs ${accountForm.type === t.v ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-slate-300'}`}>{t.l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">账户名称</Label>
                  <Input placeholder="持卡人/账户名" className="bg-slate-600 border-slate-500 mt-1 h-9" value={accountForm.name} onChange={e => setAccountForm({...accountForm, name: e.target.value})} required />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">账号</Label>
                  <Input placeholder="账号/卡号/地址" className="bg-slate-600 border-slate-500 mt-1 h-9" value={accountForm.account} onChange={e => setAccountForm({...accountForm, account: e.target.value})} required />
                </div>
                {accountForm.type === 'bank' && (
                  <div>
                    <Label className="text-slate-300 text-sm">银行名称</Label>
                    <Input placeholder="银行名称" className="bg-slate-600 border-slate-500 mt-1 h-9" value={accountForm.bankName} onChange={e => setAccountForm({...accountForm, bankName: e.target.value})} />
                  </div>
                )}
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
                    <p className="font-medium text-sm flex items-center gap-2">
                      {acc.name} {acc.isDefault && <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">默认</Badge>}
                    </p>
                    <p className="text-xs text-slate-400">{acc.account.slice(0, 4)}****{acc.account.slice(-4)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!acc.isDefault && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400" onClick={() => handleSetDefaultAccount(acc.id)}>
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDeleteAccount(acc.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )) : <p className="text-center text-slate-500 py-4">暂无收款账户</p>}
          </CardContent>
        </Card>

        {/* 提现记录 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5" />提现记录 ({withdrawals.length}条)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawals.length > 0 ? withdrawals.map(w => (
              <div key={w.id} className="flex justify-between p-3 bg-slate-700/50 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${w.method === 'mobile_money' ? 'bg-green-500/20' : w.method === 'bank' ? 'bg-blue-500/20' : 'bg-orange-500/20'}`}>
                    {w.method === 'mobile_money' ? <Phone className="w-5 h-5 text-green-400" /> : w.method === 'bank' ? <Building className="w-5 h-5 text-blue-400" /> : <Wallet className="w-5 h-5 text-orange-400" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{w.method === 'mobile_money' ? 'Mobile Money' : w.method === 'bank' ? '银行卡' : '加密货币'}</p>
                    <p className="text-xs text-slate-400">{new Date(w.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">¥{w.amount.toLocaleString()}</p>
                  <Badge variant={w.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                    {w.status === 'completed' ? '已完成' : '处理中'}
                  </Badge>
                </div>
              </div>
            )) : <p className="text-center text-slate-500 py-4">暂无提现记录</p>}
          </CardContent>
        </Card>

        {/* 培训中心 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />培训中心
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tutorials.length > 0 ? tutorials.map(t => (
              <div key={t.id} className="flex justify-between p-3 bg-slate-700/50 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.completed ? 'bg-green-500/20' : 'bg-slate-600'}`}>
                    {t.completed ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Play className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-slate-400">{t.category} · {t.duration}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-cyan-400">{t.completed ? '复习' : '学习'}</Button>
              </div>
            )) : <p className="text-center text-slate-500 py-4">暂无培训课程</p>}
            {tutorials.length > 0 && (
              <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-blue-400">学习进度</p>
                    <p className="text-xs text-slate-400">{tutorials.filter(t => t.completed).length}/{tutorials.length} 已完成</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{tutorialProgress}%</p>
                </div>
                <Progress value={tutorialProgress} className="mt-2 h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* 功能入口 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <Bell className="w-6 h-6 text-red-400 mb-2" />
            <p className="font-medium text-sm">消息通知</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <Gift className="w-6 h-6 text-pink-400 mb-2" />
            <p className="font-medium text-sm">活动中心</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <HelpCircle className="w-6 h-6 text-blue-400 mb-2" />
            <p className="font-medium text-sm">帮助中心</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <Settings className="w-6 h-6 text-slate-400 mb-2" />
            <p className="font-medium text-sm">设置</p>
          </div>
        </div>

        {/* 退出登录 */}
        <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => signOut()}>
          <LogOut className="w-4 h-4 mr-2" />退出登录
        </Button>
      </main>
    </div>
  )
}
