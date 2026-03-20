import { useEffect, useCallback } from 'react'
import { useApp } from './contexts/AppContext'
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis'
import FileUploader from './components/FileUploader'
import TextInput from './components/TextInput'
import Reader from './components/Reader'
import AudioControls from './components/AudioControls'
import ProgressBar from './components/ProgressBar'
import Settings from './components/Settings'

export default function App() {
  const { view, text, goBack, fileName } = useApp()
  const speech = useSpeechSynthesis()

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
    }
  }, [text, speech])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleGoBack = () => {
    speech.stop()
    goBack()
  }

  if (view === 'reader') {
    return (
      <div className="flex flex-col h-screen bg-white dark:bg-warm-900 transition-colors">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-warm-200 dark:border-warm-700">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="p-1.5 rounded-lg text-warm-500 dark:text-warm-400
                hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-sm font-medium text-warm-600 dark:text-warm-400 truncate max-w-[200px] sm:max-w-none">
              {fileName || 'Lecture'}
            </h1>
          </div>
          <Settings />
        </header>

        {/* Reader */}
        <div className="flex-1 overflow-hidden">
          <Reader
            sentences={speech.sentences}
            currentSentenceIndex={speech.currentSentenceIndex}
            isPlaying={speech.isPlaying}
          />
        </div>

        {/* Controls footer */}
        <footer className="border-t border-warm-200 dark:border-warm-700 px-4 py-3 space-y-3
          bg-warm-50 dark:bg-warm-800/50">
          <ProgressBar
            sentences={speech.sentences}
            currentSentenceIndex={speech.currentSentenceIndex}
            isPlaying={speech.isPlaying}
            onJump={(index) => speech.jumpToSentence(text, index)}
            rate={speech.rate}
          />
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

  // Home view
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-900 transition-colors">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div />
        <Settings />
      </header>

      <main className="px-4 sm:px-6 pb-12 max-w-2xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 mt-8 sm:mt-16">
          <h1 className="text-3xl sm:text-4xl font-semibold text-warm-800 dark:text-warm-100 mb-2">
            Liseuse
          </h1>
          <p className="text-warm-500 dark:text-warm-400">
            Écoutez vos documents, simplement.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-medium text-warm-500 dark:text-warm-400 mb-3 uppercase tracking-wide">
              Importer un PDF
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
              Coller du texte
            </h2>
            <TextInput />
          </div>
        </div>

        <p className="text-center text-xs text-warm-400 dark:text-warm-600 mt-12">
          Tout reste sur votre appareil. Aucune donnée n'est envoyée.
        </p>
      </main>
    </div>
  )
}
