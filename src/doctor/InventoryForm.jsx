import { useState } from "react"
import { addMedicine } from "../services/inventory"

export default function InventoryForm({ onAdded }) {
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    costPrice: "",
    sellingPrice: "",
    expiry: ""
  })
  const [loading, setLoading] = useState(false)

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const isValid =
    form.name.trim() &&
    Number(form.quantity) > 0 &&
    Number(form.costPrice) >= 0 &&
    Number(form.sellingPrice) >= 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    try {
      await addMedicine({
        name: form.name.trim(),
        quantity: Number(form.quantity),
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        expiry: form.expiry || null
      })

      setForm({
        name: "",
        quantity: "",
        costPrice: "",
        sellingPrice: "",
        expiry: ""
      })

      if (onAdded) onAdded()
    } catch (error) {
      console.error(error)
      alert("Failed to add medicine")
    }
    setLoading(false)
  }

  return (
    <div style={styles.card}>
      <h3 style={styles.header}>Add New Medicine</h3>
      
      <div style={styles.inputGroup}>
        <label style={styles.label}>Medicine Name</label>
        <input
          name="name"
          style={styles.input}
          placeholder="e.g. Dolo 650"
          value={form.name}
          onChange={updateField}
        />
      </div>

      <div style={styles.row}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Quantity</label>
          <input
            name="quantity"
            style={styles.input}
            type="number"
            placeholder="Qty"
            value={form.quantity}
            onChange={updateField}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Expiry</label>
          <input
            name="expiry"
            style={styles.input}
            type="month"
            value={form.expiry}
            onChange={updateField}
          />
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Cost (₹)</label>
          <input
            name="costPrice"
            style={styles.input}
            type="number"
            placeholder="Buy Price"
            value={form.costPrice}
            onChange={updateField}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Sell (₹)</label>
          <input
            name="sellingPrice"
            style={styles.input}
            type="number"
            placeholder="Sell Price"
            value={form.sellingPrice}
            onChange={updateField}
          />
        </div>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={!isValid || loading}
        style={{
          ...styles.button,
          opacity: (!isValid || loading) ? 0.5 : 1,
          cursor: (!isValid || loading) ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Adding..." : "➕ Add to Inventory"}
      </button>
    </div>
  )
}

const styles = {
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    border: "1px solid #f0f0f0",
  },
  header: {
    margin: "0 0 16px 0",
    fontSize: "18px",
    color: "#1e293b",
    fontWeight: "700",
  },
  inputGroup: {
    marginBottom: "12px",
    flex: 1,
  },
  row: {
    display: "flex",
    gap: "10px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    fontSize: "15px",
    color: "#334155",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    marginTop: "8px",
  }
}