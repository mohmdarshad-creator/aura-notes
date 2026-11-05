import React, { useEffect } from 'react'
import { Sparkles, Plus, Home, Settings, Moon, Sun, Coffee } from 'lucide-react'
import { UserProfile } from '../types'

interface FloatingBarProps {
  onOpenGemini: () => void
  onNewNote: () => void
  onNavigateHome?: () => void
  isAtHome?: boolean
  isGeminiDrawerOpen?: boolean
  isGeminiConfigured?: boolean
  activeUser?: UserProfile
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
  theme,
  onToggleTheme,
  onOpenSettings
}) => {
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

        {/* Quick New Note Trigger */}
        <button
          onClick={onNewNote}
          className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-xs sm:text-sm font-semibold shadow-xs transition-all hover:scale-[1.02]"
          title="Create a new study note"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Note</span>
        </button>

        {/* Divider */}
        <div className="h-5 w-[1px] bg-stone-200 dark:bg-stone-700 mx-0.5 hidden xs:block" />

        {/* Theme Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors hidden xs:flex items-center justify-center"
            title={`Current theme: ${theme}. Click to switch.`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : theme === 'sepia' ? (
              <Coffee className="w-4 h-4 text-amber-600" />
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

        {/* Active Scholar Initials Indicator */}
        {activeUser && (
          <div 
            className={`w-7 h-7 rounded-full bg-gradient-to-tr ${activeUser.avatarGradient} flex items-center justify-center text-white text-[10px] font-bold shadow-xs ml-0.5 flex-shrink-0 cursor-default`}
            title={`Active Scholar: ${activeUser.name}`}
          >
            {activeUser.initials}
          </div>
        )}

      </div>
    </aside>
  )
}
