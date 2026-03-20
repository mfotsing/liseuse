import { useMemo, useEffect, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import { useSwipeGestures } from '../hooks/useSwipeGestures'

export default function Reader({
  sentences,
  currentSentenceIndex,
  isPlaying,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
}) {
  const { text, textSizeClass, pages, currentPage, setCurrentPage, focusMode } = useApp()
  const containerRef = useRef(null)
  const highlightRef = useRef(null)

  const swipe = useSwipeGestures({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
  })

  // Auto page turn: find which page the current sentence belongs to
  useEffect(() => {
    if (pages.length <= 1 || !isPlaying || sentences.length === 0) return

    const currentSentence = sentences[currentSentenceIndex]
    if (!currentSentence) return

    // Find which page contains this sentence
    let offset = 0
    for (let i = 0; i < pages.length; i++) {
      const pageEnd = offset + pages[i].length
      // Check if the sentence starts within this page's range in the full text
      const sentencePos = text.indexOf(currentSentence, Math.max(0, offset - 50))
      if (sentencePos >= offset && sentencePos < pageEnd + 2) {
        if (i !== currentPage) {
          setCurrentPage(i)
        }
        break
      }
      offset = pageEnd + 2 // +2 for \n\n separator
    }
  }, [currentSentenceIndex, isPlaying, sentences, pages, text, currentPage, setCurrentPage])

  const displayText = useMemo(() => {
    if (pages.length > 1) {
      return pages[currentPage] || ''
    }
    return text
  }, [pages, currentPage, text])

  const renderedContent = useMemo(() => {
    if (!displayText) return null
    if (!sentences || sentences.length === 0) {
      return <span>{displayText}</span>
    }

    const parts = []

    // Find sentences that are in the current page text
    const pageSentences = []
    let searchFrom = 0
    for (let i = 0; i < sentences.length; i++) {
      const idx = displayText.indexOf(sentences[i], searchFrom > 0 ? 0 : 0)
      if (idx !== -1) {
        pageSentences.push({ sentence: sentences[i], globalIndex: i, localIndex: idx })
      }
    }

    pageSentences.sort((a, b) => a.localIndex - b.localIndex)

    // Deduplicate overlapping matches — keep only the first occurrence at each position
    const deduped = []
    let lastEnd = 0
    for (const ps of pageSentences) {
      if (ps.localIndex >= lastEnd) {
        deduped.push(ps)
        lastEnd = ps.localIndex + ps.sentence.length
      }
    }

    if (deduped.length === 0) {
      return <span>{displayText}</span>
    }

    lastEnd = 0
    deduped.forEach(({ sentence, globalIndex, localIndex }) => {
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

    if (lastEnd < displayText.length) {
      parts.push(
        <span key="tail">{displayText.slice(lastEnd)}</span>
      )
    }

    return parts
  }, [displayText, sentences, currentSentenceIndex, isPlaying])

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
    <div className="flex flex-col h-full" {...swipe}>
      {/* Page navigation for multi-page PDFs */}
      {pages.length > 1 && !focusMode && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-warm-200 dark:border-warm-700">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1 rounded-lg text-sm font-medium text-warm-600 dark:text-warm-400
              hover:bg-warm-100 dark:hover:bg-warm-800 disabled:opacity-30 transition-colors"
          >
            ←
          </button>
          <span className="text-sm text-warm-500 dark:text-warm-400">
            {currentPage + 1} / {pages.length}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
            disabled={currentPage === pages.length - 1}
            className="px-3 py-1 rounded-lg text-sm font-medium text-warm-600 dark:text-warm-400
              hover:bg-warm-100 dark:hover:bg-warm-800 disabled:opacity-30 transition-colors"
          >
            →
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className={`
          flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8
          text-warm-800 dark:text-warm-200 ${textSizeClass}
          whitespace-pre-wrap select-text
        `}
      >
        {renderedContent}
      </div>
    </div>
  )
}
