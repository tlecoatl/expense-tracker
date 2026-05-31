import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const CATEGORIES = ['food', 'transport', 'housing', 'entertainment', 'healthcare', 'shopping', 'utilities', 'other']

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [form, setForm] = useState({ title: '', amount: '', category: 'other', date: '', notes: '' })
  const [error, setError] = useState('')
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses/')
      setExpenses(res.data)
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const openAddForm = () => {
    setEditingExpense(null)
    setForm({ title: '', amount: '', category: 'other', date: '', notes: '' })
    setShowForm(true)
  }

  const openEditForm = (expense) => {
    setEditingExpense(expense)
    setForm({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      notes: expense.notes || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    await api.delete(`/expenses/${id}/`)
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingExpense) {
        const res = await api.patch(`/expenses/${editingExpense.id}/`, form)
        setExpenses(expenses.map(e => e.id === editingExpense.id ? res.data : e))
      } else {
        const res = await api.post('/expenses/', form)
        setExpenses([res.data, ...expenses])
      }
      setShowForm(false)
    } catch {
      setError('Something went wrong. Please check your inputs.')
    }
  }

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>Expense Tracker</h1>
        <nav style={styles.nav}>
          <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </nav>
      </header>

      <main style={styles.main}>
        <div style={styles.topRow}>
          <h2 style={styles.heading}>Expenses</h2>
          <button onClick={openAddForm} style={styles.addBtn}>+ Add Expense</button>
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h3>
            {error && <p style={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>Title</label>
                  <input
                    style={styles.input}
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Amount</label>
                  <input
                    style={styles.input}
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Category</label>
                  <select
                    style={styles.input}
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Date</label>
                  <input
                    style={styles.input}
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Notes</label>
                <textarea
                  style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>
                  {editingExpense ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={styles.list}>
          {expenses.length === 0 ? (
            <p style={styles.empty}>No expenses yet. Add one above.</p>
          ) : (
            expenses.map(expense => (
              <div key={expense.id} style={styles.expenseRow}>
                <div style={styles.expenseLeft}>
                  <span style={styles.expenseTitle}>{expense.title}</span>
                  <span style={styles.expenseMeta}>{expense.category} · {expense.date}</span>
                </div>
                <div style={styles.expenseRight}>
                  <span style={styles.expenseAmount}>${expense.amount}</span>
                  <button onClick={() => openEditForm(expense)} style={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(expense.id)} style={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  logo: { fontSize: '1.25rem', fontWeight: '700' },
  nav: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  navLink: { color: '#3b82f6', fontWeight: '500' },
  logoutBtn: {
    background: 'none',
    border: '1px solid #ddd',
    padding: '0.4rem 0.75rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  main: { padding: '2rem' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  heading: { fontSize: '1.5rem', fontWeight: '700' },
  addBtn: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem',
  },
  formTitle: { fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' },
  error: { color: '#e53e3e', fontSize: '0.9rem', marginBottom: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: { fontSize: '0.9rem', fontWeight: '500' },
  input: {
    padding: '0.6rem 0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' },
  cancelBtn: {
    background: 'none',
    border: '1px solid #ddd',
    padding: '0.6rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  empty: { color: '#999', fontSize: '0.9rem' },
  expenseRow: {
    backgroundColor: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseLeft: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  expenseTitle: { fontWeight: '600' },
  expenseMeta: { fontSize: '0.85rem', color: '#666' },
  expenseRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  expenseAmount: { fontWeight: '700', fontSize: '1.1rem' },
  editBtn: {
    background: 'none',
    border: '1px solid #ddd',
    padding: '0.3rem 0.6rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  deleteBtn: {
    background: 'none',
    border: '1px solid #ef4444',
    color: '#ef4444',
    padding: '0.3rem 0.6rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
}