import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function App() {
  const [niche, setNiche] = useState('motivasi')
  const [keywords, setKeywords] = useState('produktif, mindset, bisnis')
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateIdeas = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/ideate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          language: 'id'
        })
      })
      if (!res.ok) throw new Error('Gagal membuat ide')
      const data = await res.json()
      setIdeas(data.ideas || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // preload sample
    generateIdeas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-50">
      <header className="px-6 py-4 border-b bg-white/70 backdrop-blur sticky top-0">
        <h1 className="text-2xl font-bold">YouTube Shorts Automator</h1>
        <p className="text-sm text-gray-600">Buat ide, script, dan rencana posting yang siap monetisasi</p>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        <section className="bg-white rounded-xl shadow-sm p-5 grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Niche</label>
            <input value={niche} onChange={e => setNiche(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="mis. finansial, kuliner, teknologi" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Kata Kunci</label>
            <input value={keywords} onChange={e => setKeywords(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="pisahkan dengan koma" />
          </div>
          <div className="md:col-span-3 flex gap-3">
            <button onClick={generateIdeas} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-60">
              {loading ? 'Menggenerasi...' : 'Buat Ide Shorts'}
            </button>
            {error && <span className="text-red-600 text-sm">{error}</span>}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          {ideas.map((it, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-4 border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{it.title}</h3>
                <span className="text-xs px-2 py-1 rounded bg-gray-100">{it.posting_time}</span>
              </div>
              <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Hook:</span> {it.hook}</p>
              <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Angle:</span> {it.angle}</p>
              <p className="text-sm text-gray-700 mb-2"><span className="font-medium">CTA:</span> {it.cta}</p>
              <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Deskripsi:</span> {it.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {(it.hashtags || []).map((h, i) => (
                  <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{h}</span>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button className="text-sm bg-emerald-600 text-white px-3 py-1.5 rounded">Buat Task</button>
                <button className="text-sm bg-gray-200 px-3 py-1.5 rounded">Salin</button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

export default App
