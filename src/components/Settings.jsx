import { useApp } from '../contexts/AppContext'

export default function Settings() {
  const { theme, toggleTheme, textSize, setTextSize } = useApp()

  return (
    <div className="flex items-center gap-3">
      {/* Text size */}
      <div className="flex items-center gap-1 bg-warm-100 dark:bg-warm-800 rounded-lg p-0.5">
        {[
          { value: 'small', label: 'A', cls: 'text-xs' },
          { value: 'medium', label: 'A', cls: 'text-sm' },
          { value: 'large', label: 'A', cls: 'text-base' },
        ].map(({ value, label, cls }) => (
          <button
            key={value}
            onClick={() => setTextSize(value)}
            className={`
              ${cls} px-2 py-1 rounded-md font-medium transition-colors
              ${textSize === value
                ? 'bg-white dark:bg-warm-700 text-lavender-600 dark:text-lavender-400 shadow-sm'
                : 'text-warm-400 dark:text-warm-500 hover:text-warm-600 dark:hover:text-warm-400'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-warm-500 dark:text-warm-400
          hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
        title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
      >
        {theme === 'light' ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </button>
    </div>
  )
}
