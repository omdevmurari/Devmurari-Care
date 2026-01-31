import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore" 
import { db } from "../services/firebase"
import { savePrescription } from "../services/prescriptions"

export default function PrescriptionForm({ inventory, refreshInventory }) {
  // Patient State
  const [phone, setPhone] = useState("")
  const [patientDetails, setPatientDetails] = useState({
    name: "",
    age: "",
    gender: "Male"
  })
  const [isExistingPatient, setIsExistingPatient] = useState(false)
  const [searching, setSearching] = useState(false)

  // Prescription State
  const [searchTerm, setSearchTerm] = useState("")
  const [activeMedId, setActiveMedId] = useState(null)
  
  // Edit State
  const [qty, setQty] = useState(1)
  const [customPrice, setCustomPrice] = useState(0)
  const [timingDetails, setTimingDetails] = useState({}) 
  const [foodDetails, setFoodDetails] = useState({})

  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)

  // --- 1. AUTO-SEARCH PATIENT ---
  useEffect(() => {
    if (phone.length === 10) {
      checkPatient(phone)
    } else {
      // Reset if phone is cleared
      setIsExistingPatient(false)
      setPatientDetails({ name: "", age: "", gender: "Male" })
    }
  }, [phone])

  async function checkPatient(phoneNumber) {
    setSearching(true)
    try {
      const docRef = doc(db, "patients", phoneNumber)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        setPatientDetails({
          name: data.name || "",
          age: data.age || "",
          gender: data.gender || "Male"
        })
        setIsExistingPatient(true)
      } else {
        setIsExistingPatient(false)
      }
    } catch (error) {
      console.error("Error fetching patient:", error)
    }
    setSearching(false)
  }

  // --- ACTIONS ---

  function toggleMedicine(med) {
    if (activeMedId === med.id) {
      setActiveMedId(null)
    } else {
      setActiveMedId(med.id)
      resetEditForm(med.sellingPrice)
    }
  }

  function resetEditForm(defaultPrice = 0) {
    setQty(1)
    setCustomPrice(defaultPrice)
    setTimingDetails({})
    setFoodDetails({})
  }

  function addToCart(med) {
    if (qty > med.quantity) {
      alert(`Only ${med.quantity} in stock!`)
      return
    }

    const newItem = {
      medicineId: med.id,
      name: med.name,
      quantity: qty,
      costPrice: med.costPrice,
      sellingPrice: Number(customPrice),
      remainingQty: med.quantity - qty,
      timingDetails: { ...timingDetails }, 
      foodDetails: { ...foodDetails }     
    }

    setCart([...cart, newItem])
    setActiveMedId(null)
    setSearchTerm("")
    setTimeout(() => resetEditForm(), 300)
  }

  function removeFromCart(index) {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
  }

  // --- TIMING LOGIC ---
  function toggleTiming(time) {
    const newTiming = { ...timingDetails }
    const newFood = { ...foodDetails }

    if (newTiming[time]) {
      delete newTiming[time] 
      delete newFood[time] 
    } else {
      newTiming[time] = "1"
      newFood[time] = "After"
    }
    setTimingDetails(newTiming)
    setFoodDetails(newFood)
  }

  function setDosage(time, dosage) {
    setTimingDetails({ ...timingDetails, [time]: dosage })
  }

  function setFood(time, instruction) {
    setFoodDetails({ ...foodDetails, [time]: instruction })
  }

  // --- 2. WHATSAPP WITH NAME ---
  function sendToWhatsApp(phone, details, cartItems) {
    const date = new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })

    // Construct Patient String: "Rahul (24/M)"
    const patientStr = details.name 
      ? `${details.name} (${details.age}/${details.gender === "Male" ? "M" : "F"})`
      : phone

    const medicineListText = cartItems.map((item, index) => {
      const timingParts = Object.entries(item.timingDetails).map(([time, dose]) => {
        const food = item.foodDetails[time] || ""
        return `${time} (${dose}${food ? ` • ${food}` : ""})`
      })
      const timingStr = timingParts.length > 0 ? timingParts.join(", ") : "As advised"

      return `${index + 1}. *${item.name}* (Qty: ${item.quantity})\n   🕒 ${timingStr}`
    }).join("\n\n")

    const totalCost = cartItems.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0)

    const text = 
