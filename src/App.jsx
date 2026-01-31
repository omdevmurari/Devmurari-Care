import { useEffect, useState } from "react"
import Header from "./components/Header"
import DoctorPanel from "./doctor/DoctorPanel"
import DoctorLogin from "./components/DoctorLogin"
import { useAuth } from "./context/AuthContext"
import { listenAvailability, setAvailability } from "./services/availability"

// THIS FILE IS STRICTLY FOR LOGIC. NO UI ELEMENTS ALLOWED.
export default function App() {
  const { user, loading } = useAuth()
  const [available, setAvailable] = useState(false)
  
  // 🛑 FIX IS HERE: Changed from 'true' to 'false'
  // This prevents the "Loading..." loop even if the database is empty.
  const [availabilityLoading, setAvailabilityLoading] = useState(false)

  // Listen to availability
  useEffect(() => {
    if (!user) return
    const unsubscribe = listenAvailability((value) => {
      // If the database connects, update the status
      setAvailable(value)
      // Ensure loading is off
      setAvailabilityLoading(false)
    })
    return () => unsubscribe()
  }, [user])

  // Function to toggle status
  async function toggleAvailability() {
    // 🪄 MAGIC: Clicking this will RE-CREATE the deleted database file!
    await setAvailability(!available)
    setAvailable(!available) // Update UI instantly
  }

  // 1. Loading State (Auth)
  if (loading) {
    return <div style={{ padding: 20, textAlign: "center" }}>Loading App...</div>
  }

  // 2. Not Logged In -> Show Login
  if (!user) {
    return (
      <div className="container">
        <Header />
        <DoctorLogin />
      </div>
    )
  }

  // 3. Logged In -> Show Panel
  return (
    <div className="container">
      <Header />
      <DoctorPanel 
        available={available}
        availabilityLoading={availabilityLoading}
        onToggleAvailability={toggleAvailability}
      />
    </div>
  )
}