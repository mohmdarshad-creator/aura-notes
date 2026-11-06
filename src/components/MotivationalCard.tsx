import React, { useState, useEffect } from 'react'
import { Sparkles, Quote, RotateCw, Copy, Check } from 'lucide-react'
import { MOTIVATIONAL_QUOTES, MotivationalQuote } from '../data/motivationalQuotes'

export const MotivationalCard: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<MotivationalQuote>(() => {
    // Pick a quote on initial render / page reload avoiding immediate duplicate
    if (typeof window === 'undefined') return MOTIVATIONAL_QUOTES[0]
    try {
      const lastIdStr = localStorage.getItem('aura_last_quote_id')
      const lastId = lastIdStr ? parseInt(lastIdStr, 10) : -1
      
      const available = MOTIVATIONAL_QUOTES.filter(q => q.id !== lastId)
      const picked = available.length > 0 
        ? available[Math.floor(Math.random() * available.length)] 
        : MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
      
      localStorage.setItem('aura_last_quote_id', picked.id.toString())
      return picked
    } catch {
      return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
    }
  })

  const [isAnimating, setIsAnimating] = useState(false)
  const [copied, setCopied] = useState(false)

  // Shuffle to another quote with a subtle transition
  const handleShuffle = () => {
    setIsAnimating(true)
    setTimeout(() => {
      const nextQuotes = MOTIVATIONAL_QUOTES.filter(q => q.id !== currentQuote.id)
      const next = nextQuotes[Math.floor(Math.random() * nextQuotes.length)]
      setCurrentQuote(next)
      try {
        localStorage.setItem('aura_last_quote_id', next.id.toString())
      } catch {
        // ignore
      }
      setIsAnimating(false)
    }, 180)
  }

  const handleCopy = () => {
    const textToCopy = `"${currentQuote.text}" — ${currentQuote.author}`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="motivational-spark-card animate-levitate-slow group relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.01] border">
      
      {/* Ambient background glow & radial gradient */}
      <div className="card-ambient-glow absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 transition-opacity group-hover:opacity-60" />
      <div className="card-ambient-glow-left absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Quote Icon & 1-to-2 Line Words */}
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
          
          {/* Glowing Quote Icon Container */}
          <div className="quote-icon-badge w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-300 shadow-xs">
            <Quote className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" />
          </div>

          {/* Quote & Attribution (strictly max 2 lines) */}
          <div className="flex-1 min-w-0 space-y-1">
            <div 
              className={`transition-all duration-200 ${
                isAnimating ? 'opacity-0 translate-y-1 scale-[0.99]' : 'opacity-100 translate-y-0 scale-100'
              }`}
            >
              <p className="quote-text font-serif italic text-sm sm:text-base md:text-lg leading-snug line-clamp-2 select-text tracking-normal">
                "{currentQuote.text}"
              </p>
              
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="quote-author font-sans text-xs font-semibold tracking-wide flex items-center gap-1.5">
                  <span className="quote-dash opacity-60">—</span>
                  <span>{currentQuote.author}</span>
                </span>

                {currentQuote.tag && (
                  <span className="quote-tag text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border">
                    {currentQuote.tag}
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Interactive Actions (Shuffle & Copy) */}
        <div className="flex items-center justify-end gap-2 flex-shrink-0 self-end md:self-center border-t md:border-t-0 pt-2.5 md:pt-0 w-full md:w-auto quote-action-bar">
          
          {/* Subtle Label / Daily Spark Badge */}
          <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-mono font-semibold uppercase tracking-wider quote-daily-pill px-2.5 py-1 rounded-lg">
            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            <span>Daily Spark #{currentQuote.id}</span>
          </span>

          {/* Copy Quote Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="quote-action-btn p-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1"
            title="Copy quote"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[11px] text-emerald-600 font-semibold">Copied</span>
              </>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Shuffle to Next Quote Button */}
          <button
            type="button"
            onClick={handleShuffle}
            disabled={isAnimating}
            className="quote-action-btn p-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5"
            title="Shuffle another motivational quote"
          >
            <RotateCw className={`w-3.5 h-3.5 transition-transform duration-300 ${isAnimating ? 'rotate-180 text-amber-500' : ''}`} />
            <span className="text-[11px] font-semibold hidden sm:inline">New Spark</span>
          </button>

        </div>

      </div>

    </div>
  )
}

