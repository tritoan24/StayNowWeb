import { db, database } from "./FireBaseConfig.js";
import {
  collection,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let roomTypeData = [];
let allRoomTypeData = [];
let currentId = null;
let currentPage = 1; // Trang hiện tại
const itemsPerPage = 10; // Số hàng hiển thị trên mỗi trang

async function fetchAllRoomTypes() {
  const roomTypeRef = collection(db, "LoaiPhong");

  try {
    const querySnapshot = await getDocs(roomTypeRef);
    roomTypeData = [];
    allRoomTypeData = [];
    querySnapshot.forEach((doc) => {
      const roomType = { id: doc.id, ...doc.data() };
      allRoomTypeData.push(roomType); // Lưu vào danh sách gốc
      roomTypeData.push(roomType); // Lưu vào danh sách gốc
    });

    renderRoomTypeList(allRoomTypeData); // Render toàn bộ khi vừa tải
  } catch (e) {
    console.error("Lỗi khi lấy danh sách loại phòng:", e);
  }
}

function renderRoomTypeList(data) {
  const roomTypeListContainer = document.getElementById("roomTypeList");
  roomTypeListContainer.innerHTML = ""; // Xóa nội dung cũ

  if (data.length === 0) {
    roomTypeListContainer.innerHTML = `
      <div class="no-result-message">
          <img src="../public/assets/imgs/icons/ic-sad-face.png" alt="">
        <p>Không tìm thấy kết quả phù hợp.</p>
      </div>
    `;
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  let tableHTML = `
    <table class="room-type-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên loại phòng</th>
          <th>Trạng thái</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
  `;

  paginatedData.forEach((roomType) => {
    tableHTML += `
      <tr>
        <td>${roomType.maLoaiPhong || "N/A"}</td>
        <td>
          <span id="roomTypeName-${roomType.id}" onclick="editRoomTypeName('${roomType.id}')">
            ${roomType.tenLoaiPhong}
          </span>
          <input type="text" id="inputRoomTypeName-${roomType.id}" value="${roomType.tenLoaiPhong}" style="display:none" />
        </td>
        <td>${roomType.trangThai || "Chưa xác định"}</td>
        <td><div class='action-btn'>
          <p>Cập nhật</p>
          <img src="./assets/imgs/icons/ic-remove.png" onclick="deleteTypeRoom('${roomType.id}')"/>
        </div></td>
      </tr>
    `;
  });

  tableHTML += `</tbody></table>`;
  roomTypeListContainer.innerHTML = tableHTML;

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
      renderRoomTypeList(data); // Render lại danh sách đã lọc
    });
    paginationContainer.appendChild(button);
  }
}

function filterLoaiPhong(event) {
  const keyword = removeVietnameseTones(event.target.value || "").toLowerCase(); // Từ khóa không dấu
  const filteredRoomType = allRoomTypeData.filter((roomType) => {
    return (
      removeVietnameseTones(roomType.maLoaiPhong || "").includes(keyword) ||
      removeVietnameseTones(roomType.tenLoaiPhong || "").includes(keyword)
    );
  });

  renderRoomTypeList(filteredRoomType); // Render danh sách đã lọc
}

function removeVietnameseTones(str) {
  if (typeof str !== "string") {
    console.error("Invalid input for removeVietnameseTones:", str);
    return ""; // Trả về chuỗi rỗng nếu input không hợp lệ
  }

  return str
    .normalize("NFD") // Chuyển chuỗi thành dạng tổ hợp
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase(); // Chuyển thành chữ thường
}

