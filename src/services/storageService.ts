import { Note, DoubtMessage, SubjectItem, UserProfile, CourseItem } from '../types'

const NOTES_STORAGE_KEY = 'auranotes_notes_v2'
const API_KEY_STORAGE_KEY = 'auranotes_gemini_api_key'
const CHAT_HISTORY_STORAGE_KEY = 'auranotes_doubt_history_v2'
const THEME_STORAGE_KEY = 'auranotes_theme'
const SUBJECTS_STORAGE_KEY = 'auranotes_subjects_v2'
const NOTEBOOKS_STORAGE_KEY = 'auranotes_notebooks_v2'
const ACTIVE_USER_STORAGE_KEY = 'auranotes_active_user_v2'
const USERS_STORAGE_KEY = 'auranotes_users_v2'
const COURSES_STORAGE_KEY = 'auranotes_courses_v2'

export const fileBlobCache = new Map<string, string>()

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function extractTextFromPdfStream(raw: string): string {
  try {
    const textPieces: string[] = []
    
    // Pattern 1: (Text) Tj
    const tjRegex = /\((.*?)\)\s*Tj/g
    let match
    while ((match = tjRegex.exec(raw)) !== null) {
      const text = match[1]
        .replace(/\\([()\\])/g, '$1')
        .replace(/\\r/g, '\n')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, ' ')
      if (text.trim().length > 0) {
        textPieces.push(text.trim())
      }
    }

    // Pattern 2: [(Text) 123 (Text)] TJ
    const tjArrayRegex = /\[(.*?)\]\s*TJ/g
    while ((match = tjArrayRegex.exec(raw)) !== null) {
      const inner = match[1]
      const strMatches = inner.match(/\((.*?)\)/g)
      if (strMatches) {
        const line = strMatches
          .map(s => s.slice(1, -1).replace(/\\([()\\])/g, '$1'))
          .join('')
          .trim()
        if (line.length > 0) {
          textPieces.push(line)
        }
      }
    }

    if (textPieces.length > 0) {
      const cleaned = textPieces
        .filter(t => /[a-zA-Z0-9]/.test(t) && t.length > 1)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (cleaned.length > 30) {
        return cleaned.slice(0, 12000)
      }
    }
  } catch (err) {
    console.warn('PDF stream extraction error', err)
  }
  return ''
}

