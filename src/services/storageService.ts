import { Note, DoubtMessage, SubjectItem } from '../types'

const NOTES_STORAGE_KEY = 'auranotes_notes_v1'
const API_KEY_STORAGE_KEY = 'auranotes_gemini_api_key'
const CHAT_HISTORY_STORAGE_KEY = 'auranotes_doubt_history_v1'
const THEME_STORAGE_KEY = 'auranotes_theme'
const SUBJECTS_STORAGE_KEY = 'auranotes_subjects_v2'

export const DEFAULT_SUBJECTS: SubjectItem[] = [
  { 
    id: 'sub-cs', 
    name: 'Computer Science', 
    description: 'Neural Networks, Data Structures, Algorithms & Machine Learning',
    color: 'indigo', 
    icon: 'Code' 
  },
  { 
    id: 'sub-physics', 
    name: 'Physics', 
    description: 'Quantum Mechanics, Entanglement, Relativity & Thermodynamics',
    color: 'purple', 
    icon: 'Atom' 
  },
  { 
    id: 'sub-math', 
    name: 'Mathematics', 
    description: 'Linear Algebra, Calculus, Proofs & Discrete Structures',
    color: 'sky', 
    icon: 'Sigma' 
  },
  { 
    id: 'sub-philosophy', 
    name: 'Philosophy', 
    description: 'Stoicism, Cognitive Clarity, Epistemology & Logic',
    color: 'emerald', 
    icon: 'Feather' 
  },
]

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: '🧠 Neural Networks & Backpropagation Simplified',
    content: `# Neural Networks & Backpropagation

A neural network is an interconnected assembly of simple processing units (neurons) whose functionality is loosely based on the animal neuron.

### 1. Forward Pass
Information flows from input layer $\\rightarrow$ hidden layers $\\rightarrow$ output layer:
$$z = W \\cdot x + b$$
$$a = \\sigma(z)$$

Common activation functions:
- **ReLU**: $f(x) = \\max(0, x)$ — prevents vanishing gradients.
- **Sigmoid**: $f(x) = \\frac{1}{1 + e^{-x}}$ — maps output between $[0, 1]$.
- **Softmax**: Multi-class probability distribution.

### 2. The Loss Function (Error)
For regression, we typically use Mean Squared Error (MSE):
$$L = \\frac{1}{2} (y_{pred} - y_{true})^2$$

### 3. Backpropagation (Chain Rule)
To update weight $w_{ij}$, we compute the partial derivative of loss with respect to that weight:
$$\\frac{\\partial L}{\\partial w} = \\frac{\\partial L}{\\partial a} \\cdot \\frac{\\partial a}{\\partial z} \\cdot \\frac{\\partial z}{\\partial w}$$

> **Key Intuition**: Backpropagation is just the calculus chain rule working backward to tell each weight how much it contributed to the final mistake!`,
    category: 'Computer Science',
    tags: ['machine-learning', 'math', 'ai'],
    color: 'indigo',
    isPinned: true,
    isFavorite: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 4,
  },
  {
    id: 'note-2',
    title: '⚡ Quantum Computing: Superposition & Entanglement',
    content: `# Quantum Computing Essentials

Classical computers store information in **bits** (0 or 1). Quantum computers use **qubits** which harness quantum mechanical phenomena.

---

### Core Principles

#### 1. Superposition
A qubit state $|\\psi\\rangle$ can exist as a linear combination of basis states $|0\\rangle$ and $|1\\rangle$:
$$|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$$
where $|\\alpha|^2 + |\\beta|^2 = 1$. Until measured, the qubit is in both states simultaneously!

#### 2. Quantum Entanglement
Two or more particles become connected such that the quantum state of each particle cannot be described independently of the others:
$$|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$$
If one qubit collapses to $|0\\rangle$, the other collapses to $|0\\rangle$ instantaneously, regardless of distance.

#### 3. Quantum Gates
- **Hadamard (H)**: Creates superposition from basis states.
- **Pauli-X**: Bit-flip gate (quantum NOT).
- **CNOT**: Entangles two qubits (conditional NOT).

### Why it Matters
- **Shor's Algorithm**: Factorizes large integers in polynomial time (breaks RSA).
- **Grover's Algorithm**: Unsorted database search in $O(\\sqrt{N})$ time.
- **Drug Discovery**: Simulating molecular structures at quantum level.`,
    category: 'Physics',
    tags: ['quantum', 'physics', 'computing'],
    color: 'purple',
    isPinned: true,
    isFavorite: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    updatedAt: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: 'note-3',
    title: '🌌 The Fermi Paradox & The Great Filter Hypothesis',
    content: `# The Fermi Paradox & The Great Filter

> *"Where is everybody?"* — Enrico Fermi, 1950

If the universe is $\\approx 13.8$ billion years old and contains trillions of habitable planets, intelligent life should have colonized the galaxy by now. Why is there total silence?

### Robin Hanson's Great Filter
Somewhere along the evolutionary path from non-living matter to an interstellar civilization, there exists a barrier that is nearly impossible to cross.

The 9 Evolutionary Steps:
1. Right star system & habitable planet
2. Abiogenesis (organic molecules $\\rightarrow$ self-replicating RNA)
3. Prokaryotic single-cell life
4. Eukaryotic complex single-cell life
5. Sexual reproduction
6. Multi-cellular organisms
7. Tool-using animals with big brains
8. Space-faring civilization (Humans currently here)
9. Interstellar colonization

### The Big Question: Is the filter behind us or ahead of us?
- **Behind Us**: Abiogenesis or eukaryotic transition is cosmically rare. We are lonely and extremely lucky.
- **Ahead of Us**: Technological civilizations inevitably destroy themselves (nuclear war, runaway AGI, engineered pandemics, or climate collapse).`,
    category: 'Astronomy',
    tags: ['space', 'philosophy', 'evolution'],
    color: 'amber',
    isPinned: false,
    isFavorite: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    updatedAt: Date.now() - 1000 * 60 * 60 * 20,
  },
  {
    id: 'note-4',
    title: '🌿 Stoic Philosophy: The Dichotomy of Control & Deep Focus',
    content: `# Stoic Principles for High Performance

Stoicism is not the suppression of emotion; it is the freedom from destructive passions through clear, rational thinking.

### 1. The Dichotomy of Control (Epictetus)
Things are divided into two categories:
- **Within our control**: Our opinions, desires, intentions, focus, and actions.
- **Outside our control**: Other people's opinions, outcomes, the past, the weather, algorithmic feeds.

> *"Make the best use of what is in your power, and take the rest as it happens."* — Epictetus

### 2. Practical Protocols for Deep Study
- **Amor Fati**: Love your fate. Difficult exams or challenging bug fixes aren't obstacles; they are the training ground.
- **Premeditatio Malorum**: Negative visualization. Prepare your mind for distractions and fatigue before starting a 3-hour deep work block.
- **Memento Mori**: Remember that time is finite. Treat your attention as the most sacred currency.`,
    category: 'Philosophy',
    tags: ['stoicism', 'productivity', 'mindset'],
    color: 'emerald',
    isPinned: false,
    isFavorite: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    updatedAt: Date.now() - 1000 * 60 * 60 * 48,
  }
]

