import { Note, DoubtMessage, SubjectItem, UserProfile } from '../types'

const NOTES_STORAGE_KEY = 'auranotes_notes_v2'
const API_KEY_STORAGE_KEY = 'auranotes_gemini_api_key'
const CHAT_HISTORY_STORAGE_KEY = 'auranotes_doubt_history_v2'
const THEME_STORAGE_KEY = 'auranotes_theme'
const SUBJECTS_STORAGE_KEY = 'auranotes_subjects_v2'
const ACTIVE_USER_STORAGE_KEY = 'auranotes_active_user_v2'
const USERS_STORAGE_KEY = 'auranotes_users_v2'

export const USERS: UserProfile[] = [
  {
    id: 'user-arshad',
    name: 'Mohamed Arshad',
    initials: 'MA',
    color: 'indigo',
    role: 'Computer Science & AI Researcher',
    avatarGradient: 'from-indigo-600 via-indigo-500 to-amber-400'
  },
  {
    id: 'user-raniya',
    name: 'Raniya Parveen',
    initials: 'RP',
    color: 'coral',
    role: 'Physics & Life Sciences Scholar',
    avatarGradient: 'from-rose-500 via-pink-500 to-amber-300'
  },
  {
    id: 'user-zayd',
    name: 'Zayd Al-Mansoor',
    initials: 'ZA',
    color: 'sky',
    role: 'Pure Mathematics & Cryptography',
    avatarGradient: 'from-cyan-500 via-sky-500 to-indigo-500'
  },
  {
    id: 'user-ayesha',
    name: 'Ayesha Siddiqua',
    initials: 'AS',
    color: 'emerald',
    role: 'Astronomy & Astrophysics Scholar',
    avatarGradient: 'from-emerald-600 via-teal-500 to-sky-400'
  }
]

