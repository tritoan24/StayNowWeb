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
  activeInformationContainer.innerHTML = `<h3>Hoạt động</h3>`;
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
            <p class="information-status">Hoạt động</p>
           
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
  inactiveInformationsContainer.innerHTML = `<h3>Đã hủy</h3>`;
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
            <p class="information-status">Đã hủy</p>
           
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

async function insertInformation(event) {
  event.preventDefault(); // Ngừng việc làm mới trang khi nhấn nút Submit

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
    // Thêm dịch vụ mới vào Firestore
    const informationsRef = collection(db, "ThongTin");
    await addDoc(informationsRef, {
      Ten_thongtin: informationName,
      Don_vi: informationUnit,
      Icon_thongtin: informationIcon,
      Status: informationStatus,
    });
    console.log("Đã thêm thông tin mới");
    alert("Đã thêm thông tin mới")

    // Cập nhật lại danh sách dịch vụ
    fetchAllInformations();

    // Reset form
    document.getElementById("insertInformationForm").reset();
  } catch (e) {
    console.error("Lỗi khi thêm thông tin:", e);
    alert("Có lỗi xảy ra khi thêm thông tin.");
  }
}

// Lắng nghe sự kiện DOMContentLoaded và gọi hàm fetchAllRooms
document.addEventListener("DOMContentLoaded", () => {
  fetchAllInformations(); // Gọi hàm để tải danh sách phòng trọ khi trang tải xong
});

document
  .getElementById("submitInformationBtn")
  .addEventListener("click", insertInformation);

window.cancelInformation = cancelInformation;
window.activateInformation = activateInformation;
window.insertInformation = insertInformation;
window.deleteInformation = deleteInformation;
window.filterInformation = filterInformation;
