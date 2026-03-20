import { useApp } from '../contexts/AppContext'
import SleepTimer from './SleepTimer'

export default function AudioControls({
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onResume,
  onStop,
  onSkipForward,
  onSkipBackward,
  rate,
  onRateChange,
  voices,
  selectedVoice,
  onVoiceChange,
}) {
  const { text, focusMode } = useApp()

  const handlePlayPause = () => {
    if (!isPlaying) {
      onPlay(text)
    } else if (isPaused) {
      onResume()
    } else {
      onPause()
    }
  }

  // Group voices by language
  const voiceGroups = voices.reduce((groups, voice) => {
    const lang = voice.lang.split('-')[0]
    let label = lang
    if (lang === 'fr') label = 'Français'
    else if (lang === 'en') label = 'English'
    if (!groups[label]) groups[label] = []
    groups[label].push(voice)
    return groups
  }, {})

  if (focusMode) {
    return (
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handlePlayPause}
          disabled={!text}
          className="p-4 rounded-full bg-gradient-to-br from-lavender-500 to-lavender-700 text-white
            hover:from-lavender-600 hover:to-lavender-700 active:scale-95 disabled:opacity-40
            transition-all shadow-lg shadow-lavender-600/30"
        >
          {isPlaying && !isPaused ? (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36A1 1 0 008 5.14z" />
            </svg>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main controls row */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <SleepTimer onTimerEnd={onStop} />

        <button
          onClick={() => onSkipBackward(text)}
          disabled={!isPlaying}
          className="p-2 rounded-full text-warm-500 dark:text-warm-400
            hover:bg-warm-100 dark:hover:bg-warm-800 disabled:opacity-30 transition-colors"
          title="Reculer (←)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </button>

        <button
          onClick={handlePlayPause}
          disabled={!text}
          className="p-3 sm:p-4 rounded-full bg-gradient-to-br from-lavender-500 to-lavender-700 text-white
            hover:from-lavender-600 hover:to-lavender-700 active:scale-95 disabled:opacity-40
            disabled:cursor-not-allowed transition-all shadow-lg shadow-lavender-600/30"
          title={isPlaying && !isPaused ? 'Pause (Espace)' : 'Play (Espace)'}
        >
          {isPlaying && !isPaused ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36A1 1 0 008 5.14z" />
            </svg>
          )}
        </button>

        <button
          onClick={onStop}
          disabled={!isPlaying}
          className="p-2 rounded-full text-warm-500 dark:text-warm-400
            hover:bg-warm-100 dark:hover:bg-warm-800 disabled:opacity-30 transition-colors"
          title="Stop"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>

        <button
          onClick={() => onSkipForward(text)}
          disabled={!isPlaying}
          className="p-2 rounded-full text-warm-500 dark:text-warm-400
            hover:bg-warm-100 dark:hover:bg-warm-800 disabled:opacity-30 transition-colors"
          title="Avancer (→)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
          </svg>
        </button>
      </div>

      {/* Speed & voice row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-warm-400 dark:text-warm-500 w-8 text-right tabular-nums">
            {rate}x
          </span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => onRateChange(parseFloat(e.target.value))}
            className="w-24 sm:w-32 bg-warm-200 dark:bg-warm-700"
          />
        </div>

        <select
          value={selectedVoice?.name || ''}
          onChange={(e) => {
            const voice = voices.find(v => v.name === e.target.value)
            if (voice) onVoiceChange(voice)
          }}
          className="
            w-full sm:w-auto text-sm rounded-lg border border-warm-200 dark:border-warm-600
            bg-white dark:bg-warm-800 text-warm-700 dark:text-warm-300
            px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-lavender-300
            dark:focus:ring-lavender-600/30 max-w-full sm:max-w-[250px]
          "
        >
          {Object.entries(voiceGroups).map(([lang, groupVoices]) => (
            <optgroup key={lang} label={lang}>
              {groupVoices.map(voice => (
                <option key={voice.name} value={voice.name}>
                  {voice.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  )
}