export const CATEGORIES = [
  { id: 'all', name: 'All Notes', icon: 'BookOpen', color: 'text-stone-600' },
  { id: 'Computer Science', name: 'Computer Science', icon: 'Code', color: 'text-indigo-500' },
  { id: 'Physics', name: 'Physics', icon: 'Atom', color: 'text-purple-500' },
  { id: 'Astronomy', name: 'Astronomy', icon: 'Sparkles', color: 'text-amber-500' },
  { id: 'Philosophy', name: 'Philosophy', icon: 'Feather', color: 'text-emerald-500' },
  { id: 'Mathematics', name: 'Mathematics', icon: 'Sigma', color: 'text-sky-500' },
  { id: 'General', name: 'General', icon: 'FileText', color: 'text-stone-500' },
]

export const storageService = {
  getNotes(): Note[] {
    try {
      const stored = localStorage.getItem(NOTES_STORAGE_KEY)
      if (!stored) {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(INITIAL_NOTES))
        return INITIAL_NOTES
      }
      return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to load notes from localStorage', e)
      return INITIAL_NOTES
    }
  },

  saveNotes(notes: Note[]): void {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes))
    } catch (e) {
      console.error('Failed to save notes to localStorage', e)
    }
  },

  getApiKey(): string {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || ''
  },

  saveApiKey(key: string): void {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim())
  },

  getChatHistory(): DoubtMessage[] {
    try {
      const stored = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  saveChatHistory(messages: DoubtMessage[]): void {
    try {
      localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(messages))
    } catch (e) {
      console.error('Failed to save chat history', e)
    }
  },

  clearChatHistory(): void {
    localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY)
  },

  getTheme(): string {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'light'
  },

  saveTheme(theme: string): void {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  },

  getSubjects(): SubjectItem[] {
    try {
      const stored = localStorage.getItem(SUBJECTS_STORAGE_KEY)
      if (!stored) {
        localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(DEFAULT_SUBJECTS))
        return DEFAULT_SUBJECTS
      }
      return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to load subjects', e)
      return DEFAULT_SUBJECTS
    }
  },

  saveSubjects(subjects: SubjectItem[]): void {
    try {
      localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(subjects))
    } catch (e) {
      console.error('Failed to save subjects', e)
    }
  },

  addSubject(name: string, description: string = '', color: any = 'indigo', icon: string = 'BookOpen'): SubjectItem {
    const current = this.getSubjects()
    const newSubject: SubjectItem = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom study collection',
      color,
      icon,
      createdAt: Date.now()
    }
    const updated = [...current, newSubject]
    this.saveSubjects(updated)
    return newSubject
  },

  exportNotesJson(notes: Note[]): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `auranotes_backup_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  },

  exportSingleNoteMarkdown(note: Note): void {
    const header = `---
title: ${note.title}
category: ${note.category}
tags: ${note.tags.join(', ')}
date: ${new Date(note.updatedAt).toISOString()}
---

`
    const fullContent = header + note.content
    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(fullContent)
    const downloadAnchor = document.createElement('a')
    const sanitizedTitle = note.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `${sanitizedTitle || 'note'}.md`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }
}

