import { db } from "./FireBaseConfig.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";



// Biến toàn cục để lưu trữ danh sách phòng trọ
let comforts = [];
let allComforts = []; // Danh sách gốc

async function fetchAllComfort() {
  const comfortsRef = collection(db, "TienNghi");

  try {
    const querySnapshot = await getDocs(comfortsRef);
    comforts = []; // Reset danh sách
    allComforts = []; // Reset danh sách

    querySnapshot.forEach((doc) => {
      const comfort = { id: doc.id, ...doc.data() };
      allComforts.push(comfort); // Lưu vào danh sách gốc
      comforts.push(comfort); // Lưu vào danh sách hiển thị
    });

    renderComfortList(comforts); // Hiển thị danh sách
  } catch (e) {
    console.error("Lỗi khi lấy danh sách tiện nghi!:", e);
  }
}

function filterComfort(event) {
  const keyword = event.target.value.toLowerCase(); // Lấy từ khóa và chuyển về chữ thường

  // Lọc danh sách gốc để tìm dịch vụ phù hợp
  const filteredComforts = allComforts.filter((comfort) =>
    comfort.Ten_tiennghi.toLowerCase().includes(keyword)
  );

  // Hiển thị danh sách đã lọc
  renderComfortList(filteredComforts);
}

function renderComfortList(comforts) {
  const comfortListContainer = document.getElementById("comfortList");
  comfortListContainer.innerHTML = ""; // Xóa nội dung cũ

  const activeComforts = comforts.filter(
    (comfort) => comfort.Status === true
  );
  const inactiveComforts = comforts.filter(
    (comfort) => comfort.Status === false
  );

  // Hiển thị dịch vụ hoạt động
  const activeComfortContainer = document.createElement("div");
  activeComfortContainer.innerHTML = `<h3 class="titleStatus">Hoạt động</h3>`;
  activeComforts.forEach((comfort) => {
    const comfortDiv = document.createElement("div");
    comfortDiv.className = "comfort";
    comfortDiv.id = `comfort${comfort.id}`;

    comfortDiv.innerHTML = `
      <div class="comfort-card">
        <div class="comfort-image">
            <img src="${comfort.Icon_tiennghi}" alt="${comfort.Ten_tiennghi}" />
        </div>
        <div class="comfort-info">
            <h3 class="comfort-title">${comfort.Ten_tiennghi}</h3>
             <div class="status-layout">
              <img src="../public/assets/imgs/icons/ic-dot-active.svg" alt="">
                      <p class="comfort-status">Hoạt động</p>
            </div>
           
            <div class="comfort-actions">
                <button class="btn update" onclick="updateComfort('${comfort.id}')">Cập nhật</button>
                <button class="btn cancel" onclick="cancelComfort('${comfort.id}')">Hủy</button>
            </div>
        </div>
      </div>
    `;
    activeComfortContainer.appendChild(comfortDiv);
  });

  // Hiển thị dịch vụ đã hủy
  const inactiveComfortsContainer = document.createElement("div");
  inactiveComfortsContainer.innerHTML = `<h3 class="titleStatus">Đã hủy</h3>`;
  inactiveComforts.forEach((comfort) => {
    const comfortDiv = document.createElement("div");
    comfortDiv.className = "comfort";
    comfortDiv.id = `comfort${comfort.id}`;

    comfortDiv.innerHTML = `
      <div class="comfort-card">
        <div class="comfort-image">
            <img src="${comfort.Icon_tiennghi}" alt="${comfort.Ten_tiennghi}" />
        </div>
        <div class="comfort-info">
            <h3 class="comfort-title">${comfort.Ten_tiennghi}</h3>
     <div class="status-layout">
              <img src="../public/assets/imgs/icons/ic-dot-cancel.svg" alt="">
            <p class="comfort-status">Đã hủy</p>
            </div>
           
            <div class="comfort-actions">
                <button class="btn activate" onclick="activateComfort('${comfort.id}')">Kích hoạt</button>
                <button class="btn delete" onclick="deleteComfort('${comfort.id}')">Xóa</button>
            </div>
        </div>
      </div>
    `;
    inactiveComfortsContainer.appendChild(comfortDiv);
  });

  comfortListContainer.appendChild(activeComfortContainer);
  comfortListContainer.appendChild(inactiveComfortsContainer);
}

async function cancelComfort(comfortId) {
  const comfort = comforts.find((s) => s.id === comfortId);

  if (comfort) {
    try {
      // Cập nhật trạng thái trong Firestore
      const comfortRef = doc(db, "TienNghi", comfortId); // Tạo tham chiếu đến dịch vụ trong Firestore
      await updateDoc(comfortRef, { Status: false }); // Cập nhật trạng thái thành false

      comfort.Status = false;
      // Làm mới giao diện để hiển thị trạng thái mới
      renderComfortList(comforts);
    } catch (e) {
      console.error("Lỗi khi cập nhật trạng thái tiện nghi:", e);
    }
  }
}

async function activateComfort(comfortId) {
  const comfort = comforts.find((s) => s.id === comfortId);

  if (comfort) {
    try {
      // Cập nhật trạng thái trong Firestore
      const comfortRef = doc(db, "TienNghi", comfortId); // Tạo tham chiếu đến dịch vụ trong Firestore
      await updateDoc(comfortRef, { Status: true }); // Cập nhật trạng thái thành true

      comfort.Status = true;

      // Làm mới giao diện để hiển thị trạng thái mới
      renderComfortList(comforts);
    } catch (e) {
      console.error("Lỗi khi kích hoạt lại trạng thái tiện nghi:", e);
    }
  }
}

