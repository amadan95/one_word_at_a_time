const stripPunctuation = (word: string) => word.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '')

export const tokenize = (text: string): string[] => {
  if (!text) return []
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((token) => {
      const cleaned = stripPunctuation(token)
      return cleaned || token.trim()
    })
    .filter((token) => token.length > 0)
}
