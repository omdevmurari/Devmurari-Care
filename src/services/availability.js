import { doc, onSnapshot, updateDoc } from "firebase/firestore"
import { db } from "./firebase"

const availabilityRef = doc(db, "availability", "main")

// 🔴 REAL-TIME LISTENER
export function listenAvailability(callback) {
  return onSnapshot(availabilityRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data().isAvailable)
    }
  })
}

// 🔴 UPDATE VALUE
export async function setAvailability(value) {
  await updateDoc(availabilityRef, {
    isAvailable: value
  })
}
