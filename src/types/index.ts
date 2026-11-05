export type NoteColor = 'amber' | 'emerald' | 'indigo' | 'coral' | 'purple' | 'sky' | 'stone'

export interface UserProfile {
  id: string
  name: string
  initials: string
  color: NoteColor
  role: string
  avatarGradient: string
  registerNumber?: string
  college?: string
}

export interface Note {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  color: NoteColor
  isPinned: boolean
  isFavorite: boolean
  authorId: string
  authorName: string
  createdAt: number
  updatedAt: number
}

export interface DoubtMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  attachedNoteId?: string
  attachedNoteTitle?: string
  isStreaming?: boolean
}

export interface GeminiConfig {
  apiKey: string
  model: string
  customInstructions?: string
}

export interface CategoryItem {
  id: string
  name: string
  icon: string
  color: string
}

export interface SubjectItem {
  id: string
  name: string
  description?: string
  color: NoteColor
  icon: string
  createdAt?: number
}

export type PageRoute = 
  | { type: 'home' }
  | { type: 'collection'; view: 'all' | 'pinned' | 'favorites' }
  | { type: 'subject'; subjectName: string }
