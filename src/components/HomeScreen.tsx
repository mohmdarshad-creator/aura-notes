import React, { useState, useEffect, useRef } from 'react'
import { 
  BookOpen, 
  Pin, 
  Star, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  Code, 
  Atom, 
  Sigma, 
  Feather, 
  Folder, 
  Clock, 
  Layers, 
  ChevronRight,
  BookMarked,
  PlusCircle,
  X,
  User,
  CheckCircle2,
  GraduationCap,
  Building2,
  Hash
} from 'lucide-react'
import { Note, SubjectItem, NoteColor, UserProfile } from '../types'
import { HeroWelcome } from './HeroWelcome'

interface HomeScreenProps {
  subjects: SubjectItem[]
  notebooks: SubjectItem[]
  notes: Note[]
  activeUser: UserProfile
  users: UserProfile[]
  onSelectUser: (user: UserProfile) => void
  userFilter: 'all' | 'mine'
  setUserFilter: (filter: 'all' | 'mine') => void
  onOpenCollection: (view: 'all' | 'pinned' | 'favorites') => void
  onOpenSubject: (subjectName: string) => void
  onAddSubject: (name: string, description: string, color: NoteColor, icon: string) => void
  onAddNotebook: (name: string, description: string, color: NoteColor, icon: string) => void
  onOpenGemini: () => void
  onNewNote: () => void
  onOpenSettings?: () => void
}

