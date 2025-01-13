import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import {
  getAuth,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  update,
  query
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyA-EHInpdkzzNF3z_GhMSQsqLC5GI7mYsc",
  authDomain: "reactnative-8e2ca.firebaseapp.com",
  databaseURL: "https://reactnative-8e2ca-default-rtdb.firebaseio.com",
  projectId: "reactnative-8e2ca",
  storageBucket: "reactnative-8e2ca.appspot.com",
  messagingSenderId: "826980793632",
  appId: "1:826980793632:web:41722d76fb0ef372776b45",
  measurementId: "G-DMMZ0JC2GE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const database = getDatabase(app); // Realtime Database
const auth = getAuth(app); // Đảm bảo truyền app vào

let penddingComplaintData = [];
let approvedComplaintData = [];
let canceledComplaintData = [];
let currentId = null;
let currentPage = 1; // Trang hiện tại
const itemsPerPage = 10; // Số hàng hiển thị trên mỗi trang

const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // Remove active class from all tabs and tab contents
    tabs.forEach((t) => t.classList.remove("active"));
    tabContents.forEach((tc) => tc.classList.remove("active"));

    // Add active class to clicked tab and corresponding content
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");

    // Render danh sách đơn tố cáo tương ứng với trạng thái của tab
    if (tab.dataset.tab === "pending") {
      renderComplaintList(penddingComplaintData, "pending-contract-list");
    } else if (tab.dataset.tab === "approved") {
      renderComplaintList(approvedComplaintData, "approved-contract-list");
    } else if (tab.dataset.tab === "canceled") {
      renderComplaintList(canceledComplaintData, "canceled-contract-list");
    }
  });
});

async function fetchAllComplaints() {
  const complaintRef = collection(db, "ToCaoPhongTro");

  try {
    const querySnapshot = await getDocs(complaintRef);
    penddingComplaintData = [];
    approvedComplaintData = [];
    canceledComplaintData = [];

    querySnapshot.forEach((doc) => {
      const complaint = { id: doc.id, ...doc.data() };

      // Phân loại theo trạng thái
      switch (complaint.trangThai) {
        case "PENDING":
          penddingComplaintData.push(complaint);
          break;
        case "APPROVED":
          approvedComplaintData.push(complaint);
          break;
        case "CANCELED":
          canceledComplaintData.push(complaint);
          break;
        default:
          break;
      }
    });

    // Render danh sách theo từng trạng thái
    renderComplaintList(penddingComplaintData, "pending-contract-list");
    renderComplaintList(approvedComplaintData, "approved-contract-list");
    renderComplaintList(canceledComplaintData, "canceled-contract-list");

  } catch (e) {
    console.error("Lỗi khi lấy danh sách đơn tố cáo:", e);
  }
}

