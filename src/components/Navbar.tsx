import React, { useState, useRef, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Settings, 
  BookMarked,
  X,
  HardDrive
} from 'lucide-react'
import { UserSwitcher } from './UserSwitcher'
import { UserProfile, Note } from '../types'
import { storageService } from '../services/storageService'

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
  const [isSettingsHovered, setIsSettingsHovered] = useState(false)
  const [isNewNoteHovered, setIsNewNoteHovered] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const isSearchExpanded = isSearchHovered || isSearchFocused || Boolean(searchQuery.trim())

  const storageStats = storageService.getStorageStats(notes)

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* LEFT GROUP: AURANotes Logo at the far left + Search extending to the right */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          
          {/* Brand / Logo (End Left) */}
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
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

          {/* Search Button moved to the left, extends smoothly to the right */}
          <div 
            className="relative flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className={`group flex items-center relative overflow-hidden transition-all duration-300 ease-out rounded-xl border origin-left ${
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
                title="Search notes, doubts, #tags, or topics (Hover or click to extend right)"
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

              {/* Clear Button */}
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

        </div>

        {/* RIGHT GROUP: New Note, User Switcher, and Settings at the right most end */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* New Note Button: Bubble that expands on cursor hover to reveal 'New Note' with glowing aura outline */}
          <div
            className="relative flex items-center group animate-bubble-spring"
            onMouseEnter={() => setIsNewNoteHovered(true)}
            onMouseLeave={() => setIsNewNoteHovered(false)}
          >
            {/* Glowing outline matching the aura behind the welcome name page */}
            <div 
              className={`absolute -inset-[1.5px] rounded-full bg-gradient-to-r ${activeUser?.avatarGradient || 'from-indigo-500 via-sky-500 to-amber-400'} transition-all duration-300 pointer-events-none ${
                isNewNoteHovered 
                  ? 'opacity-100 blur-[4px] scale-105' 
                  : 'opacity-70 blur-[2.5px] animate-pulse'
              }`}
            />

            <button
              type="button"
              onClick={onNewNote}
              className={`relative group flex items-center justify-center h-9 sm:h-10 rounded-full bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 shadow-sm hover:shadow-lg transition-all duration-300 ease-out cursor-pointer active:scale-95 border border-white/20 dark:border-stone-800/40 ${
                isNewNoteHovered
                  ? 'px-3.5 gap-1.5'
                  : 'w-9 sm:w-10 px-0 group-hover:w-auto group-hover:px-3.5 group-hover:gap-1.5'
              }`}
              title="Create New Note"
            >
              <Plus className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isNewNoteHovered ? 'rotate-90 scale-105' : 'group-hover:rotate-90'}`} />
              
              <span className={`overflow-hidden whitespace-nowrap text-xs sm:text-sm font-semibold transition-all duration-300 ease-out ${
                isNewNoteHovered 
                  ? 'max-w-[120px] opacity-100' 
                  : 'max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100'
              }`}>
                New Note
              </span>
            </button>
          </div>

          {/* User Profile Switcher */}
          <UserSwitcher
            users={users}
            activeUser={activeUser}
            onSelectUser={onSelectUser}
            notes={notes}
            onOpenSettings={onOpenSettings}
          />

          {/* Settings Button: Right Most End with noticeable Storage details on touch/hover */}
          <div 
            className="relative"
            onMouseEnter={() => setIsSettingsHovered(true)}
            onMouseLeave={() => setIsSettingsHovered(false)}
          >
            <button
              onClick={onOpenSettings}
              className={`p-2 rounded-xl transition-all relative ${
                isSettingsHovered 
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 shadow-xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
              title={`Settings > Storage (${storageStats.notesCount} notes • ${storageStats.usedFormatted} / ${storageStats.totalCapacity})`}
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Storage popover visible when touching/hovering the settings button */}
            {isSettingsHovered && (
              <div className="absolute right-0 top-12 z-50 w-64 p-3.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xl pointer-events-none animate-fade-in text-left">
                <div className="flex items-center justify-between text-xs font-bold text-stone-900 dark:text-stone-100 mb-2">
                  <span className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                    Settings &gt; Storage
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-semibold">
                    {storageStats.percentUsed}%
                  </span>
                </div>
                
                <div className="text-[11px] text-stone-600 dark:text-stone-300 mb-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Total Capacity:</span>
                    <strong className="font-mono text-stone-800 dark:text-stone-200">{storageStats.totalCapacity}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Files Stored:</span>
                    <strong className="font-mono text-indigo-600 dark:text-indigo-400">{storageStats.notesCount} Notes</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Used Space:</span>
                    <strong className="font-mono text-stone-800 dark:text-stone-200">{storageStats.usedFormatted}</strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden mb-1.5">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full"
                    style={{ width: `${Math.max(4, storageStats.percentUsed)}%` }}
                  />
                </div>

                <div className="text-[10px] text-stone-400 text-center font-mono">
                  Click to open full Storage manager
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}

