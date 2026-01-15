import { useCallback, useEffect, useState, type RefObject } from 'react'

export const useFullscreen = (target: RefObject<HTMLElement | null>) => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const request = useCallback(async () => {
    if (!target.current) return
    if (!document.fullscreenElement) {
      await target.current.requestFullscreen()
    } else if (document.fullscreenElement === target.current) {
      await document.exitFullscreen()
    } else {
      await document.exitFullscreen()
      await target.current.requestFullscreen()
    }
  }, [target])

  const exit = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
  }, [])

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  return { isFullscreen, toggleFullscreen: request, exitFullscreen: exit }
}
