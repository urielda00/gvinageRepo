import { useEffect, useState } from 'react'
import ErrorNotice from './ErrorNotice'
import ItemsListDisplay from './ItemsListDisplay'
import {
  confidenceNumber,
  fallback,
  formatConfidence,
  formatValue,
  normalizeMissingFields,
} from '../utils/formatters'

const editableFields = [
  ['customer_name', 'שם לקוח'],
  ['customer_phone', 'טלפון'],
  ['customer_email', 'מייל'],
  ['shipping_address', 'כתובת למשלוח'],
  ['action_type', 'סוג פעולה'],
]

const statusOptions = [
  ['new', 'חדש'],
  ['review', 'דורש בדיקה'],
  ['handled', 'טופל'],
  ['error', 'שגיאה'],
]

const missingFieldLabels = {
  customerName: 'Customer name',
  customerPhone: 'Customer phone',
  deliveryAddress: 'Delivery address',
  customerEmail: 'Customer email',
  items: 'Items',
}

function getConfidenceLevel(value) {
  if (value === null) {
    return { label: 'Unknown', className: 'unknown', width: 0 }
  }

  const bounded = Math.max(0, Math.min(100, Math.round(value)))

  if (bounded < 60) {
    return { label: 'Low', className: 'low', width: bounded }
  }

  if (bounded < 85) {
    return { label: 'Medium', className: 'medium', width: bounded }
  }

  return { label: 'High', className: 'high', width: bounded }
}

export default function OrderDetailsModal({ order, onClose, onUpdate, onDelete }) {
  const [form, setForm] = useState(() => ({
    customer_name: order.customer_name || '',
    customer_phone: order.customer_phone || '',
    customer_email: order.customer_email || '',
    shipping_address: order.shipping_address || '',
    action_type: order.action_type || '',
    status: order.status || 'new',
    notes: order.notes || '',
  }))

  const [technicalOpen, setTechnicalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const missingFields = normalizeMissingFields(order.missing_fields)
  const confidence = confidenceNumber(order.confidence)
  const confidenceLevel = getConfidenceLevel(confidence)

  useEffect(() => {
    const close = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', close)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', close)
      document.body.style.overflow = ''
    }
  }, [onClose])

  async function save() {
    setSaving(true)
    setError('')

    try {
      await onUpdate(order, form)
    } catch {
      setError('לא ניתן לשמור את השינויים כרגע. נסו שוב.')
    } finally {
      setSaving(false)
    }
  }

  async function saveStatus(status) {
    setSaving(true)
    setError('')

    const nextForm = {
      ...form,
      status,
    }

    setForm(nextForm)

    try {
      await onUpdate(order, { status })
    } catch {
      setError('לא ניתן לעדכן את הסטטוס כרגע. נסו שוב.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="modal" role="dialog" aria-modal="true">
        <header className="modal__header">
          <div>
            <p className="eyebrow">פרטי הזמנה</p>
            <h2>{fallback(order.customer_name)}</h2>
          </div>

          <button className="icon-button" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="form-grid">
          {editableFields.map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                dir={key.includes('phone') || key.includes('email') ? 'ltr' : 'rtl'}
                value={form[key]}
                onChange={(event) =>
                  setForm({
                    ...form,
                    [key]: event.target.value,
                  })
                }
              />
            </label>
          ))}

          <label>
            סטטוס נוכחי
            <select
              value={form.status}
              onChange={(event) =>
                setForm({
                  ...form,
                  status: event.target.value,
                })
              }
            >
              {statusOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="full-field">
            הערות
            <textarea
              rows="4"
              value={form.notes}
              onChange={(event) =>
                setForm({
                  ...form,
                  notes: event.target.value,
                })
              }
            />
          </label>
        </div>

        <div className="order-insights">
          <div className="confidence-summary">
            <div>
              <span>AI confidence</span>
              <strong>{formatConfidence(order.confidence)}</strong>
            </div>

            <span className={`confidence-level confidence-level--${confidenceLevel.className}`}>
              {confidenceLevel.label}
            </span>

            <div className="confidence-meter" aria-hidden="true">
              <span style={{ width: `${confidenceLevel.width}%` }} />
            </div>
          </div>

          <div className="missing-fields-summary">
            <h3>Missing order details</h3>

            {missingFields.length ? (
              <div className="missing-fields-list">
                {missingFields.map((field) => (
                  <span className="missing-field-chip" key={field}>
                    {missingFieldLabels[field] || field}
                  </span>
                ))}
              </div>
            ) : (
              <p>No missing details</p>
            )}
          </div>
        </div>

        <div className="detail-block">
          <h3>שינוי סטטוס הזמנה</h3>

          <div className="modal-actions">
            <button
              className="button button--secondary"
              disabled={saving}
              onClick={() => saveStatus('new')}
            >
              חדש
            </button>

            <button
              className="button button--warning"
              disabled={saving}
              onClick={() => saveStatus('review')}
            >
              דורש בדיקה
            </button>

            <button
              className="button button--primary"
              disabled={saving}
              onClick={() => saveStatus('handled')}
            >
              סמן כטופל
            </button>

            <button
              className="button button--delete"
              disabled={saving}
              onClick={() => saveStatus('error')}
            >
              שגיאה
            </button>
          </div>
        </div>

        <ItemsListDisplay
          itemsList={order.items_list}
          onSave={(items) => onUpdate(order, { items_list: items })}
        />

        {error && <ErrorNotice>{error}</ErrorNotice>}

        <div className="modal-actions">
          <button className="button button--primary" disabled={saving} onClick={save}>
            {saving ? 'שומר…' : 'שמירת כל השינויים'}
          </button>

          <button
            className="button button--delete"
            disabled={saving}
            onClick={() => onDelete(order)}
          >
            מחיקת הזמנה
          </button>
        </div>

        <button
          className="text-button technical-toggle"
          onClick={() => setTechnicalOpen(!technicalOpen)}
        >
          {technicalOpen ? 'הסתר מידע טכני' : 'הצג מידע טכני'}
        </button>

        {technicalOpen && (
          <div className="technical-section">
            <div>
              <span>email_id</span>
              <code>{fallback(order.email_id)}</code>
            </div>

            <div>
              <span>items_list</span>
              <pre>{formatValue(order.items_list ?? [])}</pre>
            </div>

            <div>
              <span>raw_json</span>
              <pre>{formatValue(order.raw_json)}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
