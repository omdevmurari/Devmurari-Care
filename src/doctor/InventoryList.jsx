import { useState } from "react"
import { updateMedicine } from "../services/inventory"

export default function InventoryList({ items, refresh }) {
  const [searchTerm, setSearchTerm] = useState("")

  async function changeQty(item, delta) {
    const newQty = item.quantity + delta
    if (newQty < 0) return
    await updateMedicine(item.id, { quantity: newQty })
    refresh()
  }

  // Search Logic
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <input 
          style={styles.searchInput}
          placeholder="🔍 Search medicines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <h4 style={styles.listHeader}>
        Total Items: {items.length} 
        {searchTerm && ` (Found: ${filteredItems.length})`}
      </h4>

      {filteredItems.length === 0 ? (
        <div style={styles.emptyState}>No medicines found.</div>
      ) : (
        <div style={styles.list}>
          {filteredItems.map((item) => (
            <div key={item.id} style={styles.itemCard}>
              <div style={styles.itemInfo}>
                <div style={styles.nameRow}>
                  <span style={styles.itemName}>{item.name}</span>
                  <span style={{
                    ...styles.stockBadge,
                    background: item.quantity < 10 ? "#fee2e2" : "#dcfce7",
                    color: item.quantity < 10 ? "#dc2626" : "#166534"
                  }}>
                    {item.quantity} left
                  </span>
                </div>
                <div style={styles.detailsRow}>
                  <span>Exp: {item.expiry || "N/A"}</span>
                  <span>•</span>
                  <span>Buy: ₹{item.costPrice}</span>
                  <span>•</span>
                  <span style={{fontWeight: "bold", color: "#1e293b"}}>Sell: ₹{item.sellingPrice}</span>
                </div>
              </div>

              <div style={styles.actions}>
                <button 
                  style={{...styles.actionBtn, background: "#f1f5f9", color: "#64748b"}}
                  onClick={() => changeQty(item, -1)}
                >
                  −
                </button>
                <button 
                  style={{...styles.actionBtn, background: "#e0e7ff", color: "#4f46e5"}}
                  onClick={() => changeQty(item, 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  searchContainer: {
    marginBottom: "16px",
  },
  searchInput: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "16px",
    outline: "none",
    background: "white",
  },
  listHeader: {
    margin: "0 0 12px 0",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  itemCard: {
    background: "white",
    padding: "16px",
    borderRadius: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    border: "1px solid #f1f5f9",
  },
  itemInfo: {
    flex: 1,
  },
  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
    flexWrap: "wrap"
  },
  itemName: {
    fontWeight: "700",
    color: "#1e293b",
    fontSize: "16px",
  },
  stockBadge: {
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "10px",
    fontWeight: "700",
  },
  detailsRow: {
    fontSize: "13px",
    color: "#94a3b8",
    display: "flex",
    gap: "6px",
    alignItems: "center",
  },
  actions: {
    display: "flex",
    gap: "8px",
    marginLeft: "12px",
  },
  actionBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "bold",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#94a3b8",
    fontStyle: "italic",
  }
}