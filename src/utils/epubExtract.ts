import JSZip from 'jszip'

export interface EpubExtractResult {
  text: string
  sectionCount: number
}

export type EpubProgressCallback = (current: number, total: number) => void

const textFromXhtml = (markup: string): string => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(markup, 'text/html')
  const text = doc.body?.textContent ?? ''
  return text.replace(/\s+/g, ' ').trim()
}

const getRootfilePath = (containerXml: string) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(containerXml, 'application/xml')
  const rootfile = doc.querySelector('rootfile')
  return rootfile?.getAttribute('full-path')
}

const parseOpf = (opfXml: string) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(opfXml, 'application/xml')
  const manifest: Record<string, string> = {}
  doc.querySelectorAll('manifest > item').forEach((item) => {
    const id = item.getAttribute('id')
    const href = item.getAttribute('href')
    if (id && href) manifest[id] = href
  })
  const spineIds = Array.from(doc.querySelectorAll('spine > itemref'))
    .map((item) => item.getAttribute('idref'))
    .filter(Boolean) as string[]
  return { manifest, spineIds }
}

const resolvePath = (basePath: string, href: string) =>
  basePath ? `${basePath.replace(/\/$/, '')}/${href}` : href

export const extractTextFromEpub = async (
  file: File,
  onProgress?: EpubProgressCallback,
): Promise<EpubExtractResult> => {
  const buffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(buffer)

  const containerFile = zip.file('META-INF/container.xml')
  if (!containerFile) throw new Error('Invalid EPUB: missing container.xml')
  const containerXml = await containerFile.async('text')
  const rootfilePath = getRootfilePath(containerXml)
  if (!rootfilePath) throw new Error('Invalid EPUB: missing rootfile')

  const opfFile = zip.file(rootfilePath)
  if (!opfFile) throw new Error('Invalid EPUB: missing OPF package')
  const opfXml = await opfFile.async('text')
  const { manifest, spineIds } = parseOpf(opfXml)
  if (!spineIds.length) throw new Error('Invalid EPUB: missing spine')

  const basePathParts = rootfilePath.split('/')
  basePathParts.pop()
  const basePath = basePathParts.join('/')

  const sections: string[] = []
  const total = spineIds.length
  let processed = 0

  for (const idref of spineIds) {
    const href = manifest[idref]
    if (!href) continue
    const targetPath = resolvePath(basePath, href)
    const entry = zip.file(targetPath)
    if (!entry) continue
    const content = await entry.async('text')
    const text = textFromXhtml(content)
    if (text) sections.push(text)
    processed += 1
    onProgress?.(processed, total)
  }

  return {
    text: sections.join('\n\n'),
    sectionCount: sections.length,
  }
}
