import { signOut } from "firebase/auth"
import { auth } from "../services/firebase"
import { useAuth } from "../context/AuthContext"

export default function Header() {
  const { user, role } = useAuth()

  async function handleLogout() {
    await signOut(auth)
  }

  return (
    <div className="header-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12
        }}
      >
        <div>
          <h1>Devmurari Care</h1>
          <p>Your clinic, now digital</p>
        </div>

        {user && (
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: 14,
              color: "white"
            }}
          >
            Logout
          </button>
        )}
      </div>

      {user && (
        <p style={{ marginTop: 12, fontSize: 14, opacity: 0.9 }}>
          Logged in as{" "}
          <strong>{role === "doctor" ? "Doctor" : "Patient"}</strong>
        </p>
      )}
    </div>
  )
}