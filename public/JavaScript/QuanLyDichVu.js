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
  activeServicesContainer.innerHTML = `<h3>Hoạt động</h3>`;
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
            <p class="service-status">Hoạt động</p>
           
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
  inactiveServicesContainer.innerHTML = `<h3>Đã hủy</h3>`;
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
            <p class="service-status">Đã hủy</p>
           
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

async function addService(event) {
  event.preventDefault(); // Ngừng việc làm mới trang khi nhấn nút Submit

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
    // Thêm dịch vụ mới vào Firestore
    const servicesRef = collection(db, "DichVu");
    await addDoc(servicesRef, {
      Ten_dichvu: serviceName,
      Don_vi: serviceUnit,
      Icon_dichvu: serviceIcon,
      Status: serviceStatus,
    });
    console.log("Đã thêm dịch vụ mới");

    // Cập nhật lại danh sách dịch vụ
    fetchAllServices();

    // Reset form
    document.getElementById("addServiceForm").reset();
  } catch (e) {
    console.error("Lỗi khi thêm dịch vụ:", e);
    alert("Có lỗi xảy ra khi thêm dịch vụ.");
  }
}

// Lắng nghe sự kiện DOMContentLoaded và gọi hàm fetchAllRooms
document.addEventListener("DOMContentLoaded", () => {
  fetchAllServices(); // Gọi hàm để tải danh sách phòng trọ khi trang tải xong
});

document
  .getElementById("submitServiceBtn")
  .addEventListener("click", addService);

window.cancelService = cancelService;
window.activateService = activateService;
window.addService = addService;
window.deleteService = deleteService;
window.filterServices = filterServices;
