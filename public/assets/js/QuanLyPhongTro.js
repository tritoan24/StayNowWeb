import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
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
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const dbRT = getDatabase(app);

// Biến toàn cục để lưu trữ danh sách phòng trọ
let rooms = [];
let currentRoomId = null;
let currentSlide = 0;

async function fetchAllRooms() {
  const roomsRef = collection(db, "PhongTro");

  try {
    // Lọc phòng với điều kiện `Trang_thailuu` và `Trang_thaiphong` đều false
    const roomsQuery = query(
      roomsRef,
      where("Trang_thailuu", "==", false),
      where("Trang_thaiphong", "==", false)
    );
    const querySnapshot = await getDocs(roomsQuery);

    const approvedRooms = [];
    const canceledRooms = [];
    const pendingRooms = [];

    querySnapshot.forEach((doc) => {
      const room = { id: doc.id, ...doc.data() };
      if (room.Trang_thaiduyet === "DaDuyet") {
        approvedRooms.push(room);
      } else if (room.Trang_thaiduyet === "BiHuy") {
        canceledRooms.push(room);
      } else if (room.Trang_thaiduyet === "ChoDuyet") {
        pendingRooms.push(room);
      }
    });

    // Hiển thị danh sách phòng trọ theo từng trạng thái
    renderRoomList(approvedRooms, "approvedRoomList");
    renderRoomList(canceledRooms, "canceledRoomList");
    renderRoomList(pendingRooms, "pendingRoomList");
  } catch (e) {
    console.error("Lỗi khi lấy danh sách phòng trọ:", e);
  }
}

function renderRoomList(rooms, containerId) {
  const roomListContainer = document.getElementById(containerId);
  roomListContainer.innerHTML = "";

  rooms.forEach((room) => {
    const formattedPrice = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(room.Gia_phong);

    const roomDiv = document.createElement("div");
    roomDiv.className = "room";

    // Thêm logic hiển thị nút theo trạng thái
    let actionButtons = "";
    if (room.Trang_thaiduyet === "ChoDuyet") {
      actionButtons = `
        <button class="btn approve">Duyệt</button>
        <button class="btn cancel">Hủy</button>
      `;
    } else if (room.Trang_thaiduyet === "BiHuy") {
      actionButtons = `
        <button class="btn revert">Duyệt lại</button>
      `;
    }

    roomDiv.innerHTML = `
      <div class="room-card">
        <div class="room-image">
          <img src="${room.imageUrls[0]}" alt="${room.Ten_phongtro}" />
        </div>
        <div class="room-info">
          <h3 class="room-title">${room.Ten_phongtro}</h3>
          <div class="room-address">
            <img src="./assets/imgs/icons/ic-ping.svg" alt="${room.Dia_chi}">
            <p>${room.Dia_chi}</p>
          </div>
          <div class="room-price">
            <img src="./assets/imgs/icons/ic-monny.svg" alt="${room.Dia_chi}">
            <p>${formattedPrice}</p>
          </div>
          <div class="room-details">
            <span class="details-link" onclick="viewDetails('${room.id}')">Xem chi tiết</span>
          </div>
          <div class="room-actions">${actionButtons}</div>
        </div>
      </div>
    `;

    // Thêm sự kiện cho các nút hành động
    if (room.Trang_thaiduyet !== "DaDuyet") {
      roomDiv
        .querySelector(".approve")
        ?.addEventListener("click", () => approveRoom(room.id));
    }
    if (room.Trang_thaiduyet !== "BiHuy") {
      roomDiv
        .querySelector(".cancel")
        ?.addEventListener("click", () => cancelRoom(room.id));
    }

    if (room.Trang_thaiduyet !== "ChoDuyet") {
      roomDiv
        .querySelector(".revert")
        ?.addEventListener("click", () => revertToPending(room.id));
    }

    roomListContainer.appendChild(roomDiv);
  });
}