function renderComplaintList(data, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = ""; // Xóa nội dung cũ

  if (data.length === 0) {
    container.innerHTML = "<p>Không có đơn tố cáo nào phù hợp.</p>";
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  let tableHTML = `
    <table class="complaint-table">
      <thead>
        <tr>
          <th>Mã đơn</th>
          <th>Thời gian</th>
          <th>Nội dung</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
  `;

  paginatedData.forEach((complaint) => {
    tableHTML += `
      <tr class="complaint-item" data-id="${complaint.id}">
        <td>${complaint.id}</td>
        <td>${formatFirebaseTime(complaint.time)}</td> <!-- Chỉnh sửa lại để hiển thị thời gian -->
        <td>${complaint.vanDePhong}</td>
        <td><a class="view-details">Xem chi tiết</a></td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  container.innerHTML = tableHTML;

  // Thêm sự kiện click vào từng hàng
  document.querySelectorAll(".view-details").forEach((button) => {
    button.addEventListener("click", (event) => {
      const itemId = event.currentTarget.closest(".complaint-item").getAttribute("data-id");
      showItemDetail(itemId);
    });
  });

  renderPagination(data); // Render phân trang
}

// Hàm hiển thị chi tiết đơn tố cáo
function showItemDetail(itemId) {
  const item = [...penddingComplaintData, ...approvedComplaintData, ...canceledComplaintData].find((data) => data.id === itemId);
  
  if (!item) {
    alert("Không tìm thấy chi tiết cho đơn tố cáo này.");
    return;
  }

  const itemDetailContent = document.getElementById("itemDetailContent");
  itemDetailContent.innerHTML = `
    <p><strong>Mã người bị tố cáo:</strong> ${item.maNguoiBiToCao}</p>
    <p><strong>Mã người tố cáo:</strong> ${item.maNguoiToCao}</p>
    <p><strong>Mã phòng trọ:</strong> ${item.maPhongTro}</p>
    <p><strong>Phòng trọ:</strong> ${item.tenPhongTro}</p>
    <p><strong>Vấn đề:</strong> ${item.vanDePhong}</p>
    <p><strong>Trạng thái:</strong> ${item.trangThai}</p>
    <div>
      <strong>Ảnh liên quan:</strong>
      <div class="image-list">
        ${item.images && item.images.length > 0 ? item.images.map((img) => `<img src="${img}" alt="Complaint Image" />`).join('') : 'Không có ảnh'}
      </div>
    </div>
  `;

  const modal = document.getElementById("itemDetailModal");
  modal.style.display = "block";


  // Các nút hành động trong modal
  const lockAccComplainantBtn = document.getElementById("lockAccComplainant");
  const lockAccDefendantBtn = document.getElementById("lockAccDefendant");
  const cancelComplaintBtn = document.getElementById("cancelComplaint");

  lockAccComplainantBtn.onclick = async () => {
    lockUserAndRooms(item.maNguoiToCao);
    const itemId = item.id; 
    await approvedComplaintInDatabase(itemId)
  };

  lockAccDefendantBtn.onclick = async () => {
    lockUserAndRooms(item.maNguoiBiToCao);
    const itemId = item.id; 
    await approvedComplaintInDatabase(itemId)
  };

  cancelComplaintBtn.onclick = async () => {
    const itemId = item.id; // Lấy ID của đơn tố cáo đang xem chi tiết
    await cancelComplaintInDatabase(itemId); // Cập nhật trạng thái đơn tố cáo trong cơ sở dữ liệu

    // Cập nhật giao diện: loại bỏ đơn tố cáo đã huỷ và render lại danh sách
    penddingComplaintData = penddingComplaintData.filter((complaint) => complaint.id !== itemId);
    renderComplaintList(penddingComplaintData, "pending-contract-list"); // Cập nhật lại danh sách đơn tố cáo PENDING
    renderComplaintList(canceledComplaintData, "canceled-contract-list"); 
    // Đóng modal
    const modal = document.getElementById("itemDetailModal");
    modal.style.display = "none";
  };
}

async function lockUserAndRooms(userId) {
  try {
    // 1. Khóa tài khoản người dùng trong Realtime Database
    const userRef = ref(database, `NguoiDung/${userId}`);
    await update(userRef, {
      trangThaiTaiKhoan: 'Khoa',
      ngayCapNhat: new Date().toISOString()
    });

    // 2. Lấy danh sách phòng trọ liên quan từ Firestore
    const roomQuery = query(collection(db, 'PhongTro'), where('maNguoiDung', '==', userId));
    const roomSnapshot = await getDocs(roomQuery);

    if (!roomSnapshot.empty) {
      const roomUpdates = roomSnapshot.docs.map(docSnapshot =>
        updateDoc(doc(db, 'PhongTro', docSnapshot.id), { trangThaiDuyet: 'BiHuy' })
      );
      
      // Cập nhật trạng thái tất cả phòng trọ liên quan
      await Promise.all(roomUpdates);
      console.log("Tất cả phòng trọ liên quan đã bị khoá.");
    }

    alert(`Tài khoản người dùng ${userId} và các phòng trọ liên quan đã bị khóa.`);
  } catch (error) {
    console.error("Lỗi khi khóa tài khoản và phòng trọ:", error);
  }
}



// Đóng modal khi nhấn vào dấu 'x'
const closeModal = document.querySelector(".close");
closeModal.onclick = () => {
  const modal = document.getElementById("itemDetailModal");
  modal.style.display = "none";
}

// Đóng modal nếu người dùng nhấn ra ngoài modal
window.onclick = (event) => {
  const modal = document.getElementById("itemDetailModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Giả sử bạn có hàm cập nhật trong Firestore
async function cancelComplaintInDatabase(itemId) {
  const complaintRef = doc(db, "ToCaoPhongTro", itemId); // Lấy reference của đơn tố cáo
  try {
    await updateDoc(complaintRef, { trangThai: "CANCELED" }); // Cập nhật trạng thái thành "CANCELED"
    alert("Đơn tố cáo đã được huỷ!");
  } catch (e) {
    console.error("Lỗi khi huỷ đơn tố cáo:", e);
    alert("Có lỗi xảy ra khi huỷ đơn tố cáo.");
  }
}

async function approvedComplaintInDatabase(itemId) {
  const complaintRef = doc(db, "ToCaoPhongTro", itemId); // Lấy reference của đơn tố cáo
  try {
    await updateDoc(complaintRef, { trangThai: "APPROVED" }); // Cập nhật trạng thái thành "CANCELED"
    alert("Đơn tố cáo đã được duyệt!");
  } catch (e) {
    console.error("Lỗi khi duyệt tố cáo:", e);
    alert("Có lỗi xảy ra khi duyệt đơn tố cáo.");
  }
}


function renderPagination(data) {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = ""; // Xóa nội dung cũ

  const totalPages = Math.ceil(data.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.className = "pagination-button";
    if (i === currentPage) {
      button.classList.add("active");
    }
    button.addEventListener("click", () => {
      currentPage = i;
      renderComplaintList(data, "pending-contract-list"); // Sửa lại tên hàm renderComplaintList cho đúng
    });
    paginationContainer.appendChild(button);
  }
}

function formatFirebaseTime(times) {
  if (!times) return "Không có dữ liệu thời gian";

  const date = times.toDate ? times.toDate() : new Date(times);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}


function removeVietnameseTones(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function showNoResultMessage() {
  const informationListContainer = document.getElementById("paymentHistoryList");
  informationListContainer.innerHTML = `
    <div class="no-result-message">
        <img src="../public/assets/imgs/icons/ic-sad-face.png" alt="">
      <p>Không tìm thấy kết quả phù hợp.</p>
    </div>
  `;
}

function goBack() {
  if (document.referrer) {
    window.history.back(); // Quay về trang trước nếu có trang trước
  } else {
    console.log("Không có trang trước để quay lại.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchAllComplaints(); // Gọi hàm để tải danh sách đơn tố cáo khi trang tải xong
});

window.goBack = goBack;
