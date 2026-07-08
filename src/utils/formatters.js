export const fallback = (value) =>
  value === null || value === undefined || value === '' ? '-' : String(value)

export function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('he-IL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function formatConfidence(value) {
  if (value === null || value === undefined || value === '') return '-'
  const number = Number(value)
  if (Number.isNaN(number)) return '-'
  const normalized = number <= 1 ? number * 100 : number
  return `${Math.round(normalized)}%`
}

export function confidenceNumber(value) {
  const number = Number(value)
  if (value === null || value === undefined || value === '' || Number.isNaN(number)) return null
  return number <= 1 ? number * 100 : number
}

export function hasMissingFields(value) {
  if (!value) return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return String(value).trim().length > 0 && String(value).trim() !== '[]'
}

export function getOrderState(order = {}) {
  const status = String(order.status || '').toLowerCase()
  if (status === 'error' || order.error_message) return 'error'
  if (['handled', 'completed', 'done'].includes(status)) return 'handled'
  const confidence = confidenceNumber(order.confidence)
  if (
    order.needs_review === true ||
    status === 'review' ||
    (confidence !== null && confidence < 80) ||
    hasMissingFields(order.missing_fields)
  ) return 'review'
  if (['ok', 'success', 'valid'].includes(status)) return 'ok'
  return 'new'
}

export function formatValue(value) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

export function normalizeItemsList(itemsList) {
  if (Array.isArray(itemsList)) return itemsList

  if (typeof itemsList === 'string') {
    try {
      const parsed = JSON.parse(itemsList)
      if (Array.isArray(parsed)) return parsed
      if (parsed && typeof parsed === 'object') return [parsed]
    } catch {
      try {
        const parsed = JSON.parse(`[${itemsList}]`)
        if (Array.isArray(parsed)) return parsed
      } catch {
        return []
      }
    }
  }

  if (itemsList && typeof itemsList === 'object') return [itemsList]

  return []
}
