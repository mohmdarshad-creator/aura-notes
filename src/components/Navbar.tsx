import React from 'react'
import { 
  Sparkles, 
  Plus, 
  Search, 
  Settings, 
  Moon, 
  Sun, 
  Coffee, 
  BookMarked,
  SlidersHorizontal
} from 'lucide-react'

interface NavbarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  onNewNote: () => void
  onOpenGemini: () => void
  onOpenSettings: () => void
  theme: string
  onToggleTheme: () => void
  isGeminiConfigured: boolean
  activeView: 'notes' | 'ai-tutor'
  setActiveView: (view: 'notes' | 'ai-tutor') => void
  isZenMode: boolean
  onToggleZenMode: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onNewNote,
  onOpenGemini,
  onOpenSettings,
  theme,
  onToggleTheme,
  isGeminiConfigured,
  activeView,
  setActiveView,
  isZenMode,
  onToggleZenMode
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 dark:border-stone-800/80 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveView('notes')}
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

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 ml-4 pl-4 border-l border-stone-200 dark:border-stone-800">
            <button
              onClick={() => setActiveView('notes')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeView === 'notes'
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Study Notes
            </button>
            <button
              onClick={() => setActiveView('ai-tutor')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                activeView === 'ai-tutor'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              Gemini Doubt Solver
            </button>
          </nav>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notes, doubts, #tags, or topics..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-stone-100/80 dark:bg-stone-800/60 border border-transparent focus:border-indigo-400 focus:bg-white dark:focus:bg-stone-900 outline-none transition-all placeholder:text-stone-400"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick AI Trigger */}
          <button
            onClick={onOpenGemini}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-gradient-to-r from-indigo-50 to-amber-50 hover:from-indigo-100 hover:to-amber-100 dark:from-indigo-950/40 dark:to-amber-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50 shadow-sm transition-all hover:shadow"
            title="Ask Gemini a question or clear a doubt"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Ask</span> Gemini
            {!isGeminiConfigured && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          {/* New Note Button */}
          <button
            onClick={onNewNote}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>

          {/* Theme switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
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

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Settings & Gemini API Key"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  )
}

