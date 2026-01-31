import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "../services/firebase"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
      setUser(firebaseUser)

      const userRef = doc(db, "users", firebaseUser.uid)
      const snap = await getDoc(userRef)

      if (!snap.exists() || snap.data().role !== "doctor") {
        // 🚫 Block non-doctor access
        await signOut(auth)
        alert("Access denied")
        setUser(null)
        setRole(null)
      } else {
        setRole("doctor")
      }
    } else {
      setUser(null)
      setRole(null)
    }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
