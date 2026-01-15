'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, ShoppingCart, DollarSign, Wallet, Settings, LogOut, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'admin') {
      router.push('/mini-program')
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes, agentsRes, ordersRes, withdrawalsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/users?limit=20'),
        fetch('/api/agents?limit=20'),
        fetch('/api/orders?limit=20'),
        fetch('/api/withdrawals?limit=20')
      ])

      const [statsData, usersData, agentsData, ordersData, withdrawalsData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        agentsRes.json(),
        ordersRes.json(),
        withdrawalsRes.json()
      ])

      setStats(statsData)
      setUsers(usersData.users || [])
      setAgents(agentsData.agents || [])
      setOrders(ordersData.orders || [])
      setWithdrawals(withdrawalsData.withdrawals || [])
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAgentApproval = async (id: string, status: string) => {
    try {
      await fetch(`/api/agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      fetchData()
    } catch (error) {
      console.error('Approval error:', error)
    }
  }

  const handleWithdrawal = async (id: string, status: string) => {
    try {
      await fetch(`/api/withdrawals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      fetchData()
    } catch (error) {
      console.error('Withdrawal error:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">管理后台</h1>
              <p className="text-sm text-slate-500">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/')}>
              <LogOut className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">总用户</p>
                  <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                </div>
                <Users className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">总订单</p>
                  <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
                </div>
                <ShoppingCart className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">总销售额</p>
                  <p className="text-2xl font-bold">¥{(stats?.totalSales || 0).toLocaleString()}</p>
                </div>
                <DollarSign className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-orange-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">待处理提现</p>
                  <p className="text-3xl font-bold">{stats?.pendingWithdrawals || 0}</p>
                </div>
                <Wallet className="w-10 h-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 数据表格 */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-white">
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="agents">代理管理</TabsTrigger>
            <TabsTrigger value="orders">订单管理</TabsTrigger>
            <TabsTrigger value="withdrawals">提现管理</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>用户列表</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>姓名</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>角色</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>注册时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? '管理员' : user.role === 'agent' ? '代理' : '用户'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                            {user.status === 'active' ? '正常' : '禁用'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle>代理列表</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>代理</TableHead>
                      <TableHead>等级</TableHead>
                      <TableHead>佣金比例</TableHead>
                      <TableHead>总销售</TableHead>
                      <TableHead>总佣金</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.user?.name}</TableCell>
                        <TableCell>
                          <Badge variant={agent.level === 1 ? 'default' : 'secondary'}>
                            {agent.level === 1 ? '一级代理' : '二级代理'}
                          </Badge>
                        </TableCell>
                        <TableCell>{(agent.commissionRate * 100).toFixed(0)}%</TableCell>
                        <TableCell>¥{agent.totalSales.toLocaleString()}</TableCell>
                        <TableCell>¥{agent.totalCommission.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            agent.status === 'approved' ? 'default' :
                            agent.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {agent.status === 'approved' ? '已审核' :
                             agent.status === 'pending' ? '待审核' : '已拒绝'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {agent.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleAgentApproval(agent.id, 'approved')}>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleAgentApproval(agent.id, 'rejected')}>
                                <XCircle className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {agents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>订单列表</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>订单号</TableHead>
                      <TableHead>用户</TableHead>
                      <TableHead>代理</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>创建时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.orderNo}</TableCell>
                        <TableCell>{order.user?.name}</TableCell>
                        <TableCell>{order.agent?.user?.name || '-'}</TableCell>
                        <TableCell className="font-medium">¥{order.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            order.status === 'completed' ? 'default' :
                            order.status === 'paid' ? 'secondary' : 'outline'
                          }>
                            {order.status === 'completed' ? '已完成' :
                             order.status === 'paid' ? '已支付' :
                             order.status === 'shipped' ? '已发货' : '待支付'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {orders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>提现申请</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>手续费</TableHead>
                      <TableHead>实际到账</TableHead>
                      <TableHead>方式</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="font-medium">{w.user?.name}</TableCell>
                        <TableCell>¥{w.amount.toLocaleString()}</TableCell>
                        <TableCell>¥{w.fee.toLocaleString()}</TableCell>
                        <TableCell className="font-medium text-green-600">¥{w.actualAmount.toLocaleString()}</TableCell>
                        <TableCell>{w.method}</TableCell>
                        <TableCell>
                          <Badge variant={
                            w.status === 'completed' ? 'default' :
                            w.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {w.status === 'completed' ? '已完成' :
                             w.status === 'pending' ? '待处理' :
                             w.status === 'processing' ? '处理中' : '已拒绝'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {w.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleWithdrawal(w.id, 'completed')}>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleWithdrawal(w.id, 'rejected')}>
                                <XCircle className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {withdrawals.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