// Hàm lấy thông tin người dùng từ Realtime Database
async function getUserInfo(maNguoiDung) {
  try {
    const userRef = ref(dbRT, `NguoiDung/${maNguoiDung}`); // Tham chiếu đến nút "NguoiDung/{Ma_nguoidung}" trong Realtime Database
    const snapshot = await get(userRef); // Lấy dữ liệu từ Realtime Database

    if (snapshot.exists()) {
      return snapshot.val(); // Trả về dữ liệu người dùng
    } else {
      console.error("Không tìm thấy người dùng với Ma_nguoidung:", maNguoiDung);
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return null;
  }
}

// Hàm hiển thị chi tiết phòng trọ
async function viewDetails(roomId) {
  const room = rooms.find((r) => r.id === roomId);
  currentRoomId = roomId; // Cập nhật roomId hiện tại

  if (room) {
    try {
      // Lấy thông tin người dùng từ Realtime Database
      const userInfo = await getUserInfo(room.Ma_nguoidung);

      const loaiPhongRef = doc(db, "LoaiPhong", room.Ma_loaiphong); // Truy cập tài liệu trong bộ sưu tập 'LoaiPhong'
      const loaiPhongSnapshot = await getDoc(loaiPhongRef);

      // Lấy thông tin giới tính
      const gioiTinhRef = doc(db, "GioiTinh", room.Ma_gioiTinh); // Truy cập tài liệu trong bộ sưu tập 'GioiTinh'
      const gioiTinhSnapshot = await getDoc(gioiTinhRef);

      if (loaiPhongSnapshot.exists() && gioiTinhSnapshot.exists()) {
        const loaiPhongData = loaiPhongSnapshot.data();
        const gioiTinhData = gioiTinhSnapshot.data();

        const roomDetails = document.getElementById("roomDetails");
        roomDetails.innerHTML = `
            <strong>Tên phòng:</strong> ${room.Ten_phongtro} <br>
            <strong>Địa chỉ:</strong> ${room.Dia_chi} <br>
            <strong>Giá phòng:</strong> ${new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(room.Gia_phong)} <br>
            <strong>Mô tả chi tiết:</strong> ${room.Mota_chitiet} <br>
            <strong>Số lượt xem:</strong> ${room.So_luotxemphong} <br>
            <strong>Loại phòng:</strong> ${loaiPhongData.Ten_loaiphong} <br>
            <strong>Giới tính:</strong> ${gioiTinhData.Ten_gioitinh} <br> 
             <strong>Tên người dùng:</strong> ${userInfo.ho_ten} 
        `;

        const imageContainer = document.getElementById("roomImages");
        const carouselImages = imageContainer.querySelector(".carousel-images");
        carouselImages.innerHTML = ""; // Xóa ảnh cũ

        // Thêm ảnh vào slide
        room.imageUrls.forEach((url) => {
          const imgElement = document.createElement("img");
          imgElement.src = url;
          imgElement.alt = room.Ten_phongtro;
          carouselImages.appendChild(imgElement);
        });

        // Hiển thị hộp thoại và lớp phủ mờ
        document.getElementById("detailDialog").style.display = "block";
        document.getElementById("overlay").style.display = "block";

        // Reset slide về ảnh đầu tiên
        currentSlide = 0;
        updateSlidePosition();
      } else {
        console.error(
          "Không tìm thấy loại phòng với Ma_loaiphong:",
          room.Ma_loaiphong
        );
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin loại phòng:", error);
    }
  }
}

// Hàm thay đổi slide (tiến/lùi)
function changeSlide(direction) {
  const room = rooms.find((r) => r.id === currentRoomId);
  const totalSlides = room.imageUrls.length;

  // Cập nhật chỉ số slide hiện tại
  currentSlide = (currentSlide + direction + totalSlides) % totalSlides;

  updateSlidePosition();
}

// Hàm cập nhật vị trí của slide
function updateSlidePosition() {
  const imageContainer = document.getElementById("roomImages");
  const carouselImages = imageContainer.querySelector(".carousel-images");

  // Di chuyển ảnh theo chỉ số slide hiện tại
  carouselImages.style.transform = `translateX(-${currentSlide * 100}%)`;
}

// Hàm đóng dialog khi người dùng nhấn "Đóng"
function closeDetails() {
  document.getElementById("detailDialog").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}
function goBack() {
  if (document.referrer) {
    window.history.back(); // Quay về trang trước nếu có trang trước
  } else {
    console.log("Không có trang trước để quay lại.");
  }
}

function searchRooms() {
  const searchInput = document
    .getElementById("searchInput")
    .value.toLowerCase(); // Lấy giá trị tìm kiếm và chuyển thành chữ thường

  // Lọc các phòng trọ dựa trên tên hoặc địa chỉ (hoặc các thuộc tính khác)
  const filteredRooms = rooms.filter(
    (room) =>
      room.Ten_phongtro.toLowerCase().includes(searchInput) || // Tìm theo tên phòng
      room.Dia_chi.toLowerCase().includes(searchInput) // Tìm theo địa chỉ
  );

  // Gọi hàm render lại danh sách phòng trọ sau khi lọc
  renderRoomList(filteredRooms);
}

// Lắng nghe sự kiện DOMContentLoaded và gọi hàm fetchAllRooms
document.addEventListener("DOMContentLoaded", () => {
  fetchAllRooms(); // Gọi hàm để tải danh sách phòng trọ khi trang tải xong
});

// Hàm duyệt phòng và cập nhật trạng thái trong Firestore
function approveRoom(roomId) {
  const roomRef = doc(db, "PhongTro", roomId); // Lấy tham chiếu đến phòng

  // Sử dụng updateDoc để cập nhật dữ liệu trong Firestore
  updateDoc(roomRef, {
    Trang_thaiduyet: "DaDuyet",
    Trang_thailuu: false,
    Trang_thaiphong: false,
  })
    .then(() => {
      alert("Phòng đã được duyệt!");
      fetchAllRooms();
    })
    .catch((error) => {
      console.error("Có lỗi xảy ra khi duyệt phòng: ", error);
      alert("Đã có lỗi xảy ra, vui lòng thử lại.");
    });
}

// Hàm hủy duyệt phòng và cập nhật trạng thái trong Firestore
function cancelRoom(roomId) {
  const roomRef = doc(db, "PhongTro", roomId);

  updateDoc(roomRef, {
    Trang_thaiduyet: "BiHuy",
  })
    .then(() => {
      alert("Phòng đã bị hủy!");
      fetchAllRooms(); // Tải lại danh sách phòng trọ để cập nhật giao diện
    })
    .catch((error) => {
      console.error("Có lỗi xảy ra khi hủy phòng: ", error);
      alert("Đã có lỗi xảy ra, vui lòng thử lại.");
    });
}

function revertToPending(roomId) {
  const roomRef = doc(db, "PhongTro", roomId);

  updateDoc(roomRef, {
    Trang_thaiduyet: "ChoDuyet",
  })
    .then(() => {
      alert("Phòng đã chuyển về trạng thái Chờ duyệt!");
      fetchAllRooms(); // Tải lại danh sách phòng trọ để cập nhật giao diện
    })
    .catch((error) => {
      console.error("Có lỗi xảy ra khi chuyển trạng thái: ", error);
      alert("Đã có lỗi xảy ra, vui lòng thử lại.");
    });
}

window.viewDetails = viewDetails;
window.closeDetails = closeDetails;
window.changeSlide = changeSlide;
window.goBack = goBack;
window.searchRooms = searchRooms;
