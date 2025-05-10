import { db, database } from "./FireBaseConfig.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let paymentHistoryData = [];
let allPaymentHistoryData = [];
let serviceData = []
let allServiceData = []
let currentId = null;
let currentPage = 1; // Trang hiện tại
const itemsPerPage = 10; // Số hàng hiển thị trên mỗi trang


// Tab functionality
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
  });
});

async function fetchAllPaymentHistoris() {
  const paymentHistoryRef = collection(db, "ThanhToanHopDong");

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

async function fetchAllServices() {
  const serviceRef = collection(db, "ThanhToanDichVu");

  try {
    const querySnapshot = await getDocs(serviceRef);
    allServiceData = [];
    serviceData = [];
    querySnapshot.forEach((doc) => {
      const service = { id: doc.id, ...doc.data() };
      allServiceData.push(service); // Lưu vào danh sách gốc
      serviceData.push(service); // Lưu vào danh sách gốc
    });

    renderSerivceList(allServiceData); // Render toàn bộ khi vừa tải
  } catch (e) {
    console.error("Lỗi khi lấy danh sách lịch sử:", e);
  }
}

function renderPaymentHistoryList(data) {
  const paymentHistoryListContainer =
    document.getElementById("hopdong-contract-list");
  paymentHistoryListContainer.innerHTML = "";

  if (data.length === 0) {
    paymentHistoryListContainer.innerHTML =
      "<p>Không có lịch sử giao dịch hợp đồng nào phù hợp.</p>";
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

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

  paginatedData.forEach((paymentHistory) => {
    const formattedVND = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(paymentHistory.amount);

    tableHTML += `
      <tr class="payment-item" data-id="${paymentHistory.id}">
        <td>${formatFirebaseTime(paymentHistory.createdAt || "N/A")}</td>
        <td>${paymentHistory.appTransId || "N/A"}</td>
        <td>${formattedVND || 0}</td>
        <td>${paymentHistory.status || "Chưa xác định"}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  paymentHistoryListContainer.innerHTML = tableHTML;

  // Thêm sự kiện click vào từng hàng
  document.querySelectorAll(".payment-item").forEach((row) => {
    row.addEventListener("click", (event) => {
      const itemId = event.currentTarget.getAttribute("data-id");
      showItemDetail(itemId);
    });
  });


}


function renderSerivceList(data) {
  const paymentHistoryListContainer =
    document.getElementById("dichvu-contract-list");
  paymentHistoryListContainer.innerHTML = "";

  if (data.length === 0) {
    paymentHistoryListContainer.innerHTML =
      "<p>Không có lịch sử giao dịch dịch vụ nào phù hợp.</p>";
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

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

  paginatedData.forEach((paymentHistory) => {
    const formattedVND = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(paymentHistory.amount);

    tableHTML += `
      <tr class="payment-item" data-id="${paymentHistory.id}">
        <td>${formatFirebaseTime(paymentHistory.createdAt || "N/A")}</td>
        <td>${paymentHistory.appTransId || "N/A"}</td>
        <td>${formattedVND || 0}</td>
        <td>${paymentHistory.status || "Chưa xác định"}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  paymentHistoryListContainer.innerHTML = tableHTML;

  // Thêm sự kiện click vào từng hàng
  document.querySelectorAll(".payment-item").forEach((row) => {
    row.addEventListener("click", (event) => {
      const itemId = event.currentTarget.getAttribute("data-id");
      showItemDetail(itemId);
    });
  });


}
function showItemDetail(itemId) {
  const item = allPaymentHistoryData.find((data) => data.id === itemId);
  const itemDichVu = allServiceData.find((data) => data.id === itemId);
  
  // Xác định đối tượng chi tiết
  const newItem = item || itemDichVu;

  // Kiểm tra loại giao dịch và xác định nội dung hiển thị mã
  const itemTypeLabel = item ? "Mã hợp đồng:" : "Mã dịch vụ:";
  const itemTypeValue = item ? newItem.contractId : newItem.serviceId;

  const itemDetailContent = document.getElementById("itemDetailContent");
  itemDetailContent.innerHTML = `
    <h3>Chi Tiết Giao Dịch ${item ? "Hợp Đồng" : "Dịch Vụ"}</h3>
    <table class="item-detail-table">
      <tr><td><strong>Số tiền:</strong></td><td>${formatCurrency(newItem.amount)}</td></tr>
      <tr><td><strong>${itemTypeLabel}</strong></td><td>${itemTypeValue || "N/A"}</td></tr>
      <tr><td><strong>Mã ứng dụng:</strong></td><td>${newItem.appId || "N/A"}</td></tr>
      <tr><td><strong>Thời gian giao dịch:</strong></td><td>${formatFirebaseTimes(newItem.appTime)}</td></tr>
      <tr><td><strong>Mã giao dịch:</strong></td><td>${newItem.appTransId || "N/A"}</td></tr>
      <tr><td><strong>Ngân hàng:</strong></td><td>${newItem.bankCode || "N/A"}</td></tr>
      <tr><td><strong>Mã hoá đơn:</strong></td><td>${newItem.billId || "N/A"}</td></tr>
      <tr><td><strong>Kênh:</strong></td><td>${newItem.channel || "N/A"}</td></tr>
      <tr><td><strong>Thời gian tạo:</strong></td><td>${formatFirebaseTimes(newItem.createdAt)}</td></tr>
      <tr><td><strong>Mô tả:</strong></td><td>${newItem.description || "N/A"}</td></tr>
      <tr><td><strong>Thời gian hết hạn (giây):</strong></td><td>${newItem.expireDurationSeconds || "N/A"}</td></tr>
      <tr><td><strong>ID Thanh Toán:</strong></td><td>${newItem.idThanhToan || "N/A"}</td></tr>
      <tr><td><strong>URL đặt hàng:</strong></td><td><a href="${newItem.orderUrl}" target="_blank">Xem chi tiết</a></td></tr>
      <tr><td><strong>Thời gian server:</strong></td><td>${formatFirebaseTimes(newItem.serverTime)}</td></tr>
      <tr><td><strong>Trạng thái:</strong></td><td>${newItem.status || "N/A"}</td></tr>
      <tr><td><strong>Loại hoá đơn:</strong></td><td>${newItem.typeBill || "N/A"}</td></tr>
      <tr><td><strong>Cập nhật vào lúc:</strong></td><td>${formatFirebaseTimestamp(newItem.updateAt || "N/A")}</td></tr>
      <tr><td><strong>Mã giao dịch ZaloPay:</strong></td><td>${newItem.zpTransId || "N/A"}</td></tr>
      <tr><td><strong>Token giao dịch:</strong></td><td>${newItem.zpTransToken || "N/A"}</td></tr>
      <tr><td><strong>Mã người dùng ZaloPay:</strong></td><td>${newItem.zpUserId || "N/A"}</td></tr>
    </table>
  `;

  const modal = document.getElementById("itemDetailModal");
  modal.style.display = "block";
}


function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function formatFirebaseTimes(timestamp) {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  return date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}
function formatFirebaseTimestamp(timestamp) {
  if (!timestamp || typeof timestamp !== "object") {
    return "Không có thông tin thời gian";
  }

  // Kiểm tra và chuyển đổi timestamp từ seconds và nanoseconds
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  
  // Định dạng thời gian hiển thị
  return date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}




const closeModal = document.getElementById("closeModal");
closeModal.addEventListener("click", () => {
  document.getElementById("itemDetailModal").style.display = "none";
});

window.addEventListener("click", (event) => {
  const modal = document.getElementById("itemDetailModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});


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

function filterLichSuHopDong(event) {
  const keyword = removeVietnameseTones(event.target.value).toLowerCase(); // Từ khóa không dấu và chuyển thành chữ thường
  // Lọc danh sách gốc để tìm dịch vụ phù hợp
  const filteredLichSu = allPaymentHistoryData.filter((paymentHistory) => {
    return (
      removeVietnameseTones(paymentHistory.appTransId || "")
        .toLowerCase()
        .includes(keyword) || // Kiểm tra theo mã công việc
      removeVietnameseTones(paymentHistory.idThanhToan || "")
        .toLowerCase()
        .includes(keyword) || // Kiểm tra theo mã nhân viên
      removeVietnameseTones(paymentHistory.status || "")
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


function filterLichSuDichVu(event) {
  const keyword = removeVietnameseTones(event.target.value).toLowerCase(); // Từ khóa không dấu và chuyển thành chữ thường
  // Lọc danh sách gốc để tìm dịch vụ phù hợp
  const filteredLichSu = allServiceData.filter((service) => {
    return (
      removeVietnameseTones(service.appTransId || "")
        .toLowerCase()
        .includes(keyword) || // Kiểm tra theo mã công việc
      removeVietnameseTones(service.idThanhToan || "")
        .toLowerCase()
        .includes(keyword) || // Kiểm tra theo mã nhân viên
      removeVietnameseTones(service.status || "")
        .toLowerCase()
        .includes(keyword) // Kiểm tra theo trạng thái
    );
  });

  if (filteredLichSu.length === 0) {
    showNoResultMessageDichVu(); // Hiển thị thông báo không tìm thấy
  } else {
    renderSerivceList(filteredLichSu); // Hiển thị danh sách đã lọc
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
  const informationListContainer = document.getElementById("hopdong-contract-list");
  informationListContainer.innerHTML = `
    <div class="no-result-message">
        <img src="../public/assets/imgs/icons/ic-sad-face.png" alt="">
      <p>Không tìm thấy kết quả phù hợp.</p>
    </div>
  `;
}

function showNoResultMessageDichVu() {
  const informationListContainer = document.getElementById("dichvu-contract-list");
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
  fetchAllServices()
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", filterLichSuHopDong); // Lắng nghe sự kiện tìm kiếm
  searchInput.addEventListener("input", filterLichSuDichVu); // Lắng nghe sự kiện tìm kiếm
});

window.goBack = goBack;
window.filterLichSuHopDong = filterLichSuHopDong;
