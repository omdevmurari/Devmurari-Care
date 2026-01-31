import { useEffect, useState } from "react"
import { getInventory } from "../services/inventory"

import InventoryList from "./InventoryList"
import PrescriptionForm from "./PrescriptionForm"
import BillList from "./BillList"
import PatientHistory from "./PatientHistory"
import DashboardStats from "./DashboardStats" // Import Analytics

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

  // 🛑 DELETED THE BLOCKING LOADING SCREEN
  // No more "if (availabilityLoading) return <Loading />"
  // The app will opens immediately now.

  return (
    <div style={styles.appContainer}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h3 style={styles.title}>Doctor Panel</h3>
          
          <button
            style={{
              ...styles.statusBtn,
              // If loading, show Grey. If online Green, else Red.
              background: availabilityLoading 
                ? "#94a3b8" 
                : available 
                  ? "linear-gradient(135deg, #10b981, #059669)" 
                  : "linear-gradient(135deg, #ef4444, #dc2626)",
              cursor: availabilityLoading ? "wait" : "pointer"
            }}
            onClick={onToggleAvailability}
            disabled={availabilityLoading}
          >
            <span style={styles.dot}></span>
            {availabilityLoading 
              ? "Checking Status..." 
              : available ? "You are Available" : "You are Offline"
            }
          </button>
        </div>

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

      <div style={styles.contentArea}>
        {page === "home" && (
          <>
            <div style={styles.card}>
              <h3 style={styles.title}>Welcome Dr. Devmurari 👋</h3>
              <p style={styles.muted}>Here is your clinic's performance overview.</p>
            </div>
            {/* Analytics & Patient Search */}
            <DashboardStats />
            <PatientHistory />
          </>
        )}

        {page === "inventory" && (
          <>
             {/* Note: passing inventory so it can check duplicates if needed in future */}
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
        border: active ? "none" : "1px solid #e0e7ff"
      }}
    >
      <span style={{ fontSize: "24px", marginBottom: "4px" }}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

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
  header: { marginBottom: "20px" },
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
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr", 
    gap: "12px",
  },
  navBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 10px",
    borderRadius: "16px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    height: "100px",
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