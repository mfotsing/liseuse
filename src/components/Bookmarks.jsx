import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../contexts/AppContext'
import { getBookmarks, addBookmark, removeBookmark } from '../lib/storage'

export default function Bookmarks({ sentences, currentSentenceIndex, onJumpToSentence }) {
  const { currentDocId } = useApp()
  const [bookmarks, setBookmarks] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!currentDocId) return
    getBookmarks(currentDocId).then(setBookmarks)
  }, [currentDocId])

  const isCurrentBookmarked = bookmarks.some(b => b.sentenceIndex === currentSentenceIndex)

  const toggleBookmark = useCallback(async () => {
    if (!currentDocId || !sentences.length) return

    if (isCurrentBookmarked) {
      await removeBookmark(currentDocId, currentSentenceIndex)
    } else {
      const preview = sentences[currentSentenceIndex]?.slice(0, 80) || ''
      await addBookmark(currentDocId, {
        sentenceIndex: currentSentenceIndex,
        preview,
      })
    }
    const updated = await getBookmarks(currentDocId)
    setBookmarks(updated)
  }, [currentDocId, currentSentenceIndex, sentences, isCurrentBookmarked])

  const handleJump = (sentenceIndex) => {
    onJumpToSentence(sentenceIndex)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Bookmark toggle button */}
      <button
        onClick={toggleBookmark}
        disabled={!sentences.length}
        className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
          isCurrentBookmarked
            ? 'text-lavender-500 dark:text-lavender-400'
            : 'text-warm-400 dark:text-warm-500 hover:text-lavender-500'
        }`}
        title={isCurrentBookmarked ? 'Retirer le signet' : 'Ajouter un signet'}
      >
        <svg className="w-5 h-5" fill={isCurrentBookmarked ? 'currentColor' : 'none'}
          viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      </button>

      {/* Bookmarks list button */}
      {bookmarks.length > 0 && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-warm-400 dark:text-warm-500
            hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
          title={`${bookmarks.length} signet${bookmarks.length > 1 ? 's' : ''}`}
        >
          <span className="text-xs font-medium">{bookmarks.length}</span>
        </button>
      )}

      {/* Bookmarks dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 z-20 bg-white dark:bg-warm-800
            border border-lavender-100 dark:border-warm-700 rounded-xl shadow-lg shadow-lavender-500/10
            p-2 min-w-[240px] max-w-[300px] max-h-[300px] overflow-y-auto">
            <p className="text-xs text-warm-400 dark:text-warm-500 px-2 py-1 font-medium">
              Signets
            </p>
            {bookmarks.map((bm, i) => (
              <button
                key={i}
                onClick={() => handleJump(bm.sentenceIndex)}
                className="w-full text-left px-3 py-2 text-sm rounded-lg
                  text-warm-700 dark:text-warm-300
                  hover:bg-lavender-50 dark:hover:bg-warm-700 transition-colors"
              >
                <span className="line-clamp-2">{bm.preview || `Signet ${i + 1}`}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
