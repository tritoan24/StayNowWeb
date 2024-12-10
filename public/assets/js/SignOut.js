import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmpKO0lDHFiYb3zklAJ2zz6qC-iQrypw0",
  authDomain: "staynowapp1.firebaseapp.com",
  projectId: "staynowapp1",
  storageBucket: "staynowapp1.appspot.com",
  messagingSenderId: "918655571270",
  appId: "1:918655571270:web:94abfaf87fbbb3e4ecc147",
  measurementId: "G-PQP9CTPKGT",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Khởi tạo Authentication

document.getElementById("logoutButton").addEventListener("click", function () {
  signOut(auth)
    .then(() => {
      localStorage.removeItem("is_logged_in");
      localStorage.removeItem("accountType");

      alert("Bạn đã đăng xuất thành công.");
      window.location.href = "../public/Login/Login.html";
    })
    .catch((error) => {
      alert("Đã xảy ra lỗi khi đăng xuất: " + error.message);
    });
});
