'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Send, Loader, ImagePlus, Droplets, Leaf, X } from 'lucide-react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  type?: 'text' | 'report-result'
  imagePreview?: string
  extractedValues?: any
  prediction?: any
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      type: 'text',
      content: "👋 Hello! I'm AquaSync — your AI-powered irrigation assistant. You can **upload a soil health report** (image or PDF) and I'll instantly analyze it and give you precise irrigation recommendations powered by our trained ML model. Or just ask me anything about irrigation!"
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/auth/login')
    }
    getUser()
  }, [supabase, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSend = async () => {
    if (!newMessage.trim() && !selectedFile) return
    setLoading(true)

    // If a file is attached, process it
    if (selectedFile) {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        type: 'text',
        content: newMessage || `📄 Analyzing: ${selectedFile.name}`,
        imagePreview: previewUrl ?? undefined
      }
      setMessages(prev => [...prev, userMsg])
      setNewMessage('')
      clearFile()

      try {
        const form = new FormData()
        form.append('document', selectedFile)
        const res = await fetch('/api/extract-report', { method: 'POST', body: form })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error)

        const { extractedValues: ev, prediction: pred, message: note } = data

        const content = `🔬 **Soil Report Analysis Complete** _(${note})_

**Extracted Parameters:**
| Parameter | Value |
|---|---|
| Nitrogen (N) | ${ev.N} kg/ha |
| Phosphorous (P) | ${ev.P} kg/ha |
| Potassium (K) | ${ev.K} kg/ha |
| Soil pH | ${ev.ph} |
| Temperature | ${ev.temperature}°C |
| Humidity | ${ev.humidity}% |
| Rainfall | ${ev.rainfall} mm |
| Soil Moisture | ${ev.soil_moisture} |
| Crop Age | ${ev.crop_days} days |
| Crop Type | ${ev.crop_type} |

---

🌱 **ML Model Irrigation Recommendation:**

💧 **Irrigate every ${pred.irrigation_days} days**
🚿 **Use ${pred.water_amount} litres per cycle**

_This recommendation is based on your soil nutrient profile, current moisture levels, and crop growth stage._`

        setMessages(prev => [...prev, {
          id: Date.now().toString() + '-ai',
          role: 'assistant',
          type: 'report-result',
          content,
          extractedValues: ev,
          prediction: pred
        }])

      } catch (err: any) {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '-err',
          role: 'assistant',
          type: 'text',
          content: `❌ Sorry, I couldn't process that document: ${err.message}`
        }])
      }

    } else {
      // Text-only chat
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        type: 'text',
        content: newMessage
      }
      setMessages(prev => [...prev, userMsg])
      setNewMessage('')

      // Static smart reply for now
      const replies: { [key: string]: string } = {
        default: `🌿 Great question! For best irrigation practices:
1. **Check soil moisture** before every watering session
2. **Water early morning** (6–8 AM) to reduce evaporation
3. **Adjust schedules** based on rainfall and weather forecasts
4. **Upload a soil health report** image so I can give you precise ML-based recommendations!`
      }
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '-ai',
          role: 'assistant',
          type: 'text',
          content: replies.default
        }])
        setLoading(false)
      }, 800)
      return
    }

    setLoading(false)
  }

  const renderMessage = (msg: Message) => {
    if (msg.role === 'user') {
      return (
        <div key={msg.id} className="flex justify-end mb-4">
          <div className="max-w-[75%]">
            {msg.imagePreview && (
              <img src={msg.imagePreview} alt="uploaded" className="rounded-lg mb-2 max-h-40 object-cover" />
            )}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm shadow">
              {msg.content}
            </div>
          </div>
        </div>
      )
    }

    // Assistant message
    return (
      <div key={msg.id} className="flex justify-start mb-4 gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
          <Droplets className="w-4 h-4 text-white" />
        </div>
        <div className="max-w-[80%]">
          {msg.type === 'report-result' && msg.prediction ? (
            <div className="space-y-3">
              <div className="bg-white border rounded-2xl rounded-tl-sm shadow-sm p-4 text-sm text-gray-800 whitespace-pre-wrap">
                {/* Render simplified card for prediction */}
                <p className="font-semibold text-gray-900 mb-3">🔬 Soil Report Analysis Complete</p>
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  {msg.extractedValues && Object.entries(msg.extractedValues).map(([k, v]) => (
                    <div key={k} className="flex justify-between bg-gray-50 px-2 py-1 rounded">
                      <span className="text-gray-500 uppercase font-medium">{k}</span>
                      <span className="font-semibold">{String(v)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mt-2">
                  <p className="font-bold text-green-700 text-base mb-2">🌱 ML Irrigation Recommendation</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <Droplets className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-blue-700">{msg.prediction.water_amount}L</p>
                      <p className="text-xs text-gray-500">per cycle</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <Leaf className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-green-700">Every {msg.prediction.irrigation_days}d</p>
                      <p className="text-xs text-gray-500">irrigation interval</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap">
              {msg.content}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              AquaSync
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-600 font-medium bg-green-50 border border-green-200 px-2 py-1 rounded-full">
              🤖 ML Model Active
            </span>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col">
        <div className="flex-1 space-y-2 mb-4">
          {messages.map(renderMessage)}
          {loading && (
            <div className="flex justify-start mb-4 gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Droplets className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm text-gray-500">Analyzing with ML model…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* File Preview */}
        {selectedFile && (
          <div className="mb-3 flex items-center gap-3 bg-white border border-blue-200 rounded-xl px-4 py-3 shadow-sm">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="w-12 h-12 rounded object-cover" />
            ) : (
              <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-500">PDF</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">Ready to analyze</p>
            </div>
            <button onClick={clearFile} className="text-gray-400 hover:text-red-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Area */}
        <div
          className={`bg-white border-2 rounded-2xl shadow-sm transition-all duration-200 ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files?.[0]
            if (file) handleFileSelect(file)
          }}
        >
          <div className="flex items-center gap-2 px-4 py-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-blue-500 transition-colors"
              title="Upload soil report"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file)
              }}
            />
            <Input
              className="flex-1 border-0 shadow-none focus-visible:ring-0 px-0 text-sm"
              placeholder={selectedFile ? "Add a note (optional) or press Send to analyze…" : "Ask about irrigation or drag & drop a soil report..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }}}
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={loading || (!newMessage.trim() && !selectedFile)}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <div className="px-4 pb-2 text-xs text-gray-400">
            📎 Attach a soil health report (JPG, PNG, PDF) for instant ML analysis • Drag & drop supported
          </div>
        </div>
      </main>
    </div>
  )
}
