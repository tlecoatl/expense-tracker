import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'


const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function Dashboard() {
  const [categoryData, setCategoryData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [catRes, monthRes] = await Promise.all([
          api.get('/expenses/report/by-category/'),
          api.get('/expenses/report/monthly/'),
        ])
        setCategoryData(catRes.data.map(item => ({
        ...item,
        total: parseFloat(item.total)
        })))
        setMonthlyData(monthRes.data)
      } catch {
        // token issue handled by interceptor
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>Expense Tracker</h1>
        <nav style={styles.nav}>
          <Link to="/expenses" style={styles.navLink}>Expenses</Link>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </nav>
      </header>

      <main style={styles.main}>
        <h2 style={styles.heading}>Dashboard</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Spending by Category</h3>
            {categoryData.length === 0 ? (
              <p style={styles.empty}>No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  />
                  <Tooltip />
                  <Legend/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Monthly Spending</h3>
            {monthlyData.length === 0 ? (
              <p style={styles.empty}>No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
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
  heading: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  card: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardTitle: { fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' },
  empty: { color: '#999', fontSize: '0.9rem' },
}
