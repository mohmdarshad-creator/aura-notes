import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  Sparkles, 
  Send, 
  X, 
  Trash2, 
  Copy, 
  Check, 
  PlusSquare, 
  FileText, 
  Paperclip, 
  AlertCircle, 
  KeyRound,
  ExternalLink,
  Bot,
  User,
  ArrowRight,
  BookOpen
} from 'lucide-react'
import { Note, DoubtMessage, UserProfile } from '../types'
import { geminiService } from '../services/geminiService'
import { storageService } from '../services/storageService'

interface GeminiDrawerProps {
  isOpen: boolean
  onClose: () => void
  activeNote: Note | null
  notes?: Note[]
  activeUser?: UserProfile
  onAppendToNote: (text: string) => void
  onSaveAsNewNote: (title: string, content: string) => void
  onOpenSettings: () => void
  initialPrompt?: string
}

export const GeminiDrawer: React.FC<GeminiDrawerProps> = ({
  isOpen,
  onClose,
  activeNote,
  notes = [],
  activeUser,
  onAppendToNote,
  onSaveAsNewNote,
  onOpenSettings,
  initialPrompt
}) => {
  const [messages, setMessages] = useState<DoubtMessage[]>(() => storageService.getChatHistory(activeUser?.id))
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [useNoteContext, setUseNoteContext] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [actionNotice, setActionNotice] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const hasApiKey = geminiService.hasApiKey()

  // Reload history when active user changes
  useEffect(() => {
    if (activeUser?.id) {
      setMessages(storageService.getChatHistory(activeUser.id))
    }
  }, [activeUser?.id])

  useEffect(() => {
    if (activeUser?.id) {
      storageService.saveChatHistory(activeUser.id, messages)
    }
  }, [messages, activeUser?.id])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, messages])

  // Handle initialPrompt triggered from a note
  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInput(initialPrompt)
    }
  }, [initialPrompt, isOpen])

  const showToast = (msg: string) => {
    setActionNotice(msg)
    setTimeout(() => setActionNotice(null), 3000)
  }

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim()
    if (!textToSend || isLoading) return

    const userMessage: DoubtMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
      attachedNoteId: useNoteContext && activeNote ? activeNote.id : undefined,
      attachedNoteTitle: useNoteContext && activeNote ? activeNote.title : undefined,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      const noteToAttach = (useNoteContext && activeNote) ? activeNote : null

      const responseText = await geminiService.askGemini({
        prompt: textToSend,
        noteContext: noteToAttach,
        allNotes: notes,
        conversationHistory: history,
      })

      const assistantMessage: DoubtMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
        attachedNoteId: noteToAttach?.id,
        attachedNoteTitle: noteToAttach?.title,
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err: any) {
      const errorMessage: DoubtMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `⚠️ **Error clearing doubt**: ${err.message || 'Something went wrong.'}\n\nPlease check your internet connection or verify your Gemini API key in **Settings**.`,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleAppend = (text: string) => {
    onAppendToNote(`\n\n### 💡 Gemini Doubt Clarification\n${text}\n`)
    showToast('Appended to active note!')
  }

  const handleSaveAsNew = (text: string) => {
    const titleMatch = text.match(/###\s+(.*)/) || text.match(/\*\*(.*?)\*\*/)
    const generatedTitle = titleMatch ? titleMatch[1].slice(0, 50) : `Gemini Doubt Note: ${new Date().toLocaleDateString()}`
    onSaveAsNewNote(generatedTitle, text)
    showToast('Saved as a brand new note!')
  }

  const handleClearHistory = () => {
    if (confirm('Clear entire doubt chat history?')) {
      setMessages([])
      storageService.clearChatHistory(activeUser?.id || 'default')
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Semi-transparent backdrop blur overlay with fade-in */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] animate-backdrop-fade-in"
      />

      {/* Side Drawer with Elastic Pop-In Animation */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] md:w-[540px] bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col animate-drawer-pop-in">
      
      {/* Drawer Header */}
      <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3 bg-stone-50/70 dark:bg-stone-900/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-indigo-500 to-indigo-600 p-[1px]">
            <div className="w-full h-full bg-white dark:bg-stone-900 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              Gemini Doubt Solver
              <span className="text-[10px] font-mono uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.2 rounded font-semibold">
                2.5 Flash
              </span>
            </h2>
            <p className="text-[11px] text-stone-400">
              Personalized for {activeUser?.name || 'Student'} • Clear concepts & doubts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Knowledge Base Status Bar: Reading all uploaded notes and files */}
      <div className="px-4 py-2 bg-indigo-50/60 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate pr-2">
          <BookOpen className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
          <span className="text-stone-500 dark:text-stone-400">Library Knowledge:</span>
          <span className="font-semibold text-indigo-700 dark:text-indigo-300">
            {notes.length} {notes.length === 1 ? 'note' : 'notes & files'} indexed
          </span>
          {activeNote && useNoteContext && (
            <span className="hidden sm:inline text-stone-400 truncate">
              • Focused on "{activeNote.title}"
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/50 flex items-center gap-1 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Auto-Reading
        </span>
      </div>

      {/* Active Note Specific Context Bar if open */}
      {activeNote && (
        <div className="px-4 py-1.5 bg-stone-100/60 dark:bg-stone-800/50 border-b border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate pr-2">
            <Paperclip className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span className="text-stone-400">Primary Focus:</span>
            <span className="font-medium text-stone-800 dark:text-stone-200 truncate">
              {activeNote.title || 'Untitled Note'}
            </span>
          </div>
          <button
            onClick={() => setUseNoteContext(!useNoteContext)}
            className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${
              useNoteContext
                ? 'bg-indigo-600 text-white'
                : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
            }`}
          >
            {useNoteContext ? 'Priority' : 'Normal'}
          </button>
        </div>
      )}

      {/* API Key Banner (If Not Configured) */}
      {!hasApiKey && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-2.5 text-xs">
          <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              Running in Interactive Demo Mode
            </p>
            <p className="text-amber-700 dark:text-amber-300 mt-0.5">
              Add your free Google Gemini API Key in Settings to get unlimited live responses.
            </p>
            <button
              onClick={onOpenSettings}
              className="mt-2 inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Open Settings & Add Key <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="mx-4 mt-2 p-2 rounded-xl bg-emerald-500 text-white text-xs font-medium text-center shadow-md animate-fade-in">
          {actionNotice}
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-700 dark:text-stone-200 text-base">
                Ask any doubt or question
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                {activeNote
                  ? `Ask Gemini to clarify, summarize, or quiz you on "${activeNote.title}"`
                  : 'Get crystal-clear explanations, math derivations, and analogies.'}
              </p>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="grid grid-cols-1 gap-2 w-full pt-4 text-left">
              {[
                { title: 'Explain simply with an analogy', prompt: 'Can you explain the core concepts of this note simply, with a great everyday analogy?' },
                { title: 'Quiz me: 3 practice questions', prompt: 'Create 3 active-recall practice questions based on this note, with answers.' },
                { title: 'Find flaws or gaps in understanding', prompt: 'Critique this note. Are there any misconceptions or missing foundational ideas?' },
                { title: 'Summarize into key flashcards', prompt: 'Give me 3-4 bullet-point flashcard summaries of this note.' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  className="p-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800/70 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-stone-200/60 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-medium transition-all text-left flex items-center justify-between group"
                >
                  <span>💡 {item.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-indigo-600 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Context tag on user message */}
              {msg.attachedNoteTitle && msg.role === 'user' && (
                <span className="text-[10px] text-stone-400 mb-1 px-1 flex items-center gap-1">
                  <Paperclip className="w-2.5 h-2.5" /> Re: {msg.attachedNoteTitle}
                </span>
              )}

              <div
                className={`max-w-[90%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-br-xs shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700/60 text-stone-800 dark:text-stone-100 rounded-bl-xs shadow-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>

              {/* Action Buttons for AI responses */}
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mt-1.5 px-1">
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="p-1 rounded-md text-[11px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1 transition-colors"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                  </button>

                  {activeNote && (
                    <button
                      onClick={() => handleAppend(msg.content)}
                      className="p-1 rounded-md text-[11px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-1 transition-colors"
                      title="Append this solution to the active note"
                    >
                      <PlusSquare className="w-3 h-3" />
                      <span>Append to note</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleSaveAsNew(msg.content)}
                    className="p-1 rounded-md text-[11px] text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1 transition-colors"
                    title="Save as a new standalone note"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Save as note</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 text-xs text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/50 rounded-2xl w-fit animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
            <span>Gemini is thinking and drafting your answer...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
        <div className="relative rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeNote && useNoteContext ? `Ask doubt about "${activeNote.title}"...` : "Ask any doubt or topic..."}
            rows={2}
            className="w-full p-3 pr-12 text-sm bg-transparent border-none outline-none resize-none text-stone-800 dark:text-stone-100 placeholder:text-stone-400"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`absolute right-2.5 bottom-2.5 p-2 rounded-xl transition-all ${
              input.trim() && !isLoading
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                : 'text-stone-300 dark:text-stone-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-stone-400">
          <span>Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for newline</span>
          <span>Powered by Gemini</span>
        </div>
      </div>

    </div>
    </>
  )
}

