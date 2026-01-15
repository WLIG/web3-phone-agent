'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Smartphone, Download, Share2, QrCode, Copy, CheckCircle,
  Apple, Chrome, Globe, ArrowRight
} from 'lucide-react'

export default function DemoPage() {
  const [copied, setCopied] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    setCurrentUrl(window.location.origin)
  }, [])

  const copyLink = () => {
    navigator.clipboard.writeText(`${currentUrl}/mini-program`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-md mx-auto space-y-6 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <Smartphone className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold">Web3手机代理系统</h1>
          <p className="text-slate-400 mt-2">演示版本 v1.0</p>
        </div>

        {/* 快速访问 */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              快速访问
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">演示地址</p>
              <p className="font-mono text-cyan-400 break-all">{currentUrl}/mini-program</p>
            </div>
            <Button className="w-full bg-cyan-500" onClick={copyLink}>
              {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? '已复制' : '复制链接'}
            </Button>
          </CardContent>
        </Card>

        {/* 安装指南 */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="w-5 h-5 text-green-400" />
              安装到手机
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* iOS */}
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Apple className="w-5 h-5" />
                <span className="font-medium">iPhone / iPad</span>
                <Badge className="bg-blue-500/20 text-blue-400">Safari</Badge>
              </div>
              <ol className="text-sm text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="bg-slate-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">1</span>
                  <span>用 Safari 打开演示链接</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-slate-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">2</span>
                  <span>点击底部 <span className="text-cyan-400">分享按钮</span> 📤</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-slate-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">3</span>
                  <span>选择 <span className="text-cyan-400">"添加到主屏幕"</span></span>
                </li>
              </ol>
            </div>

            {/* Android */}
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Chrome className="w-5 h-5" />
                <span className="font-medium">Android</span>
                <Badge className="bg-green-500/20 text-green-400">Chrome</Badge>
              </div>
              <ol className="text-sm text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="bg-slate-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">1</span>
                  <span>用 Chrome 打开演示链接</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-slate-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">2</span>
                  <span>点击右上角 <span className="text-cyan-400">菜单 ⋮</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-slate-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">3</span>
                  <span>选择 <span className="text-cyan-400">"安装应用"</span> 或 <span className="text-cyan-400">"添加到主屏幕"</span></span>
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* 测试账号 */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">测试账号</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-amber-400 font-medium mb-1">管理员</p>
              <p className="text-sm text-slate-300">admin@web3phone.com / admin123</p>
            </div>
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-cyan-400 font-medium mb-1">一级代理</p>
              <p className="text-sm text-slate-300">agent1@web3phone.com / 123456</p>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-purple-400 font-medium mb-1">二级代理</p>
              <p className="text-sm text-slate-300">agent2@web3phone.com / 123456</p>
            </div>
          </CardContent>
        </Card>

        {/* 进入演示 */}
        <Button 
          className="w-full h-14 bg-gradient-to-r from-cyan-500 to-purple-600 text-lg"
          onClick={() => window.location.href = '/mini-program'}
        >
          进入演示 <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <p className="text-center text-slate-500 text-sm">
          分享此页面给团队成员，方便他们安装和体验
        </p>
      </div>
    </div>
  )
}