async function deleteComfort(comfortId) {
  showDeleteConfirmModal(comfortId, async (id) => {
    try {
      const comfortDocRef = doc(db, "TienNghi", id);
      await deleteDoc(comfortDocRef);

      // Cập nhật danh sách dịch vụ
      fetchAllComfort();
      showSuccessModal("Tiện nghi đã được xóa thành công.");
    } catch (error) {
      console.error("Lỗi khi xóa tiện nghi:", error);
      alert("Có lỗi xảy ra khi xóa tiện nghi.");
    }
  });
}

async function handleFormSubmit(event) {
  event.preventDefault(); // Ngừng việc làm mới trang khi nhấn nút Submit

  const form = document.getElementById("insertComfortForm");
  const mode = form.getAttribute("data-mode"); // Lấy trạng thái của form (add hoặc update)

  // Lấy dữ liệu từ các trường input
  const comfortName = document.getElementById("comfortName").value;
  const comfortIcon = document.getElementById("comfortIcon").value;
  const comfortStatus =
    document.getElementById("comfortStatus").value === "true"; // Convert về kiểu boolean
  let hasError = false;

  // Kiểm tra xem các trường có hợp lệ không
  if (!comfortName) {
    document.getElementById("comfortNameError").classList.remove("hidden");
    hasError = true;
    return;
  } else {
    document.getElementById("comfortNameError").classList.add("hidden");
  }
  if (!comfortIcon) {
    document.getElementById("comfortIconError").classList.remove("hidden");
    hasError = true;
    return;
  } else {
    document.getElementById("comfortIconError").classList.add("hidden");
  }

  try {
    if (mode === "add") {
      // Thêm mới
      const comfortsRef = collection(db, "TienNghi");
      await addDoc(comfortsRef, {
        Ten_tiennghi: comfortName,
        Icon_tiennghi: comfortIcon,
        Status: comfortStatus,
      });
      showSuccessModal("Tiện nghi đã được thêm thành công.", () => {
        clearForm();
        fetchAllComfort();
      });
    } else if (mode === "update") {
      // Lấy ID dịch vụ đang được cập nhật (giả sử lưu trong form)
      const comfortId = form.getAttribute("data-comfort-id");
      if (!comfortId) {
        alert("Không tìm thấy ID thông tin để cập nhật.");
        return;
      }

      // Cập nhật dịch vụ
      const comfortsRef = doc(db, "TienNghi", comfortId);
      await updateDoc(comfortsRef, {
        Ten_tiennghi: comfortName,
        Icon_tiennghi: comfortIcon,
        Status: comfortStatus,
      });
      showSuccessModal("Tiện nghi đã được cập nhật thành công.", () => {
        clearForm();
        fetchAllComfort();
      });
    }
  } catch (e) {
    console.error("Lỗi khi xử lý form:", e);
    alert("Có lỗi xảy ra.");
  }
}
function updateComfort(comfortId) {
  // Tìm dịch vụ theo ID từ danh sách all
  const selectedComfort = allComforts.find(
    (comfort) => comfort.id === comfortId
  );

  if (selectedComfort) {
    // Điền thông tin vào form
    document.getElementById("comfortName").value =
    selectedComfort.Ten_tiennghi || "";
    document.getElementById("comfortIcon").value =
    selectedComfort.Icon_tiennghi || "";
    document.getElementById("comfortStatus").value =
    selectedComfort.Status.toString();

    // Chuyển form sang chế độ cập nhật
    const form = document.getElementById("insertComfortForm");
    form.setAttribute("data-mode", "update");
    form.setAttribute("data-comfort-id", comfortId); // Lưu ID dịch vụ để cập nhật

    // Thay đổi nút "Thêm dịch vụ" thành "Cập nhật dịch vụ"
    const submitButton = document.getElementById("submitComfortBtn");
    submitButton.textContent = "Cập nhật thông tin";
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

function goBack() {
  if (document.referrer) {
    window.history.back(); // Quay về trang trước nếu có trang trước
  } else {
    console.log("Không có trang trước để quay lại.");
  }
}
function clearForm() {
  document.getElementById("comfortName").value = "";
  document.getElementById("comfortIcon").value = "";
  document.getElementById("comfortStatus").value = "true";

  const form = document.getElementById("insertComfortForm");
  form.setAttribute("data-mode", "add");
  form.removeAttribute("data-comfort-id"); // Xóa ID dịch vụ nếu có

  // Đặt lại nút submit về trạng thái "Thêm dịch vụ"
  const submitButton = document.getElementById("submitComfortBtn");
  submitButton.textContent = "Thêm tiện nghi";
}

// Lắng nghe sự kiện DOMContentLoaded và gọi hàm fetchAllRooms
document.addEventListener("DOMContentLoaded", () => {
  fetchAllComfort();
});

document
  .getElementById("submitComfortBtn")
  .addEventListener("click", handleFormSubmit);

document.getElementById("clearFormBtn").addEventListener("click", clearForm);

window.cancelComfort = cancelComfort;
window.activateComfort = activateComfort;
window.deleteComfort = deleteComfort;
window.goBack = goBack;
window.clearForm = clearForm;
window.handleFormSubmit = handleFormSubmit;
window.updateComfort = updateComfort;
window.filterComfort = filterComfort;