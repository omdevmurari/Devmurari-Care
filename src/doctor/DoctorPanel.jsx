import { useEffect, useState } from "react"
import { getInventory } from "../services/inventory"
import InventoryForm from "./InventoryForm"
import InventoryList from "./InventoryList"
import PrescriptionForm from "./PrescriptionForm"
import BillList from "./BillList"

export default function DoctorPanel({
  available,
  availabilityLoading,
  onToggleAvailability
}) {
  const [inventory, setInventory] = useState([])
  const [page, setPage] = useState("home") 

  async function loadInventory() {
    const data = await getInventory()
    setInventory(data)
  }

  useEffect(() => {
    loadInventory()
  }, [])

  if (availabilityLoading) {
    return <div style={styles.card}>Loading...</div>
  }

  return (
    <div style={styles.appContainer}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h3 style={styles.title}>Doctor Panel</h3>
          
          {/* Status Button */}
          <button
            style={{
              ...styles.statusBtn,
              background: available 
                ? "linear-gradient(135deg, #10b981, #059669)" // Green
                : "linear-gradient(135deg, #ef4444, #dc2626)"  // Red
            }}
            onClick={onToggleAvailability}
          >
            <span style={styles.dot}></span>
            {available ? "You are Available" : "You are Offline"}
          </button>
        </div>

        {/* 2x2 Navigation Grid */}
        <div style={styles.grid}>
          <NavButton 
            active={page === "home"} 
            onClick={() => setPage("home")} 
            icon="🏠" 
            label="Home" 
          />
          <NavButton 
            active={page === "inventory"} 
            onClick={() => setPage("inventory")} 
            icon="📦" 
            label="Inventory" 
          />
          <NavButton 
            active={page === "prescription"} 
            onClick={() => setPage("prescription")} 
            icon="💊" 
            label="Prescription" 
          />
          <NavButton 
            active={page === "bills"} 
            onClick={() => setPage("bills")} 
            icon="🧾" 
            label="Bills" 
          />
        </div>
      </div>

      {/* Page Content */}
      <div style={styles.contentArea}>
        {page === "home" && (
          <div style={styles.card}>
            <h3 style={styles.title}>Welcome 👋</h3>
            <p style={styles.muted}>
              Select an option from the panel above to manage your clinic.
            </p>
          </div>
        )}

        {page === "inventory" && (
          <>
            <InventoryForm onAdded={loadInventory} />
            <InventoryList items={inventory} refresh={loadInventory} />
          </>
        )}

        {page === "prescription" && (
          <PrescriptionForm
            inventory={inventory}
            refreshInventory={loadInventory}
          />
        )}

        {page === "bills" && <BillList />}
      </div>
    </div>
  )
}

// --- SUB-COMPONENT FOR BUTTONS ---
function NavButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.navBtn,
        background: active ? "#4f46e5" : "#eef2ff",
        color: active ? "white" : "#4f46e5",
        boxShadow: active ? "0 4px 12px rgba(79, 70, 229, 0.3)" : "none",
        transform: active ? "scale(1.02)" : "scale(1)",
      }}
    >
      <span style={{ fontSize: "24px", marginBottom: "4px" }}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

// --- STYLES OBJECT (CSS-in-JS) ---
const styles = {
  appContainer: {
    maxWidth: "500px",
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    border: "1px solid #f0f0f0",
  },
  header: {
    marginBottom: "20px",
  },
  title: {
    margin: "0 0 12px 0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
  },
  statusBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    color: "white",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "transform 0.2s",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "white",
    boxShadow: "0 0 8px rgba(255,255,255,0.8)",
  },
  // 🔥 THIS IS THE KEY GRID FIX
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr", // Forces 2 columns
    gap: "12px",
  },
  navBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 10px",
    borderRadius: "16px",
    border: "none",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    height: "100px", // Ensures uniform height
  },
  muted: {
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  contentArea: {
    animation: "fadeIn 0.3s ease",
  }
}