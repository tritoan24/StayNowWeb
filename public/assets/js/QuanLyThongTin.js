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
let informations = [];
let allInformations = []; // Danh sách gốc
let isLoading = false;


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


async function fetchAllInformations() {
  const informationsRef = collection(db, "ThongTin");
  isLoading = true; // Bắt đầu loading
  updateLoadingState();
  try {
    const querySnapshot = await getDocs(informationsRef);
    informations = []; // Reset danh sách
    allInformations = []; // Reset danh sách

    querySnapshot.forEach((doc) => {
      const information = { id: doc.id, ...doc.data() };
      allInformations.push(information); // Lưu vào danh sách gốc
      informations.push(information); // Lưu vào danh sách hiển thị
    });

    renderInformationList(informations); // Hiển thị danh sách
  } catch (e) {
    console.error("Lỗi khi lấy danh sách thông tin:", e);
  } finally {
    isLoading = false; // Kết thúc loading
    updateLoadingState(); // Ẩn giao diện loading
  }
}

function updateLoadingState() {
  const loadingElement = document.getElementById("loadingSpinner");
  const informationListContainer = document.getElementById("informationList");

  if (isLoading) {
    loadingElement.style.display = "block"; // Hiển thị loading
    informationListContainer.style.display = "none"; // Ẩn danh sách
  } else {
    loadingElement.style.display = "none"; // Ẩn loading
    informationListContainer.style.display = "grid"; // Hiển thị danh sách
  }
}

function removeVietnameseTones(str) {
  return str
    .normalize("NFD") // Tách dấu khỏi ký tự
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các ký tự dấu
    .replace(/đ/g, "d") // Thay đ thành d
    .replace(/Đ/g, "D") // Thay Đ thành D
    .toLowerCase(); // Chuyển về chữ thường
}

function showNoResultMessage() {
  const informationListContainer = document.getElementById("informationList");
  informationListContainer.innerHTML = `
    <div class="no-result-message">
        <img src="../public/assets/imgs/icons/ic-sad-face.png" alt="">
      <p>Không tìm thấy kết quả phù hợp.</p>
    </div>
  `;
}


function filterInformation(event) {
  const keyword = removeVietnameseTones(event.target.value); // Từ khóa không dấu

  // Lọc danh sách gốc để tìm dịch vụ phù hợp
  const filteredInformations = allInformations.filter((information) =>
    removeVietnameseTones(information.Ten_thongtin).includes(keyword)
  );

  // Kiểm tra nếu không có kết quả
  if (filteredInformations.length === 0) {
    showNoResultMessage(); // Hiển thị thông báo không tìm thấy
  } else {
    renderInformationList(filteredInformations); // Hiển thị danh sách đã lọc
  }
}


function renderInformationList(informations) {
  isLoading = true; // Bắt đầu loading
  updateLoadingState();
  const informationListContainer = document.getElementById("informationList");
  informationListContainer.innerHTML = ""; // Xóa nội dung cũ

  const activeInformations = informations.filter(
    (information) => information.Status === true
  );
  const inactiveInformations = informations.filter(
    (information) => information.Status === false
  );

  // Hiển thị dịch vụ hoạt động
  const activeInformationContainer = document.createElement("div");
  activeInformationContainer.innerHTML = `<h3 class="titleStatus">Hoạt động</h3>`;
  activeInformations.forEach((information) => {
    const informationDiv = document.createElement("div");
    informationDiv.className = "information";
    informationDiv.id = `information${information.id}`;
    informationDiv.innerHTML = `
      <div class="information-card">
        <div class="information-image">
            <img src="${information.Icon_thongtin}" alt="${information.Ten_thongtin}" />
        </div>
        <div class="information-info">
            <h3 class="information-title">${information.Ten_thongtin}</h3>
            <p class="information-unit">${information.Don_vi}</p>
             <div class="status-layout">
                 <img src="../public/assets/imgs/icons/ic-dot-active.svg" alt="">
                      <p class="service-status">Hoạt động</p>
            </div>
           
            <div class="information-actions">
                <button class="btn update" onclick="updateInformation('${information.id}')">Cập nhật</button>
                <button class="btn cancel" onclick="cancelInformation('${information.id}')">Hủy</button>
            </div>
        </div>
      </div>
    `;
    activeInformationContainer.appendChild(informationDiv);

      isLoading = false; // Kết thúc loading
      updateLoadingState(); // Ẩn giao diện loading
    
  });

  // Hiển thị dịch vụ đã hủy
  const inactiveInformationsContainer = document.createElement("div");
  inactiveInformationsContainer.innerHTML = `<h3 class="titleStatus">Đã hủy</h3>`;
  inactiveInformations.forEach((information) => {
    const informationDiv = document.createElement("div");
    informationDiv.className = "information";
    informationDiv.id = `information${information.id}`;

    informationDiv.innerHTML = `
      <div class="information-card">
        <div class="information-image">
            <img src="${information.Icon_thongtin}" alt="${information.Ten_thongtin}" />
        </div>
        <div class="information-info">
            <h3 class="information-title">${information.Ten_thongtin}</h3>
            <p class="information-unit">${information.Don_vi}</p>
     <div class="status-layout">
                 <img src="../public/assets/imgs/icons/ic-dot-cancel.svg" alt="">
            <p class="service-status">Đã hủy</p>
            </div>
           
            <div class="information-actions">
                <button class="btn activate" onclick="activateInformation('${information.id}')">Kích hoạt</button>
                <button class="btn delete" onclick="deleteInformation('${information.id}')">Xóa</button>
            </div>
        </div>
      </div>
    `;
    inactiveInformationsContainer.appendChild(informationDiv);
  });

  informationListContainer.appendChild(activeInformationContainer);
  informationListContainer.appendChild(inactiveInformationsContainer);
}

