import { confidenceNumber, getOrderState } from '../utils/formatters'

function isLastSevenDays(value) {
  if (!value) {
    return false
  }

  const time = new Date(value).getTime()

  if (Number.isNaN(time)) {
    return false
  }

  return Date.now() - time <= 7 * 24 * 60 * 60 * 1000
}

function isNewRawStatus(order) {
  return String(order?.status || '').toLowerCase() === 'new'
}

export default function StatsCards({ orders, logs }) {
  const newOrders = orders.filter((order) => isNewRawStatus(order))

  const newOrdersForReview = orders.filter(
    (order) => isNewRawStatus(order) && getOrderState(order) === 'review'
  )

  const lastWeekErrors = logs.filter(
    (log) =>
      String(log.status).toLowerCase() === 'error' && isLastSevenDays(log.created_at)
  )

  const values = orders
    .map((order) => confidenceNumber(order.confidence))
    .filter((value) => value !== null)

  const average = values.length
    ? `${Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)}%`
    : '-'

  const cards = [
    ['📦', 'הזמנות חדשות', newOrders.length, 'סטטוס חדש בלבד'],
    ['⚠️', 'דורשות בדיקה', newOrdersForReview.length, 'רק הזמנות חדשות'],
    ['❌', 'שגיאות אוטומציה', lastWeekErrors.length, 'ב-7 הימים האחרונים'],
    ['🤖', 'ביטחון AI ממוצע', average, 'לפי נתונים זמינים'],
  ]

  return (
    <section className="stats-grid" aria-label="סיכום נתונים">
      {cards.map(([icon, label, value, hint]) => (
        <article className="stat-card" key={label}>
          <div className="stat-card__label">
            <b>{icon}</b>
            <span>{label}</span>
          </div>

          <strong>{value}</strong>
          <small>{hint}</small>
        </article>
      ))}
    </section>
  )
}