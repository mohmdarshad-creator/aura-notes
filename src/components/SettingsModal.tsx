import React, { useState } from 'react'
import { 
  X, 
  KeyRound, 
  Check, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck,
  Palette,
  Bot
} from 'lucide-react'
import { storageService, INITIAL_NOTES } from '../services/storageService'
import { Note } from '../types'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  theme: string
  onThemeChange: (theme: string) => void
  notes: Note[]
  onNotesImported: (notes: Note[]) => void
  onResetSampleNotes: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  notes,
  onNotesImported,
  onResetSampleNotes
}) => {
  const [apiKey, setApiKey] = useState(() => storageService.getApiKey())
  const [showKey, setShowKey] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [model, setModel] = useState('gemini-2.5-flash')

  if (!isOpen) return null

  const handleSaveKey = () => {
    storageService.saveApiKey(apiKey)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        if (Array.isArray(parsed)) {
          onNotesImported(parsed)
          alert(`Successfully imported ${parsed.length} notes!`)
        } else {
          alert('Invalid JSON file format.')
        }
      } catch (err) {
        alert('Failed to parse JSON file.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-stone-700 dark:text-stone-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                AURA Settings & Gemini AI
              </h2>
              <p className="text-xs text-stone-400">Configure AI tutor, appearance, and backups</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Gemini API Key Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-indigo-500" />
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Get free key <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pr-24 pl-3.5 py-2.5 text-sm rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-mono text-stone-800 dark:text-stone-200"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleSaveKey}
                  className="px-2.5 py-1 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
                >
                  {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>Keys are saved strictly locally in your browser. Never shared or sent to any server.</span>
            </div>
          </div>

          {/* AI Model Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Default Gemini Model
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gemini-2.5-flash', label: '2.5 Flash', desc: 'Fast & Smart' },
                { id: 'gemini-1.5-flash', label: '1.5 Flash', desc: 'Ultra Fast' },
                { id: 'gemini-1.5-pro', label: '1.5 Pro', desc: 'Deep Reasoning' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    model === m.id
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                  }`}
                >
                  <div className="text-xs font-bold">{m.label}</div>
                  <div className="text-[10px] text-stone-400">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Palette */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-500" />
              Theme Appearance
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', label: 'Clean Paper', bg: 'bg-[#faf9f6]', text: 'text-stone-800' },
                { id: 'dark', label: 'Obsidian Night', bg: 'bg-[#121211]', text: 'text-stone-100' },
                { id: 'sepia', label: 'Warm Book', bg: 'bg-[#f4eedd]', text: 'text-amber-900' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => onThemeChange(t.id)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    theme === t.id
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${t.bg} border border-stone-300 dark:border-stone-700 shadow-inner`} />
                  <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Data Backup & Restore */}
          <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Data & Storage
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => storageService.exportNotesJson(notes)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Backup</span>
              </button>

              <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Import Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={() => {
                if (confirm('Reset to initial sample notes? Your custom notes will be backed up or overwritten.')) {
                  onResetSampleNotes()
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore Sample Study Notes</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}

