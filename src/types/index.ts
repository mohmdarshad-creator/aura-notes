export type NoteColor = 'amber' | 'emerald' | 'indigo' | 'coral' | 'purple' | 'sky' | 'stone'

export interface Note {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  color: NoteColor
  isPinned: boolean
  isFavorite: boolean
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
