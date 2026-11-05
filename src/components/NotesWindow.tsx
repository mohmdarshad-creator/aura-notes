import React, { useState, useMemo, useRef } from 'react'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Sparkles, 
  Tag, 
  BookOpen, 
  Pin, 
  Star, 
  Folder,
  Layers,
  Filter,
  X
} from 'lucide-react'
import { Note, PageRoute, UserProfile } from '../types'
import { NoteCard } from './NoteCard'
import { storageService } from '../services/storageService'

interface NotesWindowProps {
  currentRoute: PageRoute
  notes: Note[]
  activeUser: UserProfile
  users: UserProfile[]
  onBackToHome: () => void
  onSelectNote: (noteId: string) => void
  selectedNoteId: string | null
  onCreateNoteInContext: (subjectOrCategory?: string) => void
  onTogglePin: (id: string, e: React.MouseEvent) => void
  onToggleFavorite: (id: string, e: React.MouseEvent) => void
  onDeleteNote: (id: string) => void
  onAskGeminiAboutNote: (note: Note) => void
  onOpenGeminiGeneral: (contextTitle?: string) => void
}

export const NotesWindow: React.FC<NotesWindowProps> = ({
  currentRoute,
  notes,
  activeUser,
  users,
  onBackToHome,
  onSelectNote,
  selectedNoteId,
  onCreateNoteInContext,
  onTogglePin,
  onToggleFavorite,
  onDeleteNote,
  onAskGeminiAboutNote,
  onOpenGeminiGeneral,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchHovered, setIsSearchHovered] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isSearchExpanded = isSearchHovered || isSearchFocused || Boolean(searchQuery.trim())

  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [authorFilter, setAuthorFilter] = useState<'all' | string>('all')

  // Determine window title and icon based on route
  const windowMeta = useMemo(() => {
    if (currentRoute.type === 'collection') {
      if (currentRoute.view === 'pinned') {
        return {
          title: 'Pinned Notes',
          subtitle: 'Essential formulas, high-priority cheat-sheets & quick reviews',
          icon: <Pin className="w-6 h-6 text-amber-500 fill-amber-500/20" />,
          categoryFilter: null,
          pinnedOnly: true,
          favoritesOnly: false,
        }
      }
      if (currentRoute.view === 'favorites') {
        return {
          title: 'Favorite Notes',
          subtitle: 'Starred concepts, deep-dive explorations & memorable notes',
          icon: <Star className="w-6 h-6 text-rose-500 fill-rose-500/20" />,
          categoryFilter: null,
          pinnedOnly: false,
          favoritesOnly: true,
        }
      }
      return {
        title: 'All Study Notes',
        subtitle: 'Complete knowledge archive across all your notebooks',
        icon: <BookOpen className="w-6 h-6 text-indigo-500" />,
        categoryFilter: null,
        pinnedOnly: false,
        favoritesOnly: false,
      }
    }

    if (currentRoute.type === 'subject') {
      return {
        title: `${currentRoute.subjectName} Notebook`,
        subtitle: `Lecture notes, concept summaries, and exercises for ${currentRoute.subjectName}`,
        icon: <Folder className="w-6 h-6 text-indigo-500" />,
        categoryFilter: currentRoute.subjectName,
        pinnedOnly: false,
        favoritesOnly: false,
      }
    }

    return {
      title: 'Study Notes',
      subtitle: '',
      icon: <BookOpen className="w-6 h-6 text-stone-500" />,
      categoryFilter: null,
      pinnedOnly: false,
      favoritesOnly: false,
    }
  }, [currentRoute])

  // Filter notes for this specific window
  const windowNotes = useMemo(() => {
    return notes.filter((n) => {
      // Category / Subject filter
      if (windowMeta.categoryFilter && n.category.toLowerCase() !== windowMeta.categoryFilter.toLowerCase()) {
        return false
      }
      // Pinned filter
      if (windowMeta.pinnedOnly && !n.isPinned) {
        return false
      }
      // Favorites filter
      if (windowMeta.favoritesOnly && !n.isFavorite) {
        return false
      }
      // Author filter
      if (authorFilter !== 'all' && n.authorId !== authorFilter) {
        return false
      }
      // Tag filter
      if (selectedTag && !n.tags.includes(selectedTag)) {
        return false
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = n.title.toLowerCase().includes(q)
        const matchContent = n.content.toLowerCase().includes(q)
        const matchTag = n.tags.some(t => t.toLowerCase().includes(q))
        return matchTitle || matchContent || matchTag
      }
      return true
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return b.updatedAt - a.updatedAt
    })
  }, [notes, windowMeta, selectedTag, searchQuery])

  // Available tags in this window
  const availableTags = Array.from(new Set(windowNotes.flatMap(n => n.tags || []))).sort()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fade-in">
      
      {/* Top Window Navigation Bar with Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-stone-800">
        
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span>Home</span>
            <span>/</span>
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              {windowMeta.title}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenGeminiGeneral(windowMeta.title)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 hover:bg-indigo-100 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Ask Gemini</span>
          </button>

          <button
            onClick={() => onCreateNoteInContext(windowMeta.categoryFilter || 'General')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 shadow-md transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>

      </div>

      {/* Window Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-center">
            {windowMeta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 dark:text-stone-100">
                {windowMeta.title}
              </h1>
              <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                {windowNotes.length} {windowNotes.length === 1 ? 'note' : 'notes'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
              {windowMeta.subtitle}
            </p>
          </div>
        </div>

        {/* In-window Expandable Search Button & Bar */}
        <div 
          className="relative flex items-center justify-end"
          onMouseEnter={() => {
            setIsSearchHovered(true)
            setTimeout(() => {
              searchInputRef.current?.focus()
            }, 40)
          }}
          onMouseLeave={() => setIsSearchHovered(false)}
        >
          <div
            className={`group flex items-center relative overflow-hidden transition-all duration-300 ease-out rounded-xl border ${
              isSearchExpanded
                ? 'w-full md:w-80 bg-white dark:bg-stone-900 border-indigo-400 dark:border-indigo-500 shadow-sm ring-2 ring-indigo-400/20'
                : 'w-10 h-10 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border-stone-200 dark:border-stone-800 shadow-xs cursor-pointer'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setIsSearchFocused(true)
                searchInputRef.current?.focus()
              }}
              className={`w-10 h-10 flex items-center justify-center flex-shrink-0 text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                isSearchExpanded ? 'pointer-events-none' : 'cursor-pointer'
              }`}
              title="Search in this window (Hover or click to extend)"
            >
              <Search className={`w-4 h-4 transition-transform duration-200 ${isSearchExpanded ? 'text-indigo-500 scale-105' : 'group-hover:scale-110'}`} />
            </button>

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  searchInputRef.current?.blur()
                }
              }}
              placeholder="Search in this window..."
              className={`w-full pr-8 py-2 text-xs sm:text-sm bg-transparent outline-none placeholder:text-stone-400 text-stone-900 dark:text-stone-100 transition-opacity duration-200 ${
                isSearchExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none w-0'
              }`}
              tabIndex={isSearchExpanded ? 0 : -1}
            />

            {isSearchExpanded && searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setSearchQuery('')
                  searchInputRef.current?.focus()
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                title="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Author and Tags Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-stone-100 dark:border-stone-800/80">
        
        {/* Author Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-stone-400 font-medium mr-1">Author:</span>
          <button
            onClick={() => setAuthorFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              authorFilter === 'all'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
            }`}
          >
            All Students
          </button>

          {users.map((u) => {
            const isSelected = authorFilter === u.id
            return (
              <button
                key={u.id}
                onClick={() => setAuthorFilter(u.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${u.avatarGradient} text-white shadow-xs`
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                }`}
              >
                <span className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center text-white bg-gradient-to-tr ${u.avatarGradient}`}>
                  {u.initials}
                </span>
                <span>{u.name}</span>
              </button>
            )
          })}
        </div>

        {/* Filter by Tags Pills */}
        {availableTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-stone-400 font-medium flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3" /> Tags:
            </span>
            {availableTags.map((t) => {
              const isSelected = selectedTag === t
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTag(isSelected ? null : t)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  #{t}
                </button>
              )
            })}
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 underline ml-1"
              >
                Reset
              </button>
            )}
          </div>
        )}

      </div>

      {/* Notes Grid */}
      {windowNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {windowNotes.map((note, index) => (
            <div
              key={note.id}
              style={{
                animationDelay: `${(index % 9) * 60 + 40}ms`,
                animationFillMode: 'both'
              }}
              className="animate-float-in"
            >
              <NoteCard
                note={note}
                isSelected={selectedNoteId === note.id}
                onClick={() => onSelectNote(note.id)}
                onTogglePin={(e) => onTogglePin(note.id, e)}
                onToggleFavorite={(e) => onToggleFavorite(note.id, e)}
                onDelete={(e) => {
                  e.stopPropagation()
                  onDeleteNote(note.id)
                }}
                onAskGemini={(e) => {
                  e.stopPropagation()
                  onAskGeminiAboutNote(note)
                }}
                onExport={(e) => {
                  e.stopPropagation()
                  storageService.exportSingleNoteMarkdown(note)
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 rounded-3xl border border-dashed border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/30">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-700 dark:text-stone-300 text-lg">
              No notes in this window
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm">
              {searchQuery || selectedTag
                ? 'No notes match your current search or tag filters.'
                : 'Start jotting down formulas, lectures, or summaries in this collection.'}
            </p>
          </div>
          <button
            onClick={() => onCreateNoteInContext(windowMeta.categoryFilter || 'General')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Note Here</span>
          </button>
        </div>
      )}

    </div>
  )
}