export const ARSHAD_COURSES: CourseItem[] = [
  // Semester 1 (9 Courses, 22 Credits)
  { code: '21BTB102T', title: 'INTRODUCTION TO COMPUTATIONAL BIOLOGY', semester: 1, credits: 2, category: 'Computational Biology' },
  { code: '21CSS101J', title: 'PROGRAMMING FOR PROBLEM SOLVING', semester: 1, credits: 4, category: 'Programming & Problem Solving' },
  { code: '21GNH101J', title: 'PHILOSOPHY OF ENGINEERING', semester: 1, credits: 2, category: 'Humanities & Philosophy' },
  { code: '21GNM101L', title: 'PHYSICAL AND MENTAL HEALTH USING YOGA', semester: 1, credits: 0, category: 'Wellness & Non-Credit Audit' },
  { code: '21LEH101T', title: 'COMMUNICATIVE ENGLISH', semester: 1, credits: 3, category: 'Languages & Communication' },
  { code: '21MAB101T', title: 'CALCULUS AND LINEAR ALGEBRA', semester: 1, credits: 4, category: 'Mathematics & Linear Algebra' },
  { code: '21MES101L', title: 'BASIC CIVIL AND MECHANICAL WORKSHOP', semester: 1, credits: 2, category: 'Engineering Workshop' },
  { code: '21PDM101L', title: 'PROFESSIONAL SKILLS AND PRACTICES', semester: 1, credits: 0, category: 'Professional Skills & Practices' },
  { code: '21PYB102J', title: 'SEMICONDUCTOR PHYSICS AND COMPUTATIONAL METHODS', semester: 1, credits: 5, category: 'Basic Sciences / Semiconductor Physics' },

  // Semester 2 (8 Courses, 21 Credits)
  { code: '21CSC101T', title: 'OBJECT ORIENTED DESIGN AND PROGRAMMING', semester: 2, credits: 3, category: 'Professional Core' },
  { code: '21CYB101J', title: 'CHEMISTRY', semester: 2, credits: 5, category: 'Basic Sciences / Chemistry' },
  { code: '21CYM101T', title: 'ENVIRONMENTAL SCIENCE', semester: 2, credits: 0, category: 'Environmental Sciences & Audit' },
  { code: '21EES101T', title: 'ELECTRICAL AND ELECTRONICS ENGINEERING', semester: 2, credits: 4, category: 'Engineering Sciences' },
  { code: '21LEH103T', title: 'FRENCH', semester: 2, credits: 3, category: 'Humanities & Foreign Languages' },
  { code: '21LEM101T', title: 'CONSTITUTION OF INDIA', semester: 2, credits: 0, category: 'Indian Constitution & Audit' },
  { code: '21MAB102T', title: 'ADVANCED CALCULUS AND COMPLEX ANALYSIS', semester: 2, credits: 4, category: 'Mathematics & Complex Analysis' },
  { code: '21MES102L', title: 'ENGINEERING GRAPHICS AND DESIGN', semester: 2, credits: 2, category: 'Engineering Graphics & Design' },

  // Semester 3 (7 Courses, 20 Credits)
  { code: '21CSC201J', title: 'DATA STRUCTURES AND ALGORITHMS', semester: 3, credits: 4, category: 'Professional Core' },
  { code: '21CSC202J', title: 'OPERATING SYSTEMS', semester: 3, credits: 4, category: 'Professional Core' },
  { code: '21CSC203P', title: 'ADVANCED PROGRAMMING PRACTICE', semester: 3, credits: 4, category: 'Programming Lab & Practice' },
  { code: '21CSS201T', title: 'COMPUTER ORGANIZATION AND ARCHITECTURE', semester: 3, credits: 4, category: 'Core Computer Architecture' },
  { code: '21LEM201T', title: 'PROFESSIONAL ETHICS', semester: 3, credits: 0, category: 'Professional Ethics & Audit' },
  { code: '21LEM202T', title: 'UNIVERSAL HUMAN VALUES - II: UNDERSTANDING HARMONY AND ETHICAL HUMAN CONDUCT', semester: 3, credits: 0, category: 'Humanities & Human Values' },
  { code: '21MAB206T', title: 'NUMERICAL METHODS AND ANALYSIS', semester: 3, credits: 4, category: 'Mathematics & Numerical Analysis' },

  // Semester 4 (6 Courses, 20 Credits)
  { code: '21CSC204J', title: 'DESIGN AND ANALYSIS OF ALGORITHMS', semester: 4, credits: 4, category: 'Professional Core' },
  { code: '21CSC205J', title: 'DATABASE MANAGEMENT SYSTEMS', semester: 4, credits: 4, category: 'Professional Core' },
  { code: '21CSC206T', title: 'SOFTWARE ENGINEERING AND PROJECT MANAGEMENT', semester: 4, credits: 3, category: 'Software Engineering' },
  { code: '21MAB207T', title: 'PROBABILITY AND QUEUEING THEORY', semester: 4, credits: 4, category: 'Mathematics & Queueing Theory' },
  { code: '21CSS202J', title: 'JAVA AND WEB PROGRAMMING', semester: 4, credits: 4, category: 'Programming & Web Applications' },
  { code: '21LEM203T', title: 'CONSTITUTION OF INDIA AND PROFESSIONAL VALUES', semester: 4, credits: 1, category: 'Indian Constitution & Values' },

  // Semester 5 (6 Courses, 20 Credits)
  { code: '21CSC301T', title: 'FORMAL LANGUAGE AND AUTOMATA THEORY', semester: 5, credits: 3, category: 'Theory of Computation' },
  { code: '21CSC302J', title: 'COMPUTER NETWORKS', semester: 5, credits: 4, category: 'Networking & Protocols' },
  { code: '21CSC303J', title: 'FULL STACK WEB DEVELOPMENT', semester: 5, credits: 4, category: 'Web Engineering' },
  { code: '21CSS301T', title: 'ARTIFICIAL INTELLIGENCE AND EXPERT SYSTEMS', semester: 5, credits: 4, category: 'Core Artificial Intelligence' },
  { code: '21CSE301T', title: 'PROFESSIONAL ELECTIVE - I: CLOUD COMPUTING', semester: 5, credits: 3, category: 'Cloud Architecture & Virtualization' },
  { code: '21OE301T', title: 'OPEN ELECTIVE - I: CYBER SECURITY ESSENTIALS', semester: 5, credits: 2, category: 'Cyber Security Essentials' },

  // Semester 6 (6 Courses, 19 Credits)
  { code: '21CSC304J', title: 'COMPILER DESIGN', semester: 6, credits: 4, category: 'Systems & Language Engineering' },
  { code: '21CSC305J', title: 'MACHINE LEARNING', semester: 6, credits: 4, category: 'Machine Learning & Modeling' },
  { code: '21CSC306T', title: 'CRYPTOGRAPHY AND NETWORK SECURITY', semester: 6, credits: 3, category: 'Information Security & Cryptography' },
  { code: '21CSE302T', title: 'PROFESSIONAL ELECTIVE - II: INTERNET OF THINGS', semester: 6, credits: 3, category: 'Embedded Systems & IoT' },
  { code: '21CSE303T', title: 'PROFESSIONAL ELECTIVE - III: DISTRIBUTED SYSTEMS', semester: 6, credits: 3, category: 'Distributed Computing' },
  { code: '21OE302T', title: 'OPEN ELECTIVE - II: ENTREPRENEURSHIP DEVELOPMENT', semester: 6, credits: 2, category: 'Innovation & Management' },

  // Semester 7 (5 Courses, 17 Credits)
  { code: '21CSC401J', title: 'DEEP LEARNING AND NEURAL NETWORKS', semester: 7, credits: 4, category: 'Deep Learning & Neural Networks' },
  { code: '21CSC402T', title: 'BIG DATA ANALYTICS AND STREAM PROCESSING', semester: 7, credits: 3, category: 'Big Data Architectures' },
  { code: '21CSE401T', title: 'PROFESSIONAL ELECTIVE - IV: BLOCKCHAIN TECHNOLOGY', semester: 7, credits: 3, category: 'Decentralized Systems' },
  { code: '21CSP401L', title: 'INDUSTRIAL TRAINING AND INTERNSHIP', semester: 7, credits: 3, category: 'Practical & Industrial Training' },
  { code: '21CSP402L', title: 'MAJOR PROJECT - PHASE I', semester: 7, credits: 4, category: 'Capstone Project Work' },

  // Semester 8 (2 Courses, 14 Credits)
  { code: '21CSP403L', title: 'MAJOR PROJECT - PHASE II', semester: 8, credits: 11, category: 'Capstone Project & Dissertation' },
  { code: '21CSE402T', title: 'PROFESSIONAL ELECTIVE - V: QUANTUM COMPUTING', semester: 8, credits: 3, category: 'Quantum Information Sciences' },
]

