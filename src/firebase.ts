import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyC8gq6vcfD7xfnL2wTVmy1_UJ3kb_32BIU",
  authDomain: "football-43f34.firebaseapp.com",
  projectId: "football-43f34",
  storageBucket: "football-43f34.firebasestorage.app",
  messagingSenderId: "305302443221",
  appId: "1:305302443221:web:2cb89807db73161440fe5c"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
