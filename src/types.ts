export type DocSource = 'paste' | 'pdf' | 'epub'

export interface LibraryDoc {
  id: string
  title: string
  sourceType: DocSource
  rawText: string
  createdAt: number
  wordCount: number
  lastPosition?: number
  fileName?: string
}

export interface FileStatus {
  state: 'idle' | 'loading' | 'ready' | 'error'
  message: string
  fileName?: string
  pageCount?: number
  sectionCount?: number
  progressLabel?: string
  sourceType?: DocSource
}
