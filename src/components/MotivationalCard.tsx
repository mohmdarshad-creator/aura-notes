import React, { useState, useEffect } from 'react'
import { Sparkles, Quote, RotateCw, Copy, Check, X } from 'lucide-react'
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

  // 30-Second Vanish State
  const DURATION = 30
  const [timeLeft, setTimeLeft] = useState<number>(DURATION)
  const [isPaused, setIsPaused] = useState(false)
  const [isVanishing, setIsVanishing] = useState(false)
  const [isVanished, setIsVanished] = useState(false)

  // Trigger vanishing sequence
  const handleStartVanish = () => {
    if (isVanishing || isVanished) return
    setIsVanishing(true)
    setTimeout(() => {
      setIsVanished(true)
      setIsVanishing(false)
    }, 850)
  }

  // Countdown timer with 100ms ticks for fluid progress
  useEffect(() => {
    if (isVanished || isVanishing) return

    const timer = setInterval(() => {
      if (!isPaused) {
        setTimeLeft((prev) => {
          const next = prev - 0.1
          if (next <= 0) {
            return 0
          }
          return parseFloat(next.toFixed(1))
        })
      }
    }, 100)

    return () => clearInterval(timer)
  }, [isPaused, isVanished, isVanishing])

  // Watch for timer reaching zero to trigger graceful vanish
  useEffect(() => {
    if (timeLeft <= 0 && !isVanishing && !isVanished) {
      handleStartVanish()
    }
  }, [timeLeft, isVanishing, isVanished])

  // Restore the card with a fresh 30-second timer
  const handleRestore = () => {
    setTimeLeft(DURATION)
    setIsVanished(false)
    setIsVanishing(false)
  }

  // Shuffle to another quote with a subtle transition and timer reset
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
      // Reset 30s timer for the newly shuffled spark
      setTimeLeft(DURATION)
    }, 180)
  }

  const handleCopy = () => {
    const textToCopy = `"${currentQuote.text}" — ${currentQuote.author}`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // When vanished, render a discreet, luxury restore pill
  if (isVanished) {
    return (
      <div className="flex items-center justify-start py-0.5 animate-fade-in">
        <button
          type="button"
          onClick={handleRestore}
          className="spark-restore-pill group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md"
          title="Show Daily Spark motivation"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
          <span className="font-serif italic font-medium">Daily Spark</span>
          <span className="text-[10px] opacity-60 font-mono">30s</span>
        </button>
      </div>
    )
  }

  const progressPercent = Math.max(0, Math.min(100, (timeLeft / DURATION) * 100))

  return (
    <div 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`motivational-spark-card group relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-300 shadow-sm border ${
        isVanishing ? 'is-vanishing' : 'animate-spark-card-entrance hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      {/* Top Hairline Luxury Shimmer Beam */}
      <div className="spark-card-shimmer-line" />

      {/* Ambient background glow & radial gradient */}
      <div className="card-ambient-glow absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-40 transition-opacity group-hover:opacity-60" />
      <div className="card-ambient-glow-left absolute -bottom-16 -left-16 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-20" />

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

        {/* Right Side: Interactive Actions & Timer */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-shrink-0 self-end md:self-center border-t md:border-t-0 pt-2.5 md:pt-0 w-full md:w-auto quote-action-bar">
          
          {/* Subtle Live Countdown / Daily Spark Badge */}
          <span 
            className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium quote-daily-pill px-2.5 py-1 rounded-lg select-none"
            title={isPaused ? "Timer paused while hovering" : `${Math.ceil(timeLeft)}s until spark vanishes`}
          >
            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse flex-shrink-0" />
            <span className="hidden sm:inline">Daily Spark</span>
            <span className="opacity-40 hidden sm:inline">•</span>
            <span className="tabular-nums font-semibold">
              {isPaused ? 'Paused' : `${Math.ceil(timeLeft)}s`}
            </span>
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

          {/* Dismiss / Close (X) Button */}
          <button
            type="button"
            onClick={handleStartVanish}
            className="quote-action-btn p-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer flex items-center justify-center opacity-70 hover:opacity-100"
            title="Dismiss daily spark"
          >
            <X className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

      {/* 30-Second Vanish Hairline Progress Indicator at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-stone-200/40 dark:bg-stone-800/40 overflow-hidden pointer-events-none">
        <div 
          className="h-full spark-progress-bar transition-[width] duration-100 ease-linear rounded-r-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

    </div>
  )
}
