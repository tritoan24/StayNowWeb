import { db, database, auth } from "./FireBaseConfig.js";
import {  ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import {
    getAuth,
    signOut,
  } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";




// add hovered class to selected list item
let list = document.querySelectorAll(".navigation li");

function activeLink() {
  list.forEach((item) => {
    item.classList.remove("hovered");
  });
  this.classList.add("hovered");
}

list.forEach((item) => item.addEventListener("mouseover", activeLink));

// Menu Toggle
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};

function navigateTo(url) {
    window.location.href = url; // Chuyển hướng trình duyệt đến URL được truyền vào
}


document.getElementById('main').addEventListener('click', function (event) {
    if (event.target && event.target.id === 'btnPhongTro') {
        navigateTo('QuanLyPhongTro.html');
    }
    if (event.target && event.target.id === 'btnthongtin') {
        navigateTo('QuanLyThongTin.html');
    }
    if (event.target && event.target.id === 'btndichvu') {
        navigateTo('QuanLyDichVu.html');
    }
    if (event.target && event.target.id === 'btntiennghi') {
        navigateTo('QuanLyTienNghi.html');
    }
    if (event.target && event.target.id === 'btnnoihthat') {
        navigateTo('QuanLyNoiThat.html');
    }
    if (event.target && event.target.id === 'btnNhanVien') {
        navigateTo('QuanLyNhanVien.html');
    }
});



//lấy thông tin người dùng
document.addEventListener("DOMContentLoaded", () => {
    // Lấy `uid` từ `localStorage`
    const userId = localStorage.getItem("userId");
  
    if (!userId) {
      alert("Bạn chưa đăng nhập!");
      window.location.href = "../../../public/Login/Login.html";
      return;
    }
  
    // Truy vấn thông tin người dùng từ Firebase
    const userRef = ref(database, "NguoiDung/" + userId);
  
    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
  
          // Hiển thị thông tin người dùng trên màn hình chính
          console.log("Thông tin người dùng:", userData);
  
          // Ví dụ: Cập nhật thông tin người dùng trên giao diện
          document.getElementById("userName").textContent = userData.ho_ten;
          document.getElementById("userAvatar").src =
            userData.anh_daidien || "default-avatar.png";
        } else {
          alert("Không tìm thấy thông tin người dùng!");
        }
      })
      .catch((error) => {
        console.error("Lỗi kết nối đến máy chủ:", error.message);
      });
  });

