import { db, database } from "./FireBaseConfig.js";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";



// Biến toàn cục để lưu trữ danh sách phòng trọ
let rooms = [];
let currentRoomId = null;
let currentSlide = 0;

let pendingRooms = [];
let approvedRooms = [];
let canceledRooms = [];

async function fetchAllRooms() {
  const roomsRef = collection(db, "PhongTro");

  try {
    const roomsQuery = query(
      roomsRef,
      where("Trang_thailuu", "==", false),
      where("Trang_thaiphong", "==", false)
    );
    const querySnapshot = await getDocs(roomsQuery);
    querySnapshot.forEach((doc) => {
      rooms.push({ id: doc.id, ...doc.data() });
    });

    // Đặt lại các mảng trước khi thêm dữ liệu mới
    pendingRooms = [];
    approvedRooms = [];
    canceledRooms = [];

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

function redirectToChat(element) {
  // Lấy id từ data-user-id
  const userId = element.getAttribute('data-user-id');

  if (userId) {
    // Lưu userId vào localStorage hoặc sessionStorage
    localStorage.setItem('chatUserId', userId);

    // Chuyển hướng đến trang chat
    window.location.href = '../../public/QuanLyTinNhanHoTro.html';
  } else {
    console.error('User ID not found!');
  }
}



function renderRoomList(rooms, containerId) {
  const roomListContainer = document.getElementById(containerId);
  roomListContainer.innerHTML = "";

  if (!roomListContainer) {
    console.error(`Không tìm thấy phần tử với id: ${containerId}`);
    return;
  }

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
    const userRef = ref(database, `NguoiDung/${maNguoiDung}`); // Tham chiếu đến nút "NguoiDung/{Ma_nguoidung}" trong Realtime Database
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

async function getNoiThatByPhongTro(maPhongTro) {
  const q = query(
    collection(db, "PhongTroNoiThat"),
    where("ma_phongtro", "==", maPhongTro)
  );
  const querySnapshot = await getDocs(q);
  const noiThat = [];
  querySnapshot.forEach((doc) => {
    noiThat.push(doc.data().ma_noithat); // Lấy ma_noithat
  });
  return noiThat;
}

async function getNoiThatData(noiThatIds) {
  const noiThatData = [];
  for (let noiThatId of noiThatIds) {
    const noiThatRef = doc(db, "NoiThat", noiThatId); // Lấy từng document ID
    const noiThatSnapshot = await getDoc(noiThatRef); // Lấy dữ liệu từ Firestore
    if (noiThatSnapshot.exists()) {
      noiThatData.push(noiThatSnapshot.data()); // Lưu dữ liệu vào mảng
    } else {
      console.log(`No data found for noiThatId: ${noiThatId}`);
    }
  }
  return noiThatData;
}

// Hàm render danh sách Ten_noithat
function renderNoiThatList(noiThatData) {
  if (noiThatData && Array.isArray(noiThatData) && noiThatData.length > 0) {
    return noiThatData.map((item) => `<p>${item.Ten_noithat}</p>`).join(", ");
  } else {
    return "<p>Không có nội thất</p>";
  }
}

async function getTienNghiByPhongTro(maPhongTro) {
  const q = query(
    collection(db, "PhongTroTienNghi"),
    where("ma_phongtro", "==", maPhongTro)
  );
  const querySnapshot = await getDocs(q);
  const tienNghi = [];
  querySnapshot.forEach((doc) => {
    tienNghi.push(doc.data().ma_tiennghi); // Lấy ma_tiennghi
  });
  return tienNghi;
}

async function getTienNghiData(tienNghiIds) {
  const tienNghiData = [];
  for (let tienNghiId of tienNghiIds) {
    const tienNghiRef = doc(db, "TienNghi", tienNghiId); // Lấy từng document ID
    const tienNghiSnapshot = await getDoc(tienNghiRef); // Lấy dữ liệu từ Firestore
    if (tienNghiSnapshot.exists()) {
      tienNghiData.push(tienNghiSnapshot.data()); // Lưu dữ liệu vào mảng
    } else {
      console.log(`No data found for tienNghiId: ${tienNghiId}`);
    }
  }
  return tienNghiData;
}

// Hàm render danh sách Ten_noithat
function renderTienNghiList(tienNghiData) {
  if (tienNghiData && Array.isArray(tienNghiData) && tienNghiData.length > 0) {
    return tienNghiData.map((item) => `<p>${item.Ten_tiennghi}</p>`).join(", ");
  } else {
    return "<p>Không có tiện nghi</p>";
  }
}



async function getDichVuByPhongTro(maPhongTro) {
  const q = query(
    collection(db, "ChiTietThongTin"),
    where("ma_phongtro", "==", maPhongTro)
  );
  const querySnapshot = await getDocs(q);
  const dichVuData = [];
  querySnapshot.forEach((doc) => {
    dichVuData.push(doc.data()); // Lấy dich vu
  });
  return dichVuData;
}

function renderDichVuList(dichVuData) {
  if (dichVuData && Array.isArray(dichVuData) && dichVuData.length > 0) {
    return dichVuData.map((item) => `
    <div class="item-dichvu">
      <img class="ic-dichvu" src="${item.icon_thongtin}" alt="">
      <p>${item.ten_thongtin}: ${item.so_luong_donvi} ${item.don_vi}</p>
    </div>
      `).join(" ");
  } else {
    return "<p>Không có dịch vụ</p>";
  }
}

async function getDienTichPhongTro(maPhongTro) {
  const q = query(
    collection(db, "ChiTietThongTin"),
    where("ma_phongtro", "==", maPhongTro),
    where("ten_thongtin", "==", "Diện tích")
  );
  const dienTichData = []
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    dienTichData.push(doc.data()); // Lấy dich vu
  });
  return dienTichData;
}

function renderDienTich(dienTichData) {
  if (dienTichData && Array.isArray(dienTichData) && dienTichData.length > 0) {
    return dienTichData.map((item) => `<p>${item.so_luong_donvi}${item.don_vi}</p>`);
  } else {
    return "<p>Không có dịch vụ</p>";
  }
}


let isLoadingDetail = false;
function updateDetailLoadingState() {
  const loadingElement = document.getElementById("loadingSpinner");
  const detailDialog = document.getElementById("detailDialog");
  const detailContent = document.getElementById("detailDialogContent");
  const overlay = document.getElementById("overlay")

  if (!loadingElement || !detailDialog) {
    console.error("Phần tử loadingSpinner hoặc detailDialog không tồn tại.");
    return;
  }

  if (isLoadingDetail) {
    
    loadingElement.style.display = "flex"; // Hiển thị spinner
    detailDialog.style.display = "block"; // Ẩn chi tiết phòng
     detailContent.style.display = "none"
     overlay.style.display = "block"
     
  } else {
    loadingElement.style.display = "none"; // Ẩn spinner
    detailDialog.style.display = "block"; // Hiển thị chi tiết phòng
    detailContent.style.display = "block"
  }
}


// Hàm hiển thị chi tiết phòng trọ
async function viewDetails(roomId) {
  const room = rooms.find((r) => r.id === roomId);
  currentRoomId = roomId; // Cập nhật roomId hiện tại

  if (room) {
    try {
      isLoadingDetail = true;
      updateDetailLoadingState();

      // Lấy thông tin người dùng và loại phòng (như trong đoạn code trước)
      const userInfo = await getUserInfo(room.Ma_nguoidung);
      const loaiPhongRef = doc(db, "LoaiPhong", room.Ma_loaiphong);
      const loaiPhongSnapshot = await getDoc(loaiPhongRef);

      const gioiTinhRef = doc(db, "GioiTinh", room.Ma_gioiTinh);
      const gioiTinhSnapshot = await getDoc(gioiTinhRef);
      const gioiTinhData = gioiTinhSnapshot.data();

      // Lấy danh sách ma_noithat từ PhongTroNoiThat
      const noiThatIds = await getNoiThatByPhongTro(currentRoomId);
      // Lấy dữ liệu nội thất từ Firestore
      const noiThatData = await getNoiThatData(noiThatIds);

      // Lấy danh sách ma_tiennghi từ PhongTroNoiThat
      const tienNghiIds = await getTienNghiByPhongTro(currentRoomId);
      // Lấy dữ liệu nội thất từ Firestore
      const tienNghiData = await getTienNghiData(tienNghiIds);

      // Render thông tin nội thất

      const dichVuData = await getDichVuByPhongTro(currentRoomId)

      const dienTichData = await getDienTichPhongTro(currentRoomId)

      if (loaiPhongSnapshot.exists()) {
        const loaiPhongData = loaiPhongSnapshot.data();

        const roomDetails = document.getElementById("roomDetails");
        roomDetails.innerHTML = `
          <p class="room-name">${room.Ten_phongtro}</p>    <br>
           <p class="room-address-detail">${room.Dia_chi}</p>  <br>
           <div class="line-detail"></div>
           <div class="grid-price">
              <div class="room-price-detail">
                 <strong>Mức giá</strong> <br>
                 <p>
                  ${new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(room.Gia_phong)} / tháng
                 </p>
                
              </div>
               <div class="room-acreage-detail">
                  <strong>Diện tích</strong> <br>
                  <p>
                  ${renderDienTich(dienTichData)}
                  </p>
                  
               </div>
            
           </div>
           <div class="room-description-detail">
              <strong>Thông tin mô tả</strong> <br> <br> 
              <p>${room.Mota_chitiet}</p> <br>
            </div>

            <div class"describe-container">
             <strong>Đặc điểm bất động sản</strong> <br> <br> 

             <div>${renderDichVuList(dichVuData)} </div>

             <div class="grid-describe">
             
                <div class="describe-column">
                  <div class="line-detail"></div>
                  <div class="item-column">
                   <div class="item-content">
                      <img class="ic-item" src="../public/assets/imgs/icons/ic-room-type.png" alt="" />
                      <h5>Loại phòng</h5>
                   </div>
                    <div class="item-content">
                      <p>${loaiPhongData.Ten_loaiphong}</p>  <br>
                    </div>
                  </div>
                   <div class="line-detail"></div>
                  <div class="item-column">
                   <div class="item-content">
                      <img class="ic-item" src="../public/assets/imgs/icons/ic-interior.png" alt="" />
                      <h5>Nội thất</h5>
                   </div>
                    <div class="item-content">
                   ${renderNoiThatList(noiThatData)}
                    </div>
                  </div>
                  <div class="line-detail"></div>
                  <div class="item-column">
                   <div class="item-content">
                      <img class="ic-item" src="../public/assets/imgs/icons/ic-calendar.png" alt="" />
                      <h5>Thời giạn tạo</h5>
                   </div>
                    <div class="item-content">
                      <p>${formatFirebaseTime(room.ThoiGian_taophong)}</p>  <br>
                    </div>
                  </div>

                     <div class="line-detail"></div>
                  <div class="item-column">
                   <div class="item-content">
                      <img class="ic-item" src="../public/assets/imgs/icons/ic-see.png" alt="" />
                      <h5>Số lượt xem phòng</h5>
                   </div>
                    <div class="item-content">
                      <p>${room.So_luotxemphong}</p>  <br>
                    </div>
                  </div>
                </div>
                 
        
                 <div class="describe-column">
                  <div class="line-detail"></div>
                  <div class="item-column">
                   <div class="item-content">
                      <img class="ic-item" src="../public/assets/imgs/icons/ic-gender.png" alt="" />
                      <h5>Giới tính</h5>
                   </div>
                    <div class="item-content">
                      <img class="ic-item" src="${
                        gioiTinhData.ImgUrl_gioitinh
                      }" alt="" />
                      <p>${gioiTinhData.Ten_gioitinh}</p>  <br>
                    </div>
                  </div>
                   <div class="line-detail"></div>
                  <div class="item-column">
                   <div class="item-content">
                      <img class="ic-item" src="../public/assets/imgs/icons/ic-armchair.png" alt="" />
                      <h5>Tiện nghi</h5>
                   </div>
                    <div class="item-content">
                      <p class="room-type">${renderTienNghiList(
                        tienNghiData
                      )}</p>  <br>
                    </div>
                  </div>

                  <div class="line-detail"></div>
                  <div class="item-column">
                   <div class="item-content">
                      <img class="ic-item" src="../public/assets/imgs/icons/ic-calendar.png" alt="" />
                      <h5>Ngày cập nhật</h5>
                   </div>
                    <div class="item-content">
                      <p>${formatFirebaseTime(room.Ngay_capnhat)}</p>  <br>
                    </div>
                  </div>

                    <div class="line-detail"></div>
                  <div class="item-column">
                   <div class="item-content">
                      <img class="ic-item" src="../public/assets/imgs/icons/ic-location.png" alt="" />
                      <h5>Địa chỉ chi tiết</h5>
                   </div>
                    <div class="item-content">
                      <p>${room.Dia_chichitiet}</p>  <br>
                    </div>
                  </div>

                </div>
             </div>
            </div>
    
        `;

        const imageContainer = document.getElementById("roomImages");
        const carouselImages = imageContainer.querySelector(".carousel-images");
        const thumbnailsContainer = imageContainer.querySelector(".thumbnails");
        carouselImages.innerHTML = ""; // Xóa ảnh cũ
        thumbnailsContainer.innerHTML = ""; // Xóa ảnh thu nhỏ cũ

        // Thêm ảnh vào slide và ảnh thu nhỏ
        room.imageUrls.forEach((url, index) => {
          // Ảnh trong slide
          const imgElement = document.createElement("img");
          imgElement.src = url;
          imgElement.alt = room.Ten_phongtro;
          carouselImages.appendChild(imgElement);

          // Ảnh thu nhỏ
          const thumbElement = document.createElement("img");
          thumbElement.src = url;
          thumbElement.alt = `Thumbnail ${index + 1}`;
          thumbElement.onclick = () => goToSlide(index); // Xử lý click để chuyển đến slide tương ứng
          if (index === 0) thumbElement.classList.add("active"); // Slide đầu tiên được chọn mặc định
          thumbnailsContainer.appendChild(thumbElement);
        });

        // Hiển thị thông tin người dùng
        const userInfoContainer = document.querySelector(
          ".user-info-container"
        );
        userInfoContainer.querySelector(".img-avt-user").src =
          userInfo.anh_daidien || "./assets/imgs/default-avatar.png";
        userInfoContainer.querySelector(".user-name").textContent =
          userInfo.ho_ten;
        userInfoContainer.querySelector(
          ".late-time-stamp"
        ).textContent = `${formatTimestamp(userInfo.lastActiveTime)}`;
        userInfoContainer.querySelector(".user-phone").textContent = `${
          userInfo.sdt || "Không có"
        }`;

        const userChatWithUser = document.querySelector(
          ".chat-with-user-container"
        );
        userChatWithUser.setAttribute('data-user-id', room.Ma_nguoidung);
        userChatWithUser.onclick = () => redirectToChat(userChatWithUser);

          // Điều kiện ẩn/hiện các nút Duyệt và Hủy
      const actionsContainer = document.querySelector(".actions");
      if (room.Trang_thaiduyet === "ChoDuyet") {
        actionsContainer.innerHTML = `
          <button class="btn approve" onclick="approveRoom('${roomId}')">Duyệt</button>
          <button class="btn cancel" onclick="cancelRoom('${roomId}')">Hủy</button>
        `;
      } else if (room.Trang_thaiduyet === "BiHuy") {
        actionsContainer.innerHTML = `
          <button class="btn revert" onclick="revertToPending('${roomId}')">Duyệt lại</button>
        `;
      } else {
        actionsContainer.innerHTML = `
         
        `;
      }

        // Hiển thị chi tiết phòng
        document.getElementById("detailDialogContent").style.display = "block";

        // Reset slide về ảnh đầu tiên
        currentSlide = 0;
        updateSlidePosition();
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin phòng:", error);
    } finally {
      // Tắt trạng thái loading
      isLoadingDetail = false;
      updateDetailLoadingState();
    }
  }
}

function formatFirebaseTime(times) {
  if (!times) return "Không có dữ liệu thời gian";

  // Kiểm tra nếu timestamp là kiểu đối tượng của Firebase
  const date = times.toDate ? times.toDate() : new Date(times);

  // Định dạng ngày tháng
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getFullYear();

  // Định dạng giờ phút giây
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Kết hợp ngày tháng và giờ
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// Hàm định dạng thời gian
function formatTimestamp(timestamp) {
  const messageDate = new Date(timestamp);
  const now = new Date();

  const diffMs = now - messageDate;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return diffDays === 1 ? "Hôm qua" : `${diffDays} ngày trước`;
  } else if (diffHours > 0) {
    return `${diffHours} giờ trước`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} phút trước`;
  } else {
    return "Đang hoạt động";
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
  carouselImages.style.transform = `translateX(-${currentSlide * 30}%)`;

  // Cập nhật trạng thái active cho thumbnail
  const thumbnails = document.querySelectorAll(".thumbnails img");
  thumbnails.forEach((thumb, index) => {
    thumb.classList.toggle("active", index === currentSlide);
  });
}

function goToSlide(slideIndex) {
  currentSlide = slideIndex;
  updateSlidePosition();

  // Cập nhật trạng thái active cho thumbnail
  const thumbnails = document.querySelectorAll(".thumbnails img");
  thumbnails.forEach((thumb, index) => {
    thumb.classList.toggle("active", index === slideIndex);
  });
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
    .value.toLowerCase();

  // Gộp tất cả các danh sách
  const allRooms = [...pendingRooms, ...approvedRooms, ...canceledRooms];

  // Lọc danh sách dựa trên giá trị tìm kiếm
  const filteredRooms = allRooms.filter(
    (room) =>
      room.Ten_phongtro.toLowerCase().includes(searchInput) ||
      room.Dia_chi.toLowerCase().includes(searchInput)
  );

  // Xóa nội dung hiển thị cũ
  document.getElementById("pendingRoomList").innerHTML = "";
  document.getElementById("approvedRoomList").innerHTML = "";
  document.getElementById("canceledRoomList").innerHTML = "";

  // Hiển thị danh sách kết quả theo trạng thái
  renderRoomList(
    filteredRooms.filter((room) => room.Trang_thaiduyet === "ChoDuyet"),
    "pendingRoomList"
  );
  renderRoomList(
    filteredRooms.filter((room) => room.Trang_thaiduyet === "DaDuyet"),
    "approvedRoomList"
  );
  renderRoomList(
    filteredRooms.filter((room) => room.Trang_thaiduyet === "BiHuy"),
    "canceledRoomList"
  );
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
window.cancelRoom = cancelRoom
window.revertToPending = revertToPending
window.approveRoom = approveRoom
window.redirectToChat = redirectToChat
