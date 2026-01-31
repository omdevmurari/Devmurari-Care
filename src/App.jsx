import { useEffect, useState } from "react"
import Header from "./components/Header"
import DoctorPanel from "./doctor/DoctorPanel"
import { useAuth } from "./context/AuthContext"
import { listenAvailability, setAvailability } from "./services/availability"
import DoctorLogin from "./components/DoctorLogin"

export default function App() {
  const { user, loading } = useAuth()
  const [available, setAvailable] = useState(false)
  const [availabilityLoading, setAvailabilityLoading] = useState(true)

  // Listen to doctor availability in real time
  useEffect(() => {
    if (!user) return

    const unsubscribe = listenAvailability((value) => {
      setAvailable(value)
      setAvailabilityLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  async function toggleAvailability() {
    await setAvailability(!available)
  }

  // Auth still loading
  if (loading) {
    return <p style={{ padding: 20 }}>Loading...</p>
  }

  // Not logged in → doctor login only
    if (!user) {
    return (
      <div className="container">
        <Header />
        <DoctorLogin />
      </div>
    )
  }

  // Logged in → full doctor app
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