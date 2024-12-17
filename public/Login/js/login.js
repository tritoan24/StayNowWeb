import { db, auth } from "../../assets/js/FireBaseConfig.js";
import {
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Hàm đăng nhập
function loginUser() {
  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  
  let hasError = false;
  if (!email) {
    document.getElementById("emailError").classList.remove("hidden");
    document.getElementById("error-message-email").textContent =
      "Vui lòng nhập tên tài khoản";
    hasError = true;
    return;
  } else {
    document.getElementById("emailError").classList.add("hidden");
  }

  if (!validateEmail(email)) {
    document.getElementById("emailError").classList.remove("hidden");
    document.getElementById("error-message-email").textContent =
      "Email không hợp lệ";
    hasError = true;
    return;
  } else {
    document.getElementById("emailError").classList.add("hidden");
  }

  if (!password) {
    document.getElementById("passwordError").classList.remove("hidden");
    document.getElementById("error-message-password-name").textContent =
      "Vui lòng nhập mật khẩu!";
    hasError = true;
    return;
  } else {
    document.getElementById("passwordError").classList.add("hidden");
  }

  // Đăng nhập với Firebase Authentication
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    console.log("User credential:", userCredential); // Kiểm tra userCredential
    const currentUser = userCredential.user;

    if (currentUser) {
      console.log("Current user:", currentUser); // Kiểm tra đối tượng user
      localStorage.setItem("userId", currentUser.uid);
      showToast("Đăng nhập thành công!");

        
      // Delay chuyển hướng sau khi Toast hiển thị
      setTimeout(() => {
        window.location.href = "../../../public/ThongKe.html"; // Chuyển hướng về trang chính
      }, 1500); // Chờ 3 giây để Toast hiển thị
    } else {
      console.error("Current user is null");
      alert("Không thể lấy thông tin người dùng.");
    }
  })
  .catch((error) => {
    console.error("Lỗi đăng nhập:", error.message); // Hiển thị lỗi chi tiết
    showToastFalse("Tên tài khoản hoặc mật khẩu không đúng!")
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
  ? "./Login/images/icons/ic-eye-hidden.png" 
  : "./Login/images/icons/ic-eye.svg";

 
});

document.getElementById("loginButton").addEventListener("click", function(event) {
    event.preventDefault();  // Ngăn chặn form submit
    loginUser();             // Gọi hàm đăng nhập
  });


  function showToast(message) {
    const toastContainer = document.getElementById("toastContainer");
  
    // Tạo toast
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
  
    // Thêm toast vào container
    toastContainer.appendChild(toast);
  
    // Xóa toast sau khi animation kết thúc
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  
  function showToastFalse(message) {
    const toastContainer = document.getElementById("toastContainerFalse");
  
    // Tạo toast
    const toast = document.createElement("div");
    toast.className = "toast-false";
    toast.textContent = message;
  
    // Thêm toast vào container
    toastContainer.appendChild(toast);
  
    // Xóa toast sau khi animation kết thúc
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
  