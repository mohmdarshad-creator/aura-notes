import React, { useState, useEffect, useMemo, useRef } from 'react'
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
  X,
  Upload,
  FileText,
  FileUp,
  CheckCircle2,
  Pencil,
  Check
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
  onUploadFileNote?: (file: File, category?: string) => void
  onTogglePin: (id: string, e: React.MouseEvent) => void
  onToggleFavorite: (id: string, e: React.MouseEvent) => void
  onDeleteNote: (id: string) => void
  onAskGeminiAboutNote: (note: Note) => void
  onOpenGeminiGeneral: (contextTitle?: string) => void
  onRenameSubject?: (oldName: string, newName: string) => void
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
  onUploadFileNote,
  onTogglePin,
  onToggleFavorite,
  onDeleteNote,
  onAskGeminiAboutNote,
  onOpenGeminiGeneral,
  onRenameSubject,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchHovered, setIsSearchHovered] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'pdf' | 'text'>('all')
  const [uploadSuccessToast, setUploadSuccessToast] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isSearchExpanded = isSearchHovered || isSearchFocused || Boolean(searchQuery.trim())

  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [authorFilter, setAuthorFilter] = useState<'all' | string>('all')

  // Subject inline rename state
  const [isEditingSubject, setIsEditingSubject] = useState(false)
  const [editingSubjectName, setEditingSubjectName] = useState('')
  const editSubjectInputRef = useRef<HTMLInputElement>(null)

  // When route changes, sync edit input and reset edit mode
  useEffect(() => {
    setIsEditingSubject(false)
    if (currentRoute.type === 'subject') {
      setEditingSubjectName(currentRoute.subjectName)
    }
  }, [currentRoute])

  const handleStartEditing = () => {
    if (currentRoute.type !== 'subject') return
    setEditingSubjectName(currentRoute.subjectName)
    setIsEditingSubject(true)
    setTimeout(() => {
      editSubjectInputRef.current?.focus()
      editSubjectInputRef.current?.select()
    }, 40)
  }

  const handleSaveSubjectName = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (currentRoute.type !== 'subject') return

    const trimmed = editingSubjectName.trim()
    if (!trimmed) {
      setIsEditingSubject(false)
      return
    }

    if (trimmed !== currentRoute.subjectName) {
      if (onRenameSubject) {
        onRenameSubject(currentRoute.subjectName, trimmed)
      }
      setUploadSuccessToast(`Subject renamed to "${trimmed}"`)
      setTimeout(() => setUploadSuccessToast(null), 3000)
    }
    setIsEditingSubject(false)
  }

  const handleCancelEditing = () => {
    setIsEditingSubject(false)
    if (currentRoute.type === 'subject') {
      setEditingSubjectName(currentRoute.subjectName)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveSubjectName()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelEditing()
    }
  }

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      const category = windowMeta.categoryFilter || 'General'
      files.forEach(f => {
        if (onUploadFileNote) {
          onUploadFileNote(f, category)
        }
      })
      setUploadSuccessToast(`Uploaded ${files.length} file${files.length > 1 ? 's' : ''} to ${windowMeta.title}`)
      setTimeout(() => setUploadSuccessToast(null), 3500)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      const category = windowMeta.categoryFilter || 'General'
      files.forEach(f => {
        if (onUploadFileNote) {
          onUploadFileNote(f, category)
        }
      })
      setUploadSuccessToast(`Uploaded ${files.length} file${files.length > 1 ? 's' : ''} from device`)
      setTimeout(() => setUploadSuccessToast(null), 3500)
    }
  }

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
          icon: <Star className="w-6 h-6 text-amber-500 fill-amber-500/20" />,
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
        title: currentRoute.subjectName,
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

  // Raw filtered notes for this specific window
  const rawWindowNotes = useMemo(() => {
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
    })
  }, [notes, windowMeta, selectedTag, authorFilter, searchQuery])

  const pdfCountInWindow = rawWindowNotes.filter(n => n.fileData || n.tags.includes('pdf') || n.title.includes('📄')).length
  const textCountInWindow = rawWindowNotes.length - pdfCountInWindow

  const windowNotes = useMemo(() => {
    let list = rawWindowNotes
    if (fileTypeFilter === 'pdf') {
      list = list.filter(n => n.fileData || n.tags.includes('pdf') || n.title.includes('📄'))
    } else if (fileTypeFilter === 'text') {
      list = list.filter(n => !n.fileData && !n.tags.includes('pdf') && !n.title.includes('📄'))
    }
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return b.updatedAt - a.updatedAt
    })
  }, [rawWindowNotes, fileTypeFilter])

  // Available tags in this window
  const availableTags = Array.from(new Set(rawWindowNotes.flatMap(n => n.tags || []))).sort()

  return (
    <div 
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`notes-window-container max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fade-in relative transition-all ${
        isDragging ? 'ring-4 ring-amber-500/40 rounded-3xl bg-amber-50/20 dark:bg-amber-950/20' : ''
      }`}
    >
      {/* Hidden File Input for Device Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf,.doc,.docx,.txt"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      {/* Floating Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 rounded-3xl bg-amber-500/10 dark:bg-amber-950/60 backdrop-blur-xs border-2 border-dashed border-amber-500 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
          <Upload className="w-12 h-12 text-amber-600 dark:text-amber-400 animate-bounce mb-2" />
          <p className="text-lg font-serif font-bold text-amber-900 dark:text-amber-100">Drop PDF & Document files to upload</p>
          <p className="text-xs text-amber-700 dark:text-amber-300">Files will be attached to {windowMeta.title}</p>
        </div>
      )}

      {/* Toast Notification */}
      {uploadSuccessToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white shadow-xl border border-stone-700 dark:border-amber-500/30 animate-fade-in text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{uploadSuccessToast}</span>
        </div>
      )}
      
      {/* Top Window Navigation Bar with Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-stone-800">
        
        {/* BUTTON 1: Back to Home Bubble (Small circular bubble that enlarges on hover) */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center group animate-bubble-spring">
            <div 
              className={`absolute -inset-[1.5px] rounded-full bg-gradient-to-r ${activeUser?.avatarGradient || 'from-indigo-500 via-sky-500 to-amber-400'} opacity-60 blur-[2px] group-hover:opacity-100 group-hover:blur-[4px] group-hover:scale-105 transition-all duration-300 pointer-events-none`}
            />
            <button
              type="button"
              onClick={onBackToHome}
              className="relative flex items-center justify-center h-9 sm:h-10 w-9 sm:w-10 px-0 group-hover:w-auto group-hover:px-3.5 group-hover:gap-1.5 rounded-full bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 shadow-xs hover:shadow-md transition-all duration-300 ease-out cursor-pointer active:scale-95 overflow-hidden"
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4 flex-shrink-0 group-hover:-translate-x-0.5 transition-transform duration-300" />
              <span className="max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 overflow-hidden whitespace-nowrap text-xs sm:text-sm font-semibold transition-all duration-300 ease-out">
                Back to Home
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span>Home</span>
            <span>/</span>
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              {windowMeta.title}
            </span>
          </div>
        </div>

        {/* Action Buttons: 3 Small Bubbles that Enlarge on Hover */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* BUTTON 2: Ask Gemini Bubble */}
          <div className="relative flex items-center group animate-bubble-spring">
            <div 
              className="absolute -inset-[1.5px] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 opacity-60 blur-[2px] group-hover:opacity-100 group-hover:blur-[4px] group-hover:scale-105 transition-all duration-300 pointer-events-none"
            />
            <button
              type="button"
              onClick={() => onOpenGeminiGeneral(windowMeta.title)}
              className="relative flex items-center justify-center h-9 sm:h-10 w-9 sm:w-10 px-0 group-hover:w-auto group-hover:px-3.5 group-hover:gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white shadow-xs hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 ease-out cursor-pointer active:scale-95 overflow-hidden"
              title="Ask Gemini AI"
            >
              <Sparkles className="w-4 h-4 text-amber-200 animate-pulse flex-shrink-0 group-hover:rotate-12 transition-transform duration-300" />
              <span className="max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 overflow-hidden whitespace-nowrap text-xs sm:text-sm font-semibold transition-all duration-300 ease-out">
                Ask Gemini
              </span>
            </button>
          </div>

          {/* BUTTON 3: Add Notes from Device Bubble */}
          <div className="relative flex items-center group animate-bubble-spring">
            <div 
              className="absolute -inset-[1.5px] rounded-full bg-gradient-to-r from-amber-500 via-[#E8B078] to-[#E5B84B] opacity-60 blur-[2px] group-hover:opacity-100 group-hover:blur-[4px] group-hover:scale-105 transition-all duration-300 pointer-events-none"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative flex items-center justify-center h-9 sm:h-10 w-9 sm:w-10 px-0 group-hover:w-auto group-hover:px-3.5 group-hover:gap-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-white dark:hover:bg-stone-100 dark:text-stone-900 border border-amber-200/80 dark:border-white/30 shadow-xs hover:shadow-md transition-all duration-300 ease-out cursor-pointer active:scale-95 overflow-hidden upload-btn-device"
              title="Upload PDF or notes from your device"
            >
              <Upload className="w-4 h-4 text-amber-600 dark:text-stone-900 flex-shrink-0 group-hover:-translate-y-0.5 transition-transform duration-300" />
              <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-hover:opacity-100 overflow-hidden whitespace-nowrap text-xs sm:text-sm font-semibold transition-all duration-300 ease-out">
                + Add Notes from Device
              </span>
            </button>
          </div>

          {/* BUTTON 4: New Note Bubble */}
          <div className="relative flex items-center group animate-bubble-spring">
            <div 
              className={`absolute -inset-[1.5px] rounded-full bg-gradient-to-r ${activeUser?.avatarGradient || 'from-indigo-500 via-sky-500 to-amber-400'} opacity-60 blur-[2px] group-hover:opacity-100 group-hover:blur-[4px] group-hover:scale-105 transition-all duration-300 pointer-events-none`}
            />
            <button
              type="button"
              onClick={() => onCreateNoteInContext(windowMeta.categoryFilter || 'General')}
              className="relative flex items-center justify-center h-9 sm:h-10 w-9 sm:w-10 px-0 group-hover:w-auto group-hover:px-3.5 group-hover:gap-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 shadow-md hover:shadow-lg transition-all duration-300 ease-out cursor-pointer active:scale-95 border border-white/20 dark:border-stone-800/40 overflow-hidden"
              title="Create New Note in this context"
            >
              <Plus className="w-4 h-4 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" />
              <span className="max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 overflow-hidden whitespace-nowrap text-xs sm:text-sm font-semibold transition-all duration-300 ease-out">
                New Note
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* Window Header Title with Click-to-Edit for Subjects */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-center flex-shrink-0">
            {windowMeta.icon}
          </div>
          <div className="flex-1 min-w-0">
            {currentRoute.type === 'subject' && isEditingSubject ? (
              /* Inline Edit Mode */
              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSaveSubjectName(e)
                }} 
                className="flex items-center gap-2 flex-wrap animate-fade-in"
              >
                <input
                  ref={editSubjectInputRef}
                  type="text"
                  value={editingSubjectName}
                  onChange={(e) => setEditingSubjectName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="font-serif font-bold text-xl sm:text-2xl text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 border-2 border-indigo-500 rounded-xl px-3 py-1.5 shadow-inner outline-none ring-2 ring-indigo-500/20 w-full sm:w-auto sm:min-w-[360px]"
                  placeholder="Enter subject name..."
                />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSaveSubjectName()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEditing}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Normal View: Click Subject Name to Edit */
              <div className="flex items-center gap-2.5 flex-wrap">
                <div
                  onClick={currentRoute.type === 'subject' ? handleStartEditing : undefined}
                  className={currentRoute.type === 'subject' 
                    ? 'group/title cursor-pointer flex items-center gap-2.5 hover:opacity-90 transition-all' 
                    : 'flex items-center gap-2.5'
                  }
                  title={currentRoute.type === 'subject' ? 'Click to edit subject name' : undefined}
                >
                  <h1 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors">
                    {windowMeta.title}
                  </h1>
                  {currentRoute.type === 'subject' && (
                    <span 
                      className="p-1 rounded-md text-stone-400 group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 group-hover/title:bg-indigo-50 dark:group-hover/title:bg-indigo-950/60 transition-all opacity-60 group-hover/title:opacity-100" 
                      title="Click to edit subject name"
                    >
                      <Pencil className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                  {windowNotes.length} {windowNotes.length === 1 ? 'note' : 'notes'}
                </span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              {currentRoute.type === 'subject' && !isEditingSubject ? (
                <span className="inline-flex items-center gap-2">
                  <span>{windowMeta.subtitle}</span>
                  <span className="text-stone-300 dark:text-stone-600">•</span>
                  <button
                    onClick={handleStartEditing}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Rename Subject</span>
                  </button>
                </span>
              ) : (
                windowMeta.subtitle
              )}
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

        {/* Filter by Format Pills (when files/PDFs exist) */}
        {pdfCountInWindow > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-stone-400 font-medium mr-1">Format:</span>
            <button
              onClick={() => setFileTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                fileTypeFilter === 'all'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              All Formats ({rawWindowNotes.length})
            </button>
            <button
              onClick={() => setFileTypeFilter('pdf')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                fileTypeFilter === 'pdf'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              <FileText className="w-3 h-3" />
              PDF Documents ({pdfCountInWindow})
            </button>
            <button
              onClick={() => setFileTypeFilter('text')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                fileTypeFilter === 'text'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              Written Notes ({textCountInWindow})
            </button>
          </div>
        )}

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
              {searchQuery || selectedTag || fileTypeFilter !== 'all'
                ? 'No notes or PDF files match your current filters.'
                : 'Upload syllabus PDFs or start jotting down formulas, lectures, and summaries.'}
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 dark:bg-white dark:hover:bg-stone-100 dark:text-stone-900 transition-all shadow-sm hover:scale-[1.02] upload-btn-empty"
            >
              <Upload className="w-3.5 h-3.5 text-white dark:text-stone-900" />
              <span>Upload PDF / Notes from Device</span>
            </button>
            <button
              onClick={() => onCreateNoteInContext(windowMeta.categoryFilter || 'General')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Note Here</span>
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

