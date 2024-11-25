import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
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

async function fetchAllServices() {
  const servicesRef = collection(db, "DichVu"); // Truy cập vào bộ sưu tập 'PhongTro'

  try {
    const querySnapshot = await getDocs(servicesRef); // Lấy tất cả tài liệu trong bộ sưu tập 'PhongTro'

    // Xử lý danh sách phòng trọ
    services = []; // Reset lại danh sách
    querySnapshot.forEach((doc) => {
      services.push({ id: doc.id, ...doc.data() }); // Lưu dữ liệu phòng trọ vào mảng 'rooms'
    });

    console.log("Danh sách dịch vụ:", services); // In danh sách phòng trọ ra console
    renderServiceList(services); // Gọi hàm render để hiển thị danh sách phòng trọ
  } catch (e) {
    console.error("Lỗi khi lấy danh sách dịch vụ:", e);
  }
}

function renderServiceList(services) {
  const serviceListContainer = document.getElementById("serviceList");
  serviceListContainer.innerHTML = ""; // Xóa nội dung cũ

  // Nhóm dịch vụ theo trạng thái
  const activeServices = services.filter((service) => service.Status === true);
  const inactiveServices = services.filter(
    (service) => service.Status === false
  );

  // Tạo hai cột: một cột cho dịch vụ hoạt động và một cột cho dịch vụ đã hủy
  const activeColumn = document.createElement("div");
  activeColumn.className = "service-column active-column";

  const inactiveColumn = document.createElement("div");
  inactiveColumn.className = "service-column inactive-column";

  // Hiển thị các dịch vụ có trạng thái hoạt động
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
            <p class="service-unit">${service.Don_vi.join(", ")}</p>
            <p class="service-status">${
              service.Status ? "Hoạt động" : "Đã hủy"
            }</p>
            <div class="service-actions">
                <button class="btn update" onclick="updateService('${
                  service.id
                }')">Cập nhật</button>
                <button class="btn cancel" onclick="cancelService('${
                  service.id
                }')">Hủy</button>
            </div>
        </div>
      </div>
    `;
    activeColumn.appendChild(serviceDiv);
  });

  // Hiển thị các dịch vụ có trạng thái đã hủy
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
            <p class="service-unit">${service.Don_vi.join(", ")}</p>
            <p class="service-status">${
              service.Status ? "Hoạt động" : "Đã hủy"
            }</p>
            <div class="service-actions">
                <button class="btn update" onclick="updateService('${
                  service.id
                }')">Cập nhật</button>
                <button class="btn cancel" onclick="cancelService('${
                  service.id
                }')">Hủy</button>
                <button class="btn activate" onclick="activateService('${
                  service.id
                }')">Kích hoạt lại</button> <!-- Nút Kích hoạt lại -->
            </div>
        </div>
      </div>
    `;
    inactiveColumn.appendChild(serviceDiv);
  });

  // Thêm hai cột vào container
  serviceListContainer.appendChild(activeColumn);
  serviceListContainer.appendChild(inactiveColumn);
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

async function addService(event) {
  event.preventDefault(); // Ngừng việc làm mới trang khi nhấn nút Submit

  // Lấy dữ liệu từ các trường input
  const serviceName = document.getElementById("serviceName").value;
  const serviceUnit = document.getElementById("serviceUnit").value.split(","); // Để đơn vị có thể nhập nhiều giá trị cách nhau bằng dấu phẩy
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