export const DEFAULT_SUBJECTS: SubjectItem[] = [
  { 
    id: 'sub-cs', 
    name: 'Computer Science', 
    description: 'Neural Networks, Distributed Systems & Machine Learning',
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
  // Mohamed Arshad's Notes
  {
    id: 'note-1',
    title: '🧠 Neural Networks & Backpropagation Simplified',
    content: `# Neural Networks & Backpropagation

A neural network is an interconnected assembly of simple processing units (neurons) whose functionality is loosely based on the biological neuron.

### 1. Forward Pass
Information flows from input layer $\\rightarrow$ hidden layers $\\rightarrow$ output layer:
$$z = W \\cdot x + b$$
$$a = \\sigma(z)$$

Common activation functions:
- **ReLU**: $f(x) = \\max(0, x)$ — prevents vanishing gradients.
- **Sigmoid**: $f(x) = \\frac{1}{1 + e^{-x}}$ — maps output between $[0, 1]$.
- **Softmax**: Multi-class probability distribution.

### 2. Backpropagation (Chain Rule)
To update weight $w_{ij}$, we compute the partial derivative of loss with respect to that weight:
$$\\frac{\\partial L}{\\partial w} = \\frac{\\partial L}{\\partial a} \\cdot \\frac{\\partial a}{\\partial z} \\cdot \\frac{\\partial z}{\\partial w}$$

> **Key Takeaway**: Backpropagation is the calculus chain rule working backward to tell each neuron how much it contributed to the final prediction error.`,
    category: 'Computer Science',
    tags: ['machine-learning', 'math', 'ai'],
    color: 'indigo',
    isPinned: true,
    isFavorite: true,
    authorId: 'user-arshad',
    authorName: 'Mohamed Arshad',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 60 * 4,
  },
  {
    id: 'note-4',
    title: '🌿 Stoic Philosophy: The Dichotomy of Control & Deep Focus',
    content: `# Stoic Principles for High Performance

Stoicism is not the suppression of emotion; it is the liberation from destructive impulses through clear, rational thinking.

### 1. The Dichotomy of Control (Epictetus)
Things are divided into two categories:
- **Within our control**: Our opinions, desires, intentions, focus, and actions.
- **Outside our control**: Other people's opinions, external outcomes, algorithmic feeds.

> *"Make the best use of what is in your power, and take the rest as it happens."* — Epictetus

### 2. Practical Protocols for Deep Study
- **Amor Fati**: Love your fate. Difficult exams or bug fixes aren't obstacles; they are the training ground.
- **Premeditatio Malorum**: Negative visualization. Prepare your mind for distractions before starting deep work.
- **Memento Mori**: Treat your attention as the most sacred currency.`,
    category: 'Philosophy',
    tags: ['stoicism', 'productivity', 'mindset'],
    color: 'emerald',
    isPinned: false,
    isFavorite: true,
    authorId: 'user-arshad',
    authorName: 'Mohamed Arshad',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    updatedAt: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    id: 'note-5',
    title: '🌐 Distributed Systems: CAP Theorem & Consensus',
    content: `# Distributed Systems & Consensus

In a distributed computer network, trade-offs between consistency and availability are inevitable.

### Eric Brewer's CAP Theorem
A distributed data store can simultaneously provide at most two out of three guarantees:
1. **Consistency (C)**: Every read receives the most recent write or an error.
2. **Availability (A)**: Every request receives a non-error response, without guarantee that it contains the most recent write.
3. **Partition Tolerance (P)**: The system continues to operate despite an arbitrary number of dropped or delayed messages between nodes.

> In the presence of a network partition, you must choose between Consistency (CP) and Availability (AP).`,
    category: 'Computer Science',
    tags: ['distributed-systems', 'architecture', 'cloud'],
    color: 'sky',
    isPinned: true,
    isFavorite: false,
    authorId: 'user-arshad',
    authorName: 'Mohamed Arshad',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60 * 6,
  },

  // Raniya Parveen's Notes
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
Two or more particles become connected such that the quantum state of each particle cannot be described independently:
$$|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$$
If one qubit collapses to $|0\\rangle$, the other collapses instantaneously, regardless of cosmic distance.

### Algorithms to Know
- **Shor's Algorithm**: Factorizes large integers in polynomial time.
- **Grover's Algorithm**: Unsorted database search in $O(\\sqrt{N})$ time.`,
    category: 'Physics',
    tags: ['quantum', 'physics', 'computing'],
    color: 'purple',
    isPinned: true,
    isFavorite: true,
    authorId: 'user-raniya',
    authorName: 'Raniya Parveen',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    updatedAt: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: 'note-3',
    title: '🌌 The Fermi Paradox & The Great Filter Hypothesis',
    content: `# The Fermi Paradox & The Great Filter

> *"Where is everybody?"* — Enrico Fermi, 1950

If the observable universe contains trillions of habitable planets, intelligent life should have colonized our galaxy by now. Why is there cosmic silence?

### Robin Hanson's Great Filter
Somewhere along the evolutionary path from non-living matter to an interstellar civilization, there exists a barrier that is nearly impossible to cross.

### The Big Question: Is the filter behind us or ahead of us?
- **Behind Us**: Abiogenesis or eukaryotic transition is cosmically rare. We are lonely and extremely lucky.
- **Ahead of Us**: Technological civilizations inevitably destroy themselves (nuclear war, unaligned AGI, synthetic pandemics, or climate collapse).`,
    category: 'Astronomy',
    tags: ['space', 'philosophy', 'evolution'],
    color: 'amber',
    isPinned: true,
    isFavorite: false,
    authorId: 'user-raniya',
    authorName: 'Raniya Parveen',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    updatedAt: Date.now() - 1000 * 60 * 60 * 20,
  },
  {
    id: 'note-6',
    title: '🧬 CRISPR-Cas9 & Molecular Genetics Architecture',
    content: `# CRISPR-Cas9 Gene Editing Mechanisms

CRISPR (Clustered Regularly Interspaced Short Palindromic Repeats) is a bacterial defense mechanism adapted into a revolutionary precision genome editing tool.

### Mechanism Steps:
1. **Guide RNA (gRNA)**: Synthesized sequence (approx 20 base pairs) targeting the exact genomic DNA locus.
2. **Cas9 Endonuclease**: The molecular "scissors" that binds to the gRNA.
3. **PAM Sequence**: Cas9 scans for the Protospacer Adjacent Motif (5'-NGG-3').
4. **Double-Strand Break (DSB)**: Cas9 cleaves both strands 3-4 base pairs upstream of the PAM.
5. **DNA Repair**:
   - *NHEJ* (Non-Homologous End Joining) $\\rightarrow$ gene knockout.
   - *HDR* (Homology-Directed Repair) $\\rightarrow$ precise targeted gene insertion.`,
    category: 'Physics',
    tags: ['genetics', 'biology', 'crispr', 'biotech'],
    color: 'coral',
    isPinned: false,
    isFavorite: true,
    authorId: 'user-raniya',
    authorName: 'Raniya Parveen',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    updatedAt: Date.now() - 1000 * 60 * 60 * 3,
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
  getAllUsers(): UserProfile[] {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(USERS))
      return USERS
    } catch {
      return USERS
    }
  },

  saveUsers(users: UserProfile[]): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    } catch (e) {
      console.error('Failed to save users', e)
    }
  },

  updateUser(updated: UserProfile): UserProfile[] {
    const current = this.getAllUsers()
    const updatedList = current.map(u => u.id === updated.id ? updated : u)
    this.saveUsers(updatedList)
    return updatedList
  },

  addUser(newUser: Omit<UserProfile, 'id'>): { user: UserProfile; users: UserProfile[] } {
    const current = this.getAllUsers()
    const created: UserProfile = {
      ...newUser,
      id: `user-${Date.now()}`
    }
    const updatedList = [...current, created]
    this.saveUsers(updatedList)
    return { user: created, users: updatedList }
  },

  deleteUser(userId: string): UserProfile[] {
    const current = this.getAllUsers()
    if (current.length <= 1) return current // keep at least 1 user
    const updatedList = current.filter(u => u.id !== userId)
    this.saveUsers(updatedList)
    return updatedList
  },

  getActiveUser(): UserProfile {
    try {
      const users = this.getAllUsers()
      const activeId = localStorage.getItem(ACTIVE_USER_STORAGE_KEY)
      const found = users.find(u => u.id === activeId)
      return found || users[0]
    } catch {
      return USERS[0]
    }
  },

  setActiveUser(userId: string): UserProfile {
    const users = this.getAllUsers()
    const found = users.find(u => u.id === userId) || users[0]
    localStorage.setItem(ACTIVE_USER_STORAGE_KEY, found.id)
    return found
  },

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

  getChatHistory(userId?: string): DoubtMessage[] {
    try {
      const key = `${CHAT_HISTORY_STORAGE_KEY}_${userId || 'default'}`
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  saveChatHistory(userId: string, messages: DoubtMessage[]): void {
    try {
      const key = `${CHAT_HISTORY_STORAGE_KEY}_${userId}`
      localStorage.setItem(key, JSON.stringify(messages))
    } catch (e) {
      console.error('Failed to save chat history', e)
    }
  },

  clearChatHistory(userId: string): void {
    const key = `${CHAT_HISTORY_STORAGE_KEY}_${userId}`
    localStorage.removeItem(key)
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
author: ${note.authorName}
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
