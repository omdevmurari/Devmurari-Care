import { useEffect, useState, useRef } from "react"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "../services/firebase"

export default function BillList() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  
  const contentRefs = useRef({})

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

  function formatDate(timestamp) {
    if (!timestamp) return "-"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    })
  }

  function toggleExpand(id) {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div style={styles.container}>
      {/* Header Card */}
      <div style={styles.headerCard}>
        <h3 style={styles.title}>Transaction History</h3>
        <p style={styles.subtitle}>Recent prescriptions & bills</p>
      </div>

      {loading && <p style={{textAlign: 'center', color: '#64748b'}}>Loading history...</p>}

      {!loading && bills.length === 0 && (
        <div style={styles.emptyState}>No bills generated yet.</div>
      )}

      <div style={styles.list}>
        {bills.map((b) => {
          const isExpanded = expandedId === b.id
          
          return (
            <div key={b.id} style={styles.billCard}>
              {/* Main Row (Always Visible) */}
              <div style={styles.mainRow} onClick={() => toggleExpand(b.id)}>
                <div style={styles.leftSide}>
                  <div style={styles.phone}>{b.patientPhone}</div>
                  <div style={styles.date}>{formatDate(b.createdAt)}</div>
                </div>
                
                <div style={styles.rightSide}>
                  <div style={styles.total}>₹{b.billTotal}</div>
                  <div style={{
                    fontSize: "12px", 
                    color: isExpanded ? "#3b82f6" : "#64748b",
                    marginTop: "4px"
                  }}>
                    {isExpanded ? "Hide Details ▲" : "View Details ▼"}
                  </div>
                </div>
              </div>

              {/* Expandable Details */}
              {isExpanded && (
                <div style={styles.detailsPanel}>
                  <div style={styles.divider}></div>
                  <p style={styles.detailsHeader}>Medicine List:</p>
                  
                  {b.items && b.items.map((item, idx) => (
                    <div key={idx} style={styles.itemRow}>
                      <span style={styles.itemName}>
                        {idx + 1}. {item.name}
                      </span>
                      <span style={styles.itemMeta}>
                        {item.quantity} x ₹{item.sellingPrice} = <b>₹{item.quantity * item.sellingPrice}</b>
                      </span>
                    </div>
                  ))}

                  <div style={styles.profitBadge}>
                    Profit on this bill: ₹{b.profit} 📈
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: "flex", flexDirection: "column", gap: "16px"
  },
  headerCard: {
    background: "white", borderRadius: "16px", padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0",
  },
  title: { margin: "0 0 4px 0", fontSize: "18px", fontWeight: "700", color: "#1e293b" },
  subtitle: { margin: 0, fontSize: "14px", color: "#64748b" },
  
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  
  billCard: {
    background: "white", borderRadius: "14px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9",
    overflow: "hidden", transition: "all 0.2s"
  },
  mainRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px", cursor: "pointer", background: "white"
  },
  phone: { fontWeight: "700", color: "#1e293b", fontSize: "16px", marginBottom: "4px" },
  date: { fontSize: "12px", color: "#94a3b8" },
  
  rightSide: { textAlign: "right" },
  total: { fontWeight: "800", fontSize: "18px", color: "#059669" },
  
  detailsPanel: {
    padding: "0 16px 16px 16px", background: "#f8fafc"
  },
  divider: { height: "1px", background: "#e2e8f0", marginBottom: "12px" },
  detailsHeader: { fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px" },
  
  itemRow: {
    display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "6px", color: "#334155"
  },
  itemName: { fontWeight: "500" },
  itemMeta: { color: "#64748b", fontSize: "13px" },
  
  profitBadge: {
    marginTop: "12px", fontSize: "12px", background: "#dcfce7", color: "#166534",
    padding: "6px 10px", borderRadius: "6px", display: "inline-block", fontWeight: "600"
  },
  
  emptyState: {
    textAlign: "center", padding: "40px", color: "#94a3b8", fontStyle: "italic",
    background: "white", borderRadius: "16px"
  }
}