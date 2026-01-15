export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
        <div className="text-8xl mb-6">📥</div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          工作空间下载
        </h1>
        <p className="text-xl text-slate-600 mb-8">
          Complete Interactive System Workspace
        </p>

        <div className="bg-blue-50 rounded-2xl p-6 mb-8">
          <p className="text-2xl font-bold text-slate-900 mb-2">
            workspace-clean.tar.gz
          </p>
          <p className="text-slate-700">
            41 KB · 完整源代码
          </p>
        </div>

        <a 
          href="http://21.0.9.222:3000/workspace-clean.tar.gz"
          download
          className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-2xl py-6 px-8 rounded-2xl shadow-xl transition-all hover:scale-105"
        >
          ⬇️ 立即下载
        </a>

        <a 
          href="/"
          className="block w-full bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-xl py-4 px-8 rounded-xl shadow-lg transition-all hover:scale-105 mt-6"
        >
          🏠 返回首页
        </a>

        <div className="mt-12 pt-12 border-t-2 border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-600">主页</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">小程序</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">后台</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-orange-600">API</p>
            </div>
          </div>

          <div className="bg-slate-100 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">使用说明</h2>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <span className="text-2xl">1️⃣</span>
                <code className="bg-slate-900 text-green-400 px-4 py-2 rounded-lg text-sm">
                  wget http://21.0.9.222:3000/workspace-clean.tar.gz
                </code>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">2️⃣</span>
                <code className="bg-slate-900 text-green-400 px-4 py-2 rounded-lg text-sm">
                  tar -xzf workspace-clean.tar.gz
                </code>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">3️⃣</span>
                <code className="bg-slate-900 text-green-400 px-4 py-2 rounded-lg text-sm">
                  cd my-project && bun install && bun run dev
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
