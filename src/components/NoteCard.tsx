import React from 'react'
import { Pin, Star, Sparkles, Trash2, Download, Tag, Calendar, FileText, ExternalLink } from 'lucide-react'
import { Note, NoteColor } from '../types'

interface NoteCardProps {
  note: Note
  isSelected: boolean
  onClick: () => void
  onTogglePin: (e: React.MouseEvent) => void
  onToggleFavorite: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
  onAskGemini: (e: React.MouseEvent) => void
  onExport: (e: React.MouseEvent) => void
}

const COLOR_ACCENTS: Record<NoteColor, { border: string; bg: string; dot: string }> = {
  indigo: { border: 'border-l-indigo-500', bg: 'hover:border-indigo-300 dark:hover:border-indigo-800', dot: 'bg-indigo-500' },
  purple: { border: 'border-l-purple-500', bg: 'hover:border-purple-300 dark:hover:border-purple-800', dot: 'bg-purple-500' },
  amber: { border: 'border-l-amber-500', bg: 'hover:border-amber-300 dark:hover:border-amber-800', dot: 'bg-amber-500' },
  emerald: { border: 'border-l-emerald-500', bg: 'hover:border-emerald-300 dark:hover:border-emerald-800', dot: 'bg-emerald-500' },
  coral: { border: 'border-l-rose-500', bg: 'hover:border-rose-300 dark:hover:border-rose-800', dot: 'bg-rose-500' },
  sky: { border: 'border-l-sky-500', bg: 'hover:border-sky-300 dark:hover:border-sky-800', dot: 'bg-sky-500' },
  stone: { border: 'border-l-stone-400', bg: 'hover:border-stone-300 dark:hover:border-stone-700', dot: 'bg-stone-400' },
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isSelected,
  onClick,
  onTogglePin,
  onToggleFavorite,
  onDelete,
  onAskGemini,
  onExport
}) => {
  const accent = COLOR_ACCENTS[note.color] || COLOR_ACCENTS.indigo

  // Extract clean plain text preview from markdown
  const previewText = note.content
    .replace(/#+\s+/g, '') // remove headings
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // remove bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // remove italic
    .replace(/`{3}[\s\S]*?`{3}/g, '[Code Block]') // replace code
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // links
    .replace(/\$\$[\s\S]*?\$\$/g, '[Math Equation]') // math blocks
    .replace(/\$([^\$]+)\$/g, '$1')
    .slice(0, 150)

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(note.updatedAt))

  return (
    <div
      onClick={onClick}
      className={`note-card-container group relative p-5 rounded-2xl bg-white dark:bg-stone-900 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md border-l-4 ${accent.border} ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
          : 'border-stone-200/80 dark:border-stone-800/80 hover:translate-y-[-2px]'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md">
            {note.category}
          </span>
          {note.fileData && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {note.fileData.type?.includes('pdf') || note.fileData.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'FILE'}
            </span>
          )}
          {note.authorName && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
              note.authorName.includes('Arshad')
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {note.authorName}
            </span>
          )}
          <span className="text-[11px] text-stone-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>
        </div>

        {/* Pin & Favorite Badges */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onToggleFavorite}
            className={`p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ${
              note.isFavorite ? 'text-amber-500' : 'text-stone-400 hover:text-stone-600'
            }`}
            title={note.isFavorite ? 'Unfavorite' : 'Favorite'}
          >
            <Star className={`w-3.5 h-3.5 ${note.isFavorite ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={onTogglePin}
            className={`p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ${
              note.isPinned ? 'text-indigo-600' : 'text-stone-400 hover:text-stone-600'
            }`}
            title={note.isPinned ? 'Unpin' : 'Pin note'}
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Note Title */}
      <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 leading-snug mb-2 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {note.title || 'Untitled Note'}
      </h3>

      {/* Attached File Preview Card if available */}
      {note.fileData && (
        <div className="mb-3 p-2.5 rounded-xl bg-stone-50/80 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate text-xs">
              <p className="font-medium text-stone-800 dark:text-stone-200 truncate">{note.fileData.name}</p>
              <p className="text-[10px] text-stone-400">
                {note.fileData.size >= 1024 * 1024
                  ? `${(note.fileData.size / (1024 * 1024)).toFixed(2)} MB`
                  : `${Math.round(note.fileData.size / 1024)} KB`}
              </p>
            </div>
          </div>
          {note.fileData.dataUrl && (
            <a
              href={note.fileData.dataUrl}
              download={note.fileData.name}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-xs transition-all flex items-center gap-1 text-[11px] font-medium"
              title="Download File"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Snippet Preview */}
      <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed mb-4">
        {previewText || 'No additional text...'}
      </p>

      {/* Tags and Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800/80 gap-2">
        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-hidden max-h-6">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/60 px-1.5 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-[10px] text-stone-400">+{note.tags.length - 3}</span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onAskGemini}
            className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
            title="Ask Gemini doubt about this note"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </button>
          
          <button
            onClick={onExport}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Export as Markdown (.md)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

