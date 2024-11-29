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
let services = [];
let allServices = []; // Danh sách gốc

async function fetchAllServices() {
  const servicesRef = collection(db, "DichVu");

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
  }
}

function filterServices(event) {
  const keyword = event.target.value.toLowerCase(); // Lấy từ khóa và chuyển về chữ thường

  // Lọc danh sách gốc để tìm dịch vụ phù hợp
  const filteredServices = allServices.filter((service) =>
    service.Ten_dichvu.toLowerCase().includes(keyword)
  );

  // Hiển thị danh sách đã lọc
  renderServiceList(filteredServices);
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
                 <img src="../image/icons/ic-dot-active.svg" alt="">
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
                 <img src="../image/icons/ic-dot-cancel.svg" alt="">
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

  if (service) {
    try {
      // Cập nhật trạng thái trong Firestore
      const serviceRef = doc(db, "DichVu", serviceId); // Tạo tham chiếu đến dịch vụ trong Firestore
      await updateDoc(serviceRef, { Status: false }); // Cập nhật trạng thái thành false

      // Cập nhật trạng thái trong mảng services
      service.Status = false;

      // Làm mới giao diện để hiển thị trạng thái mới
      renderServiceList(services);
    } catch (e) {
      console.error("Lỗi khi cập nhật trạng thái dịch vụ:", e);
    }
  }
}

async function activateService(serviceId) {
  // Tìm dịch vụ trong mảng services
  const service = services.find((s) => s.id === serviceId);

  if (service) {
    try {
      // Cập nhật trạng thái trong Firestore
      const serviceRef = doc(db, "DichVu", serviceId); // Tạo tham chiếu đến dịch vụ trong Firestore
      await updateDoc(serviceRef, { Status: true }); // Cập nhật trạng thái thành true

      // Cập nhật trạng thái trong mảng services
      service.Status = true;

      // Làm mới giao diện để hiển thị trạng thái mới
      renderServiceList(services);
    } catch (e) {
      console.error("Lỗi khi kích hoạt lại trạng thái dịch vụ:", e);
    }
  }
}

async function deleteService(serviceId) {
  if (confirm("Bạn có chắc chắn muốn xóa dịch vụ này không?")) {
    try {
      const serviceDocRef = doc(db, "DichVu", serviceId);
      await deleteDoc(serviceDocRef); // Xóa dịch vụ trong Firestore

      // Cập nhật danh sách dịch vụ
      fetchAllServices();
      alert("Dịch vụ đã được xóa thành công.");
    } catch (error) {
      console.error("Lỗi khi xóa dịch vụ:", error);
      alert("Có lỗi xảy ra khi xóa dịch vụ.");
    }
  }
}

async function handleFormSubmit(event) {
  event.preventDefault(); // Ngừng việc làm mới trang khi nhấn nút Submit

  const form = document.getElementById("addServiceForm");
  const mode = form.getAttribute("data-mode"); // Lấy trạng thái của form (add hoặc update)

  // Lấy dữ liệu từ các trường input
  const serviceName = document.getElementById("serviceName").value;
  const serviceUnit = document
    .getElementById("serviceUnit")
    .value.split(",")
    .map((unit) => unit.trim());
  const serviceIcon = document.getElementById("serviceIcon").value;
  const serviceStatus =
    document.getElementById("serviceStatus").value === "true"; // Convert về kiểu boolean

  // Kiểm tra xem các trường có hợp lệ không
  if (!serviceName || !serviceUnit || !serviceIcon) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  try {
    if (mode === "add") {
      // Thêm dịch vụ mới
      const servicesRef = collection(db, "DichVu");
      await addDoc(servicesRef, {
        Ten_dichvu: serviceName,
        Don_vi: serviceUnit,
        Icon_dichvu: serviceIcon,
        Status: serviceStatus,
      });
      alert("Đã thêm dịch vụ mới");
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
        Ten_dichvu: serviceName,
        Don_vi: serviceUnit,
        Icon_dichvu: serviceIcon,
        Status: serviceStatus,
      });
      alert("Đã cập nhật dịch vụ");
    }

    // Cập nhật lại danh sách dịch vụ
    fetchAllServices();

    // Reset form và đặt lại về chế độ thêm mới
    clearForm();
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
