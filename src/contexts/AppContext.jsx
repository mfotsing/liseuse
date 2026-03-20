import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { docId, saveToLibrary } from '../lib/storage'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('liseuse-theme') || 'light')
  const [textSize, setTextSize] = useState(() => localStorage.getItem('liseuse-text-size') || 'medium')
  const [text, setText] = useState('')
  const [pages, setPages] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [fileName, setFileName] = useState('')
  const [currentDocId, setCurrentDocId] = useState(null)
  const [view, setView] = useState('home') // 'home' | 'library' | 'reader'
  const [focusMode, setFocusMode] = useState(false)
  const [resumeInfo, setResumeInfo] = useState(null) // { sentenceIndex, currentPage }

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

  const toggleFocusMode = useCallback(() => {
    setFocusMode(f => !f)
  }, [])

  const textSizeClass = {
    small: 'text-sm leading-relaxed',
    medium: 'text-base leading-relaxed',
    large: 'text-lg leading-loose',
  }[textSize]

  const loadContent = useCallback((content, name = '', resume = null) => {
    const pagesArr = Array.isArray(content) ? content : [content]
    const fullText = Array.isArray(content) ? content.join('\n\n') : content
    setPages(pagesArr)
    setText(fullText)
    setCurrentPage(resume?.currentPage || 0)
    setFileName(name)

    const id = docId(name, fullText)
    setCurrentDocId(id)

    // Save to library
    saveToLibrary({
      id,
      name,
      text: fullText,
      pages: pagesArr,
      sentenceIndex: resume?.sentenceIndex || 0,
      currentPage: resume?.currentPage || 0,
    })

    if (resume?.sentenceIndex > 0) {
      setResumeInfo(resume)
    } else {
      setResumeInfo(null)
    }

    setView('reader')
  }, [])

  const goBack = useCallback(() => {
    setText('')
    setPages([])
    setCurrentPage(0)
    setFileName('')
    setCurrentDocId(null)
    setResumeInfo(null)
    setFocusMode(false)
    setView('home')
  }, [])

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      textSize, setTextSize, textSizeClass,
      text, setText, pages, setPages,
      currentPage, setCurrentPage,
      fileName, setFileName,
      currentDocId,
      view, setView,
      focusMode, toggleFocusMode,
      resumeInfo, setResumeInfo,
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