const COLOR_MAP: Record<NoteColor, { border: string; bg: string; text: string; glow: string; badge: string }> = {
  indigo: {
    border: 'hover:border-indigo-400 dark:hover:border-indigo-600',
    bg: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
    text: 'text-indigo-600 dark:text-indigo-400',
    glow: 'group-hover:shadow-indigo-500/15',
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800'
  },
  purple: {
    border: 'hover:border-purple-400 dark:hover:border-purple-600',
    bg: 'from-purple-500/10 via-purple-500/5 to-transparent',
    text: 'text-purple-600 dark:text-purple-400',
    glow: 'group-hover:shadow-purple-500/15',
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-800'
  },
  sky: {
    border: 'hover:border-sky-400 dark:hover:border-sky-600',
    bg: 'from-sky-500/10 via-sky-500/5 to-transparent',
    text: 'text-sky-600 dark:text-sky-400',
    glow: 'group-hover:shadow-sky-500/15',
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/60 dark:border-sky-800'
  },
  emerald: {
    border: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    bg: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    text: 'text-emerald-600 dark:text-emerald-400',
    glow: 'group-hover:shadow-emerald-500/15',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800'
  },
  amber: {
    border: 'hover:border-amber-400 dark:hover:border-amber-600',
    bg: 'from-amber-500/10 via-amber-500/5 to-transparent',
    text: 'text-amber-600 dark:text-amber-400',
    glow: 'group-hover:shadow-amber-500/15',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800'
  },
  coral: {
    border: 'hover:border-rose-400 dark:hover:border-rose-600',
    bg: 'from-rose-500/10 via-rose-500/5 to-transparent',
    text: 'text-rose-600 dark:text-rose-400',
    glow: 'group-hover:shadow-rose-500/15',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-800'
  },
  stone: {
    border: 'hover:border-stone-400 dark:hover:border-stone-600',
    bg: 'from-stone-500/10 via-stone-500/5 to-transparent',
    text: 'text-stone-600 dark:text-stone-400',
    glow: 'group-hover:shadow-stone-500/15',
    badge: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700'
  }
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  subjects,
  notebooks,
  notes,
  activeUser,
  users,
  onSelectUser,
  userFilter,
  setUserFilter,
  onOpenCollection,
  onOpenSubject,
  onAddSubject,
  onAddNotebook,
  onOpenGemini,
  onNewNote,
  onOpenSettings
}) => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalTarget, setAddModalTarget] = useState<'subject' | 'notebook'>('subject')
  const [newSubName, setNewSubName] = useState('')
  const [newSubDesc, setNewSubDesc] = useState('')
  const [newSubColor, setNewSubColor] = useState<NoteColor>('indigo')

  // Scroll reveal observer for tiles moving in as the page gets scrolled down
  const subjectsRef = useRef<HTMLDivElement>(null)
  const viewsRef = useRef<HTMLDivElement>(null)
  const notebooksRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)

  const [subjectsVisible, setSubjectsVisible] = useState(false)
  const [viewsVisible, setViewsVisible] = useState(false)
  const [notebooksVisible, setNotebooksVisible] = useState(false)
  const [detailsVisible, setDetailsVisible] = useState(false)

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target === subjectsRef.current) setSubjectsVisible(true)
          if (entry.target === viewsRef.current) setViewsVisible(true)
          if (entry.target === notebooksRef.current) setNotebooksVisible(true)
          if (entry.target === detailsRef.current) setDetailsVisible(true)
          observer.unobserve(entry.target)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px'
    })

    if (subjectsRef.current) observer.observe(subjectsRef.current)
    if (viewsRef.current) observer.observe(viewsRef.current)
    if (notebooksRef.current) observer.observe(notebooksRef.current)
    if (detailsRef.current) observer.observe(detailsRef.current)

    return () => observer.disconnect()
  }, [subjects, notebooks])

  // Scoped notes based on userFilter
  const displayNotes = userFilter === 'mine' 
    ? notes.filter(n => n.authorId === activeUser.id)
    : notes

  const myNotesCount = notes.filter(n => n.authorId === activeUser.id).length
  const pinnedNotes = displayNotes.filter(n => n.isPinned)
  const favoriteNotes = displayNotes.filter(n => n.isFavorite)

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubName.trim()) return
    if (addModalTarget === 'subject') {
      onAddSubject(newSubName.trim(), newSubDesc.trim(), newSubColor, 'BookOpen')
    } else {
      onAddNotebook(newSubName.trim(), newSubDesc.trim(), newSubColor, 'BookMarked')
    }
    setNewSubName('')
    setNewSubDesc('')
    setShowAddModal(false)
  }

  // Get icon for subject
  const renderSubjectIcon = (icon: string, colorClass: string) => {
    switch (icon) {
      case 'Code': return <Code className={`w-6 h-6 ${colorClass}`} />
      case 'Atom': return <Atom className={`w-6 h-6 ${colorClass}`} />
      case 'Sigma': return <Sigma className={`w-6 h-6 ${colorClass}`} />
      case 'Feather': return <Feather className={`w-6 h-6 ${colorClass}`} />
      default: return <BookMarked className={`w-6 h-6 ${colorClass}`} />
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-10 animate-fade-in">
      
      {/* Front Screen Animated Split Welcome Hero */}
      <HeroWelcome activeUser={activeUser} />

      {/* Control Bar: Scope Toggle (My Notes vs Combined) & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/70 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Student Profile: <strong className="text-stone-800 dark:text-stone-200">{activeUser.name}</strong></span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            {userFilter === 'mine' 
              ? `Displaying ${myNotesCount} personal notes authored by ${activeUser.name}`
              : `Displaying all ${notes.length} notes across both students`
            }
          </p>
        </div>

        {/* User Scope Toggle & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* User Filter Scope: My Notes vs All Notes */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800/80 rounded-xl p-1 border border-stone-200/80 dark:border-stone-700/60 text-xs">
            <button
              onClick={() => setUserFilter('mine')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                userFilter === 'mine'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              My Notes ({myNotesCount})
            </button>
            <button
              onClick={() => setUserFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                userFilter === 'all'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Combined ({notes.length})
            </button>
          </div>

          <button
            onClick={() => {
              setAddModalTarget('subject')
              setShowAddModal(true)
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors border border-stone-200 dark:border-stone-700 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Insert Subject</span>
          </button>
          
          <button
            onClick={onNewNote}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 shadow-md transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* 2x2 BOXES WITH SUBJECT NAMES (Clickable to open in window) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Subjects
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Select any subject to open its dedicated notes window
            </p>
          </div>
          <button
            onClick={() => {
              setAddModalTarget('subject')
              setShowAddModal(true)
            }}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>
        </div>

        {/* 2x2 Grid */}
        <div ref={subjectsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
          {subjects.map((sub, index) => {
            const subjectNotes = displayNotes.filter(n => n.category.toLowerCase() === sub.name.toLowerCase())
            const colors = COLOR_MAP[sub.color] || COLOR_MAP.indigo

            return (
              <div
                key={sub.id}
                onClick={() => onOpenSubject(sub.name)}
                style={{
                  transitionDelay: `${index * 110 + 60}ms`
                }}
                className={`tile-reveal ${subjectsVisible ? 'revealed' : ''} group relative p-6 sm:p-7 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.015] transition-all duration-300 cursor-pointer overflow-hidden ${colors.border} ${colors.glow}`}
              >
                {/* Ambient background hover gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                  
                  {/* Top Bar with Icon & Note Count Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100/80 dark:bg-stone-800/80 border border-stone-200/70 dark:border-stone-700/60 flex items-center justify-center group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 shadow-xs">
                      {renderSubjectIcon(sub.icon, colors.text)}
                    </div>
                    
                    <span className={`text-xs font-mono font-medium px-2.5 py-1 rounded-full border transition-transform duration-300 group-hover:scale-105 ${colors.badge}`}>
                      {subjectNotes.length} {subjectNotes.length === 1 ? 'note' : 'notes'}
                    </span>
                  </div>

                  {/* Subject Title & Description */}
                  <div className="my-3">
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 dark:text-stone-100 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {sub.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                      {sub.description || 'Dedicated study notebook & doubt repository'}
                    </p>
                  </div>

                  {/* Bottom Action Indicator */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800/80 text-xs font-medium text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-colors">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Open Subject Window
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 text-indigo-500 transition-transform duration-300" />
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* VIEWS AS A BAR (Divider & Section Header) */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-[1px] flex-1 bg-stone-200 dark:bg-stone-800" />
          <div className="px-4 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-stone-700 dark:text-stone-300">
              Views
            </span>
          </div>
          <div className="h-[1px] flex-1 bg-stone-200 dark:bg-stone-800" />
        </div>

        {/* 3-BOX ANIMATED THING (All Notes, Pinned, Favorites) */}
        <div ref={viewsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Box 1: All Notes */}
          <div
            onClick={() => onOpenCollection('all')}
            style={{ transitionDelay: '60ms' }}
            className={`tile-reveal ${viewsVisible ? 'revealed' : ''} group relative p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-600`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
                  {displayNotes.length} Notes
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  All Study Notes
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Browse complete knowledge archive across all categories
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800/80 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Open in window</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Box 2: Pinned */}
          <div
            onClick={() => onOpenCollection('pinned')}
            style={{ transitionDelay: '180ms' }}
            className={`tile-reveal ${viewsVisible ? 'revealed' : ''} group relative p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden hover:border-amber-400 dark:hover:border-amber-600`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Pin className="w-5 h-5 text-amber-600 dark:text-amber-400 fill-amber-500/30" />
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800">
                  {pinnedNotes.length} Pinned
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Pinned Notes
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  High-yield formulas, urgent exam materials & summaries
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800/80 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span>Open in window</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Box 3: Favorites */}
          <div
            onClick={() => onOpenCollection('favorites')}
            style={{ transitionDelay: '300ms' }}
            className={`tile-reveal ${viewsVisible ? 'revealed' : ''} group relative p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden hover:border-rose-400 dark:hover:border-rose-600`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="w-5 h-5 text-rose-500 fill-rose-500/30" />
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800">
                  {favoriteNotes.length} Starred
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Favorite Notes
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Cherished conceptual notes, deep dives & key takeaways
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800/80 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <span>Open in window</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* NOTEBOOKS SECTION (BELOW THAT, SAME ANIMATION, SAME STYLE) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-500" />
              Notebooks
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Subject folders and specialized topics
            </p>
          </div>
          <button
            onClick={() => {
              setAddModalTarget('notebook')
              setShowAddModal(true)
            }}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Notebook</span>
          </button>
        </div>

        {/* Notebooks Cards Grid (Animated as Page Scrolled Down) */}
        <div ref={notebooksRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {notebooks.map((notebook, index) => {
            const count = displayNotes.filter(n => n.category.toLowerCase() === notebook.name.toLowerCase()).length
            const colors = COLOR_MAP[notebook.color] || COLOR_MAP.indigo

            return (
              <div
                key={notebook.id}
                onClick={() => onOpenSubject(notebook.name)}
                style={{
                  transitionDelay: `${(index % 4) * 90 + 50}ms`
                }}
                className={`tile-reveal ${notebooksVisible ? 'revealed' : ''} group relative p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden ${colors.border}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative z-10 flex flex-col justify-between h-full min-h-[130px]">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {renderSubjectIcon(notebook.icon, colors.text)}
                    </div>
                    <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border ${colors.badge}`}>
                      {count}
                    </span>
                  </div>

                  <div className="my-2">
                    <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {notebook.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                      {notebook.description || `${count} notes stored`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800/80 text-[11px] font-medium text-stone-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <span>Open Notebook</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* PERSONAL DETAILS SECTION (TAB BELOW NOTEBOOKS) */}
      <section className="space-y-4 pt-4 border-t border-stone-200/70 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              Personal Details
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Academic scholar credentials, specializations & personal learning metrics
            </p>
          </div>

          {/* Student Profile Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl p-1 border border-stone-200/80 dark:border-stone-700/60 text-xs self-start sm:self-auto overflow-x-auto max-w-full">
            {users.map((u) => {
              const isSelected = activeUser.id === u.id
              return (
                <button
                  key={u.id}
                  onClick={() => onSelectUser(u)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold flex-shrink-0 whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded text-[8px] font-bold flex items-center justify-center text-white bg-gradient-to-tr ${u.avatarGradient}`}>
                    {u.initials}
                  </span>
                  <span>{u.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Personal Details Aesthetic Card (Animated as Page Scrolled Down) */}
        <div 
          ref={detailsRef}
          className={`tile-reveal ${detailsVisible ? 'revealed' : ''} relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden`}
        >
          {/* Subtle Ambient Background Tint */}
          <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${activeUser.avatarGradient} opacity-5 blur-3xl pointer-events-none`} />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Left: Avatar & Identity Details */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr ${activeUser.avatarGradient} flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-md flex-shrink-0`}>
                {activeUser.initials}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 dark:text-stone-100">
                    {activeUser.name}
                  </h3>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Scholar
                  </span>
                </div>

                {/* Academic Credentials: Register Number & College */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 shadow-xs">
                    <Hash className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Reg No: {activeUser.registerNumber || (activeUser.name.includes('Arshad') ? 'RA2511028020147' : '9602104171')}</span>
                  </div>

                  <span className="text-stone-300 dark:text-stone-600 hidden sm:inline">•</span>

                  <div className="flex items-center gap-1.5 text-xs text-stone-700 dark:text-stone-200 font-medium">
                    <GraduationCap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>{activeUser.college || (activeUser.name.includes('Arshad') ? 'SRM Engineering College, Ramapuram, Chennai' : 'Arunachala College of Engineering, Ammandivilai, Kaniyakumari')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 text-[11px] text-stone-400 flex-wrap">
                  <span className="font-semibold text-stone-600 dark:text-stone-300">{activeUser.role}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                    Verified Local Study Space
                  </span>
                  <span>•</span>
                  <span>Gemini 2.5 Flash Connected</span>
                </div>
              </div>
            </div>

            {/* Right: Academic Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
              <div className="p-3 sm:p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 text-center min-w-[90px]">
                <div className="text-lg sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
                  {notes.filter(n => n.authorId === activeUser.id).length}
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-stone-400 mt-0.5">
                  Authored Notes
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 text-center min-w-[90px]">
                <div className="text-lg sm:text-2xl font-bold font-serif text-amber-600 dark:text-amber-400">
                  {notes.filter(n => n.authorId === activeUser.id && n.isPinned).length}
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-stone-400 mt-0.5">
                  Pinned Review
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 text-center min-w-[90px]">
                <div className="text-lg sm:text-2xl font-bold font-serif text-rose-600 dark:text-rose-400">
                  {notes.filter(n => n.authorId === activeUser.id && n.isFavorite).length}
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-stone-400 mt-0.5">
                  Starred Sheets
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Footer Notice (No pen button) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 mt-6 border-t border-stone-100 dark:border-stone-800/80 text-xs text-stone-400">
            <span>
              Profile details are configured in <strong>Settings</strong> &gt; <strong>Student Profiles</strong>.
            </span>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="self-start sm:self-auto px-3 py-1.5 rounded-xl font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
              >
                Configure in Settings →
              </button>
            )}
          </div>
        </div>
      </section>

      {/* INSERT SUBJECT OR NOTEBOOK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                    {addModalTarget === 'subject' ? 'Insert New Subject' : 'Insert New Notebook Folder'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    {addModalTarget === 'subject'
                      ? 'Adds directly to your Subjects section above'
                      : 'Adds directly to your Notebooks section below'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {addModalTarget === 'subject' ? 'Subject Name' : 'Notebook Folder Name'}
                </label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder={addModalTarget === 'subject' ? 'e.g. Neuroscience, Macroeconomics, Chemistry...' : 'e.g. AI Lab, Embedded Systems, Quantum Notes...'}
                  className="w-full mt-1.5 px-3.5 py-2.5 text-sm rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Short Description
                </label>
                <input
                  type="text"
                  value={newSubDesc}
                  onChange={(e) => setNewSubDesc(e.target.value)}
                  placeholder={addModalTarget === 'subject' ? 'e.g. Brain networks, synaptic plasticity & cognitive science' : 'e.g. Code snippets, lab experiments & assignments'}
                  className="w-full mt-1.5 px-3.5 py-2.5 text-sm rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Accent Color
                </label>
                <div className="flex items-center gap-2 mt-2">
                  {(['indigo', 'purple', 'sky', 'emerald', 'amber', 'coral'] as NoteColor[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSubColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        c === 'indigo' ? 'bg-indigo-500' :
                        c === 'purple' ? 'bg-purple-500' :
                        c === 'sky' ? 'bg-sky-500' :
                        c === 'emerald' ? 'bg-emerald-500' :
                        c === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                      } ${newSubColor === c ? 'ring-2 ring-stone-900 dark:ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
                >
                  {addModalTarget === 'subject' ? 'Insert Subject' : 'Create Notebook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

