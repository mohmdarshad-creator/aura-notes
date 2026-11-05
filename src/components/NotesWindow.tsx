import React, { useState, useMemo } from 'react'
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
  Filter
} from 'lucide-react'
import { Note, PageRoute } from '../types'
import { NoteCard } from './NoteCard'
import { storageService } from '../services/storageService'

interface NotesWindowProps {
  currentRoute: PageRoute
  notes: Note[]
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
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

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

        {/* In-window Search Bar */}
        <div className="w-full md:w-72">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in this window..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:border-indigo-500 outline-none transition-colors shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter by Tags Pills */}
      {availableTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-xs text-stone-400 font-medium flex items-center gap-1 mr-1">
            <Tag className="w-3 h-3" /> Filter:
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

      {/* Notes Grid */}
      {windowNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {windowNotes.map((note) => (
            <NoteCard
              key={note.id}
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
