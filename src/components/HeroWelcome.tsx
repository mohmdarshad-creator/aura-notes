import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'
import { UserProfile } from '../types'

interface HeroWelcomeProps {
  activeUser: UserProfile
}

export const HeroWelcome: React.FC<HeroWelcomeProps> = ({ activeUser }) => {
  const [scrollY, setScrollY] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [heroCycleKey, setHeroCycleKey] = useState(0)
  const hasScrolledAway = useRef(false)

  // Track scroll position for live parallax split
  useEffect(() => {
    setIsMounted(true)
    setScrollY(window.scrollY)

    let ticking = false
    const handleScroll = () => {
      const currentY = window.scrollY
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(currentY)

          // When scrolled down past hero (200px), mark as scrolled away
          if (currentY > 200) {
            hasScrolledAway.current = true
          } 
          // When scrolled back up to top, re-trigger the entrance animations once more!
          else if (currentY <= 5 && hasScrolledAway.current) {
            hasScrolledAway.current = false
            setHeroCycleKey(k => k + 1)
          }

          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeUser.id])

  // Extract display name: works universally for all existing, upcoming and newly created users
  const getDisplayName = (user: UserProfile) => {
    if (!user || !user.name) return 'Scholar'
    if (user.name.includes('Arshad')) return 'Arshad'
    if (user.name.includes('Raniya')) return 'Raniya'
    const parts = user.name.trim().split(/\s+/)
    if (parts.length > 1 && /^(dr\.|prof\.|mr\.|ms\.|mrs\.)/i.test(parts[0])) {
      return parts[1]
    }
    return parts[0] || user.name
  }

  const displayName = getDisplayName(activeUser)

  // Calculate dynamic parallax float, scale, split translation and opacity based on scroll
  // When scrolled down as in the earliest animation:
  // - "Welcome back" shifts LEFT
  // - Name shifts RIGHT
  const maxScroll = 260
  const progress = Math.min(1, Math.max(0, scrollY / maxScroll))

  const leftOffset = progress * 320 // pixels "Welcome back" shifts left on scroll
  const rightOffset = progress * 320 // pixels Name shifts right on scroll
  const floatY = progress * 65 // Smoothly floats upward as you scroll
  const opacity = Math.max(0, 1 - progress * 1.35)
  const scale = 1 - progress * 0.1

  // Color accents based on active user's gradient
  const glowGradient = activeUser.avatarGradient || 'from-indigo-500 via-sky-500 to-amber-400'
  const nameGradient = activeUser.avatarGradient || 'from-indigo-600 via-indigo-500 to-amber-500'

  return (
    <div className="relative w-full overflow-hidden pt-8 pb-10 sm:pt-14 sm:pb-16 flex flex-col items-center justify-center text-center select-none pointer-events-none">
      
      {/* Ambient background glowing aura with breathing pulse animation */}
      <div 
        className={`animate-aura-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[560px] h-[220px] bg-gradient-to-r ${glowGradient} rounded-full blur-3xl opacity-75 dark:opacity-50 transition-all duration-700`}
        style={{
          transform: `translate(-50%, -50%) translateY(-${floatY * 0.4}px) scale(${1 - progress * 0.4})`,
          opacity: Math.max(0, (1 - progress) * 0.8)
        }}
      />

      {/* Pill Badge */}
      <div 
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 backdrop-blur-md shadow-xs mb-5 transition-all duration-300 ${
          isMounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-3 scale-95'
        }`}
        style={{
          opacity: Math.max(0, 1 - progress * 2),
          transform: `translateY(-${progress * 40}px)`
        }}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          AURA Study Workspace • {activeUser.role}
        </span>
      </div>

      {/* Cinematic Split Typography Container: Dynamic Parallax Motion */}
      <div 
        key={heroCycleKey}
        className={`relative flex flex-col items-center justify-center transition-transform duration-75 will-change-transform ${
          isMounted ? 'animate-hero-reveal' : 'opacity-0 scale-95'
        }`}
        style={{
          opacity,
          transform: `translateY(-${floatY}px) scale(${scale})`
        }}
      >
        {/* Line 1: "Welcome back" (Shifts LEFT on scroll & reveals with leftward slide) */}
        <div 
          className="will-change-transform transition-transform duration-75"
          style={{
            transform: `translateX(-${leftOffset}px)`
          }}
        >
          <div className="tracking-tight font-serif font-bold text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-stone-900 dark:text-stone-100 leading-none drop-shadow-xs animate-welcome-slide-left">
            Welcome back
          </div>
        </div>

        {/* Line 2: Name ("Arshad" or "Raniya") (Shifts RIGHT on scroll & pops rightward with continuous shimmer) */}
        <div 
          className="will-change-transform transition-transform duration-75"
          style={{
            transform: `translateX(${rightOffset}px)`
          }}
        >
          <div className="tracking-tight font-serif font-extrabold text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-none mt-1 sm:mt-2 pb-2 animate-name-pop-right">
            <span className={`bg-gradient-to-r ${nameGradient} bg-clip-text text-transparent animate-name-shimmer inline-block`}>
              {displayName}
            </span>
          </div>
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
