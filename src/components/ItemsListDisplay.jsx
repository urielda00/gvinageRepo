import { useEffect, useState } from 'react'
import { normalizeItemsList } from '../utils/formatters'

const displayValue = (value) =>
  value === null || value === undefined || value === '' ? '-' : String(value)

export default function ItemsListDisplay({ itemsList, onSave }) {
  const normalizedItems = normalizeItemsList(itemsList)
  const [editing, setEditing] = useState(false)
  const [draftItems, setDraftItems] = useState(normalizedItems)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { if (!editing) setDraftItems(normalizedItems) }, [itemsList, editing])

  const updateDraft = (index, field, value) => setDraftItems((items) => items.map((item, itemIndex) => itemIndex === index ? {...item, [field]: value} : item))
  const cancelEdit = () => { setDraftItems(normalizedItems); setError(''); setEditing(false) }
  async function saveItems() {
    if (draftItems.some((item) => !String(item?.name ?? '').trim() || !String(item?.quantity ?? '').trim())) {
      setError('יש למלא שם מוצר וכמות בכל שורה.')
      return
    }
    setSaving(true); setError('')
    try { await onSave(draftItems); setEditing(false) }
    catch { setError('לא ניתן לשמור את המוצרים כרגע. נסו שוב.') }
    finally { setSaving(false) }
  }

  if (editing) return <section className="items-section" aria-labelledby="items-section-title">
    <h3 id="items-section-title">פרטי מוצרים</h3>
    <div className="editable-items-list">
      {draftItems.map((item, index) => <div className="editable-item-row" key={index}>
        <label>מוצר<input value={item?.name ?? ''} onChange={(e) => updateDraft(index, 'name', e.target.value)} /></label>
        <label>כמות<input value={item?.quantity ?? ''} onChange={(e) => updateDraft(index, 'quantity', e.target.value)} /></label>
        <label>יחידה<input value={item?.unit ?? ''} onChange={(e) => updateDraft(index, 'unit', e.target.value)} /></label>
        <label>הערות<input value={item?.notes ?? ''} onChange={(e) => updateDraft(index, 'notes', e.target.value)} /></label>
        <button className="button button--delete" disabled={saving} onClick={() => setDraftItems((items) => items.filter((_, itemIndex) => itemIndex !== index))}>מחק</button>
      </div>)}
    </div>
    {error && <div className="error-notice" role="alert">{error}</div>}
    <div className="items-edit-actions">
      <button className="button button--secondary" disabled={saving} onClick={() => setDraftItems((items) => [...items, {name:'', quantity:'', unit:'', notes:null}])}>הוספת מוצר</button>
      <button className="button button--primary" disabled={saving} onClick={saveItems}>{saving ? 'שומר…' : 'שמור'}</button>
      <button className="button button--secondary" disabled={saving} onClick={cancelEdit}>ביטול</button>
    </div>
  </section>

  const hasNotes = normalizedItems.some(
    (item) => item && typeof item === 'object' && item.notes !== null && item.notes !== undefined && item.notes !== '',
  )

  return <section className="items-section" aria-labelledby="items-section-title">
    <div className="items-section-heading"><h3 id="items-section-title">פרטי מוצרים</h3>{onSave && <button className="button button--secondary" onClick={() => { setDraftItems(normalizedItems.map((item) => ({...item}))); setError(''); setEditing(true) }}>עריכת מוצרים</button>}</div>
    {normalizedItems.length === 0 ? (
      <div className="items-warning" role="status">
        לא ניתן להציג את רשימת המוצרים בצורה מסודרת
      </div>
    ) : (
      <div className="items-table-wrap">
        <table className="items-table">
          <thead>
            <tr>
              <th scope="col">מוצר</th>
              <th scope="col">כמות</th>
              <th scope="col">יחידה</th>
              {hasNotes && <th scope="col">הערות</th>}
            </tr>
          </thead>
          <tbody>
            {normalizedItems.map((item, index) => {
              const product = item && typeof item === 'object' ? item : {}
              return <tr key={index}>
                <td data-label="מוצר">{displayValue(product.name)}</td>
                <td data-label="כמות">{displayValue(product.quantity)}</td>
                <td data-label="יחידה">{displayValue(product.unit)}</td>
                {hasNotes && <td data-label="הערות">{displayValue(product.notes)}</td>}
              </tr>
            })}
          </tbody>
        </table>
      </div>
    )}
  </section>
}
