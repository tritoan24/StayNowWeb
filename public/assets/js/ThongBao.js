import { db, database } from "./FireBaseConfig.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// UID cụ thể
const uid = "3GonTczKVCaPy4u3oeTTeLClUF83";
let thongBaoData = [];

async function fetchThongBaoData() {
  const db = getDatabase();
  const thongBaoRef = ref(db, `ThongBao/${uid}`);

  try {
    onValue(thongBaoRef, (snapshot) => {
      thongBaoData = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const thongBao = {
            id: childSnapshot.key,
            ...childSnapshot.val(),
          };
          thongBaoData.push(thongBao);
        });
      }
      renderThongBaoList(thongBaoData);
    });
  } catch (e) {
    console.error("Lỗi khi lấy dữ liệu thông báo:", e);
  }
}

function renderThongBaoList(data) {
  const thongBaoListContainer = document.getElementById("thongBaoList");
  thongBaoListContainer.innerHTML = "";

  if (data.length === 0) {
    thongBaoListContainer.innerHTML = "<p>Không có thông báo nào.</p>";
    return;
  }

  let listHTML = `<ul class="notification-list">`;

  data.forEach((thongBao) => {
    const statusClass = thongBao.trangThai === "unread" ? "unread" : "read";
    listHTML += `
   <li class="notification-item ${statusClass}" onclick='showItemDetail(${JSON.stringify(
      thongBao
    )})'>

        <h3>${thongBao.tieuDe}</h3>
        <p><strong>Thời gian gửi:</strong> ${formatFirebaseTime(
          thongBao.ngayGuiThongBao
        )}</p>
        <p><strong>Nội dung:</strong> ${thongBao.tinNhan}</p>
        <p><strong>Loại thông báo:</strong> ${thongBao.loaiThongBao}</p>
      </li>
    `;
  });

  listHTML += `</ul>`;
  thongBaoListContainer.innerHTML = listHTML;
}

function formatFirebaseTime(firebaseTime) {
  const date = new Date(firebaseTime);
  return date.toLocaleString("vi-VN");
}

// Lấy modal và các phần tử liên quan
const modal = document.getElementById("itemDetailModal");
const closeModal = document.getElementById("closeModal");
const itemDetailContent = document.getElementById("itemDetailContent");

// Hàm để mở modal và hiển thị chi tiết
function showItemDetail(item) {
  itemDetailContent.innerHTML = `
    <h3>${item.tieuDe}</h3>
    <p><strong>Thời gian gửi:</strong> ${formatFirebaseTime(
      item.ngayGuiThongBao
    )}</p>
    <p><strong>Nội dung:</strong> ${item.tinNhan}</p>
    <p><strong>Loại thông báo:</strong> ${item.loaiThongBao}</p>
  `;
  modal.style.display = "block"; // Mở modal
}

// Hàm để đóng modal
closeModal.onclick = function () {
  modal.style.display = "none";
};

// Khi người dùng click ra ngoài modal, đóng modal
window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Gọi hàm khi tải trang
document.addEventListener("DOMContentLoaded", () => {
  fetchThongBaoData();
});

function filterThongBao(event) {
  const keyword = removeVietnameseTones(event.target.value).toLowerCase();
  const filteredThongBao = thongBaoData.filter((thongBao) => {
    return (
      removeVietnameseTones(thongBao.tieuDe || "")
        .toLowerCase()
        .includes(keyword) ||
      removeVietnameseTones(thongBao.tinNhan || "")
        .toLowerCase()
        .includes(keyword) ||
      removeVietnameseTones(thongBao.loaiThongBao || "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  if (filteredThongBao.length === 0) {
    showNoResultMessage();
  } else {
    renderThongBaoList(filteredThongBao);
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
  const informationListContainer =
    document.getElementById("paymentHistoryList");
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

window.goBack = goBack;
window.filterThongBao = filterThongBao;
window.showItemDetail = showItemDetail;
