import { useState } from "react"
import { doc, deleteDoc, updateDoc } from "firebase/firestore"
import { db } from "../services/firebase"
import { updateMedicine } from "../services/inventory"

export default function InventoryList({ items, refresh }) {
  const [searchTerm, setSearchTerm] = useState("")
  
  // State for Editing
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    name: "", quantity: "", costPrice: "", sellingPrice: ""
  })

  // --- ACTIONS ---

  // 1. Quick +/- Quantity
  async function changeQty(item, delta) {
    const newQty = item.quantity + delta
    if (newQty < 0) return
    await updateMedicine(item.id, { quantity: newQty })
    refresh()
  }

  // 2. Delete Medicine
  async function handleDelete(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    try {
      await deleteDoc(doc(db, "inventory", id))
      refresh()
    } catch (error) {
      console.error("Error deleting:", error)
      alert("Error deleting medicine")
    }
  }

  // 3. Start Editing
  function startEditing(item) {
    setEditingId(item.id)
    setEditForm({
      name: item.name,
      quantity: item.quantity,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice
    })
  }

  // 4. Save Changes
  async function handleSave(id) {
    try {
      await updateDoc(doc(db, "inventory", id), {
        name: editForm.name,
        quantity: Number(editForm.quantity),
        costPrice: Number(editForm.costPrice),
        sellingPrice: Number(editForm.sellingPrice)
      })
      setEditingId(null)
      refresh()
    } catch (error) {
      console.error("Error updating:", error)
      alert("Error saving changes")
    }
  }

  // --- RENDER ---

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
              
              {/* === VIEW MODE === */}
              {editingId !== item.id ? (
                <>
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
                      <span>Buy: ₹{item.costPrice}</span>
                      <span>•</span>
                      <span style={{fontWeight: "bold", color: "#1e293b"}}>Sell: ₹{item.sellingPrice}</span>
                    </div>
                  </div>

                  <div style={styles.actions}>
                    {/* Edit Button */}
                    <button 
                      onClick={() => startEditing(item)}
                      style={{...styles.iconBtn, background: "#eff6ff", color: "#3b82f6"}}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    {/* Delete Button */}
                    <button 
                      onClick={() => handleDelete(item.id, item.name)}
                      style={{...styles.iconBtn, background: "#fef2f2", color: "#ef4444"}}
                      title="Delete"
                    >
                      🗑️
                    </button>
                    
                    {/* Divider */}
                    <div style={{width: 1, height: 24, background: "#e2e8f0", margin: "0 4px"}}></div>

                    {/* Quick +/- Buttons */}
                    <button 
                      style={{...styles.qtyBtn, background: "#f1f5f9", color: "#64748b"}}
                      onClick={() => changeQty(item, -1)}
                    >
                      −
                    </button>
                    <button 
                      style={{...styles.qtyBtn, background: "#e0e7ff", color: "#4f46e5"}}
                      onClick={() => changeQty(item, 1)}
                    >
                      +
                    </button>
                  </div>
                </>
              ) : (
                /* === EDIT MODE === */
                <div style={{width: "100%"}}>
                  <div style={{marginBottom: "10px"}}>
                    <label style={styles.label}>Name</label>
                    <input 
                      style={styles.editInput} 
                      value={editForm.name}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                    />
                  </div>
                  
                  <div style={{display: "flex", gap: "10px", marginBottom: "15px"}}>
                    <div style={{flex: 1}}>
                      <label style={styles.label}>Qty</label>
                      <input 
                        type="number" style={styles.editInput}
                        value={editForm.quantity}
                        onChange={e => setEditForm({...editForm, quantity: e.target.value})}
                      />
                    </div>
                    <div style={{flex: 1}}>
                      <label style={styles.label}>Cost (₹)</label>
                      <input 
                        type="number" style={styles.editInput}
                        value={editForm.costPrice}
                        onChange={e => setEditForm({...editForm, costPrice: e.target.value})}
                      />
                    </div>
                    <div style={{flex: 1}}>
                      <label style={styles.label}>Sell (₹)</label>
                      <input 
                        type="number" style={styles.editInput}
                        value={editForm.sellingPrice}
                        onChange={e => setEditForm({...editForm, sellingPrice: e.target.value})}
                      />
                    </div>
                  </div>

                  <div style={{display: "flex", gap: "8px"}}>
                    <button 
                      onClick={() => handleSave(item.id)}
                      style={{...styles.saveBtn, background: "#10b981", color: "white"}}
                    >
                      ✅ Save
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      style={{...styles.saveBtn, background: "#f1f5f9", color: "#64748b"}}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  )
}


const styles = {
  searchContainer: { marginBottom: "16px" },
  searchInput: {
    width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0",
    fontSize: "16px", outline: "none", background: "white",
  },
  listHeader: {
    margin: "0 0 12px 0", color: "#64748b", fontSize: "14px", fontWeight: "600",
  },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  itemCard: {
    background: "white", padding: "16px", borderRadius: "14px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9",
  },
  itemInfo: { flex: 1 },
  nameRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" },
  itemName: { fontWeight: "700", color: "#1e293b", fontSize: "16px" },
  stockBadge: { fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" },
  detailsRow: { fontSize: "13px", color: "#94a3b8", display: "flex", gap: "6px", alignItems: "center" },
  
  // Actions
  actions: { display: "flex", gap: "8px", marginLeft: "12px", alignItems: "center" },
  iconBtn: {
    width: "36px", height: "36px", borderRadius: "10px", border: "none",
    fontWeight: "bold", fontSize: "16px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  qtyBtn: {
    width: "36px", height: "36px", borderRadius: "10px", border: "none",
    fontWeight: "bold", fontSize: "20px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },

  // Edit Mode Styles
  label: { fontSize: "12px", color: "#64748b", marginBottom: "4px", display: "block" },
  editInput: {
    width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px"
  },
  saveBtn: {
    flex: 1, padding: "10px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer"
  },
  
  emptyState: { textAlign: "center", padding: "40px", color: "#94a3b8", fontStyle: "italic" }
}