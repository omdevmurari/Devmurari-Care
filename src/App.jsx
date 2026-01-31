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
  const [availabilityLoading, setAvailabilityLoading] = useState(true)

  // Listen to availability
  useEffect(() => {
    if (!user) return
    const unsubscribe = listenAvailability((value) => {
      setAvailable(value)
      setAvailabilityLoading(false)
    })
    return () => unsubscribe()
  }, [user])

  // Function to toggle status
  async function toggleAvailability() {
    await setAvailability(!available)
  }

  // 1. Loading State
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
  // Notice: No buttons here. Just passing data to DoctorPanel.
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