import { useState, useRef } from "react"
import { savePrescription } from "../services/prescriptions"

export default function PrescriptionForm({ inventory, refreshInventory }) {
  const [patientPhone, setPatientPhone] = useState("")
  const [activeMedId, setActiveMedId] = useState(null)
  const [qty, setQty] = useState(1)
  const [searchTerm, setSearchTerm] = useState("") // Added Search
  const [loading, setLoading] = useState(false)

  const contentRefs = useRef({})

  function toggleMedicine(med) {
    if (activeMedId === med.id) {
      setActiveMedId(null)
      setQty(1)
    } else {
      setActiveMedId(med.id)
      setQty(1)
    }
  }

  async function handleSave() {
    if (!patientPhone || !activeMedId) return

    const med = inventory.find((m) => m.id === activeMedId)
    if (!med || qty > med.quantity) return

    setLoading(true)
    try {
      await savePrescription({
        patientPhone,
        items: [
          {
            medicineId: med.id,
            name: med.name,
            quantity: qty,
            costPrice: med.costPrice,
            sellingPrice: med.sellingPrice,
            remainingQty: med.quantity - qty
          }
        ]
      })

      // Reset
      setPatientPhone("")
      setActiveMedId(null)
      setQty(1)
      setSearchTerm("") 
      refreshInventory()
      alert("Prescription Saved!") 
    } catch (error) {
      console.error(error)
      alert("Error saving prescription")
    }
    setLoading(false)
  }

  // Filter for Search
  const filteredInventory = inventory.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={styles.container}>
      {/* Patient Details Card */}
      <div style={styles.card}>
        <h3 style={styles.header}>New Prescription</h3>
        <label style={styles.label}>Patient Phone Number</label>
        <input
          style={styles.input}
          placeholder="e.g. 9876543210"
          value={patientPhone}
          onChange={(e) => setPatientPhone(e.target.value)}
        />
      </div>

      {/* Medicine Selection Card */}
      <div style={styles.card}>
        <h4 style={styles.subHeader}>Select Medicine</h4>
        
        <input 
          style={styles.searchInput} 
          placeholder="🔍 Search medicine..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div style={styles.list}>
          {filteredInventory.length === 0 && (
            <p style={styles.empty}>No medicines found.</p>
          )}

          {filteredInventory.map((med) => {
            const isOpen = activeMedId === med.id
            const height = isOpen
              ? contentRefs.current[med.id]?.scrollHeight || "auto"
              : 0

            return (
              <div key={med.id} style={styles.medItemWrapper}>
                <button
                  style={{
                    ...styles.medButton,
                    background: isOpen ? "#eff6ff" : "white",
                    borderColor: isOpen ? "#3b82f6" : "#e5e7eb",
                    color: isOpen ? "#1e40af" : "#374151"
                  }}
                  onClick={() => toggleMedicine(med)}
                >
                  <span style={{fontWeight: 500}}>{med.name}</span>
                  <span style={{fontSize: "12px", color: med.quantity < 5 ? "#ef4444" : "#6b7280"}}>
                    Stock: {med.quantity}
                  </span>
                </button>

                {/* Accordion Content */}
                <div
                  style={{
                    height,
                    overflow: "hidden",
                    transition: "height 0.25s ease",
                  }}
                >
                  <div
                    ref={(el) => (contentRefs.current[med.id] = el)}
                    style={styles.accordionContent}
                  >
                    <div style={styles.qtyControl}>
                      <label style={styles.labelSmall}>Quantity to Dispense:</label>
                      <input
                        type="number"
                        min={1}
                        max={med.quantity}
                        value={qty}
                        style={styles.qtyInput}
                        onChange={(e) => setQty(Number(e.target.value))}
                      />
                    </div>
                    <div style={styles.priceSummary}>
                      Total: <b>₹{med.sellingPrice * qty}</b>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Button */}
      <button 
        style={{
          ...styles.saveBtn, 
          opacity: (!patientPhone || !activeMedId || loading) ? 0.5 : 1
        }} 
        onClick={handleSave}
        disabled={!patientPhone || !activeMedId || loading}
      >
        {loading ? "Saving..." : "✅ Save & Dispense"}
      </button>
    </div>
  )
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    border: "1px solid #f0f0f0",
  },
  header: {
    margin: "0 0 16px 0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
  },
  subHeader: {
    margin: "0 0 12px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#475569",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "16px",
    outline: "none",
    background: "#f8fafc",
  },
  searchInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    marginBottom: "12px",
    fontSize: "14px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "400px",
    overflowY: "auto",
  },
  medItemWrapper: {
    borderRadius: "10px",
    overflow: "hidden",
  },
  medButton: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    background: "white",
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: "15px",
  },
  accordionContent: {
    padding: "12px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderTop: "none",
    borderBottomLeftRadius: "10px",
    borderBottomRightRadius: "10px",
  },
  qtyControl: {
    marginBottom: "10px",
  },
  labelSmall: {
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "4px",
    display: "block",
  },
  qtyInput: {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "16px",
  },
  priceSummary: {
    textAlign: "right",
    fontSize: "14px",
    color: "#1e293b",
  },
  saveBtn: {
    width: "100%",
    padding: "16px",
    borderRadius: "14px",
    background: "#10b981",
    color: "white",
    fontSize: "16px",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
  },
  empty: {
    textAlign: "center",
    color: "#94a3b8",
    fontStyle: "italic",
    padding: "20px",
  }
}