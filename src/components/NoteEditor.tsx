import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  Sparkles, 
  Download, 
  Trash2, 
  Copy, 
  Check, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Code, 
  List, 
  ListOrdered, 
  Quote, 
  CheckSquare, 
  Sigma, 
  Columns, 
  Eye, 
  Edit3,
  X,
  ChevronDown
} from 'lucide-react'
import { Note, NoteColor } from '../types'
import { CATEGORIES } from '../services/storageService'

interface NoteEditorProps {
  note: Note
  onUpdateNote: (updated: Partial<Note>) => void
  onDeleteNote: () => void
  onExportMarkdown: () => void
  onAskGeminiAboutNote: (quickPrompt?: string) => void
  onClose: () => void
}

const COLORS: { key: NoteColor; label: string; class: string }[] = [
  { key: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { key: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { key: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { key: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
  { key: 'coral', label: 'Coral', class: 'bg-rose-500' },
  { key: 'sky', label: 'Sky', class: 'bg-sky-500' },
  { key: 'stone', label: 'Stone', class: 'bg-stone-500' },
]

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onUpdateNote,
  onDeleteNote,
  onExportMarkdown,
  onAskGeminiAboutNote,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split')
  const [tagInput, setTagInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [showAiPrompts, setShowAiPrompts] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Calculate statistics
  const wordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0
  const readingTime = Math.ceil(wordCount / 200)

  const handleCopy = () => {
    navigator.clipboard.writeText(note.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const cleanTag = tagInput.trim().replace(/^#/, '').toLowerCase()
      if (!note.tags.includes(cleanTag)) {
        onUpdateNote({ tags: [...note.tags, cleanTag] })
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateNote({ tags: note.tags.filter(t => t !== tagToRemove) })
  }

  // Insert markdown helper at cursor
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = textarea.value.substring(start, end)
    const replacement = prefix + (selected || 'text') + suffix

    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end)
    onUpdateNote({ content: newContent })

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4))
    }, 10)
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
      
      {/* Top Header Bar */}
      <div className="px-6 py-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-4 flex-wrap bg-stone-50/50 dark:bg-stone-900/50">
        
        {/* Category & Color Picker */}
        <div className="flex items-center gap-3">
          <select
            value={note.category}
            onChange={(e) => onUpdateNote({ category: e.target.value })}
            className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 border-none rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {note.authorName && (
            <span className={`text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${
              note.authorName.includes('Arshad')
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {note.authorName}
            </span>
          )}

          {/* Color Dots */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200 dark:border-stone-700">
            {COLORS.map(c => (
              <button
                key={c.key}
                onClick={() => onUpdateNote({ color: c.key })}
                className={`w-3.5 h-3.5 rounded-full ${c.class} transition-transform ${
                  note.color === c.key ? 'ring-2 ring-stone-900 dark:ring-stone-100 scale-125' : 'opacity-60 hover:opacity-100'
                }`}
                title={`Color: ${c.label}`}
              />
            ))}
          </div>

          <div className="text-xs text-stone-400 hidden sm:block">
            {wordCount} words • {readingTime} min read
          </div>
        </div>

        {/* View Mode Controls & Actions */}
        <div className="flex items-center gap-2">
          
          {/* Ask Gemini Button with Dropdown Options */}
          <div className="relative">
            <div className="flex items-center rounded-xl bg-gradient-to-r from-indigo-500 to-amber-500 p-[1px] shadow-sm">
              <button
                onClick={() => onAskGeminiAboutNote()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-l-[11px] bg-white dark:bg-stone-900 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Ask Gemini</span>
              </button>
              <button
                onClick={() => setShowAiPrompts(!showAiPrompts)}
                className="px-1.5 py-1.5 rounded-r-[11px] bg-white dark:bg-stone-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border-l border-indigo-100 dark:border-indigo-900"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Quick AI Prompts Menu */}
            {showAiPrompts && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 p-2 z-50 space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  Quick AI Study Actions
                </div>
                {[
                  { label: 'Explain difficult concepts', prompt: 'Please explain the most complex concepts from this note in intuitive terms with real-world analogies.' },
                  { label: 'Generate 3 practice questions', prompt: 'Create 3 active-recall practice questions based on this note, with step-by-step answers hidden at the end.' },
                  { label: 'Summarize key flashcards', prompt: 'Condense this note into 4 high-yield flashcard bullets for quick memorization.' },
                  { label: 'Find knowledge gaps / errors', prompt: 'Review this note critically. What key nuances, counterexamples, or missing details should be added?' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowAiPrompts(false)
                      onAskGeminiAboutNote(item.prompt)
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-stone-700 dark:text-stone-300 font-medium transition-colors"
                  >
                    ✨ {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('edit')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'edit' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
              title="Edit Mode"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'split' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
              title="Split Mode (Edit & Preview)"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'preview' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
              title="Reading Preview Mode"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Secondary Actions */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Copy Note Markdown"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={onExportMarkdown}
            className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Export as Markdown (.md)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Prominent Del Button */}
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200/70 dark:border-rose-800/60 transition-all hover:scale-[1.02] shadow-xs"
            title="Delete this note (Del)"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Del</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Close Note"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Title & Tags Input */}
      <div className="px-8 pt-6 pb-2">
        <input
          type="text"
          value={note.title}
          onChange={(e) => onUpdateNote({ title: e.target.value })}
          placeholder="Untitled Note..."
          className="w-full text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 bg-transparent border-none outline-none placeholder:text-stone-300 dark:placeholder:text-stone-700"
        />

        {/* Tags bar */}
        <div className="flex items-center gap-1.5 flex-wrap mt-3">
          {note.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs font-mono text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md"
            >
              #{tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-rose-500 transition-colors"
              >
                &times;
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="+ tag (press Enter)"
            className="text-xs bg-transparent border-none outline-none text-stone-500 placeholder:text-stone-400 min-w-[120px]"
          />
        </div>
      </div>

      {/* Formatting Toolbar (shown when editing or split) */}
      {viewMode !== 'preview' && (
        <div className="px-8 py-2 border-y border-stone-100 dark:border-stone-800 flex items-center gap-1 overflow-x-auto text-stone-500">
          <button
            onClick={() => insertFormatting('**', '**')}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('*', '*')}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-4 bg-stone-200 dark:bg-stone-700 mx-1" />
          <button
            onClick={() => insertFormatting('# ')}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('## ')}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-4 bg-stone-200 dark:bg-stone-700 mx-1" />
          <button
            onClick={() => insertFormatting('```\n', '\n```')}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Code Block"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('> ')}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Quote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('- ')}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('1. ')}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('- [ ] ')}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Task Checkbox"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('$$ ', ' $$')}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="LaTeX Math Equation"
          >
            <Sigma className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area (Split / Edit / Preview) */}
      <div className="flex-1 overflow-hidden flex">
        
        {/* Editor Pane */}
        {viewMode !== 'preview' && (
          <div className={`h-full p-8 overflow-y-auto ${viewMode === 'split' ? 'w-1/2 border-r border-stone-200/80 dark:border-stone-800' : 'w-full'}`}>
            <textarea
              ref={textareaRef}
              value={note.content}
              onChange={(e) => onUpdateNote({ content: e.target.value })}
              placeholder="Write your study notes here using Markdown..."
              className="w-full h-full resize-none bg-transparent border-none outline-none font-mono text-sm leading-relaxed text-stone-800 dark:text-stone-200 placeholder:text-stone-400"
            />
          </div>
        )}

        {/* Markdown Rendered Preview Pane */}
        {viewMode !== 'edit' && (
          <div className={`h-full p-8 overflow-y-auto ${viewMode === 'split' ? 'w-1/2' : 'w-full max-w-3xl mx-auto'}`}>
            <div className="markdown-body text-stone-800 dark:text-stone-200">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {note.content || '*No content yet. Start typing on the left to see the aesthetic preview!*'}
              </ReactMarkdown>
            </div>
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                  Delete Note?
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Confirm note deletion
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-stone-900 dark:text-stone-100 font-semibold font-serif">"{note.title || 'Untitled Note'}"</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  onDeleteNote()
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

