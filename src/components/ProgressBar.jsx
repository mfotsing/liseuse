import { useMemo } from 'react'

export default function ProgressBar({
  sentences,
  currentSentenceIndex,
  isPlaying,
  onJump,
  rate,
}) {
  const totalSentences = sentences.length
  const progress = totalSentences > 0
    ? ((currentSentenceIndex) / totalSentences) * 100
    : 0

  // Estimate remaining time: ~150 words/min at 1x, adjusted by rate
  const estimatedTimeRemaining = useMemo(() => {
    if (!isPlaying || totalSentences === 0) return null
    const remaining = sentences.slice(currentSentenceIndex)
    const wordCount = remaining.join(' ').split(/\s+/).length
    const wpm = 150 * rate
    const minutes = wordCount / wpm
    if (minutes < 1) return 'Moins d\'une minute'
    const m = Math.round(minutes)
    return `~${m} min restante${m > 1 ? 's' : ''}`
  }, [sentences, currentSentenceIndex, isPlaying, rate, totalSentences])

  const jumpFromPosition = (clientX, el) => {
    if (totalSentences === 0) return
    const rect = el.getBoundingClientRect()
    const x = clientX - rect.left
    const ratio = x / rect.width
    const targetIndex = Math.floor(ratio * totalSentences)
    onJump(Math.max(0, Math.min(targetIndex, totalSentences - 1)))
  }

  const handleClick = (e) => jumpFromPosition(e.clientX, e.currentTarget)
  const handleTouch = (e) => jumpFromPosition(e.touches[0].clientX, e.currentTarget)

  return (
    <div className="space-y-1">
      <div
        onClick={handleClick}
        onTouchStart={handleTouch}
        className="group relative h-3 sm:h-2 cursor-pointer rounded-full bg-warm-200 dark:bg-warm-700 overflow-hidden touch-none"
        title="Clique pour sauter à un endroit"
      >
        <div
          className="h-full rounded-full bg-lavender-400 dark:bg-lavender-500 transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
          bg-lavender-100/50 dark:bg-lavender-500/10 transition-opacity" />
      </div>
      <div className="flex justify-between text-xs text-warm-400 dark:text-warm-500">
        <span>
          {totalSentences > 0 ? `${currentSentenceIndex + 1} / ${totalSentences}` : '—'}
        </span>
        {estimatedTimeRemaining && (
          <span>{estimatedTimeRemaining}</span>
        )}
      </div>
    </div>
  )
}
