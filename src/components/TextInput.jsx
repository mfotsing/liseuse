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
        placeholder="Colle ton texte ici — article, email, recette…"
        className="
          w-full h-40 sm:h-48 resize-none rounded-2xl border border-lavender-200 dark:border-warm-600
          bg-white dark:bg-warm-800 p-4 text-warm-800 dark:text-warm-200
          placeholder:text-warm-400 dark:placeholder:text-warm-500
          focus:border-lavender-400 focus:outline-none focus:ring-2 focus:ring-lavender-200/50
          dark:focus:ring-lavender-600/30 shadow-sm transition-all
        "
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="
          w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium
          bg-gradient-to-r from-lavender-500 to-lavender-600 text-white
          hover:from-lavender-600 hover:to-lavender-700
          shadow-md shadow-lavender-500/20 hover:shadow-lg hover:shadow-lavender-500/30
          disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
          transition-all
        "
      >
        Lis-moi ça
      </button>
    </div>
  )
}
