import { useState, useRef, useCallback } from 'react'
import { useApp } from '../contexts/AppContext'
import { usePdfExtractor } from '../hooks/usePdfExtractor'

export default function FileUploader() {
  const { loadContent } = useApp()
  const { extractText, loading, error, progress } = usePdfExtractor()
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = useCallback(async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      alert('Seuls les fichiers PDF sont acceptés.')
      return
    }
    const pages = await extractText(file)
    if (pages && pages.length > 0) {
      loadContent(pages, file.name)
    }
  }, [extractText, loadContent])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => fileInputRef.current?.click()}
      className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12
        transition-all duration-300 text-center shadow-sm
        ${isDragging
          ? 'drop-active border-lavender-400 bg-lavender-50 shadow-lg shadow-lavender-500/10 dark:bg-lavender-600/10'
          : 'border-lavender-200 dark:border-warm-600 hover:border-lavender-400 hover:bg-lavender-50/50 hover:shadow-md hover:shadow-lavender-500/10 dark:hover:bg-warm-800/50'
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {loading ? (
        <div className="space-y-3">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-lavender-200 border-t-lavender-500" />
          <p className="text-warm-500 dark:text-warm-400">
            Extraction du texte… {progress}%
          </p>
          <div className="mx-auto h-2 w-48 overflow-hidden rounded-full bg-warm-200 dark:bg-warm-700">
            <div
              className="h-full rounded-full bg-lavender-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 text-4xl">📄</div>
          <p className="text-lg font-medium text-warm-700 dark:text-warm-300">
            Glisse ton PDF ici
          </p>
          <p className="mt-1 text-sm text-warm-400 dark:text-warm-500">
            ou clique pour en choisir un
          </p>
        </>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
