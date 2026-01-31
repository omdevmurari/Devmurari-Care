import { doc, onSnapshot, setDoc } from "firebase/firestore"
import { db } from "./firebase"

// We use the ID 'status' for the availability document
const availabilityRef = doc(db, "availability", "status")

export function listenAvailability(callback) {
  return onSnapshot(availabilityRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().online)
    } else {
      // If document is missing (deleted), default to Offline (false)
      callback(false)
    }
  })
}

export async function setAvailability(isOnline) {
  // FIX: Use 'setDoc' with merge: true
  // This Creates the document if it's missing, or Updates it if it exists.
  await setDoc(availabilityRef, { online: isOnline }, { merge: true })
}