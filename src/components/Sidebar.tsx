import React, { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Pin, 
  Star, 
  Folder, 
  Tag, 
  Code, 
  Atom, 
  Sparkles, 
  Feather, 
  Sigma, 
  FileText,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Flame,
  CheckCircle2
} from 'lucide-react'
import { Note } from '../types'
import { CATEGORIES } from '../services/storageService'

interface SidebarProps {
  notes: Note[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
  selectedTag: string | null
  onSelectTag: (tag: string | null) => void
  filterPinnedOnly: boolean
  onTogglePinnedOnly: () => void
  filterFavoritesOnly: boolean
  onToggleFavoritesOnly: () => void
  onOpenGemini: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  selectedCategory,
  onSelectCategory,
  selectedTag,
  onSelectTag,
  filterPinnedOnly,
  onTogglePinnedOnly,
  filterFavoritesOnly,
  onToggleFavoritesOnly,
  onOpenGemini,
}) => {
  // Focus Pomodoro Timer State (25 mins)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  useEffect(() => {
    let interval: any = null
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(sec => sec - 1)
      }, 1000)
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timerSeconds])

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Extract all unique tags
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || []))).sort()

  const pinnedCount = notes.filter(n => n.isPinned).length
  const favoriteCount = notes.filter(n => n.isFavorite).length

  // Category Icon mapper
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'Computer Science': return <Code className="w-4 h-4 text-indigo-500" />
      case 'Physics': return <Atom className="w-4 h-4 text-purple-500" />
      case 'Astronomy': return <Sparkles className="w-4 h-4 text-amber-500" />
      case 'Philosophy': return <Feather className="w-4 h-4 text-emerald-500" />
      case 'Mathematics': return <Sigma className="w-4 h-4 text-sky-500" />
      default: return <Folder className="w-4 h-4 text-stone-400" />
    }
  }

  return (
    <aside className="w-64 flex-shrink-0 space-y-6">
      
      {/* Quick Views */}
      <div className="space-y-1">
        <div className="px-3 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
          Views
        </div>
        <button
          onClick={() => {
            onSelectCategory('all')
            onSelectTag(null)
            if (filterPinnedOnly) onTogglePinnedOnly()
            if (filterFavoritesOnly) onToggleFavoritesOnly()
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            selectedCategory === 'all' && !selectedTag && !filterPinnedOnly && !filterFavoritesOnly
              ? 'bg-stone-200/70 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-stone-500" />
            <span>All Notes</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
            {notes.length}
          </span>
        </button>

        <button
          onClick={onTogglePinnedOnly}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            filterPinnedOnly
              ? 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Pin className={`w-4 h-4 ${filterPinnedOnly ? 'text-amber-600 fill-amber-500' : 'text-stone-400'}`} />
            <span>Pinned</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
            {pinnedCount}
          </span>
        </button>

        <button
          onClick={onToggleFavoritesOnly}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            filterFavoritesOnly
              ? 'bg-rose-100/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Star className={`w-4 h-4 ${filterFavoritesOnly ? 'text-rose-500 fill-rose-500' : 'text-stone-400'}`} />
            <span>Favorites</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
            {favoriteCount}
          </span>
        </button>
      </div>

      {/* Categories / Notebooks */}
      <div className="space-y-1">
        <div className="px-3 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
          Notebooks
        </div>
        {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
          const count = notes.filter(n => n.category === cat.id).length
          const isSelected = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id)
                onSelectTag(null)
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-stone-200/70 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                {getCategoryIcon(cat.id)}
                <span className="truncate">{cat.name}</span>
              </div>
              <span className="text-xs text-stone-400 ml-1">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tags Cloud */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <div className="px-3 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>Tags</span>
          </div>
          <div className="flex flex-wrap gap-1.5 px-2">
            {allTags.map(tag => {
              const isSelected = selectedTag === tag
              return (
                <button
                  key={tag}
                  onClick={() => onSelectTag(isSelected ? null : tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  #{tag}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Zen Study Pomodoro Widget */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-stone-50 to-stone-100/90 dark:from-stone-900 dark:to-stone-800/90 border border-stone-200/70 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            Zen Study Focus
          </span>
          <span className="text-[10px] font-mono uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-semibold">
            25m
          </span>
        </div>

        <div className="text-center py-1">
          <div className="text-3xl font-mono font-bold tracking-tight text-stone-800 dark:text-stone-100">
            {formatTimer(timerSeconds)}
          </div>
          <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
            {isTimerRunning ? '🔥 Focus deep, eliminate noise' : 'Ready for your next study sprint?'}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              isTimerRunning 
                ? 'bg-amber-500 text-white hover:bg-amber-600' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
            }`}
          >
            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isTimerRunning ? 'Pause' : 'Start Focus'}</span>
          </button>
          
          <button
            onClick={() => {
              setIsTimerRunning(false)
              setTimerSeconds(25 * 60)
            }}
            className="p-1.5 rounded-xl text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </aside>
  )
}
