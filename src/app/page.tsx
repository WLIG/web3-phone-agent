检查'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Smartphone, CheckCircle2, Copy, RefreshCw, ArrowRight, Download, Zap, TrendingUp, Shield, Wallet, Globe2, Target } from 'luc MessageCi

export default function Home() {
  const [lang, setLang] = useState('zh')
  const [copied, setCopied] = useState(false)

  const t = (zh: string, en: string) => lang === 'zh' ? zh : en
  const download = () => {
    window.location.href = '/api/workspace'
  }
  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex flex-col">
      <header className="sticky top-0 z-50 border-b-2 border-purple-600 bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-xl animate-pulse">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {t('非洲市场Web3手机代理策略', 'African Market Web3 Mobile Agent Strategy')}
                </h1>
                <p className="text-sm text-slate-600">
                  {t('完整交互系统 · 小程序 · 管理后台', 'Complete System · Mini Program · Admin')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={() => setLang('zh')} className={lang === 'zh' ? 'bg-purple-600' : ''}>
                中文
              </Button>
              <Button size="sm" onClick={() => setLang('en')} className={lang === 'en' ? 'bg-blue-600' : ''}>
                EN
              </Button>
              <div className="w-px h-8 bg-slate-300" />
              <Button size="sm" variant="outline" onClick={download} className="border-2 border-green-500 text-green-600 hover:bg-green-50">
                <Download className="w-4 h-4 mr-2" />
                {t('下载工作空间', 'Download')}
              </Button>
              <Button size="sm" variant="outline" onClick={copyLink}>
                {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? t('已复制', 'Copied') : t('分享', 'Share')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('刷新', 'Refresh')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 bg-slate-800 p-3 rounded-2xl">
            <TabsTrigger value="overview">{t('总览', 'Overview')}</TabsTrigger>
            <TabsTrigger value="benefits">{t('既得利益', 'Benefits')}</TabsTrigger>
            <TabsTrigger value="rules">{t('规矩', 'Rules')}</TabsTrigger>
            <TabsTrigger value="tech">{t('技术方案', 'Tech')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              <Card className="border-4 border-purple-500 shadow-xl hover:scale-105 transition-all">
                <CardHeader className="bg-purple-600 text-white">
                  <Smartphone className="w-12 h-12" />
                  <CardTitle className="text-2xl">{t('小程序端', 'Mini Program')}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-purple-600" /><span>{t('完整注册登录', 'Full Auth')}</span></div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-purple-600" /><span>{t('佣金实时查看', 'Real-time')}</span></div>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => window.location.href = '/mini-program'}>
                    {t('进入小程序', 'Go to')} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-4 border-blue-500 shadow-xl hover:scale-105 transition-all">
                <CardHeader className="bg-blue-600 text-white">
                  <Target className="w-12 h-12" />
                  <CardTitle className="text-2xl">{t('管理后台', 'Admin Dashboard')}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-600" /><span>{t('用户管理', 'User Mgmt')}</span></div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-600" /><span>{t('佣金设置', 'Commission')}</span></div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = '/admin'}>
                    {t('进入后台', 'Go to')} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="benefits">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-4 border-green-500">
                <CardHeader className="bg-green-600 text-white">
                  <TrendingUp className="w-8 h-8" />
                  <CardTitle className="text-xl">{t('高佣金', 'High Commission')}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="p-4 bg-green-50 rounded-xl mb-4">
                    <h4 className="font-bold text-slate-900 mb-2">{t('一级代理', 'Tier 1')}</h4>
                    <p className="text-3xl font-bold text-green-600">15% - 25%</p>
                    <p className="text-sm text-slate-600">{t('推荐奖励：20-30%', 'Referral: 20-30%')}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-bold text-slate-900 mb-2">{t('二级代理', 'Tier 2')}</h4>
                    <p className="text-3xl font-bold text-blue-600">8% - 12%</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-blue-500">
                <CardHeader className="bg-blue-600 text-white">
                  <Wallet className="w-8 h-8" />
                  <CardTitle className="text-xl">{t('快速结算', 'Fast Settlement')}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="p-4 bg-blue-50 rounded-xl mb-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-slate-900">{t('24小时到账', '24h Payout')}</h4>
                      <span className="text-4xl font-bold text-blue-600">24h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rules">
            <Card className="border-4 border-orange-500">
              <CardHeader className="bg-orange-600 text-white">
                <Shield className="w-8 h-8" />
                <CardTitle className="text-xl">{t('佣金规则', 'Commission Rules')}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="p-4 bg-orange-50 rounded-xl border-l-4 border-orange-500 mb-4">
                  <p className="text-slate-900 font-bold mb-2">{t('佣金比例', 'Rate')}</p>
                  <p className="text-slate-700">{t('一级15-25%，二级8-12%', 'Tier 1: 15-25%, Tier 2: 8-12%')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tech">
            <Card className="border-4 border-purple-500">
              <CardHeader className="bg-purple-600 text-white">
                <Smartphone className="w-12 h-12" />
                <CardTitle className="text-2xl">{t('小程序形态', 'Mini Program')}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-white rounded-xl">
                    <Zap className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('无需下载', 'No Download')}</h3>
                    <p className="text-slate-700">{t('即开即用', 'Open & Use')}</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl">
                    <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('100%稳定', '100% Stable')}</h3>
                    <p className="text-slate-700">{t('严格测试', 'Tested')}</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl">
                    <Globe2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('标准UI', 'Standard')}</h3>
                    <p className="text-slate-700">{t('专业设计', 'Pro')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t-2 border-slate-300 bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">
                  {t('非洲市场Web3手机代理策略', 'African Market Strategy')}
                </p>
                <p className="text-sm text-slate-600">
                  {t('完整交互系统', 'Complete Interactive System')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-600 text-white px-4 py-2">{t('100%稳定', '100% Stable')}</Badge>
              <Badge className="bg-blue-600 text-white px-4 py-2">{t('标准UI', 'Standard UI')}</Badge>
              <p className="text-sm text-slate-500">
                © 2026 M-pata团队
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
