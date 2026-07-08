import EmptyState from './EmptyState'
import StatusBadge from './StatusBadge'
import { fallback, formatConfidence, formatDate } from '../utils/formatters'

export default function OrdersTable({ orders, onSelect, onStatus }) {
  if (!orders.length) {
    return <EmptyState>לא נמצאו הזמנות התואמות לחיפוש.</EmptyState>
  }

  return (
    <div className="table-wrap">
      <table className="orders-table">
        <thead>
          <tr>
            <th>סטטוס</th>
            <th>לקוח</th>
            <th>טלפון</th>
            <th>מייל</th>
            <th>סוג פעולה</th>
            <th>ביטחון AI</th>
            <th>תאריך</th>
            <th>הערות</th>
            <th>פעולות</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order, index) => (
            <tr key={order.id ?? order.email_id ?? index} onClick={() => onSelect(order)}>
              <td>
                <StatusBadge order={order} />
              </td>
              <td className="cell-strong">{fallback(order.customer_name)}</td>
              <td dir="ltr">{fallback(order.customer_phone)}</td>
              <td dir="ltr" className="email-cell">
                {fallback(order.customer_email)}
              </td>
              <td>{fallback(order.action_type)}</td>
              <td>{formatConfidence(order.confidence)}</td>
              <td>{formatDate(order.created_at)}</td>
              <td>
                <span className="notes-preview" title={order.notes || ''}>
                  {fallback(order.notes)}
                </span>
              </td>
              <td>
                <div className="row-actions" onClick={(event) => event.stopPropagation()}>
                  <button onClick={() => onSelect(order)}>פרטים</button>
                  <button onClick={() => onStatus(order, 'handled')}>סמן כטופל</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
