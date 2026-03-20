import { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { getAllFromLibrary, removeFromLibrary } from '../lib/storage'

export default function Library() {
  const { loadContent, setView } = useApp()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllFromLibrary().then(d => {
      setDocs(d)
      setLoading(false)
    })
  }, [])

  const handleOpen = (doc) => {
    const pages = doc.pages || [doc.text]
    const resume = doc.sentenceIndex > 0
      ? { sentenceIndex: doc.sentenceIndex, currentPage: doc.currentPage || 0 }
      : null
    loadContent(pages, doc.name, resume)
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    await removeFromLibrary(id)
    setDocs(d => d.filter(doc => doc.id !== id))
  }

  const formatDate = (ts) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'À l\'instant'
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const getPreview = (text) => {
    return (text || '').slice(0, 120).replace(/\s+/g, ' ').trim() + '…'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-lavender-200 border-t-lavender-500" />
      </div>
    )
  }

  if (docs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">📚</div>
        <p className="text-warm-500 dark:text-warm-400">Pas encore de lectures</p>
        <button
          onClick={() => setView('home')}
          className="mt-4 text-sm text-lavender-500 hover:text-lavender-600 font-medium"
        >
          Commencer à lire
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {docs.map(doc => (
        <button
          key={doc.id}
          onClick={() => handleOpen(doc)}
          className="w-full text-left p-4 rounded-xl border border-lavender-100 dark:border-warm-700
            bg-white dark:bg-warm-800 hover:border-lavender-300 dark:hover:border-warm-600
            hover:shadow-md hover:shadow-lavender-500/10 transition-all group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-warm-800 dark:text-warm-200 truncate">
                  {doc.name}
                </h3>
                {doc.sentenceIndex > 0 && (
                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-lavender-100 dark:bg-lavender-600/20
                    text-lavender-600 dark:text-lavender-400 font-medium">
                    En cours
                  </span>
                )}
              </div>
              <p className="text-sm text-warm-400 dark:text-warm-500 mt-1 line-clamp-2">
                {getPreview(doc.text)}
              </p>
              <p className="text-xs text-warm-400 dark:text-warm-600 mt-2">
                {formatDate(doc.lastOpenedAt)}
              </p>
            </div>
            <button
              onClick={(e) => handleDelete(e, doc.id)}
              className="shrink-0 p-1.5 rounded-lg text-warm-300 dark:text-warm-600
                opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-50
                dark:hover:bg-red-900/20 transition-all"
              title="Supprimer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </button>
      ))}
    </div>
  )
}
