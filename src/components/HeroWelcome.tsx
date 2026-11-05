import React, { useState, useEffect } from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'
import { UserProfile } from '../types'

interface HeroWelcomeProps {
  activeUser: UserProfile
}

export const HeroWelcome: React.FC<HeroWelcomeProps> = ({ activeUser }) => {
  const [scrollY, setScrollY] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // Track scroll position for live parallax split
  useEffect(() => {
    setIsMounted(true)

    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Extract display name: "Arshad" or "Raniya"
  const displayName = activeUser.name.includes('Arshad')
    ? 'Arshad'
    : activeUser.name.includes('Raniya')
    ? 'Raniya'
    : activeUser.name.split(' ')[0]

  // Calculate split translation and opacity based on scroll
  // As user scrolls down from 0 to 280px:
  // - "Welcome back" shifts LEFT
  // - Name shifts RIGHT
  const maxScroll = 260
  const progress = Math.min(1, Math.max(0, scrollY / maxScroll))

  const leftOffset = progress * 320 // pixels to shift left
  const rightOffset = progress * 320 // pixels to shift right
  const opacity = Math.max(0, 1 - progress * 1.35)
  const scale = 1 - progress * 0.08

  // Color accents based on user
  const isArshad = activeUser.name.includes('Arshad')
  const glowGradient = isArshad
    ? 'from-indigo-500/20 via-sky-500/15 to-transparent'
    : 'from-rose-500/20 via-pink-500/15 to-transparent'

  const nameGradient = isArshad
    ? 'from-indigo-600 via-indigo-500 to-amber-500 dark:from-indigo-400 dark:via-sky-300 dark:to-amber-300'
    : 'from-rose-600 via-pink-500 to-amber-500 dark:from-rose-400 dark:via-pink-300 dark:to-amber-300'

  return (
    <div className="relative w-full overflow-hidden pt-8 pb-10 sm:pt-14 sm:pb-16 flex flex-col items-center justify-center text-center select-none pointer-events-none">
      
      {/* Ambient background glowing aura */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[560px] h-[220px] bg-gradient-to-r ${glowGradient} rounded-full blur-3xl opacity-75 dark:opacity-50 transition-all duration-700`}
        style={{
          transform: `translate(-50%, -50%) scale(${1 - progress * 0.4})`,
          opacity: Math.max(0, (1 - progress) * 0.7)
        }}
      />

      {/* Pill Badge */}
      <div 
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 backdrop-blur-md shadow-xs mb-5 transition-all duration-300 ${
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
        }`}
        style={{
          opacity: Math.max(0, 1 - progress * 2),
          transform: `translateY(-${progress * 40}px)`
        }}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          AURA Study Workspace • {activeUser.role}
        </span>
      </div>

      {/* Cinematic Split Typography Container */}
      <div 
        className={`relative flex flex-col items-center justify-center transition-transform duration-75 will-change-transform ${
          isMounted ? 'animate-hero-reveal' : 'opacity-0 scale-95'
        }`}
        style={{
          opacity,
          transform: `scale(${scale})`
        }}
      >
        {/* Line 1: "Welcome back" (Shifts LEFT on scroll) */}
        <div
          className="will-change-transform transition-transform duration-75 tracking-tight font-serif font-bold text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-stone-900 dark:text-stone-100 leading-none drop-shadow-xs"
          style={{
            transform: `translateX(-${leftOffset}px)`
          }}
        >
          Welcome back
        </div>

        {/* Line 2: Name ("Arshad" or "Raniya") (Shifts RIGHT on scroll) */}
        <div
          className="will-change-transform transition-transform duration-75 tracking-tight font-serif font-extrabold text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-none mt-1 sm:mt-2 bg-gradient-to-r bg-clip-text text-transparent pb-2"
          style={{
            backgroundImage: undefined, // handled by classes below
            transform: `translateX(${rightOffset}px)`
          }}
        >
          <span className={`bg-gradient-to-r ${nameGradient} bg-clip-text text-transparent`}>
            {displayName}
          </span>
        </div>
      </div>

      {/* Scroll indicator prompt */}
      <div 
        className="mt-6 flex flex-col items-center gap-1 text-[11px] font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500 transition-all duration-200"
        style={{
          opacity: Math.max(0, 1 - progress * 2.5),
          transform: `translateY(${progress * 20}px)`
        }}
      >
        <span>Scroll to open notebooks</span>
        <ChevronDown className="w-4 h-4 animate-bounce text-stone-400" />
      </div>

    </div>
  )
}
