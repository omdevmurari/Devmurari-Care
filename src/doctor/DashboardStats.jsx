import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../services/firebase"

export default function DashboardStats() {
  const [stats, setStats] = useState({
    todayPatients: 0,
    todayIncome: 0,
    monthIncome: 0,
    lastMonthIncome: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function calculateStats() {
      try {
        const querySnapshot = await getDocs(collection(db, "bills"))
        const now = new Date()
        const todayStr = now.toDateString() // "Sat Jan 31 2026"
        const currentMonth = now.getMonth() // 0 = Jan
        const currentYear = now.getFullYear() // 2026

        let todayP = 0
        let todayI = 0
        let monthI = 0
        let lastMonthI = 0

        querySnapshot.forEach(doc => {
          const data = doc.data()
          // Convert Timestamp to Date
          const billDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
          
          const billTotal = Number(data.billTotal) || 0

          // 1. Check Today
          if (billDate.toDateString() === todayStr) {
            todayP += 1
            todayI += billTotal
          }

          // 2. Check This Month
          if (billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear) {
            monthI += billTotal
          }

          // 3. Check Last Month
          // Handle January edge case (Last month of Jan is Dec of previous year)
          const lastMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

          if (billDate.getMonth() === lastMonthIndex && billDate.getFullYear() === lastMonthYear) {
            lastMonthI += billTotal
          }
        })

        setStats({
          todayPatients: todayP,
          todayIncome: todayI,
          monthIncome: monthI,
          lastMonthIncome: lastMonthI
        })
      } catch (error) {
        console.error("Error calculating stats:", error)
      }
      setLoading(false)
    }

    calculateStats()
  }, [])

  if (loading) return <div style={{padding: 20, textAlign: "center"}}>Loading stats...</div>

  return (
    <div style={styles.container}>
      {/* ROW 1: TODAY'S STATS */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.label}>Today's Patients</div>
          <div style={styles.value}>{stats.todayPatients}</div>
          <div style={styles.subtext}>Appointments today</div>
        </div>
        <div style={styles.card}>
          <div style={styles.label}>Today's Income</div>
          <div style={{...styles.value, color: "#16a34a"}}>₹{stats.todayIncome}</div>
          <div style={styles.subtext}>Cashflow today</div>
        </div>
      </div>

      {/* ROW 2: MONTHLY OVERVIEW */}
      <div style={styles.fullCard}>
        <h4 style={styles.header}>Monthly Performance</h4>
        <div style={styles.row}>
          <div style={styles.monthBlock}>
            <div style={styles.monthLabel}>This Month</div>
            <div style={styles.bigValue}>₹{stats.monthIncome}</div>
          </div>
          <div style={styles.divider}></div>
          <div style={styles.monthBlock}>
            <div style={styles.monthLabel}>Last Month</div>
            <div style={{...styles.bigValue, color: "#64748b"}}>₹{stats.lastMonthIncome}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { marginBottom: "20px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" },
  card: {
    background: "white", padding: "16px", borderRadius: "14px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)", border: "1px solid #e2e8f0",
    textAlign: "center"
  },
  label: { fontSize: "12px", color: "#64748b", fontWeight: "600", marginBottom: "4px", textTransform: "uppercase" },
  value: { fontSize: "24px", fontWeight: "800", color: "#1e293b", marginBottom: "4px" },
  subtext: { fontSize: "11px", color: "#94a3b8" },
  
  fullCard: {
    background: "linear-gradient(135deg, #1e293b, #0f172a)", // Dark professional card
    borderRadius: "16px", padding: "20px", color: "white",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)"
  },
  header: { margin: "0 0 16px 0", fontSize: "14px", opacity: 0.8, fontWeight: "500" },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  monthBlock: { textAlign: "left" },
  monthLabel: { fontSize: "12px", opacity: 0.7, marginBottom: "4px" },
  bigValue: { fontSize: "24px", fontWeight: "700", color: "#ffffff" },
  divider: { width: "1px", height: "40px", background: "rgba(255,255,255,0.2)" }
}