import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp
} from "firebase/firestore"
import { db } from "./firebase"

// Fetch all inventory items
export async function getInventory() {
  const snapshot = await getDocs(collection(db, "inventory"))
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Add new medicine
export async function addMedicine(data) {
  await addDoc(collection(db, "inventory"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

// Update medicine (quantity / price / expiry)
export async function updateMedicine(id, updates) {
  const ref = doc(db, "inventory", id)
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}