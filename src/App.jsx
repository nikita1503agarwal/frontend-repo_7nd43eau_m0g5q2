import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function wordCount(str = '') {
  return (str || '').trim().split(/\s+/).filter(Boolean).length
}

function computeIdeaMetrics(idea, keywordsArr = []) {
  const hookWords = wordCount(idea.hook)
  const hasStrongHook = hookWords >= 6 && hookWords <= 16

  const loweredTitle = (idea.title || '').toLowerCase()
  const loweredKeywords = (keywordsArr || []).map(k => (k || '').toLowerCase())
  const titleSEO = loweredKeywords.length === 0 || loweredKeywords.some(k => loweredTitle.includes(k))

  const angleSpecific = (idea.angle || '').length >= 24

  const ctaText = (idea.cta || '').toLowerCase()
  const ctaClear = /(subscribe|subscrib[e|e?]|follow|ikuti|simpan|save|komen|komentar|comment|share|bagikan)/.test(ctaText)

  const hashtagsCount = (idea.hashtags || []).length
  const hashtagsGood = hashtagsCount >= 3 && hashtagsCount <= 10

  const descLen = (idea.description || '').length
  const descriptionGood = descLen >= 80 && descLen <= 220

  const postingTimePresent = Boolean(idea.posting_time)

  const checks = [hasStrongHook, titleSEO, angleSpecific, ctaClear, hashtagsGood, descriptionGood, postingTimePresent]
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100)

  let tier = 'Rendah'
  if (score >= 80) tier = 'Tinggi'
  else if (score >= 55) tier = 'Sedang'

  return {
    hasStrongHook,
    titleSEO,
    angleSpecific,
    ctaClear,
    hashtagsGood,
    descriptionGood,
    postingTimePresent,
    score,
    tier,
  }
}

function normalizeHandles(text = '') {
  return text
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(h => h.startsWith('@') ? h : `@${h}`)
}

