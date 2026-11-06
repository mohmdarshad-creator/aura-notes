import React, { useState, useRef, useEffect } from 'react'
import { Sparkles, Plus, Home, Settings, Moon, Sun, Check, Users } from 'lucide-react'
import { UserProfile } from '../types'

interface FloatingBarProps {
  onOpenGemini: () => void
  onNewNote: () => void
  onNavigateHome?: () => void
  isAtHome?: boolean
  isGeminiDrawerOpen?: boolean
  isGeminiConfigured?: boolean
  activeUser?: UserProfile
  users?: UserProfile[]
  onSelectUser?: (user: UserProfile) => void
  theme?: string
  onToggleTheme?: () => void
  onOpenSettings?: () => void
}

export const FloatingBar: React.FC<FloatingBarProps> = ({
  onOpenGemini,
  onNewNote,
  onNavigateHome,
  isAtHome = true,
  isGeminiDrawerOpen = false,
  isGeminiConfigured = true,
  activeUser,
  users,
  onSelectUser,
  theme,
  onToggleTheme,
  onOpenSettings
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNoteHovered, setIsNoteHovered] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Glow gradient matching the aura behind the welcome name page
  const auraGradient = activeUser?.avatarGradient || 'from-indigo-500 via-sky-500 to-amber-400'

  // Outside click to close user menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Global shortcut Cmd+K or Ctrl+K to toggle Gemini AI
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpenGemini()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onOpenGemini])

  return (
    <aside 
      aria-label="Quick Actions Floating Bar"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-out select-none ${
        isGeminiDrawerOpen 
          ? 'opacity-0 translate-y-12 pointer-events-none' 
          : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-full bg-white/85 dark:bg-stone-900/85 backdrop-blur-xl border border-stone-200/80 dark:border-stone-700/80 shadow-2xl hover:shadow-indigo-500/10 transition-shadow">
        
        {/* Navigation Home Icon (Shown when not at home) */}
        {!isAtHome && onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="p-2 sm:px-3 sm:py-2 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Return to Home Screen"
          >
            <Home className="w-4 h-4 text-stone-500" />
            <span className="hidden sm:inline">Home</span>
          </button>
        )}

        {/* FEATURED: The Gemini AI Button */}
        <button
          onClick={onOpenGemini}
          className="group relative flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 hover:from-indigo-500 hover:via-purple-500 hover:to-amber-400 text-white shadow-md hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.03] active:scale-95 transition-all duration-200"
          title="Ask Gemini Doubt Solver (⌘K)"
        >
          {/* Subtle Ambient Pulse Ring */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-amber-400 opacity-30 group-hover:opacity-75 blur-xs transition-opacity duration-300 animate-pulse" />

          <div className="relative flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse group-hover:rotate-12 transition-transform duration-300 flex-shrink-0" />
            <span className="font-semibold text-xs sm:text-sm tracking-tight text-white whitespace-nowrap">
              Ask Gemini
            </span>
            <span className="hidden md:inline-flex items-center text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-white/20 text-white/90">
              ⌘K
            </span>
            {!isGeminiConfigured && (
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
            )}
          </div>
        </button>

        {/* Quick New Note Trigger: Bubble down below with outline glow matching welcome name page aura & expansion */}
        <div 
          className="relative flex items-center group animate-bubble-spring"
          onMouseEnter={() => setIsNoteHovered(true)}
          onMouseLeave={() => setIsNoteHovered(false)}
        >
          {/* Glowing outline matching the aura behind the welcome name page */}
          <div 
            className={`absolute -inset-[1.5px] rounded-full bg-gradient-to-r ${auraGradient} transition-all duration-300 pointer-events-none ${
              isNoteHovered 
                ? 'opacity-100 blur-[4px] scale-105' 
                : 'opacity-75 blur-[2.5px] animate-pulse'
            }`}
          />

          <button
            type="button"
            onClick={onNewNote}
            className={`relative flex items-center justify-center h-8 sm:h-9 rounded-full bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-xs sm:text-sm font-semibold shadow-md transition-all duration-300 ease-out overflow-hidden active:scale-95 border border-white/20 dark:border-stone-800/40 cursor-pointer ${
              isNoteHovered
                ? 'px-3 gap-1.5'
                : 'w-8 sm:w-9 px-0'
            }`}
            title="Create a new study note"
          >
            <Plus className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isNoteHovered ? 'rotate-90 scale-105' : 'group-hover:rotate-90'}`} />
            <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-out font-medium text-xs ${
              isNoteHovered ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0 pointer-events-none'
            }`}>
              New Note
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-5 w-[1px] bg-stone-200 dark:bg-stone-700 mx-0.5 hidden xs:block" />

        {/* Theme Toggle (Light / Dark) */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors hidden xs:flex items-center justify-center"
            title={`Switch to ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600" />
            )}
          </button>
        )}

        {/* Settings */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors hidden sm:flex items-center justify-center"
            title="Settings & Scholar Preferences"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        {/* Active Scholar Button & Interactive Popover */}
        {activeUser && (
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr ${activeUser.avatarGradient} flex items-center justify-center text-white text-[10px] sm:text-[11px] font-bold shadow-xs ml-0.5 flex-shrink-0 cursor-pointer transition-all hover:scale-110 active:scale-95 ring-2 ${
                isUserMenuOpen ? 'ring-indigo-500 scale-105 shadow-md' : 'ring-transparent hover:ring-white/50 dark:hover:ring-stone-600'
              }`}
              title={`Scholar: ${activeUser.name}. Click to change user.`}
            >
              {activeUser.initials}
            </button>

            {/* Floating Popover to Change User */}
            {isUserMenuOpen && (
              <div className="absolute bottom-full mb-3 right-0 w-72 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-200/90 dark:border-stone-700/80 p-2 z-50 animate-fade-in space-y-1">
                <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 dark:border-stone-800 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Switch Scholar ({users?.length || 1})
                  </span>
                  <span className="text-[10px] text-indigo-500 font-semibold">{activeUser.name.split(' ')[0]}</span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-0.5 pt-1">
                  {(users || [activeUser]).map((u) => {
                    const isSelected = u.id === activeUser.id
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          if (onSelectUser) onSelectUser(u)
                          setIsUserMenuOpen(false)
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                          isSelected
                            ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 ring-1 ring-stone-300 dark:ring-stone-700'
                            : 'hover:bg-stone-50 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${u.avatarGradient} flex items-center justify-center text-white text-xs font-bold shadow-xs flex-shrink-0`}>
                            {u.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                              )}
                            </div>
                            <div className="text-[10px] text-stone-400 truncate">
                              {u.registerNumber ? `${u.registerNumber} • ` : ''}{u.role}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex-shrink-0 text-emerald-500">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {onOpenSettings && (
                  <div className="pt-1.5 border-t border-stone-100 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        onOpenSettings()
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-left text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors flex items-center justify-between"
                    >
                      <span>Manage & Add Scholars</span>
                      <span>→</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </aside>
  )
}

