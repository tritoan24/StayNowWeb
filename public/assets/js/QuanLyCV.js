import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";


// import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";


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
// const auth = getAuth(app);

// Hàm lấy và hiển thị danh sách hợp đồng
async function fetchContracts(userId) {
  const contractList = document.getElementById("contract-list");
  contractList.innerHTML = ""; // Xóa nội dung cũ
  

  try {
    const q = query(collection(db, "PhanChiaCV"), where("idNhanVien", "==", userId));
    const querySnapshot = await getDocs(q);
  
    if (querySnapshot.empty) {
      contractList.innerHTML = "<tr><td colspan='3'>Không có hợp đồng nào!</td></tr>";
      return;
    }
  
    // Tạo danh sách idHopDong
    const idHopDongList = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      idHopDongList.push(data.idHopDong);
    });
  
    // Truy vấn thông tin từ bảng HopDong
    const contractPromises = idHopDongList.map(async (idHopDong) => {
      const docRef = doc(db, "HopDong", idHopDong);
      const contractDoc = await getDoc(docRef);
      if (contractDoc.exists()) {
        return { id: contractDoc.id, ...contractDoc.data() };
      } else {
        console.warn(`Hợp đồng với ID ${idHopDong} không tồn tại.`);
        return null;
      }
    });
  
    // Đợi tất cả truy vấn hoàn thành
    const contracts = await Promise.all(contractPromises);
  
    // Hiển thị thông tin hợp đồng
    const contractList = document.getElementById("contract-list");

contracts.forEach((contract, index) => {
  if (contract) {
    if (index % 2 === 0) {
      // Tạo hàng cho cặp hợp đồng hiện tại
      contractList.insertAdjacentHTML("beforeend", `
        <tr style="display: flex; justify-content: space-around;">
          <td>${contract.id}</td>
          <td>Mã hóa đơn: ${contract.hoaDonHopDong.idHoaDon || "Không rõ"}</td>
          <td>Người nhận: ${contract.chuNha.hoTen || "Không rõ"}</td>
          <td>Người gửi: ${contract.nguoiThue.hoTen || "Không rõ"}</td>
          <td>${contract.ngayBatDau || "Không rõ"}</td>
          <td>${contract.ngayKetThuc || "Không rõ"}</td>
        </tr>
      `);
    } else {
      // Tạo hàng thứ hai của cặp hợp đồng
      contractList.insertAdjacentHTML("beforeend", `
        <tr style="display: flex; justify-content: space-around;">
          <td>${contract.id}</td>
          <td>Mã hóa đơn: ${contract.hoaDonHopDong.idHoaDon || "Không rõ"}</td>
          <td>Người nhận: ${contract.chuNha.hoTen || "Không rõ"}</td>
          <td>Người gửi: ${contract.nguoiThue.hoTen || "Không rõ"}</td>
          <td>${contract.ngayBatDau || "Không rõ"}</td>
          <td>${contract.ngayKetThuc || "Không rõ"}</td>
        </tr>
      `);
    }
  }
});

  } catch (error) {
    console.error("Lỗi khi lấy thông tin hợp đồng:", error);
  }
  
}

// Lấy thông tin người dùng hiện tại và hiển thị danh sách
// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     fetchContracts(user.uid); // Gọi hàm fetchContracts với userId của người dùng hiện tại
//   } else {
//     console.log("Người dùng chưa đăng nhập.");
//   }
// });
fetchContracts("msWywFEaCqN0k0FBxPVkGQU3gWQ2");