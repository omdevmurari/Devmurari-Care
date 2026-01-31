import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyChZVlaA3aLh0EOoikVn2Pf-5kcx3DQlbk",
  authDomain: "devmurari-care.firebaseapp.com",
  projectId: "devmurari-care",
  storageBucket: "devmurari-care.firebasestorage.app",
  messagingSenderId: "693950362498",
  appId: "1:693950362498:web:ffa465d8b867e9ae68959b"
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
