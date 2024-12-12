import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBmpKO0lDHFiYb3zklAJ2zz6qC-iQrypw0",
  authDomain: "staynowapp1.firebaseapp.com",
  projectId: "staynowapp1",
  storageBucket: "staynowapp1.appspot.com",
  messagingSenderId: "918655571270",
  appId: "1:918655571270:web:94abfaf87fbbb3e4ecc147",
  measurementId: "G-PQP9CTPKGT",
  databaseURL: "https://staynowapp1-default-rtdb.firebaseio.com/", // URL Realtime Database
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Khởi tạo Firebase Authentication
const database = getDatabase(app); // Khởi tạo Firebase Realtime Database

// Hàm đăng nhập
function loginUser() {
  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  if (!validateEmail(email)) {
    alert("Email không hợp lệ");
    return;
  }

  // Đăng nhập với Firebase Authentication
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    console.log("User credential:", userCredential); // Kiểm tra userCredential
    const currentUser = userCredential.user;

    if (currentUser) {
      console.log("Current user:", currentUser); // Kiểm tra đối tượng user
      localStorage.setItem("userId", currentUser.uid);
      alert("Đăng nhập thành công!");
      window.location.href = "../../../public/index.html";
    } else {
      console.error("Current user is null");
      alert("Không thể lấy thông tin người dùng.");
    }
  })
  .catch((error) => {
    console.error("Lỗi đăng nhập:", error.message); // Hiển thị lỗi chi tiết
    alert("Email hoặc mật khẩu không đúng: " + error.message);
  });

}

// Kiểm tra email hợp lệ
function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}


const passwordInput = document.getElementById("password")
const togglePassword = document.getElementById("togglePassword");
// Lắng nghe sự kiện click
togglePassword.addEventListener("click", () => {
  // Kiểm tra loại input hiện tại
  const isPassword = passwordInput.type === "password";

  // Đổi loại input thành text hoặc password
  passwordInput.type = isPassword ? "text" : "password";

  togglePassword.src = isPassword 
  ? "./images/icons/ic-eye-hidden.png" 
  : "./images/icons/ic-eye.svg";

 
});

document.getElementById("loginButton").addEventListener("click", function(event) {
    event.preventDefault();  // Ngăn chặn form submit
    loginUser();             // Gọi hàm đăng nhập
  });
