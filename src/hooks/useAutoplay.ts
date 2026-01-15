import { useEffect } from 'react'

interface AutoplayOptions {
  isPlaying: boolean
  wpm: number
  totalWords: number
  onTick: () => void
}

export const useAutoplay = ({ isPlaying, wpm, totalWords, onTick }: AutoplayOptions) => {
  useEffect(() => {
    if (!isPlaying || totalWords === 0) return undefined

    const interval = Math.max(40, 60000 / wpm)
    const id = window.setInterval(onTick, interval)

    return () => window.clearInterval(id)
  }, [isPlaying, onTick, totalWords, wpm])
}
