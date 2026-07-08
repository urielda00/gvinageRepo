const labels = { ok: 'תקין', review: 'דורש בדיקה', error: 'שגיאה', handled: 'טופל', new: 'חדש' }

export default function StatusBadge({ order }) {
  const resolved = String(order?.status || '').toLowerCase()
  const text = labels[resolved] || order?.status || resolved
  return <span className={`badge badge--${labels[resolved] ? resolved : 'neutral'}`}>{text}</span>
}
