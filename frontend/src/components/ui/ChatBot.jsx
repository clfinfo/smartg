import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi'

const QUICK_REPLIES = ['How to report an issue?', 'Check complaint status', 'Earn reward points', 'Contact municipality']

const BOT_RESPONSES = {
  'how to report an issue?': 'Click "Report Issue" in the sidebar. Open your camera, capture a photo, and our AI will auto-detect the issue type. Then fill in the details and submit! You\'ll earn 50 points per report. 🎯',
  'check complaint status': 'Go to "My Complaints" in the sidebar to track all your submitted reports. You can see real-time status updates (Pending → In Progress → Resolved). 📋',
  'earn reward points': 'Earn points by: submitting reports (+50), having complaints resolved (+100), achieving milestones (+500). Climb from Bronze → Silver → Gold → Diamond citizen! 🏆',
  'contact municipality': 'You can contact the Bengaluru municipality at: 📞 1800-425-0500 | 📧 bbmp@karnataka.gov.in | Or use the app to submit your complaint directly. 📝',
}

const ChatBot = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hi! 👋 I\'m your EcoSmart AI Assistant. How can I help you today?', time: 'now' }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { from: 'user', text: msg, time: 'now' }])
    setTyping(true)
    await new Promise(r => setTimeout(r, 1000))
    const response = BOT_RESPONSES[msg.toLowerCase()] || 'I\'m here to help with EcoSmart City! Try asking about reporting issues, checking complaint status, or earning rewards. 🌿'
    setMessages(prev => [...prev, { from: 'bot', text: response, time: 'now' }])
    setTyping(false)
  }

  return (
    <>
      {/* Chat button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 md:bottom-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-emerald-500 flex items-center justify-center shadow-glow-lg z-40 chat-icon"
      >
        {open ? <FiX className="text-white text-xl" /> : <FiMessageCircle className="text-white text-xl" />}
        {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">1</span>}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-44 md:bottom-24 right-6 w-80 glass border border-primary-500/20 rounded-2xl z-40 overflow-hidden shadow-glow-lg"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-900/80 to-dark-700 p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-600/30 flex items-center justify-center text-xl">🤖</div>
                <div>
                  <p className="text-white font-semibold text-sm">EcoSmart AI Assistant</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                    <span className="text-primary-400 text-xs">Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="p-3 space-y-3 h-56 overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${m.from === 'user' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white/10 text-gray-200 rounded-bl-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1">
                    {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                  </div>
                </div>
              )}
            </div>

            {/* Quick replies */}
            <div className="px-3 pb-2 flex gap-1 flex-wrap">
              {QUICK_REPLIES.map(r => (
                <button key={r} onClick={() => sendMessage(r)} className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:bg-primary-600/20 hover:border-primary-500/30 hover:text-primary-400 transition-all">
                  {r}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 pt-0 flex gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-primary-500" />
              <button onClick={() => sendMessage()} className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center hover:bg-primary-500 transition-colors flex-shrink-0">
                <FiSend size={14} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatBot
