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

let paymentHistoryData = [];
let allPaymentHistoryData = [];
let currentId = null;
let currentPage = 1; // Trang hiện tại
const itemsPerPage = 5; // Số hàng hiển thị trên mỗi trang

async function fetchAllPaymentHistoris() {
  const paymentHistoryRef = collection(db, "LichSuTT");

  try {
    const querySnapshot = await getDocs(paymentHistoryRef);
    allPaymentHistoryData = [];
    querySnapshot.forEach((doc) => {
      const paymentHistory = { id: doc.id, ...doc.data() };
      allPaymentHistoryData.push(paymentHistory); // Lưu vào danh sách gốc
    });

    renderPaymentHistoryList();
  } catch (e) {
    console.error("Lỗi khi lấy danh sách lịch sử:", e);
  }
}

function renderPaymentHistoryList() {
  const paymentHistoryListContainer =
    document.getElementById("paymentHistoryList");
  paymentHistoryListContainer.innerHTML = ""; // Xóa nội dung cũ

  if (allPaymentHistoryData.length === 0) {
    paymentHistoryListContainer.innerHTML =
      "<p>Không có lịch sử thanh toán nào phù hợp.</p>";
    return;
  }

  // Lấy dữ liệu trang hiện tại
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = allPaymentHistoryData.slice(startIndex, endIndex);

  // Tạo bảng
  let tableHTML = `
    <table class="payment-history-table">
      <thead>
        <tr>
          <th>Thời gian</th>
          <th>Mã giao dịch</th>
          <th>Tổng hoá đơn</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
  `;

  // Lặp qua dữ liệu phân trang
  paginatedData.forEach((paymentHistory) => {
    const formattedVND = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(paymentHistory.tongHoaDon);

    tableHTML += `
      <tr>
        <td>${formatFirebaseTime(paymentHistory.ngayThanhToan || "N/A")}</td>
        <td>
          <div class="id-cong-viec">${paymentHistory.idCongViec || "N/A"}</div>
          <div class="ma-nhan-vien"> <p class="title-manhanvien">Mã nhân viên</p> 
          ${paymentHistory.idNhanVien || "N/A"}</div>
        </td>
        <td>${formattedVND || 0}</td>
        <td>${paymentHistory.trangThai || "Chưa xác định"}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  paymentHistoryListContainer.innerHTML = tableHTML;

  // Thêm phân trang
  renderPagination();
}

function renderPagination() {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = ""; // Xóa nội dung cũ

  const totalPages = Math.ceil(allPaymentHistoryData.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.className = "pagination-button";
    if (i === currentPage) {
      button.classList.add("active");
    }
    button.addEventListener("click", () => {
      currentPage = i;
      renderPaymentHistoryList();
    });
    paginationContainer.appendChild(button);
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

function goBack() {
  if (document.referrer) {
    window.history.back(); // Quay về trang trước nếu có trang trước
  } else {
    console.log("Không có trang trước để quay lại.");
  }
}

// Lắng nghe sự kiện DOMContentLoaded và gọi hàm fetchAllRooms
document.addEventListener("DOMContentLoaded", () => {
  fetchAllPaymentHistoris(); // Gọi hàm để tải danh sách phòng trọ khi trang tải xong
});

window.goBack = goBack;
