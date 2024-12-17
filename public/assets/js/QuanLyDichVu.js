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
let services = [];
let allServices = []; // Danh sách gốc
let isLoading = true; // Bắt đầu loading

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


function updateLoadingState() {
  const loadingElement = document.getElementById("loadingSpinner");
  const serveListContainer = document.getElementById("serviceList");

  if (isLoading) {
    loadingElement.style.display = "block"; // Hiển thị loading
    serveListContainer.style.display = "none"; // Ẩn danh sách
  } else {
    loadingElement.style.display = "none"; // Ẩn loading
    serveListContainer.style.display = "grid"; // Hiển thị danh sách
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
  const informationListContainer = document.getElementById("serviceList");
  informationListContainer.innerHTML = `
    <div class="no-result-message">
        <img src="../public/assets/imgs/icons/ic-sad-face.png" alt="">
      <p>Không tìm thấy kết quả phù hợp.</p>
    </div>
  `;
}



async function fetchAllServices() {
  const servicesRef = collection(db, "DichVu");
  isLoading = true; // Bắt đầu loading
  updateLoadingState();

  try {
    const querySnapshot = await getDocs(servicesRef);
    allServices = []; // Reset danh sách gốc
    services = []; // Reset danh sách hiển thị

    querySnapshot.forEach((doc) => {
      const service = { id: doc.id, ...doc.data() };
      allServices.push(service); // Lưu vào danh sách gốc
      services.push(service); // Lưu vào danh sách hiển thị
    });

    renderServiceList(services); // Hiển thị danh sách
  } catch (e) {
    console.error("Lỗi khi lấy danh sách dịch vụ:", e);
  } finally {
    isLoading = false; // Kết thúc loading
    updateLoadingState(); // Ẩn giao diện loading
  }
}

function filterServices(event) {
  const keyword = removeVietnameseTones(event.target.value); // Từ khóa không dấu
  // Lọc danh sách gốc để tìm dịch vụ phù hợp
  const filteredServices = allServices.filter((service) =>
    removeVietnameseTones(service.Ten_dichvu).includes(keyword)
  );

    // Kiểm tra nếu không có kết quả
    if (filteredServices.length === 0) {
      showNoResultMessage(); // Hiển thị thông báo không tìm thấy
    } else {
      renderServiceList(filteredServices); // Hiển thị danh sách đã lọc
    }
}


function renderServiceList(services) {
  const serviceListContainer = document.getElementById("serviceList");
  serviceListContainer.innerHTML = ""; // Xóa nội dung cũ

  const activeServices = services.filter((service) => service.Status === true);
  const inactiveServices = services.filter(
    (service) => service.Status === false
  );

  // Hiển thị dịch vụ hoạt động
  const activeServicesContainer = document.createElement("div");
  activeServicesContainer.innerHTML = `<h3 class="titleStatus">Hoạt động</h3>`;
  activeServices.forEach((service) => {
    const serviceDiv = document.createElement("div");
    serviceDiv.className = "service";
    serviceDiv.id = `service${service.id}`;

    serviceDiv.innerHTML = `
      <div class="service-card">
        <div class="service-image">
            <img src="${service.Icon_dichvu}" alt="${service.Ten_dichvu}" />
        </div>
        <div class="service-info">
            <h3 class="service-title">${service.Ten_dichvu}</h3>
            <p class="service-unit">${service.Don_vi}</p>
            <div class="status-layout">
                <img src="../public/assets/imgs/icons/ic-dot-active.svg" alt="">
                             <p class="service-status">Hoạt động</p>
            </div>
           
            <div class="service-actions">
                <button class="btn update" onclick="updateService('${service.id}')">Cập nhật</button>
                <button class="btn cancel" onclick="cancelService('${service.id}')">Hủy</button>
            </div>
        </div>
      </div>
    `;
    activeServicesContainer.appendChild(serviceDiv);

  });

  // Hiển thị dịch vụ đã hủy
  const inactiveServicesContainer = document.createElement("div");
  inactiveServicesContainer.innerHTML = `<h3 class="titleStatus">Đã hủy</h3>`;
  inactiveServices.forEach((service) => {
    const serviceDiv = document.createElement("div");
    serviceDiv.className = "service";
    serviceDiv.id = `service${service.id}`;

    serviceDiv.innerHTML = `
      <div class="service-card">
        <div class="service-image">
            <img src="${service.Icon_dichvu}" alt="${service.Ten_dichvu}" />
        </div>
        <div class="service-info">
            <h3 class="service-title">${service.Ten_dichvu}</h3>
            <p class="service-unit">${service.Don_vi}</p>
            <div class="status-layout">
            <img src="../public/assets/imgs/icons/ic-dot-cancel.svg" alt="">
            <p class="service-status">Đã hủy</p>
            </div>
           
            <div class="service-actions">
                <button class="btn activate" onclick="activateService('${service.id}')">Kích hoạt</button>
                <button class="btn delete" onclick="deleteService('${service.id}')">Xóa</button>
            </div>
        </div>
      </div>
    `;
    inactiveServicesContainer.appendChild(serviceDiv);
  });

  serviceListContainer.appendChild(activeServicesContainer);
  serviceListContainer.appendChild(inactiveServicesContainer);

}

async function cancelService(serviceId) {
  // Tìm dịch vụ trong mảng services
  const service = services.find((s) => s.id === serviceId);
  isLoading = true; // Bắt đầu loading
  updateLoadingState();

  if (service) {
    try {
      // Cập nhật trạng thái trong Firestore
      const serviceRef = doc(db, "DichVu", serviceId); // Tạo tham chiếu đến dịch vụ trong Firestore
      await updateDoc(serviceRef, { Status: false }); // Cập nhật trạng thái thành false

      // Cập nhật trạng thái trong mảng services
      service.Status = false;

      // Làm mới giao diện để hiển thị trạng thái mới
      renderServiceList(services);
      showToastFalse("Huỷ dịch vụ thành công")
    } catch (e) {
      console.error("Lỗi khi cập nhật trạng thái dịch vụ:", e);
    } finally {
      isLoading = false; // Kết thúc loading
      updateLoadingState(); // Ẩn giao diện loading
    }
  }
}

async function activateService(serviceId) {
  // Tìm dịch vụ trong mảng services
  const service = services.find((s) => s.id === serviceId);
  isLoading = true; // Bắt đầu loading
  updateLoadingState();

  if (service) {
    try {
      // Cập nhật trạng thái trong Firestore
      const serviceRef = doc(db, "DichVu", serviceId); // Tạo tham chiếu đến dịch vụ trong Firestore
      await updateDoc(serviceRef, { Status: true }); // Cập nhật trạng thái thành true

      // Cập nhật trạng thái trong mảng services
      service.Status = true;

      // Làm mới giao diện để hiển thị trạng thái mới
      renderServiceList(services);
      showToast("Kích hoạt dịch vụ thành công")
    } catch (e) {
      console.error("Lỗi khi kích hoạt lại trạng thái dịch vụ:", e);
    } finally {
      isLoading = false; // Kết thúc loading
      updateLoadingState(); // Ẩn giao diện loading
    }
  }
}

async function deleteService(serviceId) {
  showDeleteConfirmModal(serviceId, async (id) => {
    try {
      const serviceDocRef = doc(db, "DichVu", id);
      await deleteDoc(serviceDocRef);

      // Cập nhật danh sách dịch vụ
      fetchAllServices();
      showSuccessModal("Dịch vụ đã được xóa thành công.");
    } catch (error) {
      console.error("Lỗi khi xóa dịch vụ:", error);
      alert("Có lỗi xảy ra khi xóa dịch vụ.");
    }
  });
}

async function handleFormSubmit(event) {
  event.preventDefault(); // Ngừng việc làm mới trang khi nhấn nút Submit

  const form = document.getElementById("addServiceForm");
  const mode = form.getAttribute("data-mode"); // Lấy trạng thái của form (add hoặc update)

  // Lấy dữ liệu từ các trường input
  const serviceName = document.getElementById("serviceName").value;
  const serviceUnitValue = document.getElementById("serviceUnit").value.trim(); // Lấy giá trị và loại bỏ khoảng trắng
  const serviceUnit = serviceUnitValue
    ? serviceUnitValue.split(",").map((unit) => unit.trim())
    : [];
  const serviceIcon = document.getElementById("serviceIcon").value;
  const serviceStatus =
    document.getElementById("serviceStatus").value === "true"; // Convert về kiểu boolean

  let hasError = false;
  // Kiểm tra tên dịch vụ
  if (!serviceName) {
    document.getElementById("serviceNameError").classList.remove("hidden");
    hasError = true;
    return;
  } else {
    document.getElementById("serviceNameError").classList.add("hidden");
  }

  if (!serviceIcon) {
    document.getElementById("serviceIconError").classList.remove("hidden");
    hasError = true;
    return;
  } else {
    document.getElementById("serviceIconError").classList.add("hidden");
  }

  if (serviceUnit.length === 0 || serviceUnit.some((unit) => unit === "")) {
    document.getElementById("serviceUnitError").classList.remove("hidden");
    hasError = true;
    return;
  } else {
    document.getElementById("serviceUnitError").classList.add("hidden");
  }

  try {
    if (mode === "add") {
      // Thêm dịch vụ mới
      const servicesRef = collection(db, "DichVu");
    
      const docRef = await addDoc(servicesRef, {
        Ten_dichvu: serviceName,
        Don_vi: serviceUnit,
        Icon_dichvu: serviceIcon,
        Status: serviceStatus,
      });

      await setDoc(docRef, {
        Ma_dichvu: docRef.id, // ID tự động của Firestore
        Ten_dichvu: serviceName,
        Don_vi: serviceUnit,
        Icon_dichvu: serviceIcon,
        Status: serviceStatus,
      });
      // Hiển thị modal thành công
      showSuccessModal("Dịch vụ đã được thêm thành công.", () => {
        clearForm();
        fetchAllServices();
      });
    } else if (mode === "update") {
      // Lấy ID dịch vụ đang được cập nhật (giả sử lưu trong form)
      const serviceId = form.getAttribute("data-service-id");
      if (!serviceId) {
        alert("Không tìm thấy ID dịch vụ để cập nhật.");
        return;
      }

      // Cập nhật dịch vụ
      const serviceRef = doc(db, "DichVu", serviceId);
      await updateDoc(serviceRef, {
        Ma_dichvu: serviceId, // ID tự động của Firestore
        Ten_dichvu: serviceName,
        Don_vi: serviceUnit,
        Icon_dichvu: serviceIcon,
        Status: serviceStatus,
      });
      showSuccessModal("Dịch vụ đã được cập nhật thành công.", () => {
        clearForm();
        fetchAllServices();
      });
    }
  } catch (e) {
    console.error("Lỗi khi xử lý form:", e);
    alert("Có lỗi xảy ra.");
  }
}

function updateService(serviceId) {
  // Tìm dịch vụ theo ID từ danh sách allServices
  const selectedService = allServices.find(
    (service) => service.id === serviceId
  );

  if (selectedService) {
    // Điền thông tin vào form
    document.getElementById("serviceName").value =
      selectedService.Ten_dichvu || "";
    document.getElementById("serviceUnit").value = selectedService.Don_vi || "";
    document.getElementById("serviceIcon").value =
      selectedService.Icon_dichvu || "";
    document.getElementById("serviceStatus").value =
      selectedService.Status.toString();

    // Chuyển form sang chế độ cập nhật
    const form = document.getElementById("addServiceForm");
    form.setAttribute("data-mode", "update");
    form.setAttribute("data-service-id", serviceId); // Lưu ID dịch vụ để cập nhật

    // Thay đổi nút "Thêm dịch vụ" thành "Cập nhật dịch vụ"
    const submitButton = document.getElementById("submitServiceBtn");
    submitButton.textContent = "Cập nhật dịch vụ";
  }
}

// Hiển thị modal với thông báo tùy chỉnh
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
  document.getElementById("serviceName").value = "";
  document.getElementById("serviceUnit").value = "";
  document.getElementById("serviceIcon").value = "";
  document.getElementById("serviceStatus").value = "true";

  const form = document.getElementById("addServiceForm");
  form.setAttribute("data-mode", "add");
  form.removeAttribute("data-service-id"); // Xóa ID dịch vụ nếu có

  // Đặt lại nút submit về trạng thái "Thêm dịch vụ"
  const submitButton = document.getElementById("submitServiceBtn");
  submitButton.textContent = "Thêm dịch vụ";
}

// Lắng nghe sự kiện DOMContentLoaded và gọi hàm fetchAllRooms
document.addEventListener("DOMContentLoaded", () => {
  fetchAllServices(); // Gọi hàm để tải danh sách phòng trọ khi trang tải xong
});

document
  .getElementById("submitServiceBtn")
  .addEventListener("click", handleFormSubmit);

document.getElementById("clearFormBtn").addEventListener("click", clearForm);

window.cancelService = cancelService;
window.activateService = activateService;
window.deleteService = deleteService;
window.filterServices = filterServices;
window.goBack = goBack;
window.clearForm = clearForm;
window.handleFormSubmit = handleFormSubmit;
window.updateService = updateService;
