import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Bot, User, Sparkles, Zap, Crown, Copy } from 'lucide-react'
import { useFlexPass } from '../../hooks/useFlexPass'

interface Message {
  id: number
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
  isPremium?: boolean
}

export function ChatGPTClone() {
  const { userPasses } = useFlexPass()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check if user has active ChatGPT pass
  const hasChatGPTPass = userPasses.some(pass => 
    pass.provider.name === 'ChatGPT' && 
    pass.isActive && 
    pass.isValid &&
    pass.expirationTime > Date.now()
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 1,
        content: hasChatGPTPass 
          ? "Hello! I'm ChatGPT Premium. I can help you with advanced AI tasks, code generation, detailed analysis, and much more. What would you like to work on today?"
          : "Hello! I'm ChatGPT Free. I can answer basic questions, but for advanced features like code generation, detailed analysis, and premium responses, you'll need a ChatGPT pass.",
        sender: 'assistant',
        timestamp: new Date(),
        isPremium: hasChatGPTPass
      }
      setMessages([welcomeMessage])
    }
  }, [hasChatGPTPass])

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = hasChatGPTPass ? [
        "That's a great question! With ChatGPT Premium, I can provide detailed, nuanced responses. Here's a comprehensive analysis...",
        "I can help you with advanced code generation. Let me create a complete solution for you...",
        "With premium access, I can perform complex reasoning and provide step-by-step solutions...",
        "Premium feature activated! I can now access advanced capabilities including detailed explanations, code optimization, and creative writing...",
        "Excellent! As a premium user, I can provide in-depth analysis with multiple perspectives and actionable insights..."
      ] : [
        "I can provide basic information, but for detailed analysis you'll need ChatGPT Premium access.",
        "This requires advanced reasoning capabilities available with a ChatGPT pass.",
        "Basic response: I can help with simple questions, but premium features are locked.",
        "For code generation and detailed explanations, please upgrade to ChatGPT Premium."
      ]

      const assistantMessage: Message = {
        id: Date.now() + 1,
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: 'assistant',
        timestamp: new Date(),
        isPremium: hasChatGPTPass
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!hasChatGPTPass) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold mb-4">ChatGPT Premium Required</h1>
          <p className="text-gray-400 mb-6">You need an active ChatGPT pass to access premium AI features including advanced reasoning, code generation, and detailed analysis.</p>
          <button className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold px-8 py-3 rounded-full">
            Get ChatGPT Pass
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">ChatGPT Premium</h1>
              <p className="text-sm opacity-90">Powered by FlexPass</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <span className="text-sm font-medium">✅ Premium Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-300" />
              <Sparkles className="w-5 h-5 text-blue-300" />
              <Zap className="w-5 h-5 text-green-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Premium Features */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="bg-purple-600 px-3 py-1 rounded-full">🧠 Advanced Reasoning</span>
            <span className="bg-blue-600 px-3 py-1 rounded-full">💻 Code Generation</span>
            <span className="bg-green-600 px-3 py-1 rounded-full">📊 Data Analysis</span>
            <span className="bg-yellow-600 px-3 py-1 rounded-full">✍️ Creative Writing</span>
            <span className="bg-red-600 px-3 py-1 rounded-full">🔍 Research Mode</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 mb-6 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'assistant' && (
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
              )}
              
              <div className={`max-w-3xl ${message.sender === 'user' ? 'order-1' : ''}`}>
                <div className={`p-4 rounded-2xl ${
                  message.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : message.isPremium 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                }`}>
                  {message.isPremium && message.sender === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 text-yellow-300">
                      <Crown className="w-4 h-4" />
                      <span className="text-xs font-medium">Premium Response</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.sender === 'assistant' && (
                      <button className="text-xs opacity-70 hover:opacity-100 flex items-center gap-1">
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {message.sender === 'user' && (
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6" />
                </div>
              )}
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 mb-6"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div className="bg-gray-700 p-4 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={hasChatGPTPass ? "Ask me anything... Premium features unlocked!" : "Ask a basic question..."}
                className="w-full bg-gray-700 text-white rounded-2xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={1}
                style={{ minHeight: '48px' }}
              />
              {hasChatGPTPass && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </div>
              )}
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-3 rounded-2xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
