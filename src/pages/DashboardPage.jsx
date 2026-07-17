import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import AppShell from '../components/AppShell'
import StatsCards from '../components/StatsCards'
import OrdersTable from '../components/OrdersTable'
import OrderDetailsModal from '../components/OrderDetailsModal'
import ErrorsPanel from '../components/ErrorsPanel'
import LoadingState from '../components/LoadingState'
import ErrorNotice from '../components/ErrorNotice'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import { normalizeItemsList, normalizeMissingFields } from '../utils/formatters'

function getRawOrderStatus(order) {
  return String(order?.status || '').toLowerCase()
}

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim().length > 0
}

function hasValidItems(itemsList) {
  return normalizeItemsList(itemsList).some((item) => {
    if (typeof item === 'string') {
      return hasValue(item)
    }

    if (!item || typeof item !== 'object') {
      return false
    }

    return hasValue(item.name) && hasValue(item.quantity)
  })
}

const knownMissingFields = [
  ['customerName', (order) => hasValue(order.customer_name)],
  ['customerPhone', (order) => hasValue(order.customer_phone)],
  ['customerEmail', (order) => hasValue(order.customer_email)],
  ['deliveryAddress', (order) => hasValue(order.shipping_address)],
  ['items', (order) => hasValidItems(order.items_list)],
]

function syncMissingFields(order, patch) {
  const merged = { ...order, ...patch }
  const currentMissingFields = normalizeMissingFields(order.missing_fields)
  const knownKeys = new Set(knownMissingFields.map(([key]) => key))
  const nextMissingFields = currentMissingFields.filter((field) => !knownKeys.has(field))

  knownMissingFields.forEach(([key, hasValidValue]) => {
    if (!hasValidValue(merged)) {
      nextMissingFields.push(key)
    }
  })

  const uniqueMissingFields = [...new Set(nextMissingFields)]

  return uniqueMissingFields
}

