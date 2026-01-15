export const getOrpIndex = (word: string): number => {
  const len = word.length
  if (len === 0) return 0
  if (len === 1) return 0
  if (len === 2) return 1
  const index = Math.round(len * 0.35)
  return Math.min(Math.max(index, 1), len - 2)
}

export const splitWordForOrp = (word: string) => {
  const index = getOrpIndex(word)
  return {
    prefix: word.slice(0, index),
    focusChar: word.charAt(index),
    suffix: word.slice(index + 1),
    index,
  }
}
