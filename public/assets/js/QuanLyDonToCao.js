import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  where,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  update,
  query,
  set,
  push
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
        <td>${formatFirebaseTime(
          complaint.time
        )}</td> <!-- Chỉnh sửa lại để hiển thị thời gian -->
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
      const itemId = event.currentTarget
        .closest(".complaint-item")
        .getAttribute("data-id");
      showItemDetail(itemId);
    });
  });
}

// Hàm hiển thị chi tiết đơn tố cáo
function showItemDetail(itemId) {
  const item = [
    ...penddingComplaintData,
    ...approvedComplaintData,
    ...canceledComplaintData,
  ].find((data) => data.id === itemId);

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
        ${
          item.images && item.images.length > 0
            ? item.images
                .map((img) => `<img src="${img}" alt="Complaint Image" />`)
                .join("")
            : "Không có ảnh"
        }
      </div>
    </div>
  `;

  // Hiển thị nội dung nếu đơn tố cáo đã duyệt
  if (item.trangThai === "APPROVED" && item.noiDung) {
    itemDetailContent.innerHTML += `
      <p><strong>Nội dung:</strong> ${item.noiDung}</p>
    `;
  }

  const modal = document.getElementById("itemDetailModal");
  modal.style.display = "block";

  // Lấy các nút trong modal
  const lockAccComplainantBtn = document.getElementById("lockAccComplainant");
  const lockAccDefendantBtn = document.getElementById("lockAccDefendant");
  const cancelComplaintBtn = document.getElementById("cancelComplaint");

  // Ẩn các nút nếu trạng thái đơn là "APPROVED" hoặc "CANCELED"
  if (item.trangThai === "APPROVED" || item.trangThai === "CANCELED") {
    lockAccComplainantBtn.style.display = "none";
    lockAccDefendantBtn.style.display = "none";
    cancelComplaintBtn.style.display = "none";
  } else {
    lockAccComplainantBtn.style.display = "block";
    lockAccDefendantBtn.style.display = "block";
    cancelComplaintBtn.style.display = "block";
  }

  lockAccComplainantBtn.onclick = async () => {
    await lockUserAndRoomsN(item.maNguoiToCao, item.id, item.maNguoiBiToCao);
    const itemId = item.id;
    await approvedComplaintInDatabase(itemId);
    closeModalAndReloadList();
  };

  lockAccDefendantBtn.onclick = async () => {
    await lockUserAndRooms(item.maNguoiBiToCao, item.id, item.maNguoiToCao);
    const itemId = item.id;
    await approvedComplaintInDatabase(itemId);
    closeModalAndReloadList();
  };

  cancelComplaintBtn.onclick = async () => {
    const itemId = item.id;
    await cancelComplaintInDatabase(itemId);
    closeModalAndReloadList();
  };
}



function closeModalAndReloadList() {
  const modal = document.getElementById("itemDetailModal");
  modal.style.display = "none"; // Đóng modal
  fetchAllComplaints(); // Reload lại danh sách đơn tố cáo
}

async function lockUserAndRooms(userId, complaintId, complainantId) {
  try {
    // 1. Khóa tài khoản người dùng trong Realtime Database
    const userRef = ref(database, `NguoiDung/${userId}`);
    await update(userRef, {
      trangThaiTaiKhoan: 'Khoa',
      ngayCapNhat:  Date.now()
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

    // 3. Cập nhật nội dung vào đơn tố cáo đã duyệt (trường `noiDung` cho biết tài khoản đã bị khóa)
    const complaintRef = doc(db, "ToCaoPhongTro", complaintId);
    await updateDoc(complaintRef, {
      noiDung: `Đã khóa tài khoản của người bị tố cáo với ID: ${userId}`
    });

    // Gửi thông báo cho người tố cáo
    await notifyComplainant(complaintId, complainantId, userId);
  } catch (error) {
    console.error("Lỗi khi khóa tài khoản và phòng trọ:", error);
  }
}



async function lockUserAndRoomsN(userId, complaintId, complainantId) {
  try {
    // 1. Khóa tài khoản người dùng trong Realtime Database
    const userRef = ref(database, `NguoiDung/${userId}`);
    await update(userRef, {
      trangThaiTaiKhoan: 'Khoa',
      ngayCapNhat:  Date.now()
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

    // 3. Cập nhật nội dung vào đơn tố cáo đã duyệt (trường `noiDung` cho biết tài khoản đã bị khóa)
    const complaintRef = doc(db, "ToCaoPhongTro", complaintId);
    await updateDoc(complaintRef, {
      noiDung: `Đã khóa tài khoản của người bị tố cáo với ID: ${userId}`
    });

  } catch (error) {
    console.error("Lỗi khi khóa tài khoản và phòng trọ:", error);
  }
}


async function notifyComplainant(complaintId, complainantId, defendantId) {
  try {
    const complaintRef = doc(db, "ToCaoPhongTro", complaintId);
    const complaintSnapshot = await getDoc(complaintRef);

    if (complaintSnapshot.exists()) {
      const complaintData = complaintSnapshot.data();
      const { tenPhongTro, vanDePhong } = complaintData;

      // Tạo timestamp cho thời gian gửi thông báo
      const timestamp = Date.now();  // Số mili giây kể từ 01/01/1970

      // Tạo thông báo cho người tố cáo
      const notification = {
        tieuDe: "Tài khoản của người bị tố cáo đã bị khóa",
        tinNhan: `Đơn tố cáo của bạn đã được ghi nhận. Tài khoản bạn tố cáo về phòng trọ ${tenPhongTro} đã bị khóa. Vấn đề: ${vanDePhong}`,
        thoiGianGuiThongBao: timestamp, // Lưu thời gian dưới dạng timestamp
        loaiThongBao: 'khoa_tai_khoan_vi_pham',
        daGui: true,
      };

      // Sử dụng Firestore để tự sinh ID cho thông báo
      const notificationsRef = ref(database, `ThongBao/${complainantId}`);
      const newNotificationRef = push(notificationsRef); // Tạo ID tự sinh cho thông báo
      await set(newNotificationRef, notification); // Lưu thông báo vào Firebase

      console.log("Thông báo đã được gửi cho người tố cáo.");

    }
  } catch (error) {
    console.error("Lỗi khi gửi thông báo cho người tố cáo:", error);
    showToastFalse("Có lỗi xảy ra khi gửi thông báo.");
  }
}



// Đóng modal khi nhấn vào dấu 'x'
const closeModal = document.querySelector(".close");
closeModal.onclick = () => {
  const modal = document.getElementById("itemDetailModal");
  modal.style.display = "none";
};

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
    // Cập nhật trạng thái đơn tố cáo thành "CANCELED"
    await updateDoc(complaintRef, { trangThai: "CANCELED" });

    // Lấy thông tin đơn tố cáo
    const complaintSnapshot = await getDoc(complaintRef);
    if (complaintSnapshot.exists()) {
      const complaintData = complaintSnapshot.data();
      const { maNguoiToCao, tenPhongTro, vanDePhong } = complaintData;

      // Tạo thông báo cho người tố cáo
      const timestamp = Date.now();
      const notification = {
        tieuDe: "Đơn tố cáo của bạn không được chấp nhận",
        tinNhan: `Đơn tố cáo của bạn về phòng trọ ${tenPhongTro} đã bị huỷ. Vấn đề: ${vanDePhong}`,
        thoiGianGuiThongBao: timestamp, // Thời gian thông báo
        loaiThongBao: 'huy_don_to_cao', // Loại thông báo
        daGui: true,
      };

      // Sử dụng Realtime Database để gửi thông báo cho người tố cáo
      const notificationsRef = ref(database, `ThongBao/${maNguoiToCao}`);
      const newNotificationRef = push(notificationsRef); // Tạo ID tự sinh cho thông báo
      await set(newNotificationRef, notification); // Lưu thông báo vào Firebase

      showToast("Đơn tố cáo đã được huỷ!");
    }
  } catch (e) {
    console.error("Lỗi khi huỷ đơn tố cáo:", e);
    showToastFalse("Có lỗi xảy ra khi huỷ đơn tố cáo.");
  }
}


async function approvedComplaintInDatabase(itemId) {
  const complaintRef = doc(db, "ToCaoPhongTro", itemId); // Lấy reference của đơn tố cáo
  try {
    await updateDoc(complaintRef, { trangThai: "APPROVED" }); // Cập nhật trạng thái thành "CANCELED"
    showToast("Đơn tố cáo đã được duyệt!");
  } catch (e) {
    console.error("Lỗi khi duyệt tố cáo:", e);
    showToastFalse("Có lỗi xảy ra khi duyệt đơn tố cáo.");
  }
}


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


function filterDonToCao(event) {
  const keyword = removeVietnameseTones(event.target.value).toLowerCase(); // Từ khóa không dấu và chuyển thành chữ thường
  
  let filteredData = [];

  // Lọc dữ liệu cho từng tab đang hiển thị
  const activeTab = document.querySelector(".tab.active").dataset.tab;
  
  if (activeTab === "pending") {
    filteredData = penddingComplaintData.filter((complaint) => {
      return (
        removeVietnameseTones(complaint.id || "").toLowerCase().includes(keyword) ||
        removeVietnameseTones(complaint.maPhongTro || "").toLowerCase().includes(keyword) ||
        removeVietnameseTones(complaint.maNguoiToCao || "").toLowerCase().includes(keyword) ||
        removeVietnameseTones(complaint.trangThai || "").toLowerCase().includes(keyword)
      );
    });
    renderComplaintList(filteredData, "pending-contract-list");
  } else if (activeTab === "approved") {
    filteredData = approvedComplaintData.filter((complaint) => {
      return (
        removeVietnameseTones(complaint.id || "").toLowerCase().includes(keyword) ||
        removeVietnameseTones(complaint.maPhongTro || "").toLowerCase().includes(keyword) ||
        removeVietnameseTones(complaint.maNguoiToCao || "").toLowerCase().includes(keyword) ||
        removeVietnameseTones(complaint.trangThai || "").toLowerCase().includes(keyword)
      );
    });
    renderComplaintList(filteredData, "approved-contract-list");
  } else if (activeTab === "canceled") {
    filteredData = canceledComplaintData.filter((complaint) => {
      return (
        removeVietnameseTones(complaint.id || "").toLowerCase().includes(keyword) ||
        removeVietnameseTones(complaint.maPhongTro || "").toLowerCase().includes(keyword) ||
        removeVietnameseTones(complaint.maNguoiToCao || "").toLowerCase().includes(keyword) ||
        removeVietnameseTones(complaint.trangThai || "").toLowerCase().includes(keyword)
      );
    });
    renderComplaintList(filteredData, "canceled-contract-list");
  }

  if (filteredData.length === 0) {
    showNoResultMessage(); // Hiển thị thông báo không tìm thấy
  }
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
  // Lấy tab đang được chọn
  const activeTab = document.querySelector(".tab.active").dataset.tab;
  
  // Chọn đúng container dựa trên tab hiện tại
  const informationListContainer =
    document.getElementById(`${activeTab}-contract-list`);
  
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
  fetchAllComplaints(); // Gọi hàm để tải danh sách phòng trọ khi trang tải xong
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", filterDonToCao); // Lắng nghe sự kiện tìm kiếm
});

window.goBack = goBack;
window.filterDonToCao = filterDonToCao