`🏥 *DEVMURARI CARE CLINIC*
👨‍⚕️ Dr. Devmurari
📅 ${date}

👤 *Patient:* ${patientStr}
📱 *Phone:* ${phone}
----------------------------
${medicineListText}
----------------------------
💰 *Total Bill:* ₹${totalCost}

_Get well soon!_ 🙏`

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const cleanPhone = phone.replace(/\D/g, "") 
    const finalPhone = cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone

    if (isMobile) {
      window.location.href = `whatsapp://send?phone=${finalPhone}&text=${encodeURIComponent(text)}`
    } else {
      window.open(`https://web.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(text)}`, '_blank')
    }
  }

  // --- 3. SAVE PATIENT + PRESCRIPTION ---
  async function handleFinalSave() {
    if (!phone || cart.length === 0) return
    if (!patientDetails.name) {
      if(!confirm("No Patient Name entered. Proceed anyway?")) return
    }

    setLoading(true)
    try {
      // A. Save/Update Patient Details
      await setDoc(doc(db, "patients", phone), {
        phone: phone,
        name: patientDetails.name,
        age: patientDetails.age,
        gender: patientDetails.gender,
        lastVisit: new Date()
      }, { merge: true }) // merge: true updates existing docs without overwriting everything

      // B. Save Prescription
      await savePrescription({
        patientPhone: phone,
        patientName: patientDetails.name, // Save name in bill too
        items: cart.map(item => ({
          medicineId: item.medicineId,
          name: item.name,
          quantity: item.quantity,
          costPrice: item.costPrice,
          sellingPrice: item.sellingPrice,
          remainingQty: item.remainingQty
        }))
      })

      if (confirm("Saved! Send via WhatsApp?")) {
        sendToWhatsApp(phone, patientDetails, cart)
      }

      // Reset
      setPhone("")
      setPatientDetails({ name: "", age: "", gender: "Male" })
      setCart([])
      refreshInventory()

    } catch (error) {
      console.error(error)
      alert("Error saving data")
    }
    setLoading(false)
  }

  const filteredInventory = inventory.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={styles.card}>
      <h3 style={styles.header}>New Prescription</h3>

      {/* --- PATIENT DETAILS SECTION --- */}
      <div style={styles.patientSection}>
        <div style={{marginBottom: "12px"}}>
          <label style={styles.label}>Mobile Number {searching && "⏳"}</label>
          <input
            style={styles.input}
            placeholder="9898..."
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Only show details form if phone is entered */}
        {phone.length > 0 && (
          <div style={styles.detailsGrid}>
            <div style={{flex: 2}}>
              <label style={styles.label}>Patient Name {isExistingPatient && "✅"}</label>
              <input 
                style={styles.input} 
                placeholder="Name"
                value={patientDetails.name}
                onChange={e => setPatientDetails({...patientDetails, name: e.target.value})}
              />
            </div>
            <div style={{flex: 1}}>
              <label style={styles.label}>Age</label>
              <input 
                style={styles.input} 
                type="number"
                placeholder="24"
                value={patientDetails.age}
                onChange={e => setPatientDetails({...patientDetails, age: e.target.value})}
              />
            </div>
            <div style={{flex: 1}}>
               <label style={styles.label}>Gender</label>
               <select 
                style={styles.input}
                value={patientDetails.gender}
                onChange={e => setPatientDetails({...patientDetails, gender: e.target.value})}
               >
                 <option value="Male">M</option>
                 <option value="Female">F</option>
               </select>
            </div>
          </div>
        )}
      </div>

      {/* --- CART --- */}
      {cart.length > 0 && (
        <div style={styles.cartContainer}>
          <h4 style={styles.cartHeader}>
            Medicines for {patientDetails.name || "Patient"} ({cart.length})
          </h4>
          {cart.map((item, index) => (
            <div key={index} style={styles.cartItem}>
              <div>
                <div style={{fontWeight: "bold"}}>{item.name}</div>
                <div style={{fontSize: "12px", color: "#64748b"}}>
                  Qty: {item.quantity} × ₹{item.sellingPrice} = ₹{item.sellingPrice * item.quantity}
                </div>
              </div>
              <button onClick={() => removeFromCart(index)} style={styles.removeBtn}>✕</button>
            </div>
          ))}
          <div style={styles.cartTotal}>
            Total: ₹{cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0)}
          </div>
        </div>
      )}

      {/* MEDICINE SEARCH & LIST (Same as before) */}
      <h4 style={styles.subHeader}>Add Medicine</h4>
      <input 
        style={styles.searchInput}
        placeholder="🔍 Search medicine..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div style={styles.listContainer}>
        {filteredInventory.map((med) => {
          const isOpen = activeMedId === med.id

          return (
            <div key={med.id} style={styles.medItemWrapper}>
              <button
                style={{ 
                  ...styles.medButton, 
                  background: isOpen ? "#eff6ff" : "white",
                  borderBottom: isOpen ? "1px solid #e5e7eb" : "none"
                }}
                onClick={() => toggleMedicine(med)}
              >
                <span style={{ fontWeight: isOpen ? "700" : "500", color: "#1e293b" }}>{med.name}</span>
                <span style={{ fontSize: "12px", color: med.quantity < 5 ? "#ef4444" : "#64748b" }}>
                  (Stock: {med.quantity})
                </span>
              </button>

              <div style={{
                ...styles.editorWrapper,
                maxHeight: isOpen ? "800px" : "0px",
                opacity: isOpen ? 1 : 0,
                padding: isOpen ? "12px" : "0 12px",
                borderWidth: isOpen ? "1px" : "0px",
              }}>
                  <div style={styles.row}>
                    <div style={{flex: 1}}>
                      <label style={styles.label}>Quantity</label>
                      <input
                        type="number"
                        min={1}
                        max={med.quantity}
                        value={qty}
                        style={styles.smallInput}
                        onChange={(e) => setQty(Number(e.target.value))}
                      />
                    </div>
                    <div style={{flex: 1}}>
                      <label style={styles.label}>Unit Price (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={customPrice}
                        style={{...styles.smallInput, borderColor: "#3b82f6"}}
                        onChange={(e) => setCustomPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px'}}>
                    {["Morning", "Afternoon", "Night"].map(time => {
                      const isSelected = timingDetails.hasOwnProperty(time)
                      return (
                        <div key={time} style={{
                          ...styles.timingBlock,
                          borderColor: isSelected ? "#3b82f6" : "#e2e8f0",
                          background: "white" 
                        }}>
                          <button 
                            onClick={() => toggleTiming(time)}
                            style={{
                              ...styles.timingHeaderBtn,
                              background: isSelected ? "#3b82f6" : "transparent",
                              color: isSelected ? "white" : "#64748b",
                              fontWeight: isSelected ? "700" : "500",
                              borderBottom: isSelected ? "1px solid #2563eb" : "none" 
                            }}
                          >
                            <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                              <div style={{
                                width: "16px", height: "16px", borderRadius: "4px", 
                                border: isSelected ? "1.5px solid white" : "2px solid #cbd5e1",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px"
                              }}>
                                {isSelected && "✓"}
                              </div>
                              {time}
                            </div>
                          </button>

                          {isSelected && (
                            <div style={styles.controlPanel}>
                              <div style={styles.controlRow}>
                                <span style={styles.tinyLabel}>Dose:</span>
                                <div style={styles.btnGroup}>
                                  {["1/2", "1", "2"].map(dose => (
                                    <button
                                      key={dose}
                                      onClick={() => setDosage(time, dose)}
                                      style={{
                                        ...styles.groupBtn,
                                        background: timingDetails[time] === dose ? "#3b82f6" : "white",
                                        color: timingDetails[time] === dose ? "white" : "#475569",
                                      }}
                                    >
                                      {dose}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div style={styles.controlRow}>
                                <span style={styles.tinyLabel}>Food:</span>
                                <div style={styles.btnGroup}>
                                  <button
                                    onClick={() => setFood(time, "Before")}
                                    style={{
                                      ...styles.groupBtn,
                                      background: foodDetails[time] === "Before" ? "#84cc16" : "white",
                                      color: foodDetails[time] === "Before" ? "white" : "#475569",
                                      borderColor: foodDetails[time] === "Before" ? "#65a30d" : "#e2e8f0"
                                    }}
                                  >
                                    Before
                                  </button>
                                  <button
                                    onClick={() => setFood(time, "After")}
                                    style={{
                                      ...styles.groupBtn,
                                      background: foodDetails[time] === "After" ? "#f97316" : "white",
                                      color: foodDetails[time] === "After" ? "white" : "#475569",
                                      borderColor: foodDetails[time] === "After" ? "#ea580c" : "#e2e8f0"
                                    }}
                                  >
                                    After
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <button onClick={() => addToCart(med)} style={styles.addBtn}>
                    Add to List ⬇️
                  </button>
              </div>
            </div>
          )
        })}
      </div>

      <button 
        style={{
          ...styles.saveBtn,
          opacity: (!phone || cart.length === 0 || loading) ? 0.5 : 1,
        }} 
        onClick={handleFinalSave}
        disabled={!phone || cart.length === 0 || loading}
      >
        {loading ? "Saving..." : `✅ Finalize & Send (${cart.length} items)`}
      </button>
    </div>
  )
}

const styles = {
  card: {
    background: "white", padding: "20px", borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0", paddingBottom: "30px"
  },
  header: { marginTop: 0, marginBottom: "16px", fontSize: "18px", color: "#1e293b" },
  subHeader: { fontSize: "14px", fontWeight: "600", color: "#64748b", marginBottom: "8px" },
  
  // NEW: Patient Section Styles
  patientSection: {
    background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px"
  },
  detailsGrid: { display: "flex", gap: "10px" },
  
  input: {
    width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px", outline: "none", background: "white", boxSizing: "border-box"
  },
  searchInput: {
    width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "12px", fontSize: "14px",
  },
  listContainer: { display: "flex", flexDirection: "column", gap: "10px" },
  medItemWrapper: { borderRadius: "10px", overflow: "hidden", border: "1px solid #e5e7eb", background: "white" },
  medButton: {
    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", cursor: "pointer", fontSize: "15px", transition: "all 0.2s",
    border: "none", outline: "none"
  },
  
  editorWrapper: {
    background: "#f8fafc", overflow: "hidden", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", borderTop: "none", borderColor: "#e2e8f0", borderStyle: "solid"
  },

  row: { display: "flex", gap: "15px", marginBottom: "16px" },
  label: { fontSize: "12px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "4px" },
  smallInput: { padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", fontSize: "16px" },
  addBtn: {
    width: "100%", padding: "12px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer"
  },
  
  timingBlock: { borderRadius: "10px", border: "1px solid", overflow: "hidden", transition: "all 0.2s" },
  timingHeaderBtn: { width: "100%", textAlign: "left", padding: "12px", border: "none", cursor: "pointer", fontSize: "14px" },
  controlPanel: { padding: "12px", display: "flex", flexDirection: "column", gap: "10px" },
  controlRow: { display: "flex", alignItems: "center", gap: "10px" },
  tinyLabel: { fontSize: "12px", color: "#94a3b8", width: "40px", fontWeight: "500" },
  btnGroup: { display: "flex", gap: "6px", flex: 1 },
  groupBtn: { flex: 1, padding: "8px 4px", fontSize: "13px", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "pointer", fontWeight: "600", transition: "all 0.15s" },

  cartContainer: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "12px", marginBottom: "20px" },
  cartHeader: { margin: "0 0 10px 0", fontSize: "14px", color: "#166534" },
  cartItem: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "8px", borderRadius: "8px", marginBottom: "6px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
  removeBtn: { background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "4px", width: "24px", height: "24px", cursor: "pointer", fontWeight: "bold" },
  cartTotal: { textAlign: "right", fontWeight: "bold", fontSize: "14px", marginTop: "8px", color: "#166534" },

  saveBtn: {
    width: "100%", padding: "16px", background: "#10b981", color: "white", fontSize: "16px", fontWeight: "700", border: "none", borderRadius: "12px", marginTop: "30px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
  }
}