import { auth } from "./FireBaseConfig.js"; 
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

document.getElementById("logoutButton").addEventListener("click", function () {
  // Hiển thị modal xác nhận đăng xuất
  showLogoutConfirmModal(logoutUser);
});

// Hàm hiển thị modal xác nhận logout
function showLogoutConfirmModal(logoutCallback) {
  const modal = document.getElementById("logoutConfirmModal");
  modal.classList.remove("modalHidden");
  modal.style.display = "block";

  // Xử lý khi nhấn đồng ý
  document.getElementById("confirmLogout").onclick = async function () {
    await logoutCallback();
    hideModalLogout(modal);
  };

  // Xử lý khi nhấn hủy
  document.getElementById("cancelLogout").onclick = () => hideModalLogout(modal);

  // Đóng modal khi nhấn ra ngoài
  window.onclick = function (event) {
    if (event.target === modal) {
      hideModalLogout(modal);
    }
  };
}

// Hàm ẩn modal xác nhận logout
function hideModalLogout(modal) {
  modal.classList.add("modalHidden");
  modal.style.display = "none";
}

// Hàm thực hiện đăng xuất
async function logoutUser() {
  try {
    await signOut(auth); // Đăng xuất khỏi Firebase
    localStorage.removeItem("userId"); // Xóa thông tin người dùng khỏi localStorage

    // Hiển thị modal thông báo thành công
    showToast("Đăng xuất thành công!");

    // Delay chuyển hướng sau khi Toast hiển thị
    setTimeout(() => {
      window.location.href = "../public/Login/Login.html"; // Chuyển hướng về trang chính
    }, 1500); // Chờ 3 giây để Toast hiển thị

  } catch (error) {
    alert("Đã xảy ra lỗi khi đăng xuất: " + error.message);
  }
}


// Hàm ẩn modal thành công
function hideModal(modal) {
  modal.classList.add("modalHidden");
  modal.style.display = "none";
}



function showToast(message) {
  const toastContainer = document.getElementById("toastContainer");

  // Kiểm tra xem phần tử toastContainer có tồn tại không
  if (!toastContainer) {
    console.error("Toast container not found!");
    return;
  }

  // Tạo toast
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  // Thêm toast vào container
  toastContainer.appendChild(toast);

  // Xóa toast sau khi animation kết thúc
  setTimeout(() => {
    toast.remove();
  },1500);
}
