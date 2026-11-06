import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Navbar } from './components/Navbar'
import { HomeScreen } from './components/HomeScreen'
import { NotesWindow } from './components/NotesWindow'
import { NoteEditor } from './components/NoteEditor'
import { GeminiDrawer } from './components/GeminiDrawer'
import { SettingsModal } from './components/SettingsModal'
import { FloatingBar } from './components/FloatingBar'
import { Note, PageRoute, SubjectItem, NoteColor, UserProfile, CourseItem } from './types'
import { storageService, INITIAL_NOTES, USERS } from './services/storageService'
import { geminiService } from './services/geminiService'

export function App() {
  const [route, setRoute] = useState<PageRoute>({ type: 'home' })
  const [users, setUsers] = useState<UserProfile[]>(() => storageService.getAllUsers())
  const [activeUser, setActiveUser] = useState<UserProfile>(() => storageService.getActiveUser())
  const [userFilter, setUserFilter] = useState<'all' | 'mine'>('mine')
  const [notes, setNotes] = useState<Note[]>(() => storageService.getNotes())
  const [subjects, setSubjects] = useState<SubjectItem[]>(() => storageService.getSubjects())
  const [notebooks, setNotebooks] = useState<SubjectItem[]>(() => storageService.getNotebooks())
  const [courses, setCourses] = useState<CourseItem[]>(() => storageService.getCoursesForUser(activeUser.id))
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isGeminiDrawerOpen, setIsGeminiDrawerOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [geminiInitialPrompt, setGeminiInitialPrompt] = useState<string | undefined>(undefined)
  const [theme, setTheme] = useState(() => {
    const saved = storageService.getTheme()
    return saved === 'sepia' || !saved ? 'light' : saved
  })
  
  // Track scroll position when opening a tile so Back to Home returns where entered
  const homeScrollPos = useRef<number>(0)

  // Persist notes
  useEffect(() => {
    storageService.saveNotes(notes)
  }, [notes])

  // Persist subjects
  useEffect(() => {
    storageService.saveSubjects(subjects)
  }, [subjects])

  // Persist notebooks
  useEffect(() => {
    storageService.saveNotebooks(notebooks)
  }, [notebooks])

  // Apply theme (Light Mode or Dark Mode only)
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'sepia')
    if (theme === 'dark') {
      root.classList.add('dark')
    }
    storageService.saveTheme(theme)
  }, [theme])

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const handleSelectUser = (user: UserProfile) => {
    setActiveUser(user)
    storageService.setActiveUser(user.id)
    setCourses(storageService.getCoursesForUser(user.id))
  }

  const handleUpdateUser = (updatedUser: UserProfile) => {
    const updatedUsers = storageService.updateUser(updatedUser)
    setUsers(updatedUsers)
    if (activeUser.id === updatedUser.id) {
      setActiveUser(updatedUser)
    }
    // Sync note author names
    setNotes(prev => prev.map(n => {
      if (n.authorId === updatedUser.id) {
        return {
          ...n,
          authorName: updatedUser.name
        }
      }
      return n
    }))
  }

  const handleAddUser = (newUser: Omit<UserProfile, 'id'>) => {
    const { user, users: updated } = storageService.addUser(newUser)
    setUsers(updated)
    setActiveUser(user)
    storageService.setActiveUser(user.id)
  }

  const handleDeleteUser = (userId: string) => {
    const updated = storageService.deleteUser(userId)
    setUsers(updated)
    if (activeUser.id === userId && updated.length > 0) {
      setActiveUser(updated[0])
      storageService.setActiveUser(updated[0].id)
    }
  }

  // Active note for editor
  const activeNote = useMemo(() => {
    return notes.find(n => n.id === selectedNoteId) || null
  }, [notes, selectedNoteId])

  // Navigation handlers with scroll-position memory
  const handleOpenCollection = (view: 'all' | 'pinned' | 'favorites') => {
    homeScrollPos.current = window.scrollY
    setRoute({ type: 'collection', view })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const handleOpenSubject = (subjectName: string) => {
    homeScrollPos.current = window.scrollY
    setRoute({ type: 'subject', subjectName })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const handleBackToHome = () => {
    const targetY = homeScrollPos.current
    setRoute({ type: 'home' })
    // Return smoothly to where the user entered the tile instead of top of page
    setTimeout(() => {
      window.scrollTo({ top: targetY, behavior: 'smooth' })
    }, 40)
  }

  // Rename a subject, notebook, or course and sync notes & active route
  const handleRenameSubject = (oldName: string, newName: string) => {
    const trimmedNew = newName.trim()
    const trimmedOld = oldName.trim()
    if (!trimmedNew || trimmedNew === trimmedOld) return

    const { updatedSubjects, updatedNotebooks, updatedCourses, updatedNotes } = 
      storageService.renameSubjectOrCourse(trimmedOld, trimmedNew, activeUser.id)
    
    setSubjects(updatedSubjects)
    setNotebooks(updatedNotebooks)
    setCourses(updatedCourses)
    setNotes(updatedNotes)
    
    // Update active route if currently inside this subject's window
    setRoute(prev => {
      if (prev.type === 'subject') {
        return { ...prev, subjectName: trimmedNew }
      }
      return prev
    })
  }

  // Add new subject dynamically (for Subjects section)
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

  // Add new notebook dynamically (for Notebooks section)
  const handleAddNotebook = (name: string, description: string, color: NoteColor, icon: string) => {
    const newNb: SubjectItem = {
      id: `nb-${Date.now()}`,
      name,
      description,
      color,
      icon,
      createdAt: Date.now()
    }
    setNotebooks(prev => [...prev, newNb])
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
  const handleDeleteNote = (id: string, skipNativeConfirm: boolean = false) => {
    if (skipNativeConfirm || confirm('Are you sure you want to delete this note?')) {
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

  // Upload File as Note from Device (PDF, DOCX, TXT) with automatic Gemini AI Knowledge Ingestion
  const handleUploadFileNote = async (file: File, category: string = 'General') => {
    try {
      const newNote = await storageService.createNoteFromFile(file, category, activeUser)
      setNotes(prev => [newNote, ...prev])

      // If Gemini API is available, automatically ingest and index the document in background
      if (geminiService.hasApiKey()) {
        geminiService.ingestUploadedNote(newNote).then(enrichedContent => {
          if (enrichedContent) {
            handleUpdateNote(newNote.id, { content: enrichedContent })
          }
        }).catch(err => console.warn('Background Gemini ingestion skipped', err))
      }
    } catch (err) {
      console.error('Failed to create file note from device', err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      
      {/* Top Navbar with Logo, Search, User Profile Switcher & Settings */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewNote={() => handleCreateNote()}
        onOpenSettings={() => setIsSettingsOpen(true)}
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
            notebooks={notebooks}
            courses={courses}
            notes={notes}
            activeUser={activeUser}
            users={users}
            onSelectUser={handleSelectUser}
            userFilter={userFilter}
            setUserFilter={setUserFilter}
            onOpenCollection={handleOpenCollection}
            onOpenSubject={handleOpenSubject}
            onAddSubject={handleAddSubject}
            onAddNotebook={handleAddNotebook}
            onOpenGemini={() => handleOpenGeminiGeneral()}
            onNewNote={() => handleCreateNote()}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onUploadFileNote={handleUploadFileNote}
            onRenameSubject={handleRenameSubject}
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
            onUploadFileNote={handleUploadFileNote}
            onTogglePin={handleTogglePin}
            onToggleFavorite={handleToggleFavorite}
            onDeleteNote={handleDeleteNote}
            onAskGeminiAboutNote={handleAskGeminiAboutNote}
            onOpenGeminiGeneral={handleOpenGeminiGeneral}
            onRenameSubject={handleRenameSubject}
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
              onDeleteNote={() => handleDeleteNote(activeNote.id, true)}
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
        notes={notes}
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
        users={users}
        activeUser={activeUser}
        onUpdateUser={handleUpdateUser}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
      />

      {/* Floating Bar with Prominent Ask Gemini AI Trigger & Functional User Switcher */}
      <FloatingBar
        onOpenGemini={() => handleOpenGeminiGeneral()}
        onNewNote={() => handleCreateNote()}
        onNavigateHome={handleBackToHome}
        isAtHome={route.type === 'home'}
        isGeminiDrawerOpen={isGeminiDrawerOpen}
        isGeminiConfigured={geminiService.hasApiKey()}
        activeUser={activeUser}
        users={users}
        onSelectUser={handleSelectUser}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

    </div>
  )
}
export default App