function goBack() {
  if (document.referrer) {
    window.history.back(); // Quay về trang trước nếu có trang trước
  } else {
    console.log("Không có trang trước để quay lại.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchAllRoomTypes(); // Gọi hàm để tải danh sách phòng trọ khi trang tải xong
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", filterLoaiPhong); // Lắng nghe sự kiện tìm kiếm
});

async function addRoomType() {
  const input = document.getElementById("addTypeRoomInput");
  const roomTypeName = input.value.trim();

  if (!roomTypeName) {
    alert("Vui lòng nhập tên loại phòng!");
    return;
  }

  try {
    const roomTypeRef = collection(db, "LoaiPhong");
    const docRef = await addDoc(roomTypeRef, {
      tenLoaiPhong: roomTypeName,
      trangThai: true, // Hoặc trạng thái mặc định
    });

    await setDoc(docRef, {
      maLoaiPhong: docRef.id, // ID tự động của Firestore
      tenLoaiPhong: roomTypeName,
      trangThai: true, // Hoặc trạng thái mặc định
    });

    showSuccessModal("Loại phòng đã được thêm thành công.", () => {
      input.value = ""; // Xóa nội dung ô nhập
      fetchAllRoomTypes(); // Tải lại danh sách loại phòng
    });

  } catch (error) {
    console.error("Lỗi khi thêm loại phòng:", error);
    alert("Đã xảy ra lỗi khi thêm loại phòng.");
  }
}

// Gán sự kiện click cho nút thêm loại phòng
document.addEventListener("DOMContentLoaded", () => {
  const addButton = document.querySelector(".btn-add-type-room");
  addButton.addEventListener("click", addRoomType);
});

async function deleteTypeRoom(roomTypeId) {
  showDeleteConfirmModal(roomTypeId, async (id) => {
    try {
      const typeRoomDocRef = doc(db, "LoaiPhong", id);
      await deleteDoc(typeRoomDocRef);

      // Cập nhật danh sách loại phòng sau khi xóa
      fetchAllRoomTypes();
      showSuccessModal("Loại phòng đã được xóa thành công.");
    } catch (error) {
      console.error("Lỗi khi xóa loại phòng:", error);
      alert("Có lỗi xảy ra khi xóa loại phòng.");
    }
  });
}

function editRoomTypeName(roomTypeId) {
  const nameSpan = document.getElementById(`roomTypeName-${roomTypeId}`);
  const inputField = document.getElementById(`inputRoomTypeName-${roomTypeId}`);

  // Ẩn span và hiển thị input
  nameSpan.style.display = "none";
  inputField.style.display = "inline-block";

  // Khi nhấn Enter hoặc focus ra ngoài, cập nhật tên loại phòng
  inputField.addEventListener('blur', () => updateRoomTypeName(roomTypeId));
  inputField.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
      updateRoomTypeName(roomTypeId);
    }
  });
}
async function updateRoomTypeName(roomTypeId) {
  const inputField = document.getElementById(`inputRoomTypeName-${roomTypeId}`);
  const newName = inputField.value.trim();

  if (!newName) {
    alert("Tên loại phòng không thể để trống!");
    return;
  }

  try {
    const roomTypeRef = doc(db, "LoaiPhong", roomTypeId);
    await setDoc(roomTypeRef, { tenLoaiPhong: newName }, { merge: true });

    // Cập nhật lại danh sách sau khi thay đổi
    fetchAllRoomTypes();

    // Ẩn ô input và hiển thị lại tên
    const nameSpan = document.getElementById(`roomTypeName-${roomTypeId}`);
    nameSpan.textContent = newName;
    nameSpan.style.display = "inline-block";
    inputField.style.display = "none";

    showSuccessModal("Tên loại phòng đã được cập nhật.");
  } catch (error) {
    console.error("Lỗi khi cập nhật tên loại phòng:", error);
    alert("Có lỗi xảy ra khi cập nhật tên loại phòng.");
  }
}




function showSuccessModal(message, callback = null) {
  const modal = document.getElementById("successModal");
  const modalMessage = document.getElementById("modalMessage");
  const modalAction = document.getElementById("modalAction");

  modalMessage.textContent = message;
  modal.classList.remove("modalHidden");
  modal.style.display = "block";

  modalAction.onclick = () => {
    hideModal(modal);
    if (callback) callback();
  };

  document.getElementById("closeModal").onclick = () => hideModal(modal);
}

function showDeleteConfirmModal(comfortId, deleteCallback) {
  const modal = document.getElementById("deleteConfirmModal");
  modal.classList.remove("modalHidden");
  modal.style.display = "block";

  // Xác nhận xóa
  document.getElementById("confirmDelete").onclick = async function () {
    await deleteCallback(comfortId);
    hideModalDelete(modal);
  };

  // Hủy bỏ xóa
  document.getElementById("cancelDelete").onclick = () =>
    hideModalDelete(modal);

  // Đóng modal khi nhấn ra ngoài
  window.onclick = function (event) {
    if (event.target === modal) {
      hideModalDelete(modal);
    }
  };
}

// Ẩn modal
function hideModal() {
  const modal = document.getElementById("successModal");
  modal.classList.add("modalHidden");
  modal.style.display = "none";
}

function hideModalDelete() {
  const modal = document.getElementById("deleteConfirmModal");
  modal.classList.add("modalHidden");
  modal.style.display = "none";
}


window.goBack = goBack;
window.filterLoaiPhong = filterLoaiPhong;
window.deleteTypeRoom = deleteTypeRoom
window.editRoomTypeName = editRoomTypeName
