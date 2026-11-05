import React, { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Sparkles, UserCheck, Users } from 'lucide-react'
import { UserProfile, Note } from '../types'

interface UserSwitcherProps {
  users: UserProfile[]
  activeUser: UserProfile
  onSelectUser: (user: UserProfile) => void
  notes: Note[]
}

export const UserSwitcher: React.FC<UserSwitcherProps> = ({
  users,
  activeUser,
  onSelectUser,
  notes
}) => {
  const [isOpen, setIsOpen] = useState(false)
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
        
        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1 leading-tight">
            <span>{activeUser.name}</span>
          </div>
          <div className="text-[10px] text-stone-400 leading-none">
            {activeUser.name === 'Mohamed Arshad' ? 'CS & AI' : 'Physics & Bio'}
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200/90 dark:border-stone-800 p-2 z-50 animate-fade-in space-y-1">
          <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-400">
            <span>Switch Profile</span>
            <Users className="w-3.5 h-3.5" />
          </div>

          {users.map((u) => {
            const isCurrent = u.id === activeUser.id
            const userNotesCount = notes.filter(n => n.authorId === u.id).length

            return (
              <button
                key={u.id}
                onClick={() => {
                  onSelectUser(u)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                  isCurrent
                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 ring-1 ring-stone-300 dark:ring-stone-700'
                    : 'hover:bg-stone-50 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${u.avatarGradient} flex items-center justify-center text-white text-xs font-bold shadow-xs`}>
                    {u.initials}
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-snug flex items-center gap-1.5">
                      {u.name}
                      {isCurrent && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {u.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-stone-400 bg-stone-200/50 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                    {userNotesCount} {userNotesCount === 1 ? 'note' : 'notes'}
                  </span>
                  {isCurrent && <Check className="w-4 h-4 text-emerald-500" />}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

