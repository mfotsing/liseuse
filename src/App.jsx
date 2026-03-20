import { useState, useEffect, useCallback, useRef } from 'react'
import { useApp } from './contexts/AppContext'
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis'
import { updateReadingPosition } from './lib/storage'
import FileUploader from './components/FileUploader'
import TextInput from './components/TextInput'
import Reader from './components/Reader'
import AudioControls from './components/AudioControls'
import ProgressBar from './components/ProgressBar'
import Settings from './components/Settings'
import Library from './components/Library'
import Bookmarks from './components/Bookmarks'

export default function App() {
  const {
    view, text, goBack, fileName, currentDocId,
    focusMode, toggleFocusMode,
    resumeInfo, setResumeInfo, currentPage,
  } = useApp()
  const speech = useSpeechSynthesis()
  const hasResumed = useRef(false)
  const [homeTab, setHomeTab] = useState('new') // 'new' | 'library'

  // Auto-resume reading position
  useEffect(() => {
    if (resumeInfo && text && !hasResumed.current) {
      hasResumed.current = true
      // Small delay to let sentences parse
      setTimeout(() => {
        speech.play(text, resumeInfo.sentenceIndex)
      }, 300)
    }
  }, [resumeInfo, text])

  // Reset resume flag when going back
  useEffect(() => {
    if (view === 'home') hasResumed.current = false
  }, [view])

  // Persist reading position periodically
  useEffect(() => {
    if (!currentDocId || !speech.isPlaying) return
    const interval = setInterval(() => {
      updateReadingPosition(currentDocId, speech.currentSentenceIndex, currentPage)
    }, 5000)
    return () => clearInterval(interval)
  }, [currentDocId, speech.isPlaying, speech.currentSentenceIndex, currentPage])

  // Save position on pause/stop
  useEffect(() => {
    if (currentDocId && !speech.isPlaying && speech.currentSentenceIndex > 0) {
      updateReadingPosition(currentDocId, speech.currentSentenceIndex, currentPage)
    }
  }, [speech.isPlaying, currentDocId, speech.currentSentenceIndex, currentPage])

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return

    if (e.code === 'Space') {
      e.preventDefault()
      if (!speech.isPlaying) {
        if (text) speech.play(text)
      } else if (speech.isPaused) {
        speech.resume()
      } else {
        speech.pause()
      }
    } else if (e.code === 'ArrowRight') {
      e.preventDefault()
      speech.skipForward(text)
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault()
      speech.skipBackward(text)
    } else if (e.code === 'Escape' && focusMode) {
      toggleFocusMode()
    }
  }, [text, speech, focusMode, toggleFocusMode])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleGoBack = () => {
    if (currentDocId) {
      updateReadingPosition(currentDocId, speech.currentSentenceIndex, currentPage)
    }
    speech.stop()
    goBack()
  }

  // Swipe handlers for mobile
  const handleSwipeLeft = useCallback(() => {
    if (speech.isPlaying) speech.skipForward(text)
  }, [speech, text])

  const handleSwipeRight = useCallback(() => {
    if (speech.isPlaying) speech.skipBackward(text)
  }, [speech, text])

  const handleSwipeUp = useCallback(() => {
    if (speech.isPlaying && !speech.isPaused) {
      speech.pause()
    } else if (speech.isPaused) {
      speech.resume()
    }
  }, [speech])

  // ─── Reader view ───
  if (view === 'reader') {
    return (
      <div className="flex flex-col h-[100dvh] bg-white dark:bg-warm-900 transition-colors">
        {/* Header — hidden in focus mode */}
        {!focusMode && (
          <header className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3
            border-b border-lavender-100 dark:border-warm-700 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={handleGoBack}
                className="shrink-0 p-1.5 rounded-lg text-warm-500 dark:text-warm-400
                  hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-sm font-medium text-warm-600 dark:text-warm-400 truncate">
                {fileName || 'Lecture'}
              </h1>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Bookmarks
                sentences={speech.sentences}
                currentSentenceIndex={speech.currentSentenceIndex}
                onJumpToSentence={(idx) => speech.jumpToSentence(text, idx)}
              />
              {/* Focus mode toggle */}
              <button
                onClick={toggleFocusMode}
                className="p-2 rounded-lg text-warm-400 dark:text-warm-500
                  hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
                title="Mode focus"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              </button>
              <Settings />
            </div>
          </header>
        )}

        {/* Focus mode: tap area to exit */}
        {focusMode && (
          <button
            onClick={toggleFocusMode}
            className="absolute top-3 right-3 z-10 p-2 rounded-lg
              text-warm-300 dark:text-warm-600 hover:text-warm-500
              bg-white/50 dark:bg-warm-900/50 backdrop-blur-sm transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            </svg>
          </button>
        )}

        {/* Reader */}
        <div className="flex-1 overflow-hidden">
          <Reader
            sentences={speech.sentences}
            currentSentenceIndex={speech.currentSentenceIndex}
            isPlaying={speech.isPlaying}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSwipeUp={handleSwipeUp}
          />
        </div>

        {/* Controls footer */}
        <footer className={`border-t border-lavender-100 dark:border-warm-700 px-3 sm:px-4 space-y-2 sm:space-y-3 shrink-0
          bg-gradient-to-t from-lavender-50/80 to-white dark:from-warm-800/80 dark:to-warm-900
          ${focusMode ? 'py-2' : 'py-2 sm:py-3'}`}
        >
          {!focusMode && (
            <ProgressBar
              sentences={speech.sentences}
              currentSentenceIndex={speech.currentSentenceIndex}
              isPlaying={speech.isPlaying}
              onJump={(index) => speech.jumpToSentence(text, index)}
              rate={speech.rate}
            />
          )}
          <AudioControls
            isPlaying={speech.isPlaying}
            isPaused={speech.isPaused}
            onPlay={speech.play}
            onPause={speech.pause}
            onResume={speech.resume}
            onStop={speech.stop}
            onSkipForward={speech.skipForward}
            onSkipBackward={speech.skipBackward}
            rate={speech.rate}
            onRateChange={speech.setRate}
            voices={speech.voices}
            selectedVoice={speech.selectedVoice}
            onVoiceChange={speech.setSelectedVoice}
          />
        </footer>
      </div>
    )
  }

  // ─── Home view ───
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-lavender-50 via-white to-warm-50
      dark:from-warm-900 dark:via-warm-900 dark:to-warm-800 transition-colors">
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <div />
        <Settings />
      </header>

      <main className="px-4 sm:px-6 pb-12 max-w-2xl mx-auto">
        <div className="text-center mb-6 sm:mb-12 mt-6 sm:mt-16">
          <h1 className="text-3xl sm:text-4xl font-semibold text-lavender-700 dark:text-lavender-300 mb-2">
            Liseuse de Loupiotte
          </h1>
          <p className="text-warm-500 dark:text-warm-400">
            Ta liseuse perso, mon amour.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex justify-center gap-1 mb-6 sm:mb-8 bg-warm-100 dark:bg-warm-800 rounded-xl p-1 max-w-xs mx-auto">
          <button
            onClick={() => setHomeTab('new')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              homeTab === 'new'
                ? 'bg-white dark:bg-warm-700 text-lavender-600 dark:text-lavender-400 shadow-sm'
                : 'text-warm-500 dark:text-warm-400 hover:text-warm-700'
            }`}
          >
            Nouveau
          </button>
          <button
            onClick={() => setHomeTab('library')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              homeTab === 'library'
                ? 'bg-white dark:bg-warm-700 text-lavender-600 dark:text-lavender-400 shadow-sm'
                : 'text-warm-500 dark:text-warm-400 hover:text-warm-700'
            }`}
          >
            Bibliothèque
          </button>
        </div>

        {homeTab === 'new' ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-medium text-warm-500 dark:text-warm-400 mb-3 uppercase tracking-wide">
                Dépose ton PDF ici
              </h2>
              <FileUploader />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-warm-200 dark:border-warm-700" />
              <span className="text-sm text-warm-400 dark:text-warm-500">ou</span>
              <div className="flex-1 border-t border-warm-200 dark:border-warm-700" />
            </div>

            <div>
              <h2 className="text-sm font-medium text-warm-500 dark:text-warm-400 mb-3 uppercase tracking-wide">
                Ou colle ton texte
              </h2>
              <TextInput />
            </div>
          </div>
        ) : (
          <Library />
        )}

        <p className="text-center text-xs text-warm-400 dark:text-warm-600 mt-12">
          Tout reste sur ton appareil. Rien ne sort d'ici.
        </p>

        <p className="text-center text-xs text-lavender-400 dark:text-lavender-500 mt-4">
          Fait avec amour par Doudou
        </p>
      </main>
    </div>
  )
}
