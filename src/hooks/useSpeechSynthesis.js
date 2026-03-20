import { useState, useEffect, useRef, useCallback } from 'react'
import { detectLanguage } from '../lib/detectLanguage'

// Split text into sentences for chunking (handles French and English punctuation)
function splitIntoSentences(text) {
  const sentences = []
  const regex = /[^.!?…]+[.!?…]+[\s]?|[^.!?…]+$/g
  let match
  while ((match = regex.exec(text)) !== null) {
    const s = match[0].trim()
    if (s) sentences.push(s)
  }
  if (sentences.length === 0 && text.trim()) {
    const lines = text.split(/\n+/).filter(l => l.trim())
    if (lines.length > 1) return lines
    const words = text.split(/\s+/)
    let chunk = ''
    for (const word of words) {
      if (chunk.length + word.length > 100 && chunk) {
        sentences.push(chunk.trim())
        chunk = ''
      }
      chunk += word + ' '
    }
    if (chunk.trim()) sentences.push(chunk.trim())
  }
  return sentences
}

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [rate, setRate] = useState(() => {
    const saved = localStorage.getItem('liseuse-rate')
    return saved ? parseFloat(saved) : 1
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [sentences, setSentences] = useState([])

  const synthRef = useRef(window.speechSynthesis)
  const utteranceRef = useRef(null)
  const sentenceIndexRef = useRef(0)
  const isPlayingRef = useRef(false)
  const rateRef = useRef(rate)
  const selectedVoiceRef = useRef(selectedVoice)
  const voicesRef = useRef([])
  const onSentenceChangeRef = useRef(null)

  useEffect(() => { rateRef.current = rate }, [rate])
  useEffect(() => { selectedVoiceRef.current = selectedVoice }, [selectedVoice])
  useEffect(() => { localStorage.setItem('liseuse-rate', rate.toString()) }, [rate])

  // Load voices
  useEffect(() => {
    const synth = synthRef.current
    const loadVoices = () => {
      const allVoices = synth.getVoices()
      const frEn = allVoices.filter(v =>
        v.lang.startsWith('fr') || v.lang.startsWith('en')
      )
      const others = allVoices.filter(v =>
        !v.lang.startsWith('fr') && !v.lang.startsWith('en')
      )
      const sorted = [...frEn, ...others]
      setVoices(sorted)
      voicesRef.current = sorted

      if (!selectedVoiceRef.current && sorted.length > 0) {
        const savedVoice = localStorage.getItem('liseuse-voice')
        const found = savedVoice && sorted.find(v => v.name === savedVoice)
        if (found) {
          setSelectedVoice(found)
          selectedVoiceRef.current = found
        } else {
          const frVoice = sorted.find(v => v.lang.startsWith('fr'))
          const pick = frVoice || sorted[0]
          setSelectedVoice(pick)
          selectedVoiceRef.current = pick
        }
      }
    }

    loadVoices()
    synth.addEventListener('voiceschanged', loadVoices)
    return () => synth.removeEventListener('voiceschanged', loadVoices)
  }, [])

  useEffect(() => {
    if (selectedVoice) {
      localStorage.setItem('liseuse-voice', selectedVoice.name)
    }
  }, [selectedVoice])

  // Auto-detect language and select voice
  const autoSelectVoice = useCallback((text) => {
    const lang = detectLanguage(text)
    const allVoices = voicesRef.current
    if (allVoices.length === 0) return

    // Check if current voice already matches
    if (selectedVoiceRef.current?.lang.startsWith(lang)) return

    // Find best voice for the detected language
    const match = allVoices.find(v => v.lang.startsWith(lang))
    if (match) {
      setSelectedVoice(match)
      selectedVoiceRef.current = match
    }
  }, [])

  const speakSentence = useCallback((index, sentenceList) => {
    const synth = synthRef.current
    if (index >= sentenceList.length) {
      setIsPlaying(false)
      setIsPaused(false)
      isPlayingRef.current = false
      return
    }

    const utterance = new SpeechSynthesisUtterance(sentenceList[index])
    utterance.rate = rateRef.current
    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current
    }

    utterance.onend = () => {
      if (!isPlayingRef.current) return
      const next = sentenceIndexRef.current + 1
      sentenceIndexRef.current = next
      setCurrentSentenceIndex(next)
      onSentenceChangeRef.current?.(next)
      speakSentence(next, sentenceList)
    }

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return
      console.error('Speech error:', e.error)
    }

    utteranceRef.current = utterance
    synth.speak(utterance)
  }, [])

  const play = useCallback((text, startIndex = null) => {
    const synth = synthRef.current
    synth.cancel()

    // Auto-detect language on first play
    autoSelectVoice(text)

    const sentenceList = splitIntoSentences(text)
    setSentences(sentenceList)

    const idx = startIndex !== null ? startIndex : sentenceIndexRef.current
    const safeIdx = Math.max(0, Math.min(idx, sentenceList.length - 1))
    sentenceIndexRef.current = safeIdx
    setCurrentSentenceIndex(safeIdx)
    setIsPlaying(true)
    setIsPaused(false)
    isPlayingRef.current = true

    speakSentence(safeIdx, sentenceList)
  }, [speakSentence, autoSelectVoice])

  const pause = useCallback(() => {
    synthRef.current.pause()
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    synthRef.current.resume()
    setIsPaused(false)
  }, [])

  const stop = useCallback(() => {
    isPlayingRef.current = false
    synthRef.current.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    sentenceIndexRef.current = 0
    setCurrentSentenceIndex(0)
  }, [])

  const skipForward = useCallback((text, count = 3) => {
    if (!isPlayingRef.current) return
    const sentenceList = splitIntoSentences(text)
    const next = Math.min(sentenceIndexRef.current + count, sentenceList.length - 1)
    sentenceIndexRef.current = next
    setCurrentSentenceIndex(next)
    synthRef.current.cancel()
    isPlayingRef.current = true
    setSentences(sentenceList)
    speakSentence(next, sentenceList)
  }, [speakSentence])

  const skipBackward = useCallback((text, count = 3) => {
    if (!isPlayingRef.current) return
    const sentenceList = splitIntoSentences(text)
    const prev = Math.max(sentenceIndexRef.current - count, 0)
    sentenceIndexRef.current = prev
    setCurrentSentenceIndex(prev)
    synthRef.current.cancel()
    isPlayingRef.current = true
    setSentences(sentenceList)
    speakSentence(prev, sentenceList)
  }, [speakSentence])

  const jumpToSentence = useCallback((text, index) => {
    const sentenceList = splitIntoSentences(text)
    sentenceIndexRef.current = index
    setCurrentSentenceIndex(index)
    setSentences(sentenceList)
    if (isPlayingRef.current) {
      synthRef.current.cancel()
      isPlayingRef.current = true
      speakSentence(index, sentenceList)
    }
  }, [speakSentence])

  // Allow external listener for sentence changes (used for auto page turn)
  const onSentenceChange = useCallback((callback) => {
    onSentenceChangeRef.current = callback
  }, [])

  useEffect(() => {
    return () => {
      synthRef.current.cancel()
    }
  }, [])

  return {
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    isPlaying,
    isPaused,
    currentSentenceIndex,
    sentences,
    play,
    pause,
    resume,
    stop,
    skipForward,
    skipBackward,
    jumpToSentence,
    splitIntoSentences,
    autoSelectVoice,
    onSentenceChange,
  }
}
