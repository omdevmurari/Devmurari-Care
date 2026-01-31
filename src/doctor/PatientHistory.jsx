import { useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../services/firebase"

export default function PatientHistory() {
  const [phone, setPhone] = useState("")
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!phone) return
    
    setLoading(true)
    setHasSearched(true)
    setRecords([])

    try {
      // 1. Search bills by Phone Number
      const q = query(
        collection(db, "bills"), 
        where("patientPhone", "==", phone)
      )
      const snap = await getDocs(q)
      
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // 2. Sort by Date (Newest first)
      data.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
        return dateB - dateA
      })

      setRecords(data)

    } catch (error) {
      console.error("Search error:", error)
      alert("Error fetching history")
    }
    setLoading(false)
  }

  function formatDate(timestamp) {
    if (!timestamp) return "-"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  return (
    <div style={styles.container}>
      {/* SEARCH CARD */}
      <div style={styles.searchCard}>
        <h3 style={styles.title}>Find Patient History</h3>
        <form onSubmit={handleSearch} style={styles.form}>
          <div style={styles.inputWrapper}>
            <input 
              style={styles.input}
              placeholder="Enter Patient Mobile Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Searching..." : "🔍 Search Records"}
          </button>
        </form>
      </div>

      {/* RESULTS AREA */}
      <div style={styles.resultsArea}>
        {hasSearched && !loading && records.length === 0 && (
          <div style={styles.empty}>
            No history found for this number.
          </div>
        )}

        {records.map(bill => (
          <div key={bill.id} style={styles.historyCard}>
            <div style={styles.cardHeader}>
              <span style={styles.date}>📅 {formatDate(bill.createdAt)}</span>
              <span style={styles.total}>Bill: ₹{bill.billTotal}</span>
            </div>
            
            <div style={styles.medList}>
              {bill.items?.map((item, idx) => (
                <div key={idx} style={styles.medItem}>
                  <span style={{fontWeight: "600", color: "#334155"}}>
                    {idx+1}. {item.name}
                  </span>
                  <span style={{fontSize: "13px", color: "#64748b"}}>
                    Qty: {item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: { display: "flex", flexDirection: "column", gap: "20px" },
  
  searchCard: {
    background: "white", padding: "20px", borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0"
  },
  title: { marginTop: 0, marginBottom: "16px", fontSize: "16px", color: "#1e293b" },
  
  // FIXED FORM LAYOUT
  form: { 
    display: "flex", 
    flexDirection: "column", // Stack vertically
    gap: "12px" 
  },
  
  inputWrapper: {
    width: "100%"
  },
  
  input: {
    width: "100%", 
    padding: "14px", 
    borderRadius: "10px", 
    border: "1px solid #cbd5e1",
    fontSize: "16px", 
    outline: "none",
    boxSizing: "border-box", // Prevents padding from breaking layout
    background: "#f8fafc"
  },
  
  btn: {
    width: "100%",
    padding: "14px", 
    background: "#3b82f6", 
    color: "white", 
    border: "none",
    borderRadius: "10px", 
    fontWeight: "700", 
    cursor: "pointer",
    fontSize: "16px"
  },
  
  resultsArea: { display: "flex", flexDirection: "column", gap: "12px" },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: "10px", fontStyle: "italic" },
  
  historyCard: {
    background: "white", borderRadius: "12px", padding: "16px",
    borderLeft: "4px solid #3b82f6", 
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9"
  },
  cardHeader: {
    display: "flex", justifyContent: "space-between", marginBottom: "12px",
    paddingBottom: "8px", borderBottom: "1px solid #f1f5f9"
  },
  date: { fontWeight: "bold", color: "#1e293b" },
  total: { fontWeight: "700", color: "#059669" },
  medList: { display: "flex", flexDirection: "column", gap: "6px" },
  medItem: { display: "flex", justifyContent: "space-between" }
}