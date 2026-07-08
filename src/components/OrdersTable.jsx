import EmptyState from './EmptyState'
import StatusBadge from './StatusBadge'
import { fallback, formatDate } from '../utils/formatters'

export default function OrdersTable({ orders, onSelect, onStatus }) {
  if (!orders.length) {
    return <EmptyState>לא נמצאו הזמנות התואמות לחיפוש.</EmptyState>
  }

  const tableWrapClassName = orders.length > 7 ? 'table-wrap table-wrap--scroll' : 'table-wrap'

  return (
    <div className={tableWrapClassName}>
      <table className="orders-table">
        <thead>
          <tr>
            <th>סטטוס</th>
            <th>מייל</th>
            <th>תאריך</th>
            <th>פעולות</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order, index) => (
            <tr key={order.id ?? order.email_id ?? index} onClick={() => onSelect(order)}>
              <td data-label="סטטוס">
                <StatusBadge order={order} />
              </td>
              <td data-label="מייל" dir="ltr" className="email-cell">
                {fallback(order.customer_email)}
              </td>
              <td data-label="תאריך">{formatDate(order.created_at)}</td>
              <td data-label="פעולות">
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
