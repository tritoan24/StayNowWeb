import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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
  const roomsRef = collection(db, "PhongTro"); // Truy cập vào bộ sưu tập 'PhongTro'

  try {
    const querySnapshot = await getDocs(roomsRef); // Lấy tất cả tài liệu trong bộ sưu tập 'PhongTro'

    // Xử lý danh sách phòng trọ
    rooms = []; // Reset lại danh sách
    querySnapshot.forEach((doc) => {
      rooms.push({ id: doc.id, ...doc.data() }); // Lưu dữ liệu phòng trọ vào mảng 'rooms'
    });

    console.log("Danh sách phòng trọ:", rooms); // In danh sách phòng trọ ra console
    renderRoomList(rooms); // Gọi hàm render để hiển thị danh sách phòng trọ
  } catch (e) {
    console.error("Lỗi khi lấy danh sách phòng trọ:", e);
  }
}

function renderRoomList(rooms) {
  const roomListContainer = document.getElementById("roomList");
  roomListContainer.innerHTML = ""; // Xóa nội dung cũ

  rooms.forEach((room) => {
    const roomDiv = document.createElement("div");
    roomDiv.className = "room";
    roomDiv.id = `room${room.id}`;

    // Định dạng giá phòng thành VND
    const formattedPrice = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(room.Gia_phong);

    roomDiv.innerHTML = `
            <span>${room.Ten_phongtro}</span>
 <p><img src="../image/icons/ic-ping.svg" alt="Địa chỉ" class="room-icon"> ${room.Dia_chi}</p>
     <p><img src="../image/icons/ic-monny.svg" alt="Giá phòng" class="room-icon"> ${formattedPrice}</p>
            <div class="actions">
                <button class="approve" onclick="approveRoom('${room.id}')">Duyệt</button>
                <button class="cancel" onclick="cancelRoom('${room.id}')">Hủy</button>
            </div>
            <span class="details" onclick="viewDetails('${room.id}')">Xem chi tiết</span>
        `;

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

// Lắng nghe sự kiện DOMContentLoaded và gọi hàm fetchAllRooms
document.addEventListener("DOMContentLoaded", () => {
  fetchAllRooms(); // Gọi hàm để tải danh sách phòng trọ khi trang tải xong
});

window.viewDetails = viewDetails;
window.closeDetails = closeDetails;
window.changeSlide = changeSlide;
