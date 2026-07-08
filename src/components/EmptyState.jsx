export default function EmptyState({ children = 'אין נתונים להצגה.' }) {
  return <div className="empty-state">{children}</div>
}
