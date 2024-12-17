import { db, database } from "./FireBaseConfig.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let paymentHistoryData = [];
let allPaymentHistoryData = [];
let currentId = null;
let currentPage = 1; // Trang hiện tại
const itemsPerPage = 10; // Số hàng hiển thị trên mỗi trang

async function fetchAllTransactionHistoris() {
  const paymentHistoryRef = collection(db, "LichSuTT");

  try {
    const querySnapshot = await getDocs(paymentHistoryRef);
    allPaymentHistoryData = [];
    paymentHistoryData = [];
    querySnapshot.forEach((doc) => {
      const paymentHistory = { id: doc.id, ...doc.data() };
      allPaymentHistoryData.push(paymentHistory); // Lưu vào danh sách gốc
      paymentHistoryData.push(paymentHistory); // Lưu vào danh sách gốc
    });

    renderPaymentHistoryList(allPaymentHistoryData); // Render toàn bộ khi vừa tải
  } catch (e) {
    console.error("Lỗi khi lấy danh sách lịch sử:", e);
  }
}

function renderPaymentHistoryList(data) {
  const paymentHistoryListContainer =
    document.getElementById("paymentHistoryList");
  paymentHistoryListContainer.innerHTML = ""; // Xóa nội dung cũ

  if (data.length === 0) {
    paymentHistoryListContainer.innerHTML =
      "<p>Không có lịch sử thanh toán nào phù hợp.</p>";
    return;
  }

  // Lấy dữ liệu trang hiện tại
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  // Tạo bảng
  let tableHTML = `
    <table class="payment-history-table">
      <thead>
        <tr>
          <th>Thời gian</th>
          <th>Mã thanh toán</th>
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
  renderPagination(data);
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
      renderPaymentHistoryList(data); // Render lại danh sách đã lọc
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

function filterLichSuThanhToan(event) {
  const keyword = removeVietnameseTones(event.target.value).toLowerCase(); // Từ khóa không dấu và chuyển thành chữ thường
  // Lọc danh sách gốc để tìm dịch vụ phù hợp
  const filteredLichSu = allPaymentHistoryData.filter((paymentHistory) => {
    return (
      removeVietnameseTones(paymentHistory.idCongViec || "")
        .toLowerCase()
        .includes(keyword) || // Kiểm tra theo mã công việc
      removeVietnameseTones(paymentHistory.idNhanVien || "")
        .toLowerCase()
        .includes(keyword) || // Kiểm tra theo mã nhân viên
      removeVietnameseTones(paymentHistory.trangThai || "")
        .toLowerCase()
        .includes(keyword) // Kiểm tra theo trạng thái
    );
  });

  if (filteredLichSu.length === 0) {
    showNoResultMessage(); // Hiển thị thông báo không tìm thấy
  } else {
    renderPaymentHistoryList(filteredLichSu); // Hiển thị danh sách đã lọc
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
  fetchAllPaymentHistoris(); // Gọi hàm để tải danh sách phòng trọ khi trang tải xong
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", filterLichSuThanhToan); // Lắng nghe sự kiện tìm kiếm
});

window.goBack = goBack;
window.filterLichSuThanhToan = filterLichSuThanhToan;
