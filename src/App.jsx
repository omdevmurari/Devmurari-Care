import { useEffect, useState } from "react"
import Header from "./components/Header"
import DoctorPanel from "./doctor/DoctorPanel"
import DoctorLogin from "./components/DoctorLogin"
import { useAuth } from "./context/AuthContext"
import { listenAvailability, setAvailability } from "./services/availability"

export default function App() {
  const { user, loading } = useAuth()
  const [available, setAvailable] = useState(false)
  
  // Failsafe: If Google/Firebase is slow, we won't wait forever.
  const [isTimeout, setIsTimeout] = useState(false)

  useEffect(() => {
    // If loading takes more than 2 seconds, force the app to open
    const timer = setTimeout(() => {
      setIsTimeout(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Listen to availability
  useEffect(() => {
    if (!user) return
    const unsubscribe = listenAvailability((value) => {
      setAvailable(value)
    })
    return () => unsubscribe()
  }, [user])

  async function toggleAvailability() {
    await setAvailability(!available)
    setAvailable(!available)
  }

  // 1. LOADING SCREEN (Improved)
  // We only show this if it's loading AND the timeout hasn't happened yet.
  if (loading && !isTimeout) {
    return (
      <div className="container">
        <Header />
        <div style={{ 
          padding: "60px 20px", 
          textAlign: "center", 
          color: "#64748b",
          fontWeight: "500"
        }}>
          Starting Clinic App...
        </div>
      </div>
    )
  }

  // 2. NOT LOGGED IN -> Show Login
  if (!user) {
    return (
      <div className="container">
        <Header />
        <DoctorLogin />
      </div>
    )
  }

  // 3. LOGGED IN -> Show Panel
  return (
    <div className="container">
      <Header />
      <DoctorPanel 
        available={available}
        // We pass 'false' to ensure the panel never blocks itself
        availabilityLoading={false} 
        onToggleAvailability={toggleAvailability}
      />
    </div>
  )
}