export const USERS: UserProfile[] = [
  {
    id: 'user-arshad',
    name: 'Mohamed Arshad',
    initials: 'MA',
    color: 'indigo',
    role: 'Computer Science & Engineering',
    avatarGradient: 'from-indigo-600 via-indigo-500 to-amber-400',
    registerNumber: 'RA2511028020147',
    college: 'SRM Engineering College, Ramapuram, Chennai'
  },
  {
    id: 'user-raniya',
    name: 'Raniya Parveen',
    initials: 'RP',
    color: 'coral',
    role: 'Engineering Scholar',
    avatarGradient: 'from-rose-500 via-pink-500 to-amber-300',
    registerNumber: '9602104171',
    college: 'Arunachala College of Engineering, Ammandivilai, Kaniyakumari'
  },
  {
    id: 'user-zayd',
    name: 'Zayd Al-Mansoor',
    initials: 'ZA',
    color: 'sky',
    role: 'Pure Mathematics & Cryptography',
    avatarGradient: 'from-cyan-500 via-sky-500 to-indigo-500',
    registerNumber: 'RA2511028020992',
    college: 'SRM Engineering College, Ramapuram, Chennai'
  },
  {
    id: 'user-ayesha',
    name: 'Ayesha Siddiqua',
    initials: 'AS',
    color: 'emerald',
    role: 'Astronomy & Astrophysics Scholar',
    avatarGradient: 'from-emerald-600 via-teal-500 to-sky-400',
    registerNumber: '9602104188',
    college: 'Arunachala College of Engineering, Ammandivilai, Kaniyakumari'
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

export const DEFAULT_NOTEBOOKS: SubjectItem[] = [
  {
    id: 'nb-ai-lab',
    name: 'AI & Neural Networks Lab',
    description: 'Deep Learning, Backpropagation & PyTorch architectures',
    color: 'indigo',
    icon: 'Code'
  },
  {
    id: 'nb-quantum',
    name: 'Quantum Mechanics & Relativity',
    description: 'Wave equations, state vectors & spacetime experiments',
    color: 'purple',
    icon: 'Atom'
  },
  {
    id: 'nb-crypto',
    name: 'Discrete Math & Cryptography',
    description: 'Number theory, RSA algorithms & logic proofs',
    color: 'sky',
    icon: 'Sigma'
  },
  {
    id: 'nb-stoic',
    name: 'Stoic Wisdom & Study Protocols',
    description: 'Cognitive focus, deep work habits & mental models',
    color: 'emerald',
    icon: 'Feather'
  }
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
        const parsed: UserProfile[] = JSON.parse(stored)
        let changed = false
        const updated = parsed.map(u => {
          if ((u.id === 'user-arshad' || u.name.includes('Arshad')) && (!u.registerNumber || !u.college)) {
            changed = true
            return {
              ...u,
              registerNumber: 'RA2511028020147',
              college: 'SRM Engineering College, Ramapuram, Chennai'
            }
          }
          if ((u.id === 'user-raniya' || u.name.includes('Raniya')) && (!u.registerNumber || !u.college)) {
            changed = true
            return {
              ...u,
              registerNumber: '9602104171',
              college: 'Arunachala College of Engineering, Ammandivilai, Kaniyakumari'
            }
          }
          return u
        })
        if (changed) {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated))
        }
        return updated
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

  getCoursesForUser(userId: string): CourseItem[] {
    try {
      const stored = localStorage.getItem(`${COURSES_STORAGE_KEY}_${userId}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If stored courses only contain partial semesters (e.g. only sem 1-3), backfill missing semesters from ARSHAD_COURSES
          const storedSemesters = new Set(parsed.map((c: CourseItem) => c.semester))
          const missingCourses = ARSHAD_COURSES.filter(c => !storedSemesters.has(c.semester))
          if (missingCourses.length > 0) {
            const merged = [...parsed, ...missingCourses]
            this.saveCoursesForUser(userId, merged)
            return merged
          }
          return parsed
        }
      }
    } catch (e) {
      console.error('Failed to load courses from storage', e)
    }
    // Return standard SRM CSE curriculum by default
    return ARSHAD_COURSES
  },

  saveCoursesForUser(userId: string, courses: CourseItem[]): void {
    try {
      localStorage.setItem(`${COURSES_STORAGE_KEY}_${userId}`, JSON.stringify(courses))
    } catch (e) {
      console.error('Failed to save courses for user', e)
    }
  },

  renameSubjectOrCourse(oldName: string, newName: string, userId?: string): {
    updatedSubjects: SubjectItem[]
    updatedNotebooks: SubjectItem[]
    updatedCourses: CourseItem[]
    updatedNotes: Note[]
  } {
    const trimmedNew = newName.trim()
    const trimmedOld = oldName.trim()
    if (!trimmedNew || trimmedNew.toLowerCase() === trimmedOld.toLowerCase()) {
      return {
        updatedSubjects: this.getSubjects(),
        updatedNotebooks: this.getNotebooks(),
        updatedCourses: this.getCoursesForUser(userId || 'user-arshad'),
        updatedNotes: this.getNotes()
      }
    }

    // 1. Rename in subjects if present
    const currentSubjects = this.getSubjects()
    const updatedSubjects = currentSubjects.map(s => 
      s.name.trim().toLowerCase() === trimmedOld.toLowerCase() 
        ? { ...s, name: trimmedNew } 
        : s
    )
    this.saveSubjects(updatedSubjects)

    // 2. Rename in notebooks if present
    const currentNotebooks = this.getNotebooks()
    const updatedNotebooks = currentNotebooks.map(nb => 
      nb.name.trim().toLowerCase() === trimmedOld.toLowerCase() 
        ? { ...nb, name: trimmedNew } 
        : nb
    )
    this.saveNotebooks(updatedNotebooks)

    // 3. Rename in courses if present
    const targetUserId = userId || 'user-arshad'
    const currentCourses = this.getCoursesForUser(targetUserId)
    const updatedCourses = currentCourses.map(c => 
      c.title.trim().toLowerCase() === trimmedOld.toLowerCase() 
        ? { ...c, title: trimmedNew } 
        : c
    )
    this.saveCoursesForUser(targetUserId, updatedCourses)

    // 4. Rename category in all notes
    const currentNotes = this.getNotes()
    const updatedNotes = currentNotes.map(n => {
      if (n.category && n.category.trim().toLowerCase() === trimmedOld.toLowerCase()) {
        return { ...n, category: trimmedNew, updatedAt: Date.now() }
      }
      return n
    })
    this.saveNotes(updatedNotes)

    return {
      updatedSubjects,
      updatedNotebooks,
      updatedCourses,
      updatedNotes
    }
  },

  getCoursesBySemester(userId: string, semester: number): CourseItem[] {
    const courses = this.getCoursesForUser(userId)
    return courses.filter(c => c.semester === semester)
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
      const parsed: Note[] = JSON.parse(stored)
      return parsed.map(n => {
        if (n.fileData && !n.fileData.dataUrl && fileBlobCache.has(n.id)) {
          return {
            ...n,
            fileData: {
              ...n.fileData,
              dataUrl: fileBlobCache.get(n.id)
            }
          }
        }
        return n
      })
    } catch (e) {
      console.error('Failed to load notes from localStorage', e)
      return INITIAL_NOTES
    }
  },

  saveNotes(notes: Note[]): void {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes))
    } catch (e) {
      console.warn('Storage quota issue detected, caching file data in memory to fit localStorage', e)
      try {
        const lightNotes = notes.map(n => {
          if (n.fileData && n.fileData.dataUrl && n.fileData.dataUrl.length > 250000) {
            fileBlobCache.set(n.id, n.fileData.dataUrl)
            return {
              ...n,
              fileData: {
                ...n.fileData,
                dataUrl: ''
              }
            }
          }
          return n
        })
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(lightNotes))
      } catch (err2) {
        console.error('Failed to save notes even in reduced format', err2)
      }
    }
  },

  async createNoteFromFile(file: File, category: string, activeUser: UserProfile): Promise<Note> {
    let dataUrl = ''
    try {
      dataUrl = await readFileAsDataURL(file)
    } catch (err) {
      console.warn('Could not read file as dataUrl', err)
    }

    const noteId = `note-file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    if (dataUrl) {
      fileBlobCache.set(noteId, dataUrl)
    }

    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    const formattedSize = file.size >= 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(file.size / 1024)} KB`

    // Extract readable text from document if available
    let extractedText = ''
    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      try {
        extractedText = await file.text()
      } catch (e) {
        console.warn('Could not read text content from file', e)
      }
    } else if (isPdf) {
      try {
        const buffer = await file.arrayBuffer()
        const textDecoder = new TextDecoder('latin1')
        const raw = textDecoder.decode(buffer)
        extractedText = extractTextFromPdfStream(raw)
      } catch (e) {
        console.warn('Could not extract PDF text stream', e)
      }
    }

    const textSection = extractedText 
      ? `\n\n## 📖 Document Content (Indexed for Gemini AI)\n\n${extractedText.slice(0, 10000)}\n\n---\n*This text was extracted and indexed so Gemini AI can answer future questions, formulas, and doubts regarding this document.*`
      : `\n\n## 🤖 Gemini AI Document Knowledge\n\n* **Indexed for Questions:** Yes, Gemini AI has full access to this document.\n* **Available Actions:** Ask Gemini to summarize, explain key formulas, solve doubts, or generate practice questions based on this file.`

    const noteContent = `# ${cleanTitle}

**File Name:** \`${file.name}\`  
**Format:** ${file.type || (isPdf ? 'PDF Document' : 'Document')}  
**File Size:** ${formattedSize}  
**Subject / Course:** ${category}  
**Uploaded By:** ${activeUser.name}  
**Status:** Indexed for Gemini AI Doubt Solving  

---  
*This document is stored in your academic library. Gemini AI reads and draws from this document whenever you ask doubts.*${textSection}`

    const note: Note = {
      id: noteId,
      title: `${isPdf ? '📄 ' : '📎 '}${cleanTitle}`,
      content: noteContent,
      category: category || 'General',
      tags: [isPdf ? 'pdf' : 'document', 'gemini-indexed', 'device-upload', 'study-material'],
      color: isPdf ? 'coral' : 'indigo',
      isPinned: false,
      isFavorite: false,
      authorId: activeUser.id,
      authorName: activeUser.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      fileData: {
        name: file.name,
        size: file.size,
        type: file.type || (isPdf ? 'application/pdf' : 'application/octet-stream'),
        dataUrl: dataUrl,
        uploadedAt: Date.now()
      }
    }

    return note
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

  getNotebooks(): SubjectItem[] {
    try {
      const stored = localStorage.getItem(NOTEBOOKS_STORAGE_KEY)
      if (!stored) {
        localStorage.setItem(NOTEBOOKS_STORAGE_KEY, JSON.stringify(DEFAULT_NOTEBOOKS))
        return DEFAULT_NOTEBOOKS
      }
      return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to load notebooks', e)
      return DEFAULT_NOTEBOOKS
    }
  },

  saveNotebooks(notebooks: SubjectItem[]): void {
    try {
      localStorage.setItem(NOTEBOOKS_STORAGE_KEY, JSON.stringify(notebooks))
    } catch (e) {
      console.error('Failed to save notebooks', e)
    }
  },

  addNotebook(name: string, description: string = '', color: any = 'indigo', icon: string = 'BookMarked'): SubjectItem {
    const current = this.getNotebooks()
    const newNotebook: SubjectItem = {
      id: `nb-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Specialized notebook folder',
      color,
      icon,
      createdAt: Date.now()
    }
    const updated = [...current, newNotebook]
    this.saveNotebooks(updated)
    return newNotebook
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
  },

  getStorageStats(notesList?: Note[]) {
    let totalBytes = 0
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const val = localStorage.getItem(key) || ''
          totalBytes += (key.length + val.length) * 2 // UTF-16 character size in browser
        }
      }
    } catch {
      totalBytes = 32000
    }

    const totalCapacityBytes = 5 * 1024 * 1024 // 5.0 MB standard HTML5 localStorage quota
    const usedKb = totalBytes / 1024
    const usedMb = usedKb / 1024
    const usedFormatted = usedMb >= 1 ? `${usedMb.toFixed(2)} MB` : `${usedKb.toFixed(1)} KB`
    const percentUsed = Math.min(100, Math.max(0.4, (totalBytes / totalCapacityBytes) * 100))
    const freeMb = Math.max(0, 5.0 - usedMb).toFixed(2)
    const allNotes = notesList || this.getNotes()
    const pdfFilesCount = allNotes.filter(n => n.fileData || n.tags.includes('pdf') || n.title.includes('📄')).length
    const totalFilesCount = allNotes.length
    const notebooksCount = this.getNotebooks().length
    const subjectsCount = this.getSubjects().length

    return {
      totalCapacity: '5.0 MB',
      totalCapacityBytes,
      usedBytes: totalBytes,
      usedFormatted,
      freeFormatted: `${freeMb} MB`,
      percentUsed: Number(percentUsed.toFixed(1)),
      notesCount: allNotes.length,
      notebooksCount,
      subjectsCount,
      pdfFilesCount,
      totalFilesCount
    }
  }
}
