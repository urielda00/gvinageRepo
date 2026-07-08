export default function LoadingState({ label = 'טוען נתונים…' }) {
  return <div className="state-message"><span className="spinner" />{label}</div>
}
