// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getDatabase } from "firebase/database"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDKnMkAiE4RdNfUj03qi3Cyen4VbhTwPHs",
  authDomain: "mermage-js.firebaseapp.com",
  databaseURL:
    "https://mermage-js-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mermage-js",
  storageBucket: "mermage-js.appspot.com",
  messagingSenderId: "872076286819",
  appId: "1:872076286819:web:64b53013f8ba1fb81bd156",
  measurementId: "G-FETK93FXP4",
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

export const database = getDatabase()
