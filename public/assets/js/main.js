import { database, db } from "./FireBaseConfig.js";
import {
  collection,
  getDocs,
  
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";




// Biến toàn cục để lưu trữ danh sách phòng trọ
let data = [];
let alldata = []; // Danh sách gốc

const totalRoomsElement = document.querySelector(".card .numbers");
const Phongtro = document.querySelector(".card");

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
// Hàm lấy dữ liệu từ Firestore
async function fetchData() {
  const dataref = collection(db, "PhongTro");

  try {
    const querySnapshot = await getDocs(dataref);
    data = []; // Reset danh sách
    alldata = []; // Reset danh sách

    querySnapshot.forEach((doc) => {
      const furniture = { id: doc.id, ...doc.data() };
      alldata.push(furniture); // Lưu vào danh sách gốc
      data.push(furniture); // Lưu vào danh sách hiển thị
    });

    console.log(data);
    generateStatistics(data);
  } catch (e) {
    console.error("Lỗi khi lấy danh sách nội thất!:", e);
  }
}

// Gọi fetchData để log dữ liệu khi trang được tải
fetchData();
function generateStatistics(data) {
  const totalRooms = data.length;
  return {
    totalRooms,
  };

  // Cập nhật nội dung với tổng số phòng
}

// Sau khi fetchData và generateStatistics
fetchData().then(() => {
  const stats = generateStatistics(alldata);

  totalRoomsElement.textContent = stats.totalRooms;
});

//click vào thống kê phòng trọ thì chuyển sang trang thống kê phòng trọ
Phongtro.addEventListener("click", function () {
  window.location.href = "./Dashboard/PhongTro.html";
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
