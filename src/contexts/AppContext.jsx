import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('liseuse-theme') || 'light')
  const [textSize, setTextSize] = useState(() => localStorage.getItem('liseuse-text-size') || 'medium')
  const [text, setText] = useState('')
  const [pages, setPages] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [fileName, setFileName] = useState('')
  const [view, setView] = useState('home') // 'home' | 'reader'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('liseuse-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('liseuse-text-size', textSize)
  }, [textSize])

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'light' ? 'dark' : 'light')
  }, [])

  const textSizeClass = {
    small: 'text-sm leading-relaxed',
    medium: 'text-base leading-relaxed',
    large: 'text-lg leading-loose',
  }[textSize]

  const loadContent = useCallback((content, name = '') => {
    if (Array.isArray(content)) {
      setPages(content)
      setText(content.join('\n\n'))
      setCurrentPage(0)
    } else {
      setPages([content])
      setText(content)
      setCurrentPage(0)
    }
    setFileName(name)
    setView('reader')
  }, [])

  const goBack = useCallback(() => {
    setText('')
    setPages([])
    setCurrentPage(0)
    setFileName('')
    setView('home')
  }, [])

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      textSize, setTextSize, textSizeClass,
      text, setText, pages, setPages,
      currentPage, setCurrentPage,
      fileName, setFileName,
      view, setView,
      loadContent, goBack,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
