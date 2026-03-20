import { useState } from 'react'
import { useApp } from '../contexts/AppContext'

export default function TextInput() {
  const { loadContent } = useApp()
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    loadContent(trimmed, 'Texte collé')
  }

  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Collez votre texte ici — article, email, notes…"
        className="
          w-full h-40 sm:h-48 resize-none rounded-2xl border-2 border-warm-200 dark:border-warm-600
          bg-white dark:bg-warm-800 p-4 text-warm-800 dark:text-warm-200
          placeholder:text-warm-400 dark:placeholder:text-warm-500
          focus:border-lavender-400 focus:outline-none focus:ring-2 focus:ring-lavender-200
          dark:focus:ring-lavender-600/30 transition-all
        "
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="
          w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium
          bg-lavender-500 text-white hover:bg-lavender-600
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors
        "
      >
        Lire ce texte
      </button>
    </div>
  )
}