async function cancelInformation(informationId) {
  const information = informations.find((s) => s.id === informationId);
  isLoading = true; // Bắt đầu loading
  updateLoadingState();
  if (information) {
    try {
      // Cập nhật trạng thái trong Firestore
      const informationRef = doc(db, "ThongTin", informationId); // Tạo tham chiếu đến dịch vụ trong Firestore
      await updateDoc(informationRef, { Status: false }); // Cập nhật trạng thái thành false
      showToastFalse("Huỷ thông tin thành công")
      information.Status = false;

      // Làm mới giao diện để hiển thị trạng thái mới
      renderInformationList(informations);
    } catch (e) {
      console.error("Lỗi khi cập nhật trạng thái thông tin:", e);
    } finally {
      isLoading = false; // Kết thúc loading
      updateLoadingState(); // Ẩn giao diện loading
    }
  }
}

async function activateInformation(informationId) {
  const information = informations.find((s) => s.id === informationId);
  isLoading = true; // Bắt đầu loading
  updateLoadingState();

  if (information) {
    try {
      // Cập nhật trạng thái trong Firestore
      const informationRef = doc(db, "ThongTin", informationId); // Tạo tham chiếu đến dịch vụ trong Firestore
      await updateDoc(informationRef, { Status: true }); // Cập nhật trạng thái thành true

      information.Status = true;
      showToast("Kích hoạt thông tin thành công")
      // Làm mới giao diện để hiển thị trạng thái mới
      renderInformationList(informations);
    } catch (e) {
      console.error("Lỗi khi kích hoạt lại trạng thái thông tin:", e);
    } finally {
      isLoading = false; // Kết thúc loading
      updateLoadingState(); // Ẩn giao diện loading
    }
  }
}

async function deleteInformation(informationId) {
  showDeleteConfirmModal(informationId, async (id) => {
    try {
      const informationDocRef = doc(db, "ThongTin", id);
      await deleteDoc(informationDocRef);

      // Cập nhật danh sách dịch vụ
      fetchAllInformations();
      showSuccessModal("Thông tin đã được xóa thành công.");
    } catch (error) {
      console.error("Lỗi khi xóa thông tin:", error);
      alert("Có lỗi xảy ra khi xóa thông tin.");
    }
  });
}

async function handleFormSubmit(event) {
  event.preventDefault(); // Ngừng việc làm mới trang khi nhấn nút Submit

  const form = document.getElementById("insertInformationForm");
  const mode = form.getAttribute("data-mode"); // Lấy trạng thái của form (add hoặc update)

  // Lấy dữ liệu từ các trường input
  const informationName = document.getElementById("informationName").value;
  const informationUnit = document.getElementById("informationUnit").value;
  const informationIcon = document.getElementById("informationIcon").value;
  const informationStatus =
    document.getElementById("informationStatus").value === "true"; // Convert về kiểu boolean
  let hasError = false;

  // Kiểm tra xem các trường có hợp lệ không
  if (!informationName) {
    document.getElementById("informationNameError").classList.remove("hidden");
    hasError = true;
    return;
  } else {
    document.getElementById("informationNameError").classList.add("hidden");
  }
  if (!informationIcon) {
    document.getElementById("informationIconError").classList.remove("hidden");
    hasError = true;
    return;
  } else {
    document.getElementById("informationIconError").classList.add("hidden");
  }
  if (!informationUnit) {
    document.getElementById("informationUnitError").classList.remove("hidden");
    hasError = true;
    return;
  } else {
    document.getElementById("informationUnitError").classList.add("hidden");
  }

  try {
    if (mode === "add") {
      // Thêm dịch vụ mới
      const informationsRef = collection(db, "ThongTin");
      await addDoc(informationsRef, {
        Ten_thongtin: informationName,
        Don_vi: informationUnit,
        Icon_dichvu: informationIcon,
        Status: informationStatus,
      });
      showSuccessModal("Thông tin đã được thêm thành công.", () => {
        clearForm();
        fetchAllInformations();
      });
    } else if (mode === "update") {
      // Lấy ID dịch vụ đang được cập nhật (giả sử lưu trong form)
      const informationId = form.getAttribute("data-information-id");
      if (!informationId) {
        alert("Không tìm thấy ID thông tin để cập nhật.");
        return;
      }

      // Cập nhật dịch vụ
      const informationRef = doc(db, "ThongTin", informationId);
      await updateDoc(informationRef, {
        Ten_thongtin: informationName,
        Don_vi: informationUnit,
        Icon_dichvu: informationIcon,
        Status: informationStatus,
      });
      showSuccessModal("Thông tin đã được cập nhật thành công.", () => {
        clearForm();
        fetchAllInformations();
      });
    }
  } catch (e) {
    console.error("Lỗi khi xử lý form:", e);
    alert("Có lỗi xảy ra.");
  }
}
function updateInformation(informationId) {
  // Tìm dịch vụ theo ID từ danh sách all
  const selectedInformation = allInformations.find(
    (information) => information.id === informationId
  );

  if (selectedInformation) {
    // Điền thông tin vào form
    document.getElementById("informationName").value =
      selectedInformation.Ten_thongtin || "";
    document.getElementById("informationUnit").value =
      selectedInformation.Don_vi || "";
    document.getElementById("informationIcon").value =
      selectedInformation.Icon_dichvu || "";
    document.getElementById("informationStatus").value =
      selectedInformation.Status.toString();

    // Chuyển form sang chế độ cập nhật
    const form = document.getElementById("insertInformationForm");
    form.setAttribute("data-mode", "update");
    form.setAttribute("data-information-id", informationId); // Lưu ID dịch vụ để cập nhật

    // Thay đổi nút "Thêm dịch vụ" thành "Cập nhật dịch vụ"
    const submitButton = document.getElementById("submitInformationBtn");
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
  document.getElementById("informationName").value = "";
  document.getElementById("informationUnit").value = "";
  document.getElementById("informationIcon").value = "";
  document.getElementById("informationStatus").value = "true";

  const form = document.getElementById("insertInformationForm");
  form.setAttribute("data-mode", "add");
  form.removeAttribute("data-information-id"); // Xóa ID dịch vụ nếu có

  // Đặt lại nút submit về trạng thái "Thêm dịch vụ"
  const submitButton = document.getElementById("submitInformationBtn");
  submitButton.textContent = "Thêm thông tin mới";
}

// Lắng nghe sự kiện DOMContentLoaded và gọi hàm fetchAllRooms
document.addEventListener("DOMContentLoaded", () => {
  fetchAllInformations();
});

document
  .getElementById("submitInformationBtn")
  .addEventListener("click", handleFormSubmit);

document.getElementById("clearFormBtn").addEventListener("click", clearForm);

window.cancelInformation = cancelInformation;
window.activateInformation = activateInformation;
window.deleteInformation = deleteInformation;
window.goBack = goBack;
window.clearForm = clearForm;
window.handleFormSubmit = handleFormSubmit;
window.updateInformation = updateInformation;
window.filterInformation = filterInformation;
