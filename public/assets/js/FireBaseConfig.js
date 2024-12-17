import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Cấu hình Firebase
// const firebaseConfig = {
//   apiKey: "AIzaSyBmpKO0lDHFiYb3zklAJ2zz6qC-iQrypw0",
//   authDomain: "staynowapp1.firebaseapp.com",
//   databaseURL: "https://staynowapp1-default-rtdb.firebaseio.com",
//   projectId: "staynowapp1",
//   storageBucket: "staynowapp1.appspot.com",
//   messagingSenderId: "918655571270",
//   appId: "1:918655571270:web:94abfaf87fbbb3e4ecc147",
//   measurementId: "G-PQP9CTPKGT",
// };

const firebaseConfig = {
  apiKey: "AIzaSyA-EHInpdkzzNF3z_GhMSQsqLC5GI7mYsc",
  authDomain: "reactnative-8e2ca.firebaseapp.com",
  databaseURL: "https://reactnative-8e2ca-default-rtdb.firebaseio.com",
  projectId: "reactnative-8e2ca",
  storageBucket: "reactnative-8e2ca.appspot.com",
  messagingSenderId: "826980793632",
  appId: "1:826980793632:web:41722d76fb0ef372776b45",
  measurementId: "G-DMMZ0JC2GE",
};

// Khởi tạo Firebase (tránh trùng lặp)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Khởi tạo các dịch vụ Firebase
const auth = getAuth(app); // Authentication
const database = getDatabase(app); // Realtime Database
const db = getFirestore(app); // Firestore

export { app, database, auth, db };
