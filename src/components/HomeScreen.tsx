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
  ChevronDown,
  BookMarked,
  PlusCircle,
  X,
  User,
  CheckCircle2,
  GraduationCap,
  Building2,
  Hash,
  Upload,
  FileText,
  FileUp,
  Cpu,
  Table,
  LayoutGrid,
  Pencil
} from 'lucide-react'
import { Note, SubjectItem, NoteColor, UserProfile } from '../types'
import { HeroWelcome } from './HeroWelcome'
import { storageService } from '../services/storageService'

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
  onUploadFileNote?: (file: File, category: string) => void
  onRenameSubject?: (oldName: string, newName: string) => void
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
  onOpenSettings,
  onUploadFileNote,
  onRenameSubject
}) => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalTarget, setAddModalTarget] = useState<'subject' | 'notebook'>('subject')
  const [newSubName, setNewSubName] = useState('')
  const [newSubDesc, setNewSubDesc] = useState('')
  const [newSubColor, setNewSubColor] = useState<NoteColor>('indigo')
  
  // Selected semester for viewing subjects inside each semester tile
  const [selectedSemester, setSelectedSemester] = useState<number | null>(1)
  const [isClosingSemester, setIsClosingSemester] = useState(false)
  const closeSemesterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSemesterTileClick = (semNum: number) => {
    if (selectedSemester === semNum && !isClosingSemester) {
      // Toggle collapse with closing animation
      setIsClosingSemester(true)
      if (closeSemesterTimerRef.current) clearTimeout(closeSemesterTimerRef.current)
      closeSemesterTimerRef.current = setTimeout(() => {
        setSelectedSemester(null)
        setIsClosingSemester(false)
      }, 300)
    } else if (isClosingSemester) {
      if (closeSemesterTimerRef.current) clearTimeout(closeSemesterTimerRef.current)
      setIsClosingSemester(false)
      setSelectedSemester(semNum)
    } else {
      setSelectedSemester(semNum)
      setIsClosingSemester(false)
    }
  }

  useEffect(() => {
    return () => {
      if (closeSemesterTimerRef.current) clearTimeout(closeSemesterTimerRef.current)
    }
  }, [])
  const [subjectViewTab, setSubjectViewTab] = useState<'semester' | 'custom'>('semester')
  const [deviceUploadToast, setDeviceUploadToast] = useState<string | null>(null)
  const [targetUploadSubject, setTargetUploadSubject] = useState<string>('')
  const semesterFileInputRef = useRef<HTMLInputElement>(null)

  const triggerUploadForSubject = (subjectTitle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setTargetUploadSubject(subjectTitle)
    semesterFileInputRef.current?.click()
  }

  const handleSemesterFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      const category = targetUploadSubject || `Semester ${selectedSemester || 1}`
      files.forEach(f => {
        if (onUploadFileNote) {
          onUploadFileNote(f, category)
        }
      })
      setDeviceUploadToast(`Uploaded ${files.length} document${files.length > 1 ? 's' : ''} to ${category}`)
      setTimeout(() => setDeviceUploadToast(null), 3500)
      if (semesterFileInputRef.current) semesterFileInputRef.current.value = ''
    }
  }

  // Scroll reveal observer for tiles moving in as the page gets scrolled down
  const semestersRef = useRef<HTMLDivElement>(null)
  const subjectsRef = useRef<HTMLDivElement>(null)
  const viewsRef = useRef<HTMLDivElement>(null)
  const notebooksRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)

  const [semestersVisible, setSemestersVisible] = useState(false)
  const [subjectsVisible, setSubjectsVisible] = useState(false)
  const [viewsVisible, setViewsVisible] = useState(false)
  const [notebooksVisible, setNotebooksVisible] = useState(false)
  const [detailsVisible, setDetailsVisible] = useState(false)

  // Personal Details: Courses Completed Tab state & active semester bubble
  const [showCoursesCompleted, setShowCoursesCompleted] = useState(false)
  const [isClosingCourses, setIsClosingCourses] = useState(false)
  const closeCoursesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [selectedSemesterBubble, setSelectedSemesterBubble] = useState<number>(1)
  const [courseViewMode, setCourseViewMode] = useState<'table' | 'cards'>('table')
  const [showAllSemestersTranscript, setShowAllSemestersTranscript] = useState(false)
  const isArshad = activeUser.id === 'user-arshad' || activeUser.name.toLowerCase().includes('arshad')
  const userCourses = storageService.getCoursesForUser(activeUser.id)

  const handleToggleCoursesCompleted = () => {
    if (showCoursesCompleted && !isClosingCourses) {
      setIsClosingCourses(true)
      if (closeCoursesTimerRef.current) clearTimeout(closeCoursesTimerRef.current)
      closeCoursesTimerRef.current = setTimeout(() => {
        setShowCoursesCompleted(false)
        setIsClosingCourses(false)
      }, 300)
    } else if (isClosingCourses) {
      if (closeCoursesTimerRef.current) clearTimeout(closeCoursesTimerRef.current)
      setIsClosingCourses(false)
      setShowCoursesCompleted(true)
    } else {
      setShowCoursesCompleted(true)
      setIsClosingCourses(false)
    }
  }

  useEffect(() => {
    return () => {
      if (closeCoursesTimerRef.current) clearTimeout(closeCoursesTimerRef.current)
    }
  }, [])

  useEffect(() => {
    // Check initial visibility so sections currently on screen are revealed immediately
    const checkVisibility = () => {
      const vh = window.innerHeight
      if (semestersRef.current) {
        const rect = semestersRef.current.getBoundingClientRect()
        setSemestersVisible(rect.top < vh && rect.bottom > 0)
      }
      if (subjectsRef.current) {
        const rect = subjectsRef.current.getBoundingClientRect()
        setSubjectsVisible(rect.top < vh && rect.bottom > 0)
      }
      if (viewsRef.current) {
        const rect = viewsRef.current.getBoundingClientRect()
        setViewsVisible(rect.top < vh && rect.bottom > 0)
      }
      if (notebooksRef.current) {
        const rect = notebooksRef.current.getBoundingClientRect()
        setNotebooksVisible(rect.top < vh && rect.bottom > 0)
      }
      if (detailsRef.current) {
        const rect = detailsRef.current.getBoundingClientRect()
        setDetailsVisible(rect.top < (vh - 40) && rect.bottom > 40)
      }
    }

    checkVisibility()
    const timer = setTimeout(checkVisibility, 60)

    // Continuous scroll observer for Semester, Subject & Notebook tiles: triggers animations when scrolled up or down
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.target === semestersRef.current) {
          setSemestersVisible(entry.isIntersecting)
        }
        if (entry.target === subjectsRef.current) {
          setSubjectsVisible(entry.isIntersecting)
        }
        if (entry.target === viewsRef.current) {
          setViewsVisible(entry.isIntersecting)
        }
        if (entry.target === notebooksRef.current) {
          setNotebooksVisible(entry.isIntersecting)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.05,
      rootMargin: '0px 0px -20px 0px'
    })

    if (semestersRef.current) observer.observe(semestersRef.current)
    if (subjectsRef.current) observer.observe(subjectsRef.current)
    if (viewsRef.current) observer.observe(viewsRef.current)
    if (notebooksRef.current) observer.observe(notebooksRef.current)

    // Dedicated observer for Personal Details Tile: Fades In when scrolled in, Fades Out when scrolled out
    const detailsObserverCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.target === detailsRef.current) {
          setDetailsVisible(entry.isIntersecting)
        }
      })
    }

    const detailsObserver = new IntersectionObserver(detailsObserverCallback, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    })

    if (detailsRef.current) detailsObserver.observe(detailsRef.current)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
      detailsObserver.disconnect()
    }
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

          {/* Insert Subject Bubble Button */}
          <div className="relative flex items-center group animate-bubble-spring">
            <div 
              className="absolute -inset-[1.5px] rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 opacity-60 blur-[2px] group-hover:opacity-100 group-hover:blur-[4px] group-hover:scale-105 transition-all duration-300 pointer-events-none"
            />
            <button
              type="button"
              onClick={() => {
                setAddModalTarget('subject')
                setShowAddModal(true)
              }}
              className="relative flex items-center justify-center h-9 sm:h-10 w-9 sm:w-10 px-0 group-hover:w-auto group-hover:px-3.5 group-hover:gap-1.5 rounded-full bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 shadow-xs hover:shadow-md transition-all duration-300 ease-out cursor-pointer active:scale-95 overflow-hidden"
              title="Insert New Subject"
            >
              <Plus className="w-4 h-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400 group-hover:rotate-90 transition-transform duration-300" />
              <span className="max-w-0 opacity-0 group-hover:max-w-[130px] group-hover:opacity-100 overflow-hidden whitespace-nowrap text-xs sm:text-sm font-semibold transition-all duration-300 ease-out">
                Insert Subject
              </span>
            </button>
          </div>
          
          {/* New Note Bubble Button */}
          <div className="relative flex items-center group animate-bubble-spring">
            <div 
              className={`absolute -inset-[1.5px] rounded-full bg-gradient-to-r ${activeUser?.avatarGradient || 'from-indigo-500 via-sky-500 to-amber-400'} opacity-60 blur-[2px] group-hover:opacity-100 group-hover:blur-[4px] group-hover:scale-105 transition-all duration-300 pointer-events-none`}
            />
            <button
              type="button"
              onClick={onNewNote}
              className="relative flex items-center justify-center h-9 sm:h-10 w-9 sm:w-10 px-0 group-hover:w-auto group-hover:px-3.5 group-hover:gap-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 shadow-md hover:shadow-lg transition-all duration-300 ease-out cursor-pointer active:scale-95 border border-white/20 dark:border-stone-800/40 overflow-hidden"
              title="Create New Note"
            >
              <Plus className="w-4 h-4 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" />
              <span className="max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 overflow-hidden whitespace-nowrap text-xs sm:text-sm font-semibold transition-all duration-300 ease-out">
                New Note
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION: SEMESTER (8 Tiles: Semester 1 to Semester 8) */}
      <section className="space-y-4">
        {/* Hidden File Input for Device Upload */}
        <input 
          ref={semesterFileInputRef}
          type="file"
          accept=".pdf,application/pdf,.doc,.docx,.txt"
          multiple
          className="hidden"
          onChange={handleSemesterFileSelected}
        />

        {/* Device Upload Toast */}
        {deviceUploadToast && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-xl border border-stone-700 animate-fade-in text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{deviceUploadToast}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              Semester
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Select any semester to display its subject tiles and add notes from your device
            </p>
          </div>
        </div>

        {/* 8 Semester Tiles Grid */}
        <div 
          ref={semestersRef}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((semNum, index) => {
            const semCourses = isArshad ? storageService.getCoursesBySemester(activeUser.id, semNum) : []
            const semCredits = semCourses.reduce((sum, c) => sum + c.credits, 0)
            const semCourseTitles = new Set(semCourses.map(c => c.title.toLowerCase()))
            const semCourseCodes = new Set(semCourses.map(c => c.code.toLowerCase()))
            const semNotesCount = notes.filter(n => {
              const cat = n.category.toLowerCase()
              return cat === `semester ${semNum}` || 
                     cat === `sem ${semNum}` || 
                     semCourseTitles.has(cat) || 
                     semCourseCodes.has(cat) ||
                     semCourses.some(c => n.title.toLowerCase().includes(c.code.toLowerCase()))
            }).length
            const isSelected = selectedSemester === semNum

            return (
              <div
                key={semNum}
                onClick={() => handleSemesterTileClick(semNum)}
                style={{ transitionDelay: semestersVisible ? `${index * 60}ms` : '0ms' }}
                className={`tile-reveal ${semestersVisible ? 'revealed' : ''} group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[145px] ${
                  isSelected && !isClosingSemester
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/50 border-indigo-500 shadow-md ring-2 ring-indigo-500/30 -translate-y-1'
                    : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.02] hover:border-indigo-400 dark:hover:border-indigo-600'
                }`}
              >
                {/* Top Badge & Count */}
                <div className="flex items-center justify-between">
                  <span className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-colors shadow-xs ${
                    isSelected && !isClosingSemester
                      ? 'bg-indigo-600 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-indigo-600 group-hover:text-white'
                  }`}>
                    0{semNum}
                  </span>
                  {isSelected && !isClosingSemester ? (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white shadow-xs">
                      Active
                    </span>
                  ) : (
                    semCourses.length > 0 && (
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                        {semCourses.length} Sub
                      </span>
                    )
                  )}
                </div>

                {/* Center Title */}
                <div className="my-2">
                  <h3 className={`font-serif font-bold text-sm sm:text-base transition-colors ${
                    isSelected && !isClosingSemester ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  }`}>
                    Semester {semNum}
                  </h3>
                  <div className="text-[10px] text-stone-400 mt-0.5 truncate">
                    {isArshad && semCourses.length > 0 
                      ? `${semCredits} Credits • ${semCourses.length} Courses`
                      : (isArshad ? 'Upcoming' : 'Curriculum')
                    }
                  </div>
                </div>

                {/* Bottom subtle indicator */}
                <div className="flex items-center justify-between text-[10px] text-stone-400 font-medium pt-2 border-t border-stone-100 dark:border-stone-800/70">
                  <span>{semNotesCount} Notes</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    isSelected && !isClosingSemester ? 'text-indigo-600 dark:text-indigo-400 rotate-180' : 'text-stone-400 group-hover:text-indigo-500'
                  }`} />
                </div>
              </div>
            )
          })}
        </div>

        {/* INSIDE SEMESTER SECTION: EXPANDED SUBJECT TILES FOR THE ACTIVE SEMESTER TILE */}
        {selectedSemester !== null && (
          <div className={`mt-5 pt-5 border-t border-stone-200/80 dark:border-stone-800 space-y-4 overflow-hidden ${
            isClosingSemester ? 'animate-tab-close-up' : 'animate-tab-open-down'
          }`}>
            {/* Header for Active Semester Subjects */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-600 text-white shadow-xs">
                  Semester 0{selectedSemester}
                </span>
                <span className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                  Subject Modules
                </span>
                {isArshad && storageService.getCoursesBySemester(activeUser.id, selectedSemester).length > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 font-bold">
                    {storageService.getCoursesBySemester(activeUser.id, selectedSemester).length} Courses • {storageService.getCoursesBySemester(activeUser.id, selectedSemester).reduce((s, c) => s + c.credits, 0)} Credits
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Add Subject Bubble Button */}
                <div className="relative flex items-center group animate-bubble-spring">
                  <div 
                    className="absolute -inset-[1.5px] rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 opacity-60 blur-[2px] group-hover:opacity-100 group-hover:blur-[4px] group-hover:scale-105 transition-all duration-300 pointer-events-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAddModalTarget('subject')
                      setShowAddModal(true)
                    }}
                    className="relative flex items-center justify-center h-8 sm:h-8.5 w-8 sm:w-8.5 px-0 group-hover:w-auto group-hover:px-3 group-hover:gap-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs hover:shadow-md transition-all duration-300 ease-out cursor-pointer active:scale-95 overflow-hidden"
                    title="Add Subject Tile"
                  >
                    <Plus className="w-3.5 h-3.5 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-300 ease-out">
                      Add Subject
                    </span>
                  </button>
                </div>

                {/* Collapse Button */}
                <button
                  type="button"
                  onClick={() => handleSemesterTileClick(selectedSemester)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Collapse Semester Subjects"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Collapse</span>
                </button>
              </div>
            </div>

            {/* Subject Tiles Grid */}
            <div ref={subjectsRef} className="space-y-4">
          {(() => {
            const activeCourses = isArshad ? storageService.getCoursesBySemester(activeUser.id, selectedSemester) : []

            if (activeCourses.length > 0) {
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeCourses.map((course, index) => {
                    // Match notes for this subject
                    const courseNotes = notes.filter(n => 
                      n.category.toLowerCase() === course.title.toLowerCase() ||
                      n.category.toLowerCase() === course.code.toLowerCase() ||
                      n.title.toLowerCase().includes(course.code.toLowerCase())
                    )
                    const coursePdfs = courseNotes.filter(n => n.fileData || n.tags.includes('pdf') || n.title.includes('📄'))

                    // Determine aesthetic color accent based on course prefix
                    let accentColor = 'indigo'
                    if (course.code.startsWith('21CSS') || course.code.startsWith('21CSC')) accentColor = 'indigo'
                    else if (course.code.startsWith('21MAB')) accentColor = 'sky'
                    else if (course.code.startsWith('21PYB') || course.code.startsWith('21CYB')) accentColor = 'purple'
                    else if (course.code.startsWith('21BTB') || course.code.startsWith('21GNM') || course.code.startsWith('21CYM')) accentColor = 'emerald'
                    else if (course.code.startsWith('21LEH') || course.code.startsWith('21LEM') || course.code.startsWith('21GNH')) accentColor = 'amber'
                    else accentColor = 'stone'

                    return (
                      <div
                        key={course.code}
                        onClick={() => onOpenSubject(course.title)}
                        style={{
                          transitionDelay: `${index * 50 + 40}ms`
                        }}
                        className={`tile-reveal ${subjectsVisible ? 'revealed' : ''} group relative p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 hover:scale-[1.015] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[200px] hover:border-indigo-400 dark:hover:border-indigo-600`}
                      >
                        {/* Ambient subtle glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                          {/* Top row: Code Badge, Credits, Notes count */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200/70 dark:border-stone-700/70 shadow-2xs">
                              {course.code}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                                {course.credits} Cr
                              </span>
                              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/80 px-2 py-0.5 rounded-md">
                                {courseNotes.length} {courseNotes.length === 1 ? 'note' : 'notes'}
                              </span>
                            </div>
                          </div>

                          {/* Course Title & Category */}
                          <div>
                            <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug line-clamp-2">
                              {course.title}
                            </h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-1">
                              {course.category || 'Core Academic Curriculum'}
                            </p>
                          </div>

                          {/* PDF count indicator if any */}
                          {coursePdfs.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                              <FileText className="w-3.5 h-3.5" />
                              <span>{coursePdfs.length} PDF Document{coursePdfs.length > 1 ? 's' : ''} attached</span>
                            </div>
                          )}

                          {/* Bottom Action Bar: Prominent "+ Add Notes from Device" and Open Link */}
                          <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-2">
                            <button
                              onClick={(e) => triggerUploadForSubject(course.title, e)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900/70 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 transition-all shadow-xs hover:scale-[1.03]"
                              title={`Upload PDF or document notes for ${course.title}`}
                            >
                              <Upload className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                              <span>+ Add Notes from Device</span>
                            </button>

                            <span className="text-xs font-medium text-stone-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1 transition-colors">
                              <span>Open</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>

                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            }

            // Empty state for semesters without registered courses (e.g., Sem 4..8 or Raniya)
            return (
              <div className="py-14 px-6 rounded-3xl border border-dashed border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-800 dark:text-stone-200 text-lg">
                    Semester {selectedSemester} Curriculum
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto mt-1">
                    {isArshad 
                      ? `Semester ${selectedSemester} courses will appear here as you advance. You can start uploading lecture materials or create custom subject tiles now.`
                      : `Semester ${selectedSemester} course modules ready. You can add notes or upload documents directly from your device.`}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {/* Add Notes from Device Bubble */}
                  <div className="relative flex items-center group animate-bubble-spring">
                    <div 
                      className="absolute -inset-[1.5px] rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 opacity-60 blur-[2px] group-hover:opacity-100 group-hover:blur-[4px] group-hover:scale-105 transition-all duration-300 pointer-events-none"
                    />
                    <button
                      type="button"
                      onClick={(e) => triggerUploadForSubject(`Semester ${selectedSemester}`, e)}
                      className="relative flex items-center justify-center h-9 sm:h-10 w-9 sm:w-10 px-0 group-hover:w-auto group-hover:px-4 group-hover:gap-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xs hover:shadow-md transition-all duration-300 ease-out cursor-pointer active:scale-95 overflow-hidden"
                      title="Upload notes from device"
                    >
                      <Upload className="w-4 h-4 flex-shrink-0 group-hover:-translate-y-0.5 transition-transform duration-300" />
                      <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-hover:opacity-100 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-300 ease-out">
                        + Add Notes from Device
                      </span>
                    </button>
                  </div>

                  {/* Add Subject Tile Bubble */}
                  <div className="relative flex items-center group animate-bubble-spring">
                    <div 
                      className="absolute -inset-[1.5px] rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 opacity-60 blur-[2px] group-hover:opacity-100 group-hover:blur-[4px] group-hover:scale-105 transition-all duration-300 pointer-events-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAddModalTarget('subject')
                        setShowAddModal(true)
                      }}
                      className="relative flex items-center justify-center h-9 sm:h-10 w-9 sm:w-10 px-0 group-hover:w-auto group-hover:px-4 group-hover:gap-1.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs hover:shadow-md transition-all duration-300 ease-out cursor-pointer active:scale-95 overflow-hidden"
                      title="Insert New Subject Tile"
                    >
                      <Plus className="w-4 h-4 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" />
                      <span className="max-w-0 opacity-0 group-hover:max-w-[130px] group-hover:opacity-100 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-300 ease-out">
                        Add Subject Tile
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })()}
            </div>
          </div>
        )}

        {/* Optional Toggle / Additional section for Custom Added Subjects if any exist */}
        {subjects.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  Custom & General Subjects ({subjects.length})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {subjects.map((sub) => {
                  const subNotes = notes.filter(n => n.category.toLowerCase() === sub.name.toLowerCase())
                  return (
                    <div
                      key={sub.id}
                      onClick={() => onOpenSubject(sub.name)}
                      className="group p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300">
                          {renderSubjectIcon(sub.icon, 'text-indigo-600 dark:text-indigo-400')}
                        </div>
                        <span className="text-[10px] font-mono text-stone-400">{subNotes.length} notes</span>
                      </div>
                      <div className="mt-2.5">
                        <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {sub.name}
                        </h4>
                      </div>
                      <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                        <button
                          onClick={(e) => triggerUploadForSubject(sub.name, e)}
                          className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          <span>+ Upload</span>
                        </button>
                        <ChevronRight className="w-3 h-3 text-stone-400 group-hover:translate-x-0.5 group-hover:text-indigo-500 transition-transform" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
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

        {/* Personal Details Aesthetic Card (Fade In when Scrolled In, Fade Out when Scrolled Out) */}
        <div 
          ref={detailsRef}
          className={`details-tile-fade ${detailsVisible ? 'faded-in' : 'faded-out'} relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden`}
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

          {/* Action Row: Courses Completed Button & Settings Shortcut */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-6 border-t border-stone-100 dark:border-stone-800/80">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleCoursesCompleted}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 shadow-xs cursor-pointer ${
                  showCoursesCompleted && !isClosingCourses
                    ? 'bg-indigo-600 text-white shadow-indigo-500/25 shadow-md ring-2 ring-indigo-500/30'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 hover:shadow-xs'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-amber-500" />
                <span>Courses Completed</span>
                {isArshad && userCourses.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold transition-colors ${
                    showCoursesCompleted && !isClosingCourses ? 'bg-white/20 text-white' : 'bg-indigo-200/70 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100'
                  }`}>
                    {userCourses.length} Courses
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showCoursesCompleted && !isClosingCourses ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-stone-400">
              <span>
                Profile details configured in <strong>Settings</strong> &gt; <strong>Student Profiles</strong>.
              </span>
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="px-2.5 py-1 rounded-lg font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                >
                  Edit →
                </button>
              )}
            </div>
          </div>

          {/* EXPANDABLE "COURSES COMPLETED" TAB */}
          {showCoursesCompleted && (
            <div className={`pt-6 mt-6 border-t border-stone-200/80 dark:border-stone-800 space-y-5 overflow-hidden ${
              isClosingCourses ? 'animate-tab-close-up' : 'animate-tab-open-down'
            }`}>
              
              {/* Heading & Credits Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    Courses Completed
                  </h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {isArshad 
                      ? 'SRM Institute of Science and Technology course curriculum across all 8 academic semesters'
                      : 'Academic course curriculum across all 8 semesters for ' + activeUser.name
                    }
                  </p>
                </div>

                {isArshad && (
                  <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 font-bold">
                      {userCourses.length} Courses Registered
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 font-bold">
                      {userCourses.reduce((sum, c) => sum + c.credits, 0)} Total Credits (Sem 1-3)
                    </span>
                  </div>
                )}
              </div>

              {/* 8 SEMESTER BUBBLES */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((semNum) => {
                  const isSelected = selectedSemesterBubble === semNum
                  const semCourses = isArshad ? storageService.getCoursesBySemester(activeUser.id, semNum) : []
                  
                  return (
                    <button
                      key={semNum}
                      type="button"
                      onClick={() => setSelectedSemesterBubble(semNum)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all duration-200 flex-shrink-0 ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25 scale-[1.03]'
                          : 'bg-stone-100 dark:bg-stone-800/90 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-stone-200 border border-stone-200/60 dark:border-stone-700/60'
                      }`}
                    >
                      <span>Semester {semNum}</span>
                      {isArshad && (
                        <span className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center ${
                          isSelected 
                            ? 'bg-white/25 text-white' 
                            : semCourses.length > 0 
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' 
                              : 'bg-stone-200 dark:bg-stone-700 text-stone-400'
                        }`}>
                          {semCourses.length}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* DETAILS ACCORDING TO SELECTED SEMESTER BUBBLE */}
              <div className="space-y-3 pt-1">
                {/* For Mohamed Arshad: Add subject details in each bubble */}
                {isArshad ? (
                  (() => {
                    const coursesForBubble = storageService.getCoursesBySemester(activeUser.id, selectedSemesterBubble)
                    const displayCourses = showAllSemestersTranscript ? userCourses : coursesForBubble
                    const totalCredits = displayCourses.reduce((sum, c) => sum + c.credits, 0)
                    
                    if (displayCourses.length === 0) {
                      return (
                        <div className="p-8 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-dashed border-stone-200 dark:border-stone-700 text-center space-y-2">
                          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 mx-auto">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <h5 className="font-serif font-bold text-base text-stone-700 dark:text-stone-300">
                            Semester {selectedSemesterBubble} Curriculum
                          </h5>
                          <p className="text-xs text-stone-400 max-w-sm mx-auto">
                            Upcoming semester registration in progress. No courses completed yet for this semester.
                          </p>
                        </div>
                      )
                    }

                    return (
                      <div className="space-y-3.5">
                        {/* Semester summary banner with View Switcher */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-1 gap-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-800 dark:text-stone-200">
                              {showAllSemestersTranscript 
                                ? `SRM Full Course List (${displayCourses.length} Subjects Across Semesters 1-3)`
                                : `Semester ${selectedSemesterBubble} Course List (${displayCourses.length} Subjects)`
                              }
                            </span>
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-800/50">
                              {totalCredits} Credits
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* All Semesters Toggle */}
                            <button
                              type="button"
                              onClick={() => setShowAllSemestersTranscript(!showAllSemestersTranscript)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors ${
                                showAllSemestersTranscript
                                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:text-stone-900 dark:hover:text-white'
                              }`}
                            >
                              {showAllSemestersTranscript ? 'Show Single Sem' : 'All Semesters'}
                            </button>

                            {/* View Switcher: Portal Table vs Cards */}
                            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
                              <button
                                type="button"
                                onClick={() => setCourseViewMode('table')}
                                className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                                  courseViewMode === 'table'
                                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-bold'
                                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                                }`}
                                title="SRM Official Portal Table View"
                              >
                                <Table className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Portal Table</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setCourseViewMode('cards')}
                                className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                                  courseViewMode === 'cards'
                                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-bold'
                                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                                }`}
                                title="Aesthetic Cards View"
                              >
                                <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Cards</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* MODE 1: SRM STUDENT PORTAL OFFICIAL TABLE VIEW */}
                        {courseViewMode === 'table' ? (
                          <div className="overflow-x-auto rounded-2xl border border-stone-200/90 dark:border-stone-700/80 bg-white dark:bg-stone-900 shadow-xs">
                            {/* SRM Portal header styling matching sp.srmist.edu.in */}
                            <div className="px-4 py-2.5 bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between gap-2 flex-wrap text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-stone-800 dark:text-stone-200 tracking-wide font-sans">
                                  Faculty of Engineering and Technology, Ramapuram, Chennai
                                </span>
                                <span className="text-stone-400">•</span>
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Course List</span>
                              </div>
                              <span className="font-mono text-[11px] text-stone-400">
                                sp.srmist.edu.in
                              </span>
                            </div>

                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-stone-50/70 dark:bg-stone-800/40 border-b border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold text-[11px]">
                                  <th className="py-3 px-4 w-[140px]">Code</th>
                                  <th className="py-3 px-4">Description</th>
                                  <th className="py-3 px-4 text-center w-[90px]">Semester</th>
                                  <th className="py-3 px-4 text-center w-[90px]">Credit</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/70 font-mono">
                                {displayCourses.map((course) => (
                                  <tr key={course.code} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors">
                                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                                      {course.code}
                                    </td>
                                    <td className="py-3 px-4 font-sans text-stone-800 dark:text-stone-200">
                                      <div className="font-medium text-xs text-stone-900 dark:text-stone-100">{course.title}</div>
                                      {course.category && (
                                        <div className="text-[10px] text-stone-400 font-sans mt-0.5">{course.category}</div>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-center font-bold text-stone-700 dark:text-stone-300">
                                      {course.semester}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                                        course.credits > 0 
                                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50' 
                                          : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                                      }`}>
                                        {course.credits}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="bg-stone-50/80 dark:bg-stone-800/80 font-bold border-t border-stone-200 dark:border-stone-700 text-xs">
                                  <td colSpan={2} className="py-3 px-4 text-stone-700 dark:text-stone-200 font-sans">
                                    Total ({displayCourses.length} Subjects)
                                  </td>
                                  <td className="py-3 px-4 text-center text-stone-500 font-mono text-[11px]">
                                    {showAllSemestersTranscript ? 'Sem 1-3' : `Sem ${selectedSemesterBubble}`}
                                  </td>
                                  <td className="py-3 px-4 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                    {displayCourses.reduce((sum, c) => sum + c.credits, 0)} Cr
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        ) : (
                          /* MODE 2: AESTHETIC GRID OF CARDS */
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {displayCourses.map((course) => (
                              <div
                                key={course.code}
                                className="p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all flex flex-col justify-between gap-3 group"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs">
                                      {course.code}
                                    </span>
                                    {showAllSemestersTranscript && (
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                                        Sem {course.semester}
                                      </span>
                                    )}
                                  </div>
                                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                    course.credits > 0 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50' 
                                      : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                                  }`}>
                                    {course.credits > 0 ? `${course.credits} Credits` : 'Non-Credit (0)'}
                                  </span>
                                </div>

                                <div>
                                  <h5 className="font-sans font-bold text-sm text-stone-900 dark:text-stone-100 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {course.title}
                                  </h5>
                                  {course.category && (
                                    <div className="text-[11px] text-stone-400 mt-1 font-medium">
                                      {course.category}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()
                ) : (
                  /* For Raniya Parveen: 8 bubbles, details left empty as requested */
                  <div className="p-8 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-dashed border-stone-200 dark:border-stone-700 text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 mx-auto">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <h5 className="font-serif font-bold text-base text-stone-700 dark:text-stone-300">
                      Semester {selectedSemesterBubble}
                    </h5>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto">
                      No course details added for this semester yet.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}
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

