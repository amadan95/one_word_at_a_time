import { useCallback, useEffect, useState } from 'react'
import type { LibraryDoc } from '../types'

const STORAGE_KEY = 'one-word-library'
const LEGACY_KEY = 'focus-reader-library'

const parseDocs = (value: string | null): LibraryDoc[] => {
  if (!value) return []
  try {
    const parsed = JSON.parse(value) as LibraryDoc[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to read library', error)
    return []
  }
}

const readFromStorage = (): LibraryDoc[] => {
  const primary = parseDocs(localStorage.getItem(STORAGE_KEY))
  if (primary.length > 0) return primary
  return parseDocs(localStorage.getItem(LEGACY_KEY))
}

export const useLocalStorageLibrary = () => {
  const [library, setLibrary] = useState<LibraryDoc[]>(() => readFromStorage())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library))
  }, [library])

  const saveDoc = useCallback((doc: LibraryDoc) => {
    setLibrary((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === doc.id)
      if (existingIndex !== -1) {
        const existing = prev[existingIndex]
        const updated: LibraryDoc = { ...doc, createdAt: existing.createdAt }
        const next = [...prev]
        next[existingIndex] = updated
        return next
      }
      return [doc, ...prev]
    })
  }, [])

  const updatePosition = useCallback((id: string, lastPosition: number) => {
    setLibrary((prev) =>
      prev.map((item) => (item.id === id ? { ...item, lastPosition } : item)),
    )
  }, [])

  const clearLibrary = useCallback(() => setLibrary([]), [])

  return { library, saveDoc, updatePosition, clearLibrary }
}
