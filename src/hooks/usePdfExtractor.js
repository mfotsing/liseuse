import { useState, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString()

export function usePdfExtractor() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const extractText = useCallback(async (file) => {
    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      const arrayBuffer = await file.arrayBuffer()
      // isEvalSupported: false stops pdf.js from turning code found inside the
      // file (PostScript functions) into JavaScript with new Function().
      // Text extraction never needs it, and the CSP in vercel.json forbids eval.
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, isEvalSupported: false }).promise
      const numPages = pdf.numPages
      const pages = []

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const strings = content.items.map(item => item.str)
        // Join with spaces, collapse multiple spaces, trim lines
        const pageText = strings.join(' ')
          .replace(/\s+/g, ' ')
          .trim()
        if (pageText) {
          pages.push(pageText)
        }
        setProgress(Math.round((i / numPages) * 100))
      }

      setLoading(false)
      return pages
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'extraction du PDF')
      setLoading(false)
      return null
    }
  }, [])

  return { extractText, loading, error, progress }
}
