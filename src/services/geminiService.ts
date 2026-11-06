import { Note } from '../types'
import { storageService, fileBlobCache } from './storageService'

export interface AskGeminiParams {
  prompt: string
  noteContext?: Note | null
  allNotes?: Note[]
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[]
  model?: string
}

const DEFAULT_MODEL = 'gemini-2.5-flash'

/**
 * Score and retrieve the most relevant notes and documents from the student's library
 */
function scoreAndRetrieveNotes(prompt: string, allNotes: Note[] = [], activeNote?: Note | null) {
  const query = prompt.toLowerCase()
  const stopWords = new Set(['what', 'when', 'where', 'which', 'who', 'how', 'why', 'can', 'you', 'explain', 'tell', 'about', 'from', 'this', 'that', 'with', 'and', 'the', 'for', 'have', 'does', 'please', 'help', 'give', 'notes', 'note'])
  const words = query
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))

  const scored = allNotes.map(n => {
    let score = 0
    if (activeNote && n.id === activeNote.id) {
      score += 120
    }
    const titleLower = n.title.toLowerCase()
    const catLower = n.category.toLowerCase()
    const contentLower = n.content.toLowerCase()
    const fileNameLower = n.fileData?.name?.toLowerCase() || ''

    // Exact matches
    if (query.includes(catLower)) score += 35
    if (catLower.length > 3 && query.includes(catLower)) score += 30

    // Check course codes (e.g., 21css, 21mab, 21csc, etc.)
    const codeMatch = (titleLower + ' ' + contentLower).match(/\b\d{2}[a-z]{3}\d{3}[a-z]?\b/i)
    if (codeMatch && query.includes(codeMatch[0].toLowerCase())) {
      score += 50
    }

    words.forEach(w => {
      if (titleLower.includes(w)) score += 15
      if (catLower.includes(w)) score += 12
      if (fileNameLower.includes(w)) score += 12
      if (n.tags.some(t => t.toLowerCase().includes(w))) score += 10
      if (contentLower.includes(w)) score += 4
    })

    return { note: n, score }
  })

  scored.sort((a, b) => b.score - a.score)
  const topScored = scored.filter(s => s.score > 0).slice(0, 6).map(s => s.note)
  const finalRelevant = topScored.length > 0 
    ? topScored 
    : (activeNote ? [activeNote] : allNotes.slice(0, 4))

  const archiveIndex = allNotes.map(n => 
    `• [${n.category}] "${n.title}" (${n.fileData ? 'File: ' + n.fileData.name : 'Written Note'}) - Tags: #${n.tags.join(' #')}`
  ).join('\n')

  return {
    relevantNotes: finalRelevant,
    archiveIndex
  }
}

export const geminiService = {
  getEffectiveApiKey(): string {
    const fromStorage = storageService.getApiKey()
    if (fromStorage) return fromStorage
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY
    if (envKey) return envKey
    return ''
  },

  hasApiKey(): boolean {
    return Boolean(this.getEffectiveApiKey())
  },

  async askGemini({
    prompt,
    noteContext,
    allNotes = [],
    conversationHistory = [],
    model = DEFAULT_MODEL
  }: AskGeminiParams): Promise<string> {
    const apiKey = this.getEffectiveApiKey()

    // Retrieve relevant notes & documents across student's entire uploaded archive
    const { relevantNotes, archiveIndex } = scoreAndRetrieveNotes(prompt, allNotes, noteContext)

    // If no API key is provided, return rich contextual response citing their real notes
    if (!apiKey) {
      return this.generateSimulatedResponse(prompt, noteContext, relevantNotes, allNotes)
    }

    const systemInstruction = `You are AURA AI, an elite academic mentor and doubt solver equipped with direct, complete access to the student's entire collection of uploaded lecture notes, syllabus materials, and PDF documents.

Your Instructions:
1. Always analyze and draw directly from the student's uploaded notes and documents provided in the context.
2. Explicitly cite the specific notes, subjects, or course codes you are referencing (e.g. "According to your note '🧠 Neural Networks & Backpropagation Simplified'...", "In your 21CSS101J syllabus...").
3. Deliver crystal-clear explanations formatted in GitHub Flavored Markdown with KaTeX LaTeX math ($...$ inline, $$...$$ on its own line), step-by-step logic, bullet points, and code blocks where applicable.
4. If a concept spans multiple uploaded notes or semesters, synthesize the insights seamlessly.
5. If the student asks a question about upcoming or general engineering topics not in their notes, explain accurately from first principles and relate it to their curriculum.`

    const contents: any[] = []

    // Build rich knowledge base context
    let notesContextBlock = ''
    if (relevantNotes.length > 0) {
      notesContextBlock = `\n=== STUDENT'S RELEVANT UPLOADED NOTES & DOCUMENTS (${relevantNotes.length} matched) ===\n`
      relevantNotes.forEach((n, idx) => {
        notesContextBlock += `\n--- [Document #${idx + 1}] "${n.title}" [Subject/Semester: ${n.category}] ---\n`
        notesContextBlock += `Author: ${n.authorName} | Tags: ${n.tags.join(', ')}\n`
        if (n.fileData) {
          notesContextBlock += `Attached File: ${n.fileData.name} (${n.fileData.type || 'PDF'}, ${Math.round(n.fileData.size / 1024)} KB)\n`
        }
        notesContextBlock += `Content:\n${n.content.slice(0, 6000)}\n`
      })
      notesContextBlock += `\n=== END RELEVANT DOCUMENTS ===\n`
    }

    let archiveSummaryBlock = ''
    if (allNotes.length > 0) {
      archiveSummaryBlock = `\n=== STUDENT'S ENTIRE NOTES ARCHIVE INDEX (${allNotes.length} total files) ===\n${archiveIndex.slice(0, 3000)}\n=======================================================\n`
    }

    const contextualPrompt = `${notesContextBlock}
${archiveSummaryBlock}
Student's Doubt / Request:
${prompt}`

    // Add recent history
    for (const msg of conversationHistory.slice(-6)) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })
    }

    // Prepare user parts (with multi-modal PDF support if attached)
    const userParts: any[] = []

    // If top relevant note is an attached PDF and base64 is available, include it for native Gemini reading
    const topPdfNote = relevantNotes.find(n => n.fileData?.type?.includes('pdf') || n.fileData?.name?.toLowerCase().endsWith('.pdf'))
    if (topPdfNote) {
      const dataUrl = topPdfNote.fileData?.dataUrl || fileBlobCache.get(topPdfNote.id)
      if (dataUrl && dataUrl.startsWith('data:application/pdf;base64,')) {
        const base64Data = dataUrl.split(',')[1]
        // Include inlineData for PDFs under ~6MB
        if (base64Data && base64Data.length < 8000000) {
          userParts.push({
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data
            }
          })
        }
      }
    }

    userParts.push({ text: contextualPrompt })

    contents.push({
      role: 'user',
      parts: userParts
    })

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData?.error?.message || `Request failed with status ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!candidateText) {
        throw new Error('Received an empty response from Gemini.')
      }

      return candidateText
    } catch (err: any) {
      console.error('Gemini API Error:', err)
      if (err.message && (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid'))) {
        throw new Error('Invalid Gemini API Key. Please verify your key in Settings.')
      }
      throw err
    }
  },

  /**
   * Ingest and generate an AI concept summary when a new note or document is uploaded
   */
  async ingestUploadedNote(note: Note): Promise<string | null> {
    const apiKey = this.getEffectiveApiKey()
    if (!apiKey) return null

    try {
      const prompt = `Analyze this uploaded document/note titled "${note.title}" for subject "${note.category}".
