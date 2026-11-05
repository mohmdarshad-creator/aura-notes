import React, { useState, useRef, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Settings, 
  BookMarked,
  X
} from 'lucide-react'
import { UserSwitcher } from './UserSwitcher'
import { UserProfile, Note } from '../types'

interface NavbarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  onNewNote: () => void
  onOpenSettings: () => void
  onNavigateHome: () => void
  isAtHome?: boolean
  users: UserProfile[]
  activeUser: UserProfile
  onSelectUser: (user: UserProfile) => void
  notes: Note[]
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onNewNote,
  onOpenSettings,
  onNavigateHome,
  users,
  activeUser,
  onSelectUser,
  notes
}) => {
  const [isSearchHovered, setIsSearchHovered] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const isSearchExpanded = isSearchHovered || isSearchFocused || Boolean(searchQuery.trim())

  const handleMouseEnter = () => {
    setIsSearchHovered(true)
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 40)
  }

  const handleMouseLeave = () => {
    setIsSearchHovered(false)
  }

  // Auto-hide taskbar on scroll down, show when scrolled back from any screen
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          // At the very top, always show taskbar
          if (currentScrollY <= 15) {
            setIsNavbarVisible(true)
          } else if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
            // Scrolling DOWN -> automatically hide taskbar
            setIsNavbarVisible(false)
          } else if (currentScrollY < lastScrollY.current) {
            // Scrolled BACK (scrolling up) from any screen -> make taskbar visible
            setIsNavbarVisible(true)
          }
          lastScrollY.current = currentScrollY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-30 border-b border-stone-200/80 dark:border-stone-800/80 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md transition-all duration-300 ease-in-out ${
      isNavbarVisible ? 'translate-y-0 opacity-100 shadow-xs' : '-translate-y-full opacity-0 pointer-events-none'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 p-[1px] shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-stone-900 rounded-[11px] flex items-center justify-center">
                <BookMarked className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="font-serif font-bold text-xl tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                AURA<span className="text-indigo-600 dark:text-indigo-400 font-sans text-xs uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 font-semibold">Notes</span>
              </span>
            </div>
          </div>
        </div>

        {/* Expandable Search Button & Bar */}
        <div 
          className="relative flex items-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={`group flex items-center relative overflow-hidden transition-all duration-300 ease-out rounded-xl border ${
              isSearchExpanded
                ? 'w-64 sm:w-80 md:w-96 bg-white dark:bg-stone-900 border-indigo-400 dark:border-indigo-500 shadow-md ring-2 ring-indigo-400/20 dark:ring-indigo-500/20'
                : 'w-10 h-10 bg-stone-100/90 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700/80 border-stone-200/80 dark:border-stone-700/70 shadow-xs cursor-pointer'
            }`}
          >
            {/* Search Icon / Button Trigger */}
            <button
              type="button"
              onClick={() => {
                setIsSearchFocused(true)
                searchInputRef.current?.focus()
              }}
              className={`w-10 h-10 flex items-center justify-center flex-shrink-0 text-stone-500 dark:text-stone-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
                isSearchExpanded ? 'pointer-events-none' : 'cursor-pointer'
              }`}
              title="Search notes, doubts, #tags, or topics (Hover or click to extend)"
            >
              <Search className={`w-4 h-4 transition-transform duration-200 ${isSearchExpanded ? 'text-indigo-500 scale-105' : 'group-hover:scale-110'}`} />
            </button>

            {/* Extended Input Field */}
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  searchInputRef.current?.blur()
                }
              }}
              placeholder="Search notes, doubts, #tags, or topics..."
              className={`w-full pr-8 py-2 text-sm bg-transparent outline-none placeholder:text-stone-400 text-stone-900 dark:text-stone-100 transition-opacity duration-200 ${
                isSearchExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none w-0'
              }`}
              tabIndex={isSearchExpanded ? 0 : -1}
            />

            {/* Clear Button (Visible when text entered) */}
            {isSearchExpanded && searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSearchChange('')
                  searchInputRef.current?.focus()
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* New Note Button */}
          <button
            onClick={onNewNote}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>

          {/* User Profile Switcher */}
          <UserSwitcher
            users={users}
            activeUser={activeUser}
            onSelectUser={onSelectUser}
            notes={notes}
            onOpenSettings={onOpenSettings}
          />

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Settings & Appearance"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  )
}

