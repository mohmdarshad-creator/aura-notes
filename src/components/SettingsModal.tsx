import React, { useState, useEffect } from 'react'
import { 
  X, 
  KeyRound, 
  Check, 
  ExternalLink, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck,
  Palette,
  Bot,
  Users,
  Sliders,
  Plus,
  Trash2,
  Sun,
  Moon
} from 'lucide-react'
import { storageService } from '../services/storageService'
import { Note, UserProfile, NoteColor } from '../types'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  theme: string
  onThemeChange: (theme: string) => void
  notes: Note[]
  onNotesImported: (notes: Note[]) => void
  onResetSampleNotes: () => void
  users: UserProfile[]
  activeUser: UserProfile
  onUpdateUser: (updatedUser: UserProfile) => void
  onAddUser: (newUser: Omit<UserProfile, 'id'>) => void
  onDeleteUser: (userId: string) => void
}

const GRADIENT_PRESETS: { id: string; name: string; gradient: string; color: NoteColor }[] = [
  { id: 'indigo', name: 'Indigo Amber', gradient: 'from-indigo-600 via-indigo-500 to-amber-400', color: 'indigo' },
  { id: 'rose', name: 'Rose Pink', gradient: 'from-rose-500 via-pink-500 to-amber-300', color: 'coral' },
  { id: 'emerald', name: 'Emerald Teal', gradient: 'from-emerald-600 via-teal-500 to-sky-400', color: 'emerald' },
  { id: 'purple', name: 'Purple Violet', gradient: 'from-purple-600 via-violet-500 to-pink-400', color: 'purple' },
  { id: 'amber', name: 'Amber Orange', gradient: 'from-amber-500 via-orange-500 to-rose-400', color: 'amber' },
  { id: 'cyan', name: 'Cyan Sky', gradient: 'from-cyan-500 via-sky-500 to-indigo-500', color: 'sky' },
]

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  notes,
  onNotesImported,
  onResetSampleNotes,
  users,
  activeUser,
  onUpdateUser,
  onAddUser,
  onDeleteUser
}) => {
  const [apiKey, setApiKey] = useState(() => storageService.getApiKey())
  const [isEnteringKey, setIsEnteringKey] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [model, setModel] = useState('gemini-2.5-flash')
  const isGeminiConnected = Boolean(apiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY)

  // Edit Mode state for User Profiles
  const [isUserEditMode, setIsUserEditMode] = useState(false)
  const [editTab, setEditTab] = useState<string>(activeUser.id) // userId or 'new'
  
  // Edit existing user state
  const [editName, setEditName] = useState('')
  const [editInitials, setEditInitials] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editRegisterNumber, setEditRegisterNumber] = useState('')
  const [editCollege, setEditCollege] = useState('')
  const [editGradient, setEditGradient] = useState(GRADIENT_PRESETS[0].gradient)
  const [editColor, setEditColor] = useState<NoteColor>('indigo')
  const [userProfileSaved, setUserProfileSaved] = useState(false)

  // New user state
  const [newName, setNewName] = useState('')
  const [newInitials, setNewInitials] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newRegisterNumber, setNewRegisterNumber] = useState('')
  const [newCollege, setNewCollege] = useState('')
  const [newGradient, setNewGradient] = useState(GRADIENT_PRESETS[0].gradient)
  const [newColor, setNewColor] = useState<NoteColor>('indigo')
  const [userCreatedNotice, setUserCreatedNotice] = useState(false)

  // Sync edit form when selected user changes
  useEffect(() => {
    if (editTab !== 'new') {
      const target = users.find(u => u.id === editTab) || activeUser
      if (target) {
        setEditName(target.name)
        setEditInitials(target.initials)
        setEditRole(target.role)
        setEditRegisterNumber(target.registerNumber || '')
        setEditCollege(target.college || '')
        setEditGradient(target.avatarGradient)
        setEditColor(target.color || 'indigo')
      }
    }
  }, [editTab, users, activeUser])

  if (!isOpen) return null

  const handleSaveKey = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!keyInput.trim()) return
    storageService.saveApiKey(keyInput.trim())
    setApiKey(keyInput.trim())
    setKeyInput('')
    setIsEnteringKey(false)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  const handleDisconnectKey = () => {
    if (confirm(`Disconnect Google Gemini from ${activeUser.name}'s profile?`)) {
      storageService.saveApiKey('')
      setApiKey('')
      setIsEnteringKey(false)
    }
  }

  const handleSaveUserProfile = (e: React.FormEvent) => {
    e.preventDefault()
    const target = users.find(u => u.id === editTab)
    if (!target || !editName.trim()) return

    const updated: UserProfile = {
      ...target,
      name: editName.trim(),
      initials: editInitials.trim() || editName.trim().slice(0, 2).toUpperCase(),
      role: editRole.trim() || 'Student Scholar',
      registerNumber: editRegisterNumber.trim(),
      college: editCollege.trim(),
      color: editColor,
      avatarGradient: editGradient || target.avatarGradient
    }

    onUpdateUser(updated)
    setUserProfileSaved(true)
    setTimeout(() => setUserProfileSaved(false), 2000)
  }

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    onAddUser({
      name: newName.trim(),
      initials: newInitials.trim() || newName.trim().slice(0, 2).toUpperCase(),
      role: newRole.trim() || 'Academic Scholar',
      registerNumber: newRegisterNumber.trim(),
      college: newCollege.trim(),
      color: newColor,
      avatarGradient: newGradient
    })

    setNewName('')
    setNewInitials('')
    setNewRole('')
    setNewRegisterNumber('')
    setNewCollege('')
    setUserCreatedNotice(true)
    setTimeout(() => {
      setUserCreatedNotice(false)
      setEditTab(activeUser.id)
    }, 1500)
  }

  const handleDeleteProfile = (userId: string) => {
    if (users.length <= 1) {
      alert('You must have at least one student profile.')
      return
    }
    const target = users.find(u => u.id === userId)
    if (confirm(`Are you sure you want to delete profile for "${target?.name}"?`)) {
      onDeleteUser(userId)
      setEditTab(users.find(u => u.id !== userId)?.id || '')
    }
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
              <Sliders className="w-4 h-4 text-stone-700 dark:text-stone-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                AURA Settings & Profiles
              </h2>
              <p className="text-xs text-stone-400">Manage user profiles, AI tutor, and appearance</p>
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
          
          {/* USER PROFILES & EDIT MODE SECTION */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Student Profiles ({users.length})
                </span>
              </div>

              {/* Edit Mode Toggle Button inside Settings */}
              <button
                type="button"
                onClick={() => setIsUserEditMode(!isUserEditMode)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  isUserEditMode
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600'
                }`}
              >
                {isUserEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
              </button>
            </div>

            {/* If Edit Mode is OFF: show current details cleanly */}
            {!isUserEditMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 max-h-52 overflow-y-auto pr-1">
                {users.map((u) => {
                  const isActive = u.id === activeUser.id
                  return (
                    <div
                      key={u.id}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 bg-white dark:bg-stone-800 transition-all ${
                        isActive
                          ? 'border-indigo-400 dark:border-indigo-600 ring-1 ring-indigo-500/20 shadow-xs'
                          : 'border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${u.avatarGradient} flex items-center justify-center text-white text-xs font-bold shadow-xs flex-shrink-0`}>
                        {u.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate flex items-center gap-1.5">
                          {u.name}
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        </div>
                        <div className="text-[10px] text-stone-400 truncate">
                          {u.role}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* If Edit Mode is ON: tabs for each user + "+ Add New Student" */
              <div className="space-y-4 pt-2 border-t border-stone-200 dark:border-stone-700">
                
                {/* Horizontal scrollable tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setEditTab(u.id)}
                      className={`py-1 px-2.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                        editTab === u.id
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                          : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {u.name.split(' ')[0]}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditTab('new')}
                    className={`py-1 px-2.5 text-xs font-semibold rounded-lg whitespace-nowrap flex items-center gap-1 transition-all ${
                      editTab === 'new'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                {/* Form: Add New User */}
                {editTab === 'new' ? (
                  <form onSubmit={handleCreateNewUser} className="space-y-3 bg-white dark:bg-stone-800/90 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Create New Student Profile
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => {
                          setNewName(e.target.value)
                          if (!newInitials) {
                            setNewInitials(e.target.value.slice(0, 2).toUpperCase())
                          }
                        }}
                        placeholder="e.g. Zayd Al-Mansoor"
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                          Initials
                        </label>
                        <input
                          type="text"
                          maxLength={3}
                          value={newInitials}
                          onChange={(e) => setNewInitials(e.target.value.toUpperCase())}
                          placeholder="ZA"
                          className="w-full mt-1 px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none uppercase text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                          Field / Role
                        </label>
                        <input
                          type="text"
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          placeholder="e.g. Pure Mathematics & Logic"
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                          Register Number
                        </label>
                        <input
                          type="text"
                          value={newRegisterNumber}
                          onChange={(e) => setNewRegisterNumber(e.target.value)}
                          placeholder="e.g. RA2511028020147"
                          className="w-full mt-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                          College / Institution
                        </label>
                        <input
                          type="text"
                          value={newCollege}
                          onChange={(e) => setNewCollege(e.target.value)}
                          placeholder="e.g. SRM Engineering College"
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                        Theme Color Gradient
                      </label>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {GRADIENT_PRESETS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setNewGradient(p.gradient)
                              setNewColor(p.color)
                            }}
                            className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${p.gradient} transition-transform ${
                              newGradient === p.gradient ? 'ring-2 ring-stone-900 dark:ring-white scale-110 shadow-xs' : 'opacity-70 hover:opacity-100'
                            }`}
                            title={p.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        {userCreatedNotice ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{userCreatedNotice ? 'Added!' : 'Create Profile'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Form: Edit Existing User */
                  <form onSubmit={handleSaveUserProfile} className="space-y-3 bg-white dark:bg-stone-800/90 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                          Initials
                        </label>
                        <input
                          type="text"
                          maxLength={3}
                          value={editInitials}
                          onChange={(e) => setEditInitials(e.target.value.toUpperCase())}
                          placeholder="e.g. MA"
                          className="w-full mt-1 px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none uppercase text-center"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                          Academic Role / Field
                        </label>
                        <input
                          type="text"
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          placeholder="e.g. Computer Science & AI"
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                          Register Number
                        </label>
                        <input
                          type="text"
                          value={editRegisterNumber}
                          onChange={(e) => setEditRegisterNumber(e.target.value)}
                          placeholder="e.g. RA2511028020147"
                          className="w-full mt-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                          College / Institution
                        </label>
                        <input
                          type="text"
                          value={editCollege}
                          onChange={(e) => setEditCollege(e.target.value)}
                          placeholder="e.g. SRM Engineering College, Ramapuram, Chennai"
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                        Theme Color Gradient
                      </label>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {GRADIENT_PRESETS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setEditGradient(p.gradient)
                              setEditColor(p.color)
                            }}
                            className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${p.gradient} transition-transform ${
                              editGradient === p.gradient ? 'ring-2 ring-stone-900 dark:ring-white scale-110 shadow-xs' : 'opacity-70 hover:opacity-100'
                            }`}
                            title={p.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {users.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteProfile(editTab)}
                          className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Profile</span>
                        </button>
                      )}
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={() => setIsUserEditMode(false)}
                          className="px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg"
                        >
                          Done
                        </button>
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          {userProfileSaved ? <Check className="w-3.5 h-3.5" /> : null}
                          <span>{userProfileSaved ? 'Saved!' : 'Save Details'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* GOOGLE GEMINI AI STATUS SECTION (API KEY HIDDEN) */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Google Gemini AI
                </span>
              </div>

              {/* Status Badge: Whether Gemini is Connected */}
              {isGeminiConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                  <span className="w-2 h-2 rounded-full bg-stone-400" />
                  Disconnected
                </span>
              )}
            </div>

            {/* Whose Gemini is Connected */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${activeUser.avatarGradient} flex items-center justify-center text-white text-xs font-bold shadow-xs flex-shrink-0`}>
                  {activeUser.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate flex items-center gap-1.5">
                    {activeUser.name}&apos;s Gemini
                    {isGeminiConnected && (
                      <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-200/50 dark:border-emerald-800/50">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                    {isGeminiConnected 
                      ? 'Connected to Google Gemini AI • Ready for doubts & explanations' 
                      : 'Offline demo mode • No Gemini API key linked'}
                  </div>
                </div>
              </div>

              {/* Actions: Connect / Change Key / Disconnect without ever displaying raw key */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isGeminiConnected ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsEnteringKey(!isEnteringKey)}
                      className="px-2.5 py-1 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
                    >
                      {isEnteringKey ? 'Cancel' : 'Change Key'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnectKey}
                      className="px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEnteringKey(!isEnteringKey)}
                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
                  >
                    {isEnteringKey ? 'Cancel' : 'Connect Key'}
                  </button>
                )}
              </div>
            </div>

            {/* Hidden Input field shown ONLY when clicking Connect Key / Change Key */}
            {isEnteringKey && (
              <form onSubmit={handleSaveKey} className="p-3 bg-white dark:bg-stone-800 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                    Paste Gemini API Key
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Get free key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    autoFocus
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="Enter API key (stored securely, never shown)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:border-indigo-500 outline-none font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors whitespace-nowrap"
                  >
                    {isSaved ? 'Saved!' : 'Save & Link'}
                  </button>
                </div>
              </form>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>API key remains strictly hidden and encrypted locally in your browser.</span>
            </div>
          </div>

          {/* THEME SECTION (Light Mode & Dark Mode only - Warm Book removed) */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Theme
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Light Mode */}
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  theme === 'light'
                    ? 'border-indigo-500 bg-white dark:bg-stone-800 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-stone-200 dark:border-stone-700/80 bg-white/60 dark:bg-stone-800/40 hover:border-stone-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 flex-shrink-0 shadow-xs">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                    <span>Light Mode</span>
                    {theme === 'light' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <div className="text-[11px] text-stone-400">Clean Paper White</div>
                </div>
              </button>

              {/* Dark Mode */}
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-white dark:bg-stone-800 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-stone-200 dark:border-stone-700/80 bg-white/60 dark:bg-stone-800/40 hover:border-stone-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-xs">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                    <span>Dark Mode</span>
                    {theme === 'dark' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <div className="text-[11px] text-stone-400">Obsidian Night Dark</div>
                </div>
              </button>
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
