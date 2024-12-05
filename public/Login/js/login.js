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
      const currentUser = userCredential.user;

      if (currentUser) {
        // Truy cập vào thông tin người dùng trong Realtime Database
        const userRef = ref(database, "NguoiDung/" + currentUser.uid);

        get(userRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              const status = data.trang_thaitaikhoan || "HoatDong";
              const accountType = data.loai_taikhoan;

              if (status === "HoatDong") {
                // Lưu thông tin đăng nhập vào localStorage
                localStorage.setItem("is_logged_in", "true");
                localStorage.setItem("accountType", accountType);
                alert("Đăng nhập thành công");
                // Chuyển đến trang chính
                window.location.href = "../../../public/index.html";
              } else {
                alert("Tài khoản của bạn đã bị khóa");
              }
            } else {
              alert("Không tìm thấy thông tin người dùng");
            }
          })
          .catch((error) => {
            alert("Lỗi kết nối đến máy chủ: " + error.message);
          });
      }
    })
    .catch((error) => {
      alert("Email hoặc mật khẩu không đúng: " + error.message);
    });
}

// Kiểm tra email hợp lệ
function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

document.getElementById("loginButton").addEventListener("click", function(event) {
    event.preventDefault();  // Ngăn chặn form submit
    loginUser();             // Gọi hàm đăng nhập
  });