Provide a concise, 3-point Academic Study Index (under 120 words):
- 🎯 Core Topics & Objectives
- 📐 Essential Equations / Definitions
- 💡 Likely Exam / Viva Focus Areas
Format in clean Markdown with KaTeX if equations are present.`

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: `${prompt}\n\nDocument Text Preview:\n${note.content.slice(0, 4000)}` }]
          }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.4 }
        })
      })

      if (!response.ok) return null
      const data = await response.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        return `${note.content}\n\n---\n### 🤖 Gemini Ingestion & Knowledge Index\n${text}`
      }
    } catch (e) {
      console.warn('Could not ingest note with Gemini', e)
    }
    return null
  },

  generateSimulatedResponse(prompt: string, noteContext?: Note | null, relevantNotes: Note[] = [], allNotes: Note[] = []): string {
    const primaryNote = noteContext || relevantNotes[0] || allNotes[0]
    const noteTitle = primaryNote ? primaryNote.title : 'your academic library'
    const lower = prompt.toLowerCase()

    const referencedNotesText = relevantNotes.length > 0
      ? `*I have cross-referenced **${relevantNotes.length} document${relevantNotes.length > 1 ? 's' : ''}** from your library:*  \n${relevantNotes.slice(0, 3).map(n => `• **${n.title}** (${n.category})`).join('\n')}\n\n`
      : ''

    if (lower.includes('question') || lower.includes('quiz') || lower.includes('test')) {
      return `### 📝 Practice Questions for **${noteTitle}**

${referencedNotesText}Here are 3 conceptual check-for-understanding questions formulated from your notes:

1. **Fundamental Mechanism**: 
   *How does the primary rule in ${primaryNote?.category || 'this subject'} apply when scaling inputs by a factor of 10?*

2. **Edge Case Analysis**:
   *What happens when the boundary constraints break down in this model?*

3. **Application Scenario**:
   *Devise a real-world engineering scenario where failing to account for these variables causes system failure.*

---
> 💡 *Tip: Connect your personal Gemini API key in **Settings** (top right) to generate dynamic, unlimited answers with live AI!*`
    }

    if (lower.includes('summar') || lower.includes('flashcard') || lower.includes('key')) {
      return `### ⚡ Knowledge Summary: **${noteTitle}**

${referencedNotesText}* **Primary Focus**: Synthesizes the foundational definitions and governing principles in ${primaryNote?.category || 'your curriculum'}.
* **Key Mechanism**: State transitions propagate predictably through the system constraints.
* **Core Rule**: Always isolate primary variables from external environmental noise.
* **Exam Insight**: Pay special attention to derivation proofs and initial boundary conditions.

---
> 💡 *Add your free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) in Settings to unlock deep multi-turn chat!*`
    }

    return `### ✨ Academic Insight & Doubt Resolution for **${noteTitle}**

${referencedNotesText}Here is the step-by-step breakdown based on your study materials:

1. **The Core Intuition**:
   Think of this concept like an orchestra conductor. Rather than every component operating at maximum throughput, harmony emerges because each module responds dynamically to feedback from the overall system.

2. **Step-by-Step Resolution**:
   - First, identify the primary inputs and boundary conditions.
   - Second, trace how state changes propagate through the system.
   - Third, verify the final output against your expected invariants.

3. **Quick Self-Check**:
   Can you summarize the most critical step in one sentence without looking at the reference?

---
> 🚀 *This is a contextual preview reading your library (${allNotes.length} notes). Connect your free Google Gemini API Key in **Settings** to chat with **Gemini 2.5 Flash** live!*`
  }
}


