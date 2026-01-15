export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">📄</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">API文档</h1>
            <p className="text-slate-600">API Documentation - 完整接口</p>
          </div>
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900 mb-2">15+</p>
              <p className="text-slate-600">API端点</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900 mb-2">24h</p>
              <p className="text-slate-600">实时可用</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900 mb-2">100%</p>
              <p className="text-slate-600">文档完整</p>
            </div>
          </div>
          <a href="/" className="block w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-4 rounded-xl text-center">
            返回首页
          </a>
        </div>
        <div className="bg-green-600 text-white rounded-xl p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">RESTful API</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-lg p-4">
              <p className="font-bold">认证</p>
              <p className="text-sm">JWT Token</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="font-bold">数据</p>
              <p className="text-sm">Real-time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
