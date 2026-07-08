import { useMemo, useState } from 'react'
import EmptyState from './EmptyState'
import ConfirmDialog from './ConfirmDialog'
import { fallback, formatDate, formatValue } from '../utils/formatters'

const issueStatuses = ['error', 'blocked']

const friendlySteps = {
  supabase_insert_order: 'שמירת ההזמנה למסד הנתונים',
  openai_parse_order: 'פענוח ההזמנה עם AI',
  json_parse_or_create: 'עיבוד מבנה הנתונים',
  gmail_update_label: "עדכון תווית בג'ימייל",
  call_order_json_handler_webhook: 'שליחה לאוטומציית עיבוד ההזמנה',
  webhook_secret_validation: 'Webhook security validation',
}

const statusLabels = {
  error: 'שגיאה',
  blocked: 'נחסם מטעמי אבטחה',
  handled: 'טופל',
}

function getLogStatus(log) {
  return String(log?.status || '').toLowerCase()
}

function isOpenIssue(log) {
  return issueStatuses.includes(getLogStatus(log))
}

export default function ErrorsPanel({ logs, onMarkSeen, onDelete }) {
  const errors = useMemo(
    () => logs.filter((log) => [...issueStatuses, 'handled'].includes(getLogStatus(log))),
    [logs]
  )

  const unresolvedCount = errors.filter(isOpenIssue).length
  const [query, setQuery] = useState('')
  const [scenario, setScenario] = useState('all')
  const [step, setStep] = useState('all')
  const [statusFilter, setStatusFilter] = useState('open')
  const [selected, setSelected] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const [action, setAction] = useState('')
  const [actionError, setActionError] = useState('')

  const scenarios = [...new Set(errors.map((log) => log.scenario_name).filter(Boolean))]
  const steps = [...new Set(errors.map((log) => log.step_name).filter(Boolean))]

  const shown = errors.filter((log) => {
    const status = getLogStatus(log)
    const searchText = [
      log.email_id,
      log.error_message,
      log.source,
      log.scenario_name,
      log.step_name,
      friendlySteps[log.step_name],
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const statusMatch =
      statusFilter === 'all' ||
      (statusFilter === 'open' ? issueStatuses.includes(status) : status === 'handled')

    return (
      statusMatch &&
      (scenario === 'all' || log.scenario_name === scenario) &&
      (step === 'all' || log.step_name === step) &&
      (!query || searchText.includes(query.toLowerCase()))
    )
  })

  async function confirmAction() {
    if (!confirmation) {
      return
    }

    const { type, log } = confirmation
    setAction(`${type}:${log.id}`)
    setActionError('')

    try {
      if (type === 'seen') {
        await onMarkSeen(log)
      } else {
        await onDelete(log)

        if (selected?.id === log.id) {
          setSelected(null)
        }
      }

      setConfirmation(null)
    } catch {
      setActionError(
        type === 'seen'
          ? 'לא ניתן לסמן את השגיאה כרגע. נסו שוב.'
          : 'לא ניתן למחוק את השגיאה כרגע. נסו שוב.'
      )
    } finally {
      setAction('')
    }
  }

  return (
    <section className="panel errors-panel">
      <div className="view-heading">
        <div>
          <h2>שגיאות אוטומציה</h2>
          <p>תקלות ואירועי אבטחה שדורשים תשומת לב</p>
        </div>
        <span className="count-pill">{unresolvedCount}</span>
      </div>

      <div className="filters errors-filters">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="חיפוש לפי מזהה מייל, הודעת שגיאה או שלב..."
        />

        <select value={scenario} onChange={(event) => setScenario(event.target.value)}>
          <option value="all">כל התרחישים</option>
          {scenarios.map((name) => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </select>

        <select value={step} onChange={(event) => setStep(event.target.value)}>
          <option value="all">כל השלבים</option>
          {steps.map((name) => (
            <option value={name} key={name}>
              {friendlySteps[name] || name}
            </option>
          ))}
        </select>

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="open">לא טופלו</option>
          <option value="handled">טופלו</option>
          <option value="all">הכל</option>
        </select>
      </div>

      {!shown.length ? (
        <EmptyState>אין שגיאות התואמות לסינון.</EmptyState>
      ) : (
        <div className="error-list">
          {shown.map((log, index) => {
            const status = getLogStatus(log)
            const handled = status === 'handled'
            const busy = action.endsWith(`:${log.id}`)

            return (
              <article
                className={`error-item${handled ? ' error-item--handled' : ''}`}
                key={log.id ?? index}
              >
                <div className="error-item__top">
                  <div>
                    <strong>{fallback(log.scenario_name)}</strong>
                    <span>{friendlySteps[log.step_name] || fallback(log.step_name)}</span>
                    {statusLabels[status] && (
                      <span className={`badge badge--${status}`}>{statusLabels[status]}</span>
                    )}
                  </div>
                  <time>{formatDate(log.created_at)}</time>
                </div>

                <p>{fallback(log.error_message)}</p>
                {log.email_id && <small dir="ltr">Email ID: {log.email_id}</small>}

                <div className="error-actions">
                  <button
                    className="button button--secondary technical-button"
                    disabled={busy}
                    onClick={() => setSelected(log)}
                  >
                    פרטים טכניים
                  </button>

                  {!handled && (
                    <button
                      className="button button--secondary technical-button"
                      disabled={busy}
                      onClick={() => {
                        setActionError('')
                        setConfirmation({ type: 'seen', log })
                      }}
                    >
                      סמן כנראה
                    </button>
                  )}

                  <button
                    className="button button--delete technical-button"
                    disabled={busy}
                    onClick={() => {
                      setActionError('')
                      setConfirmation({ type: 'delete', log })
                    }}
                  >
                    מחק
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {selected && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}
        >
          <section className="modal technical-modal">
            <header className="modal__header">
              <div>
                <p className="eyebrow">פרטים טכניים</p>
                <h2>{friendlySteps[selected.step_name] || selected.step_name}</h2>
              </div>
              <button className="icon-button" onClick={() => setSelected(null)}>
                ×
              </button>
            </header>

            <h3>מטען גולמי</h3>
            <pre>{formatValue(selected.raw_payload)}</pre>
            <h3>רשומת לוג מלאה</h3>
            <pre>{formatValue(selected)}</pre>
          </section>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmation)}
        title={confirmation?.type === 'seen' ? 'סימון שגיאה כנראתה' : 'מחיקת שגיאת אוטומציה'}
        message={
          confirmation?.type === 'seen'
            ? 'האם לסמן את השגיאה הזו כנראתה? היא לא תופיע יותר בספירת השגיאות הפתוחות.'
            : 'האם למחוק את השגיאה הזו לצמיתות?'
        }
        confirmText={confirmation?.type === 'seen' ? 'סמן כנראה' : 'מחק'}
        danger={confirmation?.type === 'delete'}
        loading={Boolean(action)}
        loadingText={confirmation?.type === 'delete' ? 'מוחק...' : 'שומר...'}
        error={actionError}
        onConfirm={confirmAction}
        onCancel={() => {
          setConfirmation(null)
          setActionError('')
        }}
      />
    </section>
  )
}
