import { useEffect, useId } from 'react'

export default function ConfirmDialog({ open, title, message, confirmText, cancelText = 'ביטול', danger = false, loading = false, loadingText = 'שומר...', error = '', onConfirm, onCancel }) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return undefined
    const close = (event) => {
      if (event.key !== 'Escape') return
      event.stopImmediatePropagation()
      if (!loading) onCancel()
    }
    document.addEventListener('keydown', close, true)
    return () => document.removeEventListener('keydown', close, true)
  }, [open, loading, onCancel])

  if (!open) return null

  return <div className="modal-backdrop confirm-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !loading && onCancel()}>
    <section className="modal confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      <p>{message}</p>
      {error && <div className="error-notice" role="alert">{error}</div>}
      <div className="modal-actions confirm-dialog__actions">
        <button className={`button ${danger ? 'button--danger' : 'button--primary'}`} disabled={loading} onClick={onConfirm}>{loading ? loadingText : confirmText}</button>
        <button className="button button--secondary" disabled={loading} onClick={onCancel}>{cancelText}</button>
      </div>
    </section>
  </div>
}
