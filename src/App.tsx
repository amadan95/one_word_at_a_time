import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Controls from './components/Controls'
import DocumentLoader from './components/DocumentLoader'
import FocusView from './components/FocusView'
import Header from './components/Header'
import Library from './components/Library'
import StatsBar from './components/StatsBar'
import { useAutoplay } from './hooks/useAutoplay'
import { useFullscreen } from './hooks/useFullscreen'
import { useLocalStorageLibrary } from './hooks/useLocalStorageLibrary'
import type { DocSource, FileStatus, LibraryDoc } from './types'
import { splitWordForOrp } from './utils/orp'
import { extractTextFromEpub } from './utils/epubExtract'
import { extractTextFromPdf, isLikelyScannedPdf } from './utils/pdfExtract'
import { tokenize } from './utils/tokenize'

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const fileNameToTitle = (fileName: string) => {
  const trimmed = fileName.trim()
  if (!trimmed) return 'Untitled document'
  const withoutExt = trimmed.replace(/\.[^.]+$/, '')
  return withoutExt || trimmed
}

const App = () => {
  const [title, setTitle] = useState('Untitled document')
  const [rawText, setRawText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [wpm, setWpm] = useState(320)
  const [isPlaying, setIsPlaying] = useState(false)
  const [sourceType, setSourceType] = useState<DocSource>('paste')
  const [currentDocId, setCurrentDocId] = useState<string | null>(null)
  const [fileStatus, setFileStatus] = useState<FileStatus>({
    state: 'idle',
    message: 'No PDF/EPUB loaded',
  })

  const focusRef = useRef<HTMLDivElement | null>(null)
  const { isFullscreen, toggleFullscreen, exitFullscreen } = useFullscreen(focusRef)
  const { library, saveDoc, updatePosition, clearLibrary } = useLocalStorageLibrary()

  const words = useMemo(() => tokenize(rawText), [rawText])

  useEffect(() => {
    if (!currentDocId) return
    updatePosition(currentDocId, currentIndex)
  }, [currentDocId, currentIndex, updatePosition])

  const currentWord = useMemo(() => (words.length ? words[currentIndex] : null), [words, currentIndex])
  const wordParts = useMemo(
    () => (currentWord ? splitWordForOrp(currentWord) : null),
    [currentWord],
  )

  const handleTick = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1
      if (nextIndex >= words.length) {
        setIsPlaying(false)
        return prev
      }
      return nextIndex
    })
  }, [words.length])

  useAutoplay({
    isPlaying,
    wpm,
    totalWords: words.length,
    onTick: handleTick,
  })

  const start = useCallback(() => {
    if (!words.length) return
    setCurrentIndex((prev) => (prev >= words.length - 1 ? 0 : prev))
    setIsPlaying(true)
  }, [words.length])

  const pause = useCallback(() => setIsPlaying(false), [])

  const togglePlay = useCallback(() => {
    if (!words.length) return
    setCurrentIndex((prev) => (prev >= words.length - 1 ? 0 : prev))
    setIsPlaying((prev) => !prev)
  }, [words.length])

  const stepForward = useCallback(() => {
    setCurrentIndex((prev) => {
      if (!words.length) return 0
      return Math.min(prev + 1, words.length - 1)
    })
  }, [words.length])

  const stepBack = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  const reset = useCallback(() => {
    setIsPlaying(false)
    setCurrentIndex(0)
  }, [])

  const handleWpmChange = (value: number) => setWpm(clamp(Math.round(value), 120, 900))

  const handleTextChange = (text: string) => {
    setSourceType('paste')
    setCurrentDocId(null)
    setCurrentIndex(0)
    setIsPlaying(false)
    setRawText(text)
    setFileStatus({
      state: 'idle',
      message: 'No PDF/EPUB loaded',
    })
  }

  const handlePdfSelected = async (file: File) => {
    setFileStatus({
      state: 'loading',
      message: 'Extracting text…',
      progressLabel: 'Extracting text…',
      fileName: file.name,
      sourceType: 'pdf',
    })
    try {
      const result = await extractTextFromPdf(file, (current, total) => {
        setFileStatus({
          state: 'loading',
          message: `Extracting text… page ${current} of ${total}`,
          progressLabel: `Extracting text… page ${current} of ${total}`,
          fileName: file.name,
          pageCount: total,
          sourceType: 'pdf',
        })
      })

      if (isLikelyScannedPdf(result.text, result.pageCount)) {
      setFileStatus({
        state: 'error',
        message: 'This PDF may be scanned or image-based. Try a different file.',
        fileName: file.name,
        pageCount: result.pageCount,
        sourceType: 'pdf',
      })
        setRawText('')
        setCurrentIndex(0)
        setIsPlaying(false)
        setCurrentDocId(null)
        return
      }

      setSourceType('pdf')
      setCurrentDocId(null)
      setIsPlaying(false)
      setCurrentIndex(0)
      setRawText(result.text)
      setFileStatus({
        state: 'ready',
        message: 'PDF loaded',
        fileName: file.name,
        pageCount: result.pageCount,
        sourceType: 'pdf',
      })
    } catch (error) {
      console.error(error)
      setFileStatus({
        state: 'error',
        message: 'Unable to read PDF. Try a different file.',
        fileName: file.name,
        sourceType: 'pdf',
      })
    }
  }

  const handleEpubSelected = async (file: File) => {
    setFileStatus({
      state: 'loading',
      message: 'Extracting EPUB…',
      progressLabel: 'Extracting EPUB…',
      fileName: file.name,
      sourceType: 'epub',
    })

    try {
      const result = await extractTextFromEpub(file, (current, total) => {
        setFileStatus({
          state: 'loading',
          message: `Extracting EPUB… section ${current} of ${total}`,
          progressLabel: `Extracting EPUB… section ${current} of ${total}`,
          fileName: file.name,
          sectionCount: total,
          sourceType: 'epub',
        })
      })

      const isTooSmall = result.text.trim().length < Math.max(50, result.sectionCount * 10)
      if (isTooSmall) {
        setFileStatus({
          state: 'error',
          message: 'This EPUB seems empty or image-based. Try a different file.',
        fileName: file.name,
        sectionCount: result.sectionCount,
        sourceType: 'epub',
      })
        setRawText('')
        setCurrentIndex(0)
        setIsPlaying(false)
        setCurrentDocId(null)
        return
      }

      setSourceType('epub')
      setCurrentDocId(null)
      setIsPlaying(false)
      setCurrentIndex(0)
      setRawText(result.text)
      setFileStatus({
        state: 'ready',
        message: 'EPUB loaded',
        fileName: file.name,
        sectionCount: result.sectionCount,
        sourceType: 'epub',
      })
    } catch (error) {
      console.error(error)
      setFileStatus({
        state: 'error',
        message: 'Unable to read EPUB. Try a different file.',
        fileName: file.name,
        sourceType: 'epub',
      })
    }
  }

  const handleFileSelected = (file: File) => {
    setTitle(fileNameToTitle(file.name))
    const lower = file.name.toLowerCase()
    const isPdf = file.type === 'application/pdf' || lower.endsWith('.pdf')
    const isEpub = file.type === 'application/epub+zip' || lower.endsWith('.epub')

    if (isPdf) {
      handlePdfSelected(file)
    } else if (isEpub) {
      handleEpubSelected(file)
    } else {
      setFileStatus({
        state: 'error',
        message: 'Unsupported file type. Please upload a PDF or EPUB.',
        fileName: file.name,
      })
    }
  }

  const handleSave = useCallback(() => {
    if (!rawText.trim()) return
    const doc: LibraryDoc = {
      id: currentDocId ?? crypto.randomUUID(),
      title: title.trim() || 'Untitled document',
      sourceType,
      rawText,
      createdAt: Date.now(),
      wordCount: words.length,
      lastPosition: currentIndex,
      fileName: fileStatus.fileName,
    }
    saveDoc(doc)
    setCurrentDocId(doc.id)
  }, [currentDocId, currentIndex, fileStatus.fileName, rawText, saveDoc, sourceType, title, words.length])

  const handleLoadDoc = (doc: LibraryDoc) => {
    const docWords = tokenize(doc.rawText)
    const safeIndex = Math.min(doc.lastPosition ?? 0, Math.max(docWords.length - 1, 0))

    setTitle(doc.title)
    setRawText(doc.rawText)
    setSourceType(doc.sourceType)
    setCurrentDocId(doc.id)
    setCurrentIndex(safeIndex)
    setIsPlaying(false)
    setFileStatus({
      state: doc.sourceType === 'pdf' || doc.sourceType === 'epub' ? 'ready' : 'idle',
      message:
        doc.sourceType === 'pdf' || doc.sourceType === 'epub'
          ? 'Loaded from library'
          : 'No PDF/EPUB loaded',
      fileName: doc.fileName,
      sourceType: doc.sourceType,
    })
  }

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isFormField =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      if (isFormField) return

      if (event.code === 'Space') {
        event.preventDefault()
        togglePlay()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        stepForward()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        stepBack()
      } else if (event.key.toLowerCase() === 'r') {
        event.preventDefault()
        reset()
      } else if (event.key.toLowerCase() === 'f') {
        event.preventDefault()
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [reset, stepBack, stepForward, toggleFullscreen, togglePlay])

  return (
    <div className="min-h-screen pb-16">
      <div className="relative mx-auto max-w-6xl px-4 pt-10">
        <div className="absolute -left-10 top-0 h-48 w-48 rounded-full bg-accent/30 blur-[100px] md:-left-24" />
        <div className="absolute right-10 top-20 h-60 w-60 rounded-full bg-white/10 blur-[120px]" />
        <div className="relative space-y-8">
          <Header />
          <StatsBar totalWords={words.length} currentIndex={currentIndex} />

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-3">
              <FocusView
                containerRef={focusRef}
                currentWord={currentWord}
                wordParts={wordParts}
                isPlaying={isPlaying}
                isFullscreen={isFullscreen}
                wpm={wpm}
                onChangeWpm={handleWpmChange}
                onTogglePlay={togglePlay}
                onExitFullscreen={exitFullscreen}
              />
              <Controls
                wpm={wpm}
                isPlaying={isPlaying}
                onChangeWpm={handleWpmChange}
                onStart={start}
                onPause={pause}
                onReset={reset}
                onFullscreenToggle={toggleFullscreen}
                isFullscreen={isFullscreen}
              />
            </div>

            <div className="space-y-4 lg:col-span-2">
              <DocumentLoader
                title={title}
                rawText={rawText}
                fileStatus={fileStatus}
                onTitleChange={setTitle}
                onTextChange={handleTextChange}
                onSave={handleSave}
                onFileSelected={handleFileSelected}
              />
              <Library library={library} onLoad={handleLoadDoc} onClear={clearLibrary} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
