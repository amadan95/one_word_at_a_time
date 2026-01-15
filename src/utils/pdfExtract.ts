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

const extractTextFromPage = async (
  pdf: PDFDocumentProxy,
  pageNumber: number,
): Promise<string> => {
  const page = await pdf.getPage(pageNumber)
  const content = await page.getTextContent()
  return content.items
    .map((item) => (isTextItem(item) ? item.str : ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
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