function App() {
  const [niche, setNiche] = useState('motivasi')
  const [keywords, setKeywords] = useState('produktif, mindset, bisnis')

  // Tambahan konteks sebelum "Buat Ide Shorts"
  const [shortDesc, setShortDesc] = useState('Konten motivasi harian seputar produktivitas dan mindset bisnis untuk pemula.')
  const [audienceAge, setAudienceAge] = useState('18-34')
  const [audienceCountry, setAudienceCountry] = useState('Indonesia')
  const [referencesText, setReferencesText] = useState('@aliabdaal, @nasdaily')

  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState(null)

  const keywordsArr = useMemo(() => keywords.split(',').map(k => k.trim()).filter(Boolean), [keywords])
  const referencesArr = useMemo(() => normalizeHandles(referencesText), [referencesText])

  const generateIdeas = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/ideate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          keywords: keywordsArr,
          language: 'id',
          // Informasi tambahan (akan diabaikan backend saat ini, tetapi disimpan untuk pengembangan berikutnya)
          context: {
            description: shortDesc,
            audience: { age: audienceAge, country: audienceCountry },
            references: referencesArr,
          }
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

  const handleCopy = (idea, metrics) => {
    const block = [
      `Judul: ${idea.title}`,
      `Hook: ${idea.hook}`,
      `Angle: ${idea.angle}`,
      `CTA: ${idea.cta}`,
      `Deskripsi: ${idea.description}`,
      `Hashtag: ${(idea.hashtags || []).map(h => `#${h.replace(/^#/, '')}`).join(' ')}`,
      `Waktu Posting: ${idea.posting_time || '-'}`,
      '',
      'Konteks Kanal:',
      `- Deskripsi singkat: ${shortDesc}`,
      `- Target: Usia ${audienceAge}, Negara ${audienceCountry}`,
      `- Referensi: ${referencesArr.join(', ') || '-'}`,
      '',
      'Ringkasan Kelayakan:',
      `- Hook kuat: ${metrics.hasStrongHook ? 'Ya' : 'Perbaiki (6–16 kata)'}`,
      `- Judul SEO (mengandung keyword): ${metrics.titleSEO ? 'Ya' : 'Tambahkan keyword'}`,
      `- Angle spesifik: ${metrics.angleSpecific ? 'Ya' : 'Perjelas eksekusi'}`,
      `- CTA jelas: ${metrics.ctaClear ? 'Ya' : 'Gunakan ajakan aksi'}`,
      `- Hashtag 3–10: ${metrics.hashtagsGood ? 'Ya' : 'Sesuaikan jumlah'}`,
      `- Deskripsi 80–220 karakter: ${metrics.descriptionGood ? 'Ya' : 'Sesuaikan panjang'}`,
      `- Rekomendasi jam ada: ${metrics.postingTimePresent ? 'Ya' : 'Tambahkan jam'}`,
      `Skor: ${metrics.score}% (${metrics.tier})`
    ].join('\n')

    navigator.clipboard.writeText(block).then(() => {
      // noop
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <header className="px-6 py-5 border-b bg-white/70 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">YouTube Shorts Automator</h1>
            <p className="text-sm text-gray-600">Buat ide, pahami kriterianya, dan siap eksekusi menuju monetisasi</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">Beta</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Form */}
        <section className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 md:p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Niche</label>
              <input value={niche} onChange={e => setNiche(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="mis. finansial, kuliner, teknologi" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Kata Kunci</label>
              <input value={keywords} onChange={e => setKeywords(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="pisahkan dengan koma" />
              <p className="text-xs text-gray-500 mt-1">Contoh: produktif, mindset, bisnis</p>
            </div>

            {/* Elemen tambahan untuk menguatkan niche & keyword */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Deskripsi Singkat</label>
              <textarea
                value={shortDesc}
                onChange={e => setShortDesc(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                rows={3}
                placeholder="Gambarkan tujuan channel dan gaya penyampaian dalam 1-2 kalimat"
              />
              <p className="text-xs text-gray-500 mt-1">Contoh: Konten edukasi singkat dengan contoh praktis dan storytelling ringan.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Target Penonton (Usia)</label>
              <input
                value={audienceAge}
                onChange={e => setAudienceAge(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="mis. 18-34"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Penonton (Negara)</label>
              <input
                value={audienceCountry}
                onChange={e => setAudienceCountry(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="mis. Indonesia, Malaysia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Referensi Creator (awali @, pisahkan koma)</label>
              <input
                value={referencesText}
                onChange={e => setReferencesText(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="@namacreator, @creatorlain"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {referencesArr.map((h, i) => (
                  <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{h}</span>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 flex flex-wrap items-center gap-3 pt-1">
              <button onClick={generateIdeas} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-60 transition">
                {loading ? 'Menggenerasi...' : 'Buat Ide Shorts'}
              </button>
              {error && <span className="text-red-600 text-sm">{error}</span>}
            </div>
          </div>

          {/* Penjelasan & Kriteria */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-indigo-50/60 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Apa yang akan kamu dapat?</h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                <li>Judul yang ramah SEO</li>
                <li>Hook pembuka yang kuat</li>
                <li>Angle/format eksekusi</li>
                <li>CTA untuk mendorong interaksi</li>
                <li>Deskripsi singkat dan hashtag relevan</li>
                <li>Rekomendasi waktu posting</li>
              </ul>
            </div>
            <div className="bg-sky-50/60 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Kriteria kelayakan (otomatis dinilai)</h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                <li>Hook 6–16 kata</li>
                <li>Judul mengandung salah satu kata kunci</li>
                <li>Angle spesifik (jelas cara eksekusinya)</li>
                <li>CTA jelas (ajak subscribe/ikuti/simpan/komentar)</li>
                <li>3–10 hashtag relevan</li>
                <li>Deskripsi 80–220 karakter</li>
                <li>Ada rekomendasi jam posting</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Hasil Ide */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold">Hasil Ide Shorts</h2>
              <p className="text-sm text-gray-600">Setiap kartu menampilkan skor kelayakan dan checklist agar mudah dipahami.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {ideas.map((it, idx) => {
              const metrics = computeIdeaMetrics(it, keywordsArr)
              const badgeColor = metrics.tier === 'Tinggi' ? 'bg-emerald-100 text-emerald-700' : metrics.tier === 'Sedang' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-700'

              return (
                <div key={idx} className="group bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
                  <div className="p-4 border-b bg-gradient-to-r from-white to-indigo-50/60">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold pr-3 line-clamp-2">{it.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${badgeColor}`}>{metrics.tier} • {metrics.score}%</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-600">{it.posting_time ? `Waktu posting disarankan: ${it.posting_time}` : 'Waktu posting: -'}</div>
                  </div>

                  <div className="p-4 space-y-2">
                    <p className="text-sm"><span className="font-medium">Hook:</span> {it.hook}</p>
                    <p className="text-sm"><span className="font-medium">Angle:</span> {it.angle}</p>
                    <p className="text-sm"><span className="font-medium">CTA:</span> {it.cta}</p>
                    <p className="text-sm"><span className="font-medium">Deskripsi:</span> {it.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(it.hashtags || []).map((h, i) => (
                        <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">#{h.replace(/^#/, '')}</span>
                      ))}
                    </div>

                    {/* Checklist */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <CheckItem ok={metrics.hasStrongHook} label="Hook 6–16 kata" />
                      <CheckItem ok={metrics.titleSEO} label="Judul mengandung keyword" />
                      <CheckItem ok={metrics.angleSpecific} label="Angle spesifik" />
                      <CheckItem ok={metrics.ctaClear} label="CTA jelas" />
                      <CheckItem ok={metrics.hashtagsGood} label="3–10 hashtag" />
                      <CheckItem ok={metrics.descriptionGood} label="Deskripsi 80–220" />
                      <CheckItem ok={metrics.postingTimePresent} label="Jam posting ada" />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          handleCopy(it, metrics)
                          setCopiedIndex(idx)
                          setTimeout(() => setCopiedIndex(null), 1500)
                        }}
                        className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-black transition"
                      >{copiedIndex === idx ? 'Disalin ✓' : 'Salin'}</button>
                      <button className="text-sm bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 transition">Buat Task</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}

function CheckItem({ ok, label }) {
  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded ${ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
      <span className="text-base leading-none">{ok ? '✔' : '✖'}</span>
      <span>{label}</span>
    </div>
  )
}

export default App
