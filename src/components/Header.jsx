import { useAuth } from "../context/AuthContext"
import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../services/firebase"

export default function Header() {
  const { user, logout } = useAuth()
  const [displayName, setDisplayName] = useState("Loading...")

  useEffect(() => {
    async function getUserDetails() {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid)
          const docSnap = await getDoc(docRef)

          if (docSnap.exists()) {
            // 1. If we found the name in DB, show it (e.g. "Dr. Devmurari")
            setDisplayName(docSnap.data().name || "Doctor")
          } else {
            // 2. If no DB record exists yet, assume it's the Doctor
            setDisplayName("Doctor")
          }
        } catch (error) {
          setDisplayName("Doctor")
        }
      }
    }
    getUserDetails()
  }, [user])

  return (
    <div style={styles.header}>
      <div style={styles.textGroup}>
        <h1 style={styles.title}>Devmurari Care</h1>
        <p style={styles.subtitle}>Your clinic, now digital</p>
        
        {user && (
          <div style={styles.roleTag}>
            Logged in as <span style={{fontWeight: "700", color: "white"}}>{displayName}</span>
          </div>
        )}
      </div>

      {user && (
        <button onClick={logout} style={styles.logoutBtn}>
          Logout
        </button>
      )}
    </div>
  )
}

const styles = {
  header: {
    background: "linear-gradient(135deg, #2563eb, #1e40af)",
    color: "white",
    padding: "24px",
    borderRadius: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4)"
  },
  textGroup: { display: "flex", flexDirection: "column", gap: "4px" },
  title: { margin: 0, fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" },
  subtitle: { margin: 0, fontSize: "14px", opacity: 0.9, fontWeight: "400" },
  
  roleTag: { 
    marginTop: "12px", 
    fontSize: "13px", 
    background: "rgba(255,255,255,0.2)", 
    padding: "4px 10px", 
    borderRadius: "20px",
    width: "fit-content",
    backdropFilter: "blur(4px)"
  },

  logoutBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "white",
    padding: "10px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s"
  }
}