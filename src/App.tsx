import React, { useState, useEffect, useMemo } from 'react'
import { Navbar } from './components/Navbar'
import { HomeScreen } from './components/HomeScreen'
import { NotesWindow } from './components/NotesWindow'
import { NoteEditor } from './components/NoteEditor'
import { GeminiDrawer } from './components/GeminiDrawer'
import { SettingsModal } from './components/SettingsModal'
import { Note, PageRoute, SubjectItem, NoteColor, UserProfile } from './types'
import { storageService, INITIAL_NOTES, USERS } from './services/storageService'
import { geminiService } from './services/geminiService'

export function App() {
  const [route, setRoute] = useState<PageRoute>({ type: 'home' })
  const [users] = useState<UserProfile[]>(() => storageService.getAllUsers())
  const [activeUser, setActiveUser] = useState<UserProfile>(() => storageService.getActiveUser())
  const [userFilter, setUserFilter] = useState<'all' | 'mine'>('mine')
  const [notes, setNotes] = useState<Note[]>(() => storageService.getNotes())
  const [subjects, setSubjects] = useState<SubjectItem[]>(() => storageService.getSubjects())
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isGeminiDrawerOpen, setIsGeminiDrawerOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [geminiInitialPrompt, setGeminiInitialPrompt] = useState<string | undefined>(undefined)
  const [theme, setTheme] = useState(() => storageService.getTheme())

  // Persist notes
  useEffect(() => {
    storageService.saveNotes(notes)
  }, [notes])

  // Persist subjects
  useEffect(() => {
    storageService.saveSubjects(subjects)
  }, [subjects])

  // Apply theme
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

  const handleSelectUser = (user: UserProfile) => {
    setActiveUser(user)
    storageService.setActiveUser(user.id)
  }

  // Active note for editor
  const activeNote = useMemo(() => {
    return notes.find(n => n.id === selectedNoteId) || null
  }, [notes, selectedNoteId])

  // Navigation handlers
  const handleOpenCollection = (view: 'all' | 'pinned' | 'favorites') => {
    setRoute({ type: 'collection', view })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenSubject = (subjectName: string) => {
    setRoute({ type: 'subject', subjectName })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToHome = () => {
    setRoute({ type: 'home' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Add new subject dynamically
  const handleAddSubject = (name: string, description: string, color: NoteColor, icon: string) => {
    const newSub: SubjectItem = {
      id: `sub-${Date.now()}`,
      name,
      description,
      color,
      icon,
      createdAt: Date.now()
    }
    setSubjects(prev => [...prev, newSub])
  }

  // Create Note
  const handleCreateNote = (contextCategory?: string) => {
    let cat = 'General'
    if (contextCategory && contextCategory !== 'all') {
      cat = contextCategory
    } else if (route.type === 'subject') {
      cat = route.subjectName
    }

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      content: `# Untitled Note\n\nJot down thoughts, definitions, or equations...\n`,
      category: cat,
      tags: ['study'],
      color: activeUser.color || 'indigo',
      isPinned: route.type === 'collection' && route.view === 'pinned',
      isFavorite: route.type === 'collection' && route.view === 'favorites',
      authorId: activeUser.id,
      authorName: activeUser.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setNotes(prev => [newNote, ...prev])
    setSelectedNoteId(newNote.id)
  }

  // Update Note
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

  // Delete Note
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

  const handleOpenGeminiGeneral = (contextTitle?: string) => {
    setGeminiInitialPrompt(contextTitle ? `I'm currently reviewing ${contextTitle}. Can you give me an overview and suggest key focus areas for ${activeUser.name}?` : undefined)
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
      category: activeNote ? activeNote.category : (route.type === 'subject' ? route.subjectName : 'General'),
      tags: ['gemini-solved'],
      color: activeUser.color || 'amber',
      isPinned: false,
      isFavorite: false,
      authorId: activeUser.id,
      authorName: activeUser.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setNotes(prev => [newNote, ...prev])
    setSelectedNoteId(newNote.id)
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      
      {/* Top Navbar with Logo, Search, User Profile Switcher & Settings */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewNote={() => handleCreateNote()}
        onOpenGemini={() => handleOpenGeminiGeneral()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isGeminiConfigured={geminiService.hasApiKey()}
        onNavigateHome={handleBackToHome}
        isAtHome={route.type === 'home'}
        users={users}
        activeUser={activeUser}
        onSelectUser={handleSelectUser}
        notes={notes}
      />

      {/* Main Multi-Page Content (No left dashboard) */}
      <main className="flex-1 w-full pb-16">
        {route.type === 'home' ? (
          /* Page 1: Home Screen with 2x2 Subjects, Views Bar, 3-Box Animated Cards, and Notebooks */
          <HomeScreen
            subjects={subjects}
            notes={notes}
            activeUser={activeUser}
            users={users}
            onSelectUser={handleSelectUser}
            userFilter={userFilter}
            setUserFilter={setUserFilter}
            onOpenCollection={handleOpenCollection}
            onOpenSubject={handleOpenSubject}
            onAddSubject={handleAddSubject}
            onOpenGemini={() => handleOpenGeminiGeneral()}
            onNewNote={() => handleCreateNote()}
          />
        ) : (
          /* Page 2: Dedicated Notes Window */
          <NotesWindow
            currentRoute={route}
            notes={notes}
            activeUser={activeUser}
            users={users}
            onBackToHome={handleBackToHome}
            onSelectNote={(noteId) => setSelectedNoteId(noteId)}
            selectedNoteId={selectedNoteId}
            onCreateNoteInContext={(category) => handleCreateNote(category)}
            onTogglePin={handleTogglePin}
            onToggleFavorite={handleToggleFavorite}
            onDeleteNote={handleDeleteNote}
            onAskGeminiAboutNote={handleAskGeminiAboutNote}
            onOpenGeminiGeneral={handleOpenGeminiGeneral}
          />
        )}
      </main>

      {/* Note Editor Modal Overlay */}
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
        activeUser={activeUser}
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