export default function DashboardPage() {
  const [orders, setOrders] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [orderToDelete, setOrderToDelete] = useState(null)
  const [deletingOrder, setDeletingOrder] = useState(false)
  const [deleteOrderError, setDeleteOrderError] = useState('')
  const [tab, setTab] = useState('orders')
  const [toast, setToast] = useState(null)

  const loadData = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')

    const [ordersResult, logsResult] = await Promise.all([
      supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),

      supabase
        .from('automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
    ])

    if (ordersResult.error || logsResult.error) {
      setError('לא ניתן לטעון את הנתונים כרגע. ייתכן שיש בעיית חיבור או הרשאות.')
    } else {
      setOrders(ordersResult.data || [])
      setLogs(logsResult.data || [])
    }

    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const now = Date.now()

    return orders.filter((order) => {
      const search =
        !needle ||
        [
          'customer_name',
          'customer_phone',
          'customer_email',
          'shipping_address',
          'action_type',
        ].some((key) =>
          String(order[key] ?? '')
            .toLowerCase()
            .includes(needle)
        )

      const status = filter === 'all' || getRawOrderStatus(order) === filter

      const time = order.created_at ? new Date(order.created_at).getTime() : 0

      const date =
        dateFilter === 'all' ||
        (dateFilter === 'today' &&
          new Date(order.created_at).toDateString() === new Date().toDateString()) ||
        (dateFilter === 'week' && now - time <= 7 * 864e5)

      return search && status && date
    })
  }, [orders, query, filter, dateFilter])

  async function updateOrder(order, patch) {
    const safe = {}
    const nextMissingFields = syncMissingFields(order, patch)

    ;[
      'customer_name',
      'customer_phone',
      'customer_email',
      'shipping_address',
      'action_type',
      'status',
      'notes',
      'items_list',
    ].forEach((key) => {
      if (Object.hasOwn(patch, key)) {
        safe[key] = patch[key]
      }
    })

    if (nextMissingFields) {
      safe.missing_fields = nextMissingFields
    }

    const { data, error: updateError } = await supabase
      .from('orders')
      .update(safe)
      .eq('id', order.id)
      .select('*')
      .single()

    if (updateError) {
      throw updateError
    }

    setOrders((currentOrders) =>
      currentOrders.map((currentOrder) =>
        currentOrder.id === order.id ? { ...currentOrder, ...data } : currentOrder
      )
    )

    setSelected((currentOrder) =>
      currentOrder?.id === order.id ? { ...currentOrder, ...data } : currentOrder
    )

    setToast({ message: 'השינויים נשמרו' })
  }

  async function markLogSeen(log) {
    const { data: updatedLog, error: updateError } = await supabase
      .from('automation_logs')
      .update({ status: 'handled' })
      .eq('id', log.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    setLogs((currentLogs) =>
      currentLogs.map((currentLog) =>
        currentLog.id === updatedLog.id ? updatedLog : currentLog
      )
    )

    setToast({ message: 'השגיאה סומנה כנראה' })
  }

  async function deleteLog(log) {
    const { error: deleteError } = await supabase
      .from('automation_logs')
      .delete()
      .eq('id', log.id)

    if (deleteError) {
      throw deleteError
    }

    setLogs((currentLogs) => currentLogs.filter((currentLog) => currentLog.id !== log.id))
    setToast({ message: 'השגיאה נמחקה' })
  }

  async function changeStatus(order, status) {
    try {
      await updateOrder(order, { status })
    } catch {
      setToast({
        type: 'error',
        message: 'לא ניתן לעדכן את ההזמנה כרגע.',
      })
    }
  }

  function deleteOrder(order) {
    setDeleteOrderError('')
    setOrderToDelete(order)
  }

  async function confirmDeleteOrder() {
    if (!orderToDelete) {
      return
    }

    setDeletingOrder(true)
    setDeleteOrderError('')

    try {
      const { data: deletedOrder, error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderToDelete.id)
        .select('id')
        .single()

      if (deleteError) {
        throw deleteError
      }

      if (deletedOrder.id !== orderToDelete.id) {
        throw new Error('The delete response did not match the requested order.')
      }

      setOrders((currentOrders) =>
        currentOrders.filter((currentOrder) => currentOrder.id !== deletedOrder.id)
      )

      setSelected(null)
      setOrderToDelete(null)
      setToast({ message: 'ההזמנה נמחקה' })
    } catch (deleteError) {
      console.error('Failed to delete order from Supabase', {
        orderId: orderToDelete.id,
        code: deleteError?.code,
        message: deleteError?.message,
      })
      setDeleteOrderError('לא ניתן למחוק את ההזמנה כרגע. ייתכן שאין הרשאה או שיש בעיית חיבור.')
    } finally {
      setDeletingOrder(false)
    }
  }

  return (
    <AppShell
      onRefresh={() => loadData(true)}
      refreshing={refreshing}
      onLogout={() => supabase.auth.signOut()}
      activeTab={tab}
      onTabChange={setTab}
    >
      {loading ? (
        <LoadingState />
      ) : (
        <>
          {error && <ErrorNotice>{error}</ErrorNotice>}

          <StatsCards orders={orders} logs={logs} />

          {tab === 'orders' ? (
            <section className="panel orders-panel">
              <div className="view-heading">
                <div>
                  <h2>הזמנות</h2>
                  <p>מעקב אחר הזמנות, סינון, עדכון וטיפול</p>
                </div>
              </div>

              <div className="filters">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="חיפוש לפי שם, טלפון, מייל או כתובת..."
                />

                <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                  <option value="all">הכל</option>
                  <option value="new">חדש</option>
                  <option value="ok">תקין</option>
                  <option value="review">דורש בדיקה</option>
                  <option value="handled">טופל</option>
                  <option value="error">שגיאה</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                >
                  <option value="all">כל התאריכים</option>
                  <option value="today">היום</option>
                  <option value="week">7 ימים אחרונים</option>
                </select>
              </div>

              <OrdersTable
                orders={filtered}
                onSelect={setSelected}
                onStatus={changeStatus}
              />
            </section>
          ) : (
            <ErrorsPanel logs={logs} onMarkSeen={markLogSeen} onDelete={deleteLog} />
          )}
        </>
      )}

      {selected && (
        <OrderDetailsModal
          order={selected}
          onClose={() => setSelected(null)}
          onUpdate={updateOrder}
          onDelete={deleteOrder}
        />
      )}

      <ConfirmDialog
        open={Boolean(orderToDelete)}
        title="מחיקת הזמנה"
        message="האם למחוק את ההזמנה הזו לצמיתות?"
        confirmText="מחק"
        danger
        loading={deletingOrder}
        loadingText="מוחק..."
        error={deleteOrderError}
        onConfirm={confirmDeleteOrder}
        onCancel={() => {
          setOrderToDelete(null)
          setDeleteOrderError('')
        }}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </AppShell>
  )
}
