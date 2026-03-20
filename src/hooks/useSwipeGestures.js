import { useRef, useCallback } from 'react'

const SWIPE_THRESHOLD = 50
const SWIPE_MAX_TIME = 500

export function useSwipeGestures({ onSwipeLeft, onSwipeRight, onSwipeUp }) {
  const touchStart = useRef(null)

  const onTouchStart = useCallback((e) => {
    const touch = e.touches[0]
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }
  }, [])

  const onTouchEnd = useCallback((e) => {
    if (!touchStart.current) return

    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStart.current.x
    const dy = touch.clientY - touchStart.current.y
    const dt = Date.now() - touchStart.current.time

    if (dt > SWIPE_MAX_TIME) return

    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    // Horizontal swipe
    if (absDx > SWIPE_THRESHOLD && absDx > absDy) {
      if (dx < 0) onSwipeLeft?.()
      else onSwipeRight?.()
    }
    // Vertical swipe up
    else if (absDy > SWIPE_THRESHOLD && dy < 0 && absDy > absDx) {
      onSwipeUp?.()
    }

    touchStart.current = null
  }, [onSwipeLeft, onSwipeRight, onSwipeUp])

  return { onTouchStart, onTouchEnd }
}
