import React, { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Plus, Search, Users } from 'lucide-react'
import { UserProfile, Note } from '../types'

interface UserSwitcherProps {
  users: UserProfile[]
  activeUser: UserProfile
  onSelectUser: (user: UserProfile) => void
  notes: Note[]
  onOpenSettings?: () => void
}

export const UserSwitcher: React.FC<UserSwitcherProps> = ({
  users,
  activeUser,
  onSelectUser,
  notes,
  onOpenSettings
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filterQuery, setFilterQuery] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(filterQuery.toLowerCase())
  )

  return (
    <div className="relative" ref={menuRef}>
      {/* Current User Pill Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-stone-200/90 dark:border-stone-700/80 bg-white/90 dark:bg-stone-800/90 hover:bg-stone-50 dark:hover:bg-stone-700/60 shadow-xs transition-all hover:scale-[1.01]"
      >
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${activeUser.avatarGradient} flex items-center justify-center text-white text-[11px] font-bold shadow-xs`}>
          {activeUser.initials}
        </div>
        
        <div className="text-left hidden sm:block max-w-[130px]">
          <div className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate leading-tight">
            {activeUser.name}
          </div>
          <div className="text-[10px] text-stone-400 truncate leading-none mt-0.5">
            {activeUser.role}
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200/90 dark:border-stone-800 p-2 z-50 animate-fade-in space-y-1">
          <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 dark:border-stone-800 pb-2">
            <span>Student Profiles ({users.length})</span>
            <Users className="w-3.5 h-3.5" />
          </div>

          {/* Search bar if many users */}
          {users.length > 3 && (
            <div className="px-1 py-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter students..."
                  className="w-full pl-8 pr-3 py-1 text-xs rounded-lg bg-stone-100 dark:bg-stone-800 border-none outline-none"
                />
              </div>
            </div>
          )}

          {/* Scrollable list of students */}
          <div className="max-h-64 overflow-y-auto space-y-1 pr-0.5">
            {filteredUsers.map((u) => {
              const isCurrent = u.id === activeUser.id
              const userNotesCount = notes.filter(n => n.authorId === u.id).length

              return (
                <button
                  key={u.id}
                  onClick={() => {
                    onSelectUser(u)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                    isCurrent
                      ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 ring-1 ring-stone-300 dark:ring-stone-700'
                      : 'hover:bg-stone-50 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${u.avatarGradient} flex items-center justify-center text-white text-xs font-bold shadow-xs flex-shrink-0`}>
                      {u.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-snug flex items-center gap-1.5 truncate">
                        <span className="truncate">{u.name}</span>
                        {isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400 truncate">
                        {u.role}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] font-mono text-stone-400 bg-stone-200/50 dark:bg-stone-800 px-1.5 py-0.5 rounded-full">
                      {userNotesCount}
                    </span>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Quick Add Profile Action in Settings */}
          {onOpenSettings && (
            <div className="pt-1.5 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => {
                  setIsOpen(false)
                  onOpenSettings()
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage & Add Profiles in Settings</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
