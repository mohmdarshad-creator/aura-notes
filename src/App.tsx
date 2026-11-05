import React, { useState, useEffect, useMemo } from 'react'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { NoteCard } from './components/NoteCard'
import { NoteEditor } from './components/NoteEditor'
import { GeminiDrawer } from './components/GeminiDrawer'
import { SettingsModal } from './components/SettingsModal'
import { Note } from './types'
import { storageService, INITIAL_NOTES } from './services/storageService'
import { geminiService } from './services/geminiService'
import { 
  Sparkles, 
  Plus, 
  Search, 
  LayoutGrid, 
  ListFilter, 
  BookOpen, 
  Frown,
  CheckCircle2,
  FolderOpen
} from 'lucide-react'

export function App() {
  const [notes, setNotes] = useState<Note[]>(() => storageService.getNotes())
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [filterPinnedOnly, setFilterPinnedOnly] = useState(false)
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false)
  const [isGeminiDrawerOpen, setIsGeminiDrawerOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activeView, setActiveView] = useState<'notes' | 'ai-tutor'>('notes')
  const [theme, setTheme] = useState(() => storageService.getTheme())
  const [geminiInitialPrompt, setGeminiInitialPrompt] = useState<string | undefined>(undefined)
  const [isZenMode, setIsZenMode] = useState(false)

  // Sync notes to storage
  useEffect(() => {
    storageService.saveNotes(notes)
  }, [notes])

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'sepia')
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'sepia') {
      root.classList.add('sepia')
    }
    storageService.saveTheme(theme)
  }, [theme])

  const handleToggleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('sepia')
    else setTheme('light')
  }

  // Active note
  const activeNote = useMemo(() => {
    return notes.find(n => n.id === selectedNoteId) || null
  }, [notes, selectedNoteId])

  // Create new note
  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      content: `# Untitled Note\n\nWrite your thoughts, lecture takeaways, or study questions here...\n`,
      category: selectedCategory !== 'all' ? selectedCategory : 'General',
      tags: selectedTag ? [selectedTag] : ['study'],
      color: 'indigo',
      isPinned: false,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setNotes(prev => [newNote, ...prev])
    setSelectedNoteId(newNote.id)
  }

  const handleUpdateNote = (id: string, updated: Partial<Note>) => {
    setNotes(prev => prev.map(n => {
      if (n.id === id) {
        return {
          ...n,
          ...updated,
          updatedAt: Date.now()
        }
      }
      return n
    }))
  }

  const handleDeleteNote = (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(prev => prev.filter(n => n.id !== id))
      if (selectedNoteId === id) {
        setSelectedNoteId(null)
      }
    }
  }

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n))
  }

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))
  }

  const handleAskGeminiAboutNote = (note: Note, prompt?: string) => {
    setSelectedNoteId(note.id)
    setGeminiInitialPrompt(prompt)
    setIsGeminiDrawerOpen(true)
  }

  const handleAppendToNote = (text: string) => {
    if (!activeNote) return
    handleUpdateNote(activeNote.id, {
      content: activeNote.content + text
    })
  }

  const handleSaveAsNewNote = (title: string, content: string) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title,
      content,
      category: activeNote ? activeNote.category : 'General',
      tags: ['gemini-solved', ...(activeNote ? activeNote.tags : [])],
      color: 'amber',
      isPinned: false,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setNotes(prev => [newNote, ...prev])
    setSelectedNoteId(newNote.id)
  }

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      // Category filter
      if (selectedCategory !== 'all' && note.category !== selectedCategory) {
        return false
      }
      // Tag filter
      if (selectedTag && !note.tags.includes(selectedTag)) {
        return false
      }
      // Pinned filter
      if (filterPinnedOnly && !note.isPinned) {
        return false
      }
      // Favorite filter
      if (filterFavoritesOnly && !note.isFavorite) {
        return false
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = note.title.toLowerCase().includes(q)
        const matchesContent = note.content.toLowerCase().includes(q)
        const matchesTag = note.tags.some(t => t.toLowerCase().includes(q))
        const matchesCategory = note.category.toLowerCase().includes(q)
        return matchesTitle || matchesContent || matchesTag || matchesCategory
      }
      return true
    }).sort((a, b) => {
      // Pinned first, then by updatedAt descending
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return b.updatedAt - a.updatedAt
    })
  }, [notes, selectedCategory, selectedTag, filterPinnedOnly, filterFavoritesOnly, searchQuery])

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewNote={handleCreateNote}
        onOpenGemini={() => {
          setGeminiInitialPrompt(undefined)
          setIsGeminiDrawerOpen(true)
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isGeminiConfigured={geminiService.hasApiKey()}
        activeView={activeView}
        setActiveView={setActiveView}
        isZenMode={isZenMode}
        onToggleZenMode={() => setIsZenMode(!isZenMode)}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex gap-8">
        
        {/* Left Sidebar (hidden in active editor modal if small screen) */}
        <Sidebar
          notes={notes}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          filterPinnedOnly={filterPinnedOnly}
          onTogglePinnedOnly={() => setFilterPinnedOnly(!filterPinnedOnly)}
          filterFavoritesOnly={filterFavoritesOnly}
          onToggleFavoritesOnly={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
          onOpenGemini={() => {
            setGeminiInitialPrompt(undefined)
            setIsGeminiDrawerOpen(true)
          }}
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          
          {/* Header Bar above notes list */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                {selectedCategory === 'all' ? 'All Study Notes' : selectedCategory}
                {selectedTag && (
                  <span className="text-sm font-sans font-normal text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                    #{selectedTag}
                  </span>
                )}
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} found • Designed for deep focus & clarity
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateNote}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Note</span>
              </button>
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isSelected={selectedNoteId === note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  onTogglePin={(e) => handleTogglePin(note.id, e)}
                  onToggleFavorite={(e) => handleToggleFavorite(note.id, e)}
                  onDelete={(e) => {
                    e.stopPropagation()
                    handleDeleteNote(note.id)
                  }}
                  onAskGemini={(e) => {
                    e.stopPropagation()
                    handleAskGeminiAboutNote(note)
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
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 rounded-3xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-stone-700 dark:text-stone-300 text-lg">
                  No notes match your filter
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm">
                  Try clearing your search query, selecting another category, or start a new note.
                </p>
              </div>
              <button
                onClick={handleCreateNote}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Note</span>
              </button>
            </div>
          )}

        </main>

      </div>

      {/* Note Editor Overlay / Modal */}
      {activeNote && (
        <div className="fixed inset-0 z-40 p-4 sm:p-6 md:p-8 bg-black/40 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="w-full max-w-5xl h-[92vh]">
            <NoteEditor
              note={activeNote}
              onUpdateNote={(updated) => handleUpdateNote(activeNote.id, updated)}
              onDeleteNote={() => handleDeleteNote(activeNote.id)}
              onExportMarkdown={() => storageService.exportSingleNoteMarkdown(activeNote)}
              onAskGeminiAboutNote={(quickPrompt) => handleAskGeminiAboutNote(activeNote, quickPrompt)}
              onClose={() => setSelectedNoteId(null)}
            />
          </div>
        </div>
      )}

      {/* Gemini AI Doubt Solver Drawer */}
      <GeminiDrawer
        isOpen={isGeminiDrawerOpen}
        onClose={() => setIsGeminiDrawerOpen(false)}
        activeNote={activeNote}
        onAppendToNote={handleAppendToNote}
        onSaveAsNewNote={handleSaveAsNewNote}
        onOpenSettings={() => {
          setIsGeminiDrawerOpen(false)
          setIsSettingsOpen(true)
        }}
        initialPrompt={geminiInitialPrompt}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        notes={notes}
        onNotesImported={(imported) => {
          setNotes(imported)
          storageService.saveNotes(imported)
        }}
        onResetSampleNotes={() => {
          setNotes(INITIAL_NOTES)
          storageService.saveNotes(INITIAL_NOTES)
        }}
      />

    </div>
  )
}
export default App
