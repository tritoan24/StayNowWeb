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
let informations = [];
let allInformations = []; // Danh sách gốc

async function fetchAllInformations() {
  const informationsRef = collection(db, "ThongTin");

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
  }
}

function filterInformation(event) {
  const keyword = event.target.value.toLowerCase(); // Lấy từ khóa và chuyển về chữ thường

  // Lọc danh sách gốc để tìm dịch vụ phù hợp
  const filteredInformations = allInformations.filter((information) =>
    information.Ten_thongtin.toLowerCase().includes(keyword)
  );

  // Hiển thị danh sách đã lọc
  renderInformationList(filteredInformations);
}

function renderInformationList(informations) {
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
                 <img src="../image/icons/ic-dot-active.svg" alt="">
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
                 <img src="../image/icons/ic-dot-cancel.svg" alt="">
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

  if (information) {
    try {
      // Cập nhật trạng thái trong Firestore
      const informationRef = doc(db, "ThongTin", informationId); // Tạo tham chiếu đến dịch vụ trong Firestore
      await updateDoc(informationRef, { Status: false }); // Cập nhật trạng thái thành false

      information.Status = false;

      // Làm mới giao diện để hiển thị trạng thái mới
      renderInformationList(informations);
    } catch (e) {
      console.error("Lỗi khi cập nhật trạng thái thông tin:", e);
    }
  }
}

async function activateInformation(informationId) {
  const information = informations.find((s) => s.id === informationId);

  if (information) {
    try {
      // Cập nhật trạng thái trong Firestore
      const informationRef = doc(db, "ThongTin", informationId); // Tạo tham chiếu đến dịch vụ trong Firestore
      await updateDoc(informationRef, { Status: true }); // Cập nhật trạng thái thành true


      information.Status = true;

      // Làm mới giao diện để hiển thị trạng thái mới
      renderInformationList(informations);
    } catch (e) {
      console.error("Lỗi khi kích hoạt lại trạng thái thông tin:", e);
    }
  }
}

async function deleteInformation(informationId) {
  if (confirm("Bạn có chắc chắn muốn xóa thông tin này không?")) {
    try {
      const informationDocRef = doc(db, "ThongTin", informationId);
      await deleteDoc(informationDocRef); // Xóa dịch vụ trong Firestore

      // Cập nhật danh sách dịch vụ
      fetchAllInformations();
      alert("Thông tin đã được xóa thành công.");
    } catch (error) {
      console.error("Lỗi khi xóa thông tin:", error);
      alert("Có lỗi xảy ra khi xóa thông tin.");
    }
  }
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

  // Kiểm tra xem các trường có hợp lệ không
  if (!informationName || !informationUnit || !informationIcon) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
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
      alert("Đã thêm thông tin mới");
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
      alert("Đã cập nhật thông tin");
    }

    // Cập nhật lại danh sách dịch vụ
    fetchAllInformations();

    
    clearForm();
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
    document.getElementById("informationUnit").value = selectedInformation.Don_vi || "";
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
