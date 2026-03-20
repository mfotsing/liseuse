// Simple heuristic language detection (French vs English)
// Checks for frequency of common function words

const FR_WORDS = new Set([
  'le', 'la', 'les', 'de', 'des', 'du', 'un', 'une', 'et', 'est',
  'en', 'que', 'qui', 'dans', 'pour', 'pas', 'sur', 'ce', 'il',
  'elle', 'nous', 'vous', 'sont', 'avec', 'mais', 'ou', 'je', 'tu',
  'au', 'aux', 'cette', 'ces', 'mon', 'ton', 'son', 'notre', 'leur',
  'ne', 'se', 'sa', 'ses', 'ont', 'été', 'être', 'avoir', 'fait',
  'comme', 'plus', 'aussi', 'tout', 'très', 'bien', 'alors', 'même',
])

const EN_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'of', 'to',
  'in', 'for', 'on', 'with', 'at', 'by', 'from', 'this', 'that',
  'it', 'not', 'but', 'or', 'and', 'if', 'they', 'we', 'he', 'she',
  'their', 'there', 'which', 'what', 'when', 'where', 'how', 'than',
])

export function detectLanguage(text) {
  // Take a sample (first ~500 words)
  const words = text.toLowerCase()
    .replace(/[^a-zàâäéèêëïîôùûüÿçœæ\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0)
    .slice(0, 500)

  let frScore = 0
  let enScore = 0

  for (const word of words) {
    if (FR_WORDS.has(word)) frScore++
    if (EN_WORDS.has(word)) enScore++
  }

  if (frScore > enScore) return 'fr'
  if (enScore > frScore) return 'en'
  return 'fr' // default to French
}
