import { db, database } from "./FireBaseConfig.js";
import {
  collection,
  getDocs,
  doc, getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let backlogData = [];
let allBacklogData = [];
let currentPage = 1; // Trang hiện tại
const itemsPerPage = 10; // Số hàng hiển thị trên mỗi trang

async function fetchAllBacklogs() {
  const backLogRef = collection(db, "PhanChiaCV");

  try {
    const querySnapshot = await getDocs(backLogRef);
    allBacklogData = [];
    backlogData = [];

    querySnapshot.forEach((doc) => {
      const backlog = { id: doc.id, ...doc.data() };
      
      // Chỉ thêm vào danh sách nếu trạng thái là "PROCCESSING"
      if (backlog.trangThai === "PROCESSING") {
        allBacklogData.push(backlog);
        backlogData.push(backlog);
      }
    });

    renderBackLogList(allBacklogData); // Render chỉ mục trạng thái PROCCESSING
  } catch (e) {
    console.error("Lỗi khi lấy danh sách công việc:", e);
  }
}

async function fetchContractDetails(contractId) {
  if (!contractId) {
    console.warn("Không có ID hợp đồng để tìm kiếm.");
    return null;
  }

  try {
    const contractRef = doc(db, "HopDong", contractId);
    const contractSnapshot = await getDoc(contractRef);
    if (contractSnapshot.exists()) {
      return contractSnapshot.data();
    } else {
      console.warn("Không tìm thấy hợp đồng với ID:", contractId);
      return null;
    }
  } catch (e) {
    console.error("Lỗi khi lấy thông tin hợp đồng:", e);
    return null;
  }
}


function renderBackLogList(data) {
  const backlogListContainer =
    document.getElementById("backlogList");
    backlogListContainer.innerHTML = "";

  if (data.length === 0) {
    backlogListContainer.innerHTML =
      "<p>Không có công việc nào phù hợp.</p>";
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
          <th>Mã hợp đồng</th>
          <th>Mã nhân viên</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
  `;

  paginatedData.forEach((backlog) => {

    tableHTML += `
      <tr class="payment-item" data-id="${backlog.id}">
        <td>${formatFirebaseTime(backlog.thoigian || "N/A")}</td>
        <td>${backlog.idHopDong || "N/A"}</td>
        <td>${backlog.idNhanVien || "N/A"}</td>
        <td>${backlog.trangThai || "Chưa xác định"}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  backlogListContainer.innerHTML = tableHTML;

  // Thêm sự kiện click vào từng hàng
  document.querySelectorAll(".payment-item").forEach((row) => {
    row.addEventListener("click", (event) => {
      const itemId = event.currentTarget.getAttribute("data-id");
      showItemDetail(itemId);
    });
  });

}

async function showItemDetail(itemId) {
  const item = allBacklogData.find((data) => data.id === itemId);

  if (!item) {
    alert("Không tìm thấy chi tiết cho mục này.");
    return;
  }

  const contractDetails = await fetchContractDetails(item.idHopDong);

  const itemDetailContent = document.getElementById("itemDetailContent");
  itemDetailContent.innerHTML = `
    <p><strong>Thời gian:</strong> ${formatFirebaseTime(item.thoigian)}</p>
    <p><strong>Mã hợp đồng:</strong> ${item.idHopDong || "N/A"}</p>
    <p><strong>Mã nhân viên:</strong> ${item.idNhanVien || "N/A"}</p>
    <p><strong>Thông tin hợp đồng:</strong></p>
    <p>${contractDetails ? `
      <p>
         <strong>SĐT chủ nhà:</strong> ${contractDetails.chuNha.soDienThoai || "N/A"}<br>
      </p>   
      <p>
               <strong>Tên người thuê:</strong> ${contractDetails.nguoiThue.hoTen || "N/A"}<br>
      </p>
       <p>
            <strong>SĐT người thuê:</strong> ${contractDetails.nguoiThue.soDienThoai || "N/A"}<br>
      </p>
       <p>
               <strong>Số CCCD người thuê:</strong> ${contractDetails.nguoiThue.soCCCD || "N/A"}<br>
      </p>
  
      ` : "Không có thông tin hợp đồng."}
    </p>
  `;

  const modal = document.getElementById("itemDetailModal");
  modal.style.display = "block";
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

function filterBacklog(event) {
  const keyword = removeVietnameseTones(event.target.value).toLowerCase(); // Từ khóa không dấu và chuyển thành chữ thường
  // Lọc danh sách gốc để tìm dịch vụ phù hợp
  const filteredLichSu = allBacklogData.filter((paymentHistory) => {
    return (
      removeVietnameseTones(paymentHistory.idHopDong || "")
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
    renderBackLogList(filteredLichSu); // Hiển thị danh sách đã lọc
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
  const informationListContainer = document.getElementById("backlogList");
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
  fetchAllBacklogs(); // Gọi hàm để tải danh sách phòng trọ khi trang tải xong
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", filterBacklog); // Lắng nghe sự kiện tìm kiếm
});

window.goBack = goBack;
window.filterBacklog = filterBacklog;
