import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "../services/firebase"

export default function BillList() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBills() {
      try {
        const q = query(
          collection(db, "bills"),
          orderBy("createdAt", "desc")
        )
        const snap = await getDocs(q)
        setBills(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error("Error loading bills:", err)
      }
      setLoading(false)
    }
    loadBills()
  }, [])

  // Helper to format Firestore Timestamp or Date string
  function formatDate(timestamp) {
    if (!timestamp) return "Unknown Date"
    // If it's a Firestore timestamp (has .toDate())
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString() + ", " + timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    // If it's already a string/date
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div>
      {/* Header Card */}
      <div style={styles.headerCard}>
        <h3 style={styles.title}>Transactions</h3>
        <p style={styles.subtitle}>Recent prescriptions & bills</p>
      </div>

      {loading && <p style={{textAlign: 'center', color: '#64748b'}}>Loading bills...</p>}

      {!loading && bills.length === 0 && (
        <div style={styles.emptyState}>No bills generated yet.</div>
      )}

      <div style={styles.list}>
        {bills.map((b) => (
          <div key={b.id} style={styles.billCard}>
            <div style={styles.row}>
              <div>
                <div style={styles.phone}>{b.patientPhone}</div>
                <div style={styles.date}>{formatDate(b.createdAt)}</div>
              </div>
              <div style={styles.rightSide}>
                <div style={styles.total}>₹{b.billTotal}</div>
                <div style={styles.profit}>
                  (+ ₹{b.profit} profit)
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  headerCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    border: "1px solid #f0f0f0",
  },
  title: {
    margin: "0 0 4px 0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  billCard: {
    background: "white",
    padding: "16px",
    borderRadius: "14px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    border: "1px solid #f1f5f9",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  phone: {
    fontWeight: "700",
    color: "#1e293b",
    fontSize: "16px",
    marginBottom: "4px",
  },
  date: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  rightSide: {
    textAlign: "right",
  },
  total: {
    fontWeight: "700",
    fontSize: "18px",
    color: "#0f172a",
  },
  profit: {
    fontSize: "12px",
    color: "#10b981", // Green for profit
    fontWeight: "600",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#94a3b8",
    fontStyle: "italic",
    background: "white",
    borderRadius: "16px",
  }
}