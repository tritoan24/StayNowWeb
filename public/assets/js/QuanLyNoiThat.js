import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBmpKO0lDHFiYb3zklAJ2zz6qC-iQrypw0",
  authDomain: "staynowapp1.firebaseapp.com",
  projectId: "staynowapp1",
  storageBucket: "staynowapp1.appspot.com",
  messagingSenderId: "918655571270",
  appId: "1:918655571270:web:94abfaf87fbbb3e4ecc147",
  measurementId: "G-PQP9CTPKGT",
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Biến toàn cục để lưu trữ danh sách phòng trọ
let furnitures = [];
let allFurnitures = []; // Danh sách gốc

async function fetchAllFurniture() {
  const furnituresRef = collection(db, "NoiThat");

  try {
    const querySnapshot = await getDocs(furnituresRef);
    furnitures = []; // Reset danh sách
    allFurnitures = []; // Reset danh sách

    querySnapshot.forEach((doc) => {
      const furniture = { id: doc.id, ...doc.data() };
      allFurnitures.push(furniture); // Lưu vào danh sách gốc
      furnitures.push(furniture); // Lưu vào danh sách hiển thị
    });

    renderFurnitureList(furnitures); // Hiển thị danh sách
  } catch (e) {
    console.error("Lỗi khi lấy danh sách nội thất!:", e);
  }
}

function filterFurniture(event) {
  const keyword = event.target.value.toLowerCase(); // Lấy từ khóa và chuyển về chữ thường

  // Lọc danh sách gốc để tìm dịch vụ phù hợp
  const filteredFurnitures = allFurnitures.filter((furniture) =>
    furniture.Ten_noithat.toLowerCase().includes(keyword)
  );

  // Hiển thị danh sách đã lọc
  renderFurnitureList(filteredInformations);
}

function renderFurnitureList(furnitures) {
  const furnitureListContainer = document.getElementById("furnitureList");
  furnitureListContainer.innerHTML = ""; // Xóa nội dung cũ

  const activeFurnitures = furnitures.filter(
    (furniture) => furniture.Status === true
  );
  const inactiveFurnitures = furnitures.filter(
    (furniture) => furniture.Status === false
  );

  // Hiển thị dịch vụ hoạt động
  const activeFurnitureContainer = document.createElement("div");
  activeFurnitureContainer.innerHTML = `<h3 class="titleStatus">Hoạt động</h3>`;
  activeFurnitures.forEach((furniture) => {
    const furnitureDiv = document.createElement("div");
    furnitureDiv.className = "furniture";
    furnitureDiv.id = `furniture${furniture.id}`;

    furnitureDiv.innerHTML = `
      <div class="furniture-card">
        <div class="furniture-image">
            <img src="${furniture.Icon_noithat}" alt="${furniture.Ten_noithat}" />
        </div>
        <div class="furniture-info">
            <h3 class="furniture-title">${furniture.Ten_noithat}</h3>
             <div class="status-layout">
               <img src="../public/assets/imgs/icons/ic-dot-active.svg" alt="">
                      <p class="furniture-status">Hoạt động</p>
            </div>
           
            <div class="furniture-actions">
                <button class="btn update" onclick="updateFurniture('${furniture.id}')">Cập nhật</button>
                <button class="btn cancel" onclick="cancelFurniture('${furniture.id}')">Hủy</button>
            </div>
        </div>
      </div>
    `;
    activeFurnitureContainer.appendChild(furnitureDiv);
  });

  // Hiển thị dịch vụ đã hủy
  const inactiveFurnituresContainer = document.createElement("div");
  inactiveFurnituresContainer.innerHTML = `<h3 class="titleStatus">Đã hủy</h3>`;
  inactiveFurnitures.forEach((furniture) => {
    const furnitureDiv = document.createElement("div");
    furnitureDiv.className = "furniture";
    furnitureDiv.id = `furniture${furniture.id}`;

    furnitureDiv.innerHTML = `
      <div class="furniture-card">
        <div class="furniture-image">
            <img src="${furniture.Icon_noithat}" alt="${furniture.Ten_noithat}" />
        </div>
        <div class="furniture-info">
            <h3 class="furniture-title">${furniture.Ten_noithat}</h3>
     <div class="status-layout">
                <img src="../public/assets/imgs/icons/ic-dot-cancel.svg" alt="">
            <p class="furniture-status">Đã hủy</p>
            </div>
           
            <div class="furniture-actions">
                <button class="btn activate" onclick="activateFurniture('${furniture.id}')">Kích hoạt</button>
                <button class="btn delete" onclick="deleteFurniture('${furniture.id}')">Xóa</button>
            </div>
        </div>
      </div>
    `;
    inactiveFurnituresContainer.appendChild(furnitureDiv);
  });

  furnitureListContainer.appendChild(activeFurnitureContainer);
  furnitureListContainer.appendChild(inactiveFurnituresContainer);
}

async function cancelFurniture(furnitureId) {
  const furniture = furnitures.find((s) => s.id === furnitureId);

  if (furniture) {
    try {
      // Cập nhật trạng thái trong Firestore
      const furnitureRef = doc(db, "NoiThat", furnitureId); // Tạo tham chiếu đến dịch vụ trong Firestore
      await updateDoc(furnitureRef, { Status: false }); // Cập nhật trạng thái thành false

      furniture.Status = false;
      // Làm mới giao diện để hiển thị trạng thái mới
      renderFurnitureList(furnitures);
    } catch (e) {
      console.error("Lỗi khi cập nhật trạng thái nội thất:", e);
    }
  }
}

async function activateFurniture(furnitureId) {
  const furniture = furnitures.find((s) => s.id === furnitureId);

  if (furniture) {
    try {
      // Cập nhật trạng thái trong Firestore
      const furnitureRef = doc(db, "NoiThat", furnitureId); // Tạo tham chiếu đến dịch vụ trong Firestore
      await updateDoc(furnitureRef, { Status: true }); // Cập nhật trạng thái thành true

      furniture.Status = true;

      // Làm mới giao diện để hiển thị trạng thái mới
      renderFurnitureList(furnitures);
    } catch (e) {
      console.error("Lỗi khi kích hoạt lại trạng thái nội thất:", e);
    }
  }
}

async function deleteFurniture(furnitureId) {
  showDeleteConfirmModal(furnitureId, async (id) => {
    try {
      const furnitureDocRef = doc(db, "NoiThat", id);
      await deleteDoc(furnitureDocRef);

      // Cập nhật danh sách dịch vụ
      fetchAllFurniture();
      showSuccessModal("Nội thất đã được xóa thành công.");
    } catch (error) {
      console.error("Lỗi khi xóa nội thất:", error);
      alert("Có lỗi xảy ra khi xóa nội thất.");
    }
  });
}

async function handleFormSubmit(event) {
  event.preventDefault(); // Ngừng việc làm mới trang khi nhấn nút Submit

  const form = document.getElementById("insertFurnitureForm");
  const mode = form.getAttribute("data-mode"); // Lấy trạng thái của form (add hoặc update)

  // Lấy dữ liệu từ các trường input
  const furnitureName = document.getElementById("furnitureName").value;
  const furnitureIcon = document.getElementById("furnitureIcon").value;
  const furnitureStatus =
    document.getElementById("furnitureStatus").value === "true"; // Convert về kiểu boolean
  let hasError = false;

  // Kiểm tra xem các trường có hợp lệ không
  if (!furnitureName) {
    document.getElementById("furnitureNameError").classList.remove("hidden");
    hasError = true;
    return;
  } else {
    document.getElementById("furnitureNameError").classList.add("hidden");
  }
  if (!furnitureIcon) {
    document.getElementById("furnitureIconError").classList.remove("hidden");
    hasError = true;
    return;
  } else {
    document.getElementById("furnitureIconError").classList.add("hidden");
  }

  try {
    if (mode === "add") {
      // Thêm mới
      const furnituresRef = collection(db, "NoiThat");
      await addDoc(furnituresRef, {
        Ten_noithat: furnitureName,
        Icon_noithat: furnitureIcon,
        Status: furnitureStatus,
      });
      showSuccessModal("Nội thất đã được thêm thành công.", () => {
        clearForm();
        fetchAllFurniture();
      });
    } else if (mode === "update") {
      // Lấy ID dịch vụ đang được cập nhật (giả sử lưu trong form)
      const furnitureId = form.getAttribute("data-furniture-id");
      if (!furnitureId) {
        alert("Không tìm thấy ID thông tin để cập nhật.");
        return;
      }

      // Cập nhật dịch vụ
      const furnitureRef = doc(db, "NoiThat", furnitureId);
      await updateDoc(furnitureRef, {
        Ten_noithat: furnitureName,
        Icon_noithat: furnitureIcon,
        Status: furnitureStatus,
      });
      showSuccessModal("Nội thất đã được cập nhật thành công.", () => {
        clearForm();
        fetchAllFurniture();
      });
    }
  } catch (e) {
    console.error("Lỗi khi xử lý form:", e);
    alert("Có lỗi xảy ra.");
  }
}
function updateFurniture(furnitureId) {
  // Tìm dịch vụ theo ID từ danh sách all
  const selectedFurniture = allFurnitures.find(
    (furniture) => furniture.id === furnitureId
  );

  if (selectedFurniture) {
    // Điền thông tin vào form
    document.getElementById("furnitureName").value =
    selectedFurniture.Ten_noithat || "";
    document.getElementById("furnitureIcon").value =
    selectedFurniture.Icon_noithat || "";
    document.getElementById("furnitureStatus").value =
    selectedFurniture.Status.toString();

    // Chuyển form sang chế độ cập nhật
    const form = document.getElementById("insertFurnitureForm");
    form.setAttribute("data-mode", "update");
    form.setAttribute("data-furniture-id", furnitureId); // Lưu ID dịch vụ để cập nhật

    // Thay đổi nút "Thêm dịch vụ" thành "Cập nhật dịch vụ"
    const submitButton = document.getElementById("submitFurnitureBtn");
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

function showDeleteConfirmModal(serviceId, deleteCallback) {
  const modal = document.getElementById("deleteConfirmModal");
  modal.classList.remove("modalHidden");
  modal.style.display = "block";

  // Xác nhận xóa
  document.getElementById("confirmDelete").onclick = async function () {
    await deleteCallback(serviceId);
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
  document.getElementById("furnitureName").value = "";
  document.getElementById("furnitureIcon").value = "";
  document.getElementById("furnitureStatus").value = "true";

  const form = document.getElementById("insertFurnitureForm");
  form.setAttribute("data-mode", "add");
  form.removeAttribute("data-furniture-id"); // Xóa ID dịch vụ nếu có

  // Đặt lại nút submit về trạng thái "Thêm dịch vụ"
  const submitButton = document.getElementById("submitFurnitureBtn");
  submitButton.textContent = "Thêm nội thất";
}

// Lắng nghe sự kiện DOMContentLoaded và gọi hàm fetchAllRooms
document.addEventListener("DOMContentLoaded", () => {
  fetchAllFurniture();
});

document
  .getElementById("submitFurnitureBtn")
  .addEventListener("click", handleFormSubmit);

document.getElementById("clearFormBtn").addEventListener("click", clearForm);

window.cancelFurniture = cancelFurniture;
window.activateFurniture = activateFurniture;
window.deleteFurniture = deleteFurniture;
window.goBack = goBack;
window.clearForm = clearForm;
window.handleFormSubmit = handleFormSubmit;
window.updateFurniture = updateFurniture;
window.filterFurniture = filterFurniture;