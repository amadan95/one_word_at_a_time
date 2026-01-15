import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import type {
  PDFDocumentProxy,
  TextItem,
  TextMarkedContent,
} from 'pdfjs-dist/types/src/display/api'
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url'

GlobalWorkerOptions.workerSrc = workerSrc

export interface PdfExtractResult {
  text: string
  pageCount: number
}

export type PdfProgressCallback = (current: number, total: number) => void

const isTextItem = (item: TextItem | TextMarkedContent): item is TextItem =>
  'str' in item

const buildLineText = (items: TextItem[]) => {
  const sorted = [...items].sort((a, b) => a.transform[4] - b.transform[4])
  let line = ''
  let prevX: number | null = null
  let prevWidth = 0
  let prevLen = 0

  for (const item of sorted) {
    const raw = item.str
    const text = raw.replace(/\s+/g, ' ')
    if (!text) continue

    const x = item.transform[4]
    const width = item.width ?? 0

    if (prevX !== null) {
      const gap = x - (prevX + prevWidth)
      const avgCharWidth = prevLen ? prevWidth / prevLen : 3
      const gapThreshold = Math.max(1.5, avgCharWidth * 0.6)
      if (gap > gapThreshold && !line.endsWith(' ')) {
        line += ' '
      }
    }

    line += text
    prevX = x
    prevWidth = width
    prevLen = text.length
  }

  return line.replace(/\s+/g, ' ').trim()
}

const extractTextFromPage = async (
  pdf: PDFDocumentProxy,
  pageNumber: number,
): Promise<string> => {
  const page = await pdf.getPage(pageNumber)
  const content = await page.getTextContent()
  const textItems = content.items.filter(isTextItem)

  const lines = new Map<number, TextItem[]>()
  for (const item of textItems) {
    const y = item.transform[5]
    const key = Math.round(y / 3)
    if (!lines.has(key)) lines.set(key, [])
    lines.get(key)?.push(item)
  }

  const orderedKeys = Array.from(lines.keys()).sort((a, b) => b - a)
  const outputLines = orderedKeys
    .map((key) => buildLineText(lines.get(key) ?? []))
    .filter((line) => line.length > 0)

  return outputLines.join('\n')
}

export const extractTextFromPdf = async (
  file: File,
  onProgress?: PdfProgressCallback,
): Promise<PdfExtractResult> => {
  const data = await file.arrayBuffer()
  const loadingTask = getDocument({ data })
  let pdf: PDFDocumentProxy | null = null
  try {
    pdf = await loadingTask.promise
    const totalPages = pdf.numPages
    let combined = ''

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      const text = await extractTextFromPage(pdf, pageNumber)
      combined += text
      if (pageNumber < totalPages) {
        combined += '\n\n'
      }
      onProgress?.(pageNumber, totalPages)
    }

    return { text: combined, pageCount: totalPages }
  } finally {
    await loadingTask.destroy()
  }
}

export const isLikelyScannedPdf = (text: string, pageCount: number) =>
  text.trim().length < Math.max(50, pageCount * 15)
