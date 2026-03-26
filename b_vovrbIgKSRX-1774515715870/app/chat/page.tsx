'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, Loader } from 'lucide-react'
import Link from 'next/link'

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
        fetchMessages()
      }
    }
    getUser()
  }, [supabase, router])

  const fetchMessages = async () => {
    const response = await fetch('/api/chat')
    const data = await response.json()
    setMessages(data || [])
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      })
      const data = await response.json()
      setMessages([data, ...messages])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              AquaAdvisor
            </h1>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-purple-600" />
            AI Irrigation Advisor
          </h2>
          <p className="text-gray-600 mt-1">Ask questions about irrigation, water management, and crop care</p>
        </div>

        <Card className="flex flex-col h-[600px]">
          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600">Start a conversation about your irrigation needs</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                      {msg.user_message}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-200 rounded-lg p-3 max-w-xs">
                      {msg.ai_response}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about irrigation..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={loading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !newMessage.trim()}
                className="gap-2"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
