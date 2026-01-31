import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore"
import { db } from "./firebase"

export async function savePrescription({ patientPhone, items }) {
  let billTotal = 0
  let profit = 0

  const billItems = items.map((i) => {
    const total = i.quantity * i.sellingPrice
    billTotal += total
    profit += (i.sellingPrice - i.costPrice) * i.quantity

    return {
      name: i.name,
      quantity: i.quantity,
      costPrice: i.costPrice,
      sellingPrice: i.sellingPrice,
      total
    }
  })

  // 1️⃣ Save prescription
  await addDoc(collection(db, "prescriptions"), {
    patientPhone,
    items: billItems,
    createdAt: serverTimestamp()
  })

  // 2️⃣ Save bill
  await addDoc(collection(db, "bills"), {
    patientPhone,
    items: billItems,
    billTotal,
    profit,
    createdAt: serverTimestamp()
  })

  // 3️⃣ Reduce inventory
  for (const item of items) {
    const ref = doc(db, "inventory", item.medicineId)
    await updateDoc(ref, {
      quantity: item.remainingQty
    })
  }
}