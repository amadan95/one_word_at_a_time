import { useState, type DragEvent } from 'react'
import type { FileStatus } from '../types'

interface DocumentLoaderProps {
  title: string
  rawText: string
  fileStatus: FileStatus
  onTitleChange: (value: string) => void
  onTextChange: (value: string) => void
  onSave: () => void
  onFileSelected: (file: File) => void
}

const DocumentLoader = ({
  title,
  rawText,
  fileStatus,
  onTitleChange,
  onTextChange,
  onSave,
  onFileSelected,
}: DocumentLoaderProps) => {
  const [isDragActive, setIsDragActive] = useState(false)
  const canSave = rawText.trim().length > 0

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    onFileSelected(file)
  }

  const handleDrop = (event: DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault()
    setIsDragActive(false)
    handleFiles(event.dataTransfer.files)
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Document</p>
          <h3 className="text-lg font-semibold text-white">Paste your text or upload a PDF/EPUB</h3>
        </div>
        <button
          onClick={onSave}
          disabled={!canSave}
          className={`rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5 ${
            canSave
              ? 'bg-white/90 text-ink hover:bg-white'
              : 'cursor-not-allowed bg-white/40 text-slate-700'
          }`}
        >
          Save to Library
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <label className="block text-sm font-semibold text-slate-200" htmlFor="document-title">
          Document title
        </label>
        <input
          id="document-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-accent"
          placeholder="e.g. Learning sprint notes"
        />
      </div>

      <div className="mt-4">
        <textarea
          value={rawText}
          onChange={(e) => onTextChange(e.target.value)}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragActive(true)
          }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={handleDrop}
          placeholder="Paste your text or drop a PDF/EPUB file here"
          className={`h-40 w-full rounded-2xl border px-4 py-3 text-white outline-none transition focus:border-accent ${
            isDragActive ? 'border-accent/70 bg-white/10' : 'border-white/10 bg-white/5'
          }`}
          aria-label="Paste your text or upload a PDF or EPUB"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <label
            htmlFor="pdf-upload"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-semibold text-white transition hover:border-white/60 hover:bg-white/20"
          >
            Upload PDF/EPUB
          </label>
          <span className="text-slate-400">or drop a PDF/EPUB to load</span>
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf,application/pdf,.epub,application/epub+zip"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
        {fileStatus.state === 'idle' && <span>No PDF/EPUB loaded</span>}
        {fileStatus.state === 'loading' && (
          <span className="text-amber-200">{fileStatus.progressLabel ?? 'Extracting text…'}</span>
        )}
        {fileStatus.state === 'ready' && (
          <div className="flex flex-wrap items-center gap-2 text-emerald-200">
            <span>Loaded</span>
            {fileStatus.fileName && <span className="font-semibold text-white">{fileStatus.fileName}</span>}
            {fileStatus.pageCount !== undefined && <span>· {fileStatus.pageCount} pages</span>}
            {fileStatus.sectionCount !== undefined && (
              <span>· {fileStatus.sectionCount} sections</span>
            )}
            {fileStatus.sourceType && <span className="text-slate-300">· {fileStatus.sourceType.toUpperCase()}</span>}
          </div>
        )}
        {fileStatus.state === 'error' && <span className="text-rose-200">{fileStatus.message}</span>}
        {fileStatus.state === 'loading' && fileStatus.message && (
          <div className="text-slate-300">{fileStatus.message}</div>
        )}
      </div>
    </div>
  )
}

export default DocumentLoader
