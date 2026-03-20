import { useState, useEffect, useRef, useCallback } from 'react'

const PRESETS = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1h', minutes: 60 },
]

export default function SleepTimer({ onTimerEnd }) {
  const [isOpen, setIsOpen] = useState(false)
  const [remaining, setRemaining] = useState(null) // seconds
  const timerRef = useRef(null)
  const endTimeRef = useRef(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    endTimeRef.current = null
    setRemaining(null)
  }, [])

  const startTimer = useCallback((minutes) => {
    clearTimer()
    const end = Date.now() + minutes * 60 * 1000
    endTimeRef.current = end
    setRemaining(minutes * 60)
    setIsOpen(false)

    timerRef.current = setInterval(() => {
      const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
      setRemaining(left)
      if (left <= 0) {
        clearTimer()
        onTimerEnd?.()
      }
    }, 1000)
  }, [clearTimer, onTimerEnd])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const formatTime = (seconds) => {
    if (seconds === null) return null
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative">
      <button
        onClick={() => remaining !== null ? clearTimer() : setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${
          remaining !== null
            ? 'text-lavender-500 dark:text-lavender-400 bg-lavender-50 dark:bg-lavender-600/10'
            : 'text-warm-400 dark:text-warm-500 hover:bg-warm-100 dark:hover:bg-warm-800'
        }`}
        title={remaining !== null ? `Minuterie : ${formatTime(remaining)} — cliquer pour annuler` : 'Minuterie de sommeil'}
      >
        {remaining !== null ? (
          <span className="text-xs font-medium tabular-nums">{formatTime(remaining)}</span>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full right-0 mb-2 z-20 bg-white dark:bg-warm-800
            border border-lavender-100 dark:border-warm-700 rounded-xl shadow-lg shadow-lavender-500/10
            p-2 min-w-[140px]">
            <p className="text-xs text-warm-400 dark:text-warm-500 px-2 py-1 font-medium">
              Arrêter dans…
            </p>
            {PRESETS.map(({ label, minutes }) => (
              <button
                key={minutes}
                onClick={() => startTimer(minutes)}
                className="w-full text-left px-3 py-2 text-sm rounded-lg
                  text-warm-700 dark:text-warm-300
                  hover:bg-lavender-50 dark:hover:bg-warm-700 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
