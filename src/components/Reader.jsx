import { useMemo, useEffect, useRef } from 'react'
import { useApp } from '../contexts/AppContext'

export default function Reader({ sentences, currentSentenceIndex, isPlaying }) {
  const { text, textSizeClass, pages, currentPage, setCurrentPage } = useApp()
  const containerRef = useRef(null)
  const highlightRef = useRef(null)

  // Build the displayed text for current page or full text
  const displayText = useMemo(() => {
    if (pages.length > 1) {
      return pages[currentPage] || ''
    }
    return text
  }, [pages, currentPage, text])

  // Map sentences to their positions in the display text
  const renderedContent = useMemo(() => {
    if (!displayText) return null
    if (!sentences || sentences.length === 0) {
      return <span>{displayText}</span>
    }

    // Find all sentence positions in the full text
    const parts = []
    let remaining = displayText
    let sentenceGlobalIdx = 0

    // When multi-page, we need to figure out which sentences belong to this page
    let fullText = text
    let pageOffset = 0
    if (pages.length > 1) {
      for (let i = 0; i < currentPage; i++) {
        // Each page is joined by \n\n
        pageOffset += pages[i].length + 2
      }
    }

    // Find sentences that are in the current page text
    const pageSentences = []
    for (let i = 0; i < sentences.length; i++) {
      const idx = displayText.indexOf(sentences[i])
      if (idx !== -1) {
        pageSentences.push({ sentence: sentences[i], globalIndex: i, localIndex: idx })
      }
    }

    // Sort by position
    pageSentences.sort((a, b) => a.localIndex - b.localIndex)

    if (pageSentences.length === 0) {
      return <span>{displayText}</span>
    }

    let lastEnd = 0
    pageSentences.forEach(({ sentence, globalIndex, localIndex }) => {
      // Add text before this sentence
      if (localIndex > lastEnd) {
        parts.push(
          <span key={`gap-${lastEnd}`}>{displayText.slice(lastEnd, localIndex)}</span>
        )
      }
      const isActive = isPlaying && globalIndex === currentSentenceIndex
      parts.push(
        <span
          key={`s-${globalIndex}`}
          ref={isActive ? highlightRef : null}
          className={isActive ? 'sentence-highlight' : ''}
          data-sentence-index={globalIndex}
        >
          {sentence}
        </span>
      )
      lastEnd = localIndex + sentence.length
    })

    // Add remaining text
    if (lastEnd < displayText.length) {
      parts.push(
        <span key="tail">{displayText.slice(lastEnd)}</span>
      )
    }

    return parts
  }, [displayText, sentences, currentSentenceIndex, isPlaying, text, pages, currentPage])

  // Auto-scroll to highlighted sentence
  useEffect(() => {
    if (highlightRef.current && containerRef.current) {
      const container = containerRef.current
      const el = highlightRef.current
      const containerRect = container.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()

      if (elRect.top < containerRect.top || elRect.bottom > containerRect.bottom) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentSentenceIndex])

  return (
    <div className="flex flex-col h-full">
      {/* Page navigation for multi-page PDFs */}
      {pages.length > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-warm-200 dark:border-warm-700">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1 rounded-lg text-sm font-medium text-warm-600 dark:text-warm-400
              hover:bg-warm-100 dark:hover:bg-warm-800 disabled:opacity-30 transition-colors"
          >
            ← Précédent
          </button>
          <span className="text-sm text-warm-500 dark:text-warm-400">
            Page {currentPage + 1} / {pages.length}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
            disabled={currentPage === pages.length - 1}
            className="px-3 py-1 rounded-lg text-sm font-medium text-warm-600 dark:text-warm-400
              hover:bg-warm-100 dark:hover:bg-warm-800 disabled:opacity-30 transition-colors"
          >
            Suivant →
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className={`
          flex-1 overflow-y-auto p-4 sm:p-6
          text-warm-800 dark:text-warm-200 ${textSizeClass}
          whitespace-pre-wrap
        `}
      >
        {renderedContent}
      </div>
    </div>
  )
}
