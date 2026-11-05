import { Note } from '../types'
import { storageService } from './storageService'

export interface AskGeminiParams {
  prompt: string
  noteContext?: Note | null
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[]
  model?: string
}

const DEFAULT_MODEL = 'gemini-2.5-flash'

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
    conversationHistory = [],
    model = DEFAULT_MODEL
  }: AskGeminiParams): Promise<string> {
    const apiKey = this.getEffectiveApiKey()

    // If no API key is provided, return rich contextual demo response with guidance
    if (!apiKey) {
      return this.generateSimulatedResponse(prompt, noteContext)
    }

    const systemInstruction = `You are Aura AI, an aesthetic, friendly, and exceptionally clear academic mentor and doubt solver.
Your mission is to clarify doubts, demystify complex concepts, provide memorable analogies, and format explanations with crystal-clear Markdown, LaTeX formulas, bullet points, and code blocks where applicable.
Always be encouraging, precise, and structured. When answering doubts about a specific note, directly connect your answer to the concepts in the note.`

    const contents: any[] = []

    // Build context
    let contextualPrompt = prompt
    if (noteContext) {
      contextualPrompt = `[Context Note: "${noteContext.title}" (${noteContext.category})]
---
${noteContext.content}
---

Student's Doubt / Request:
${prompt}`
    }

    // Add recent history
    for (const msg of conversationHistory.slice(-6)) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: contextualPrompt }]
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
      // If error is invalid API key or quota, provide helpful explanation
      if (err.message && (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid'))) {
        throw new Error('Invalid Gemini API Key. Please verify your key in Settings.')
      }
      throw err
    }
  },

  generateSimulatedResponse(prompt: string, noteContext?: Note | null): string {
    const noteTitle = noteContext?.title || 'your notes'
    const lower = prompt.toLowerCase()

    if (lower.includes('question') || lower.includes('quiz') || lower.includes('test')) {
      return `### 📝 Practice Questions for **${noteTitle}**

Here are 3 interactive check-for-understanding questions:

1. **Conceptual Challenge**: 
   *How would you explain the fundamental mechanism of this topic to someone with zero technical background using an everyday metaphor?*

2. **Edge Case Analysis**:
   *What happens when the core constraints or assumptions break down? (e.g. extreme values or boundary conditions)*

3. **Application Scenario**:
   *Can you devise a real-world scenario where relying purely on intuition would lead to the opposite of what actually occurs?*

---
> 💡 *Tip: Connect your personal Gemini API key in **Settings** (top right) to generate dynamic, unlimited answers with live AI!*`
    }

    if (lower.includes('summar') || lower.includes('flashcard') || lower.includes('key')) {
      return `### ⚡ Flashcard Summary: **${noteTitle}**

* **Core Premise**: The primary thesis revolves around breaking down complexity into observable, first-principles components.
* **Key Mechanism**: Information or energy shifts predictably when following the governing laws.
* **Golden Rule**: Always isolate controllable variables from external noise.
* **Common Pitfall**: Overfitting or confusing correlation with direct causation.

---
> 💡 *Add your free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) in Settings to unlock deep multi-turn chat!*`
    }

    return `### ✨ Explanation & Insight for **${noteTitle}**

Thank you for bringing up this doubt! Here is a structured breakdown:

1. **The Core Intuition**:
   Think of this concept like an orchestra conductor. Rather than every instrument playing at maximum volume, harmony emerges because each section responds dynamically to feedback from the overall sound.

2. **Step-by-Step Resolution**:
   - First, identify the primary inputs and boundary conditions.
   - Second, trace how state changes propagate through the system.
   - Third, verify the final output against your expected invariants.

3. **Quick Self-Check**:
   Can you summarize the most critical step in one sentence without looking at the reference?

---
> 🚀 *This is a preview response. Connect your free Google Gemini API Key in **Settings** to chat with **Gemini 2.5 Flash** in real-time!*`
  }
}
