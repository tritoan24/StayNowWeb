import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";



// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBmpKO0lDHFiYb3zklAJ2zz6qC-iQrypw0",
  authDomain: "staynowapp1.firebaseapp.com",
  databaseURL: "https://staynowapp1-default-rtdb.firebaseio.com",
  projectId: "staynowapp1",
  storageBucket: "staynowapp1.appspot.com",
  messagingSenderId: "918655571270",
  appId: "1:918655571270:web:94abfaf87fbbb3e4ecc147",
  measurementId: "G-PQP9CTPKGT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const database = getDatabase(app); // Realtime Database
const auth = getAuth(app); // Đảm bảo truyền app vào


let currentUserId = null;

function checkAuthStatus() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Hủy listener sau khi được gọi
      if (user) {
        currentUserId = user.uid; // Gán giá trị global
        resolve(user.uid);
      } else {
        console.log('Chưa đăng nhập');
        resolve(null);
      }
    });
  });
}

async function initializeStaynowApp() {
  try {
    const userId = await checkAuthStatus();
    if (userId) {
      currentUserId = userId;
      // await fetchContracts(userId);
    } else {
      console.log('Không thể lấy user ID');
    }
  } catch (error) {
    console.error('Lỗi khởi tạo ứng dụng:', error);
  }
}

// Modal functionality
const modal = document.getElementById("contractModal");
const closeButton = document.querySelector(".close-button");

function openModal(content) {
  const modalBody = document.getElementById("modal-body");
  modalBody.innerHTML = content;
  modal.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
}

closeButton.addEventListener("click", closeModal);
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Tab functionality
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class from all tabs and tab contents
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));

    // Add active class to clicked tab and corresponding content
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});


async function layThongTinThanhToan(maNguoiDung) {
  try {
    // Tham chiếu trực tiếp đến document với ID là maNguoiDung
    const thongTinRef = doc(db, "ThongTinTT", maNguoiDung);

    // Lấy document
    const thongTinDoc = await getDoc(thongTinRef);

    // Kiểm tra xem document có tồn tại không
    if (!thongTinDoc.exists()) {
      console.log(`Không tìm thấy thông tin thanh toán cho mã người dùng: ${maNguoiDung}`);
      return null;
    }

    // Lấy dữ liệu từ document
    const thongTinData = thongTinDoc.data();

    return {
      soTaiKhoan: thongTinData.Sotaikhoan || "Không có thông tin",
      tenTaiKhoan: thongTinData.Tentaikhoan || "Không có thông tin", 
      maQR: thongTinData.maQR || "Không có mã QR"
    };

  } catch (error) {
    console.error("Lỗi khi lấy thông tin thanh toán:", error);
    return null;
  }
}


async function fetchContracts(userId) {
  const waitingList = document.getElementById("waiting-contract-list");
  const paidList = document.getElementById("paid-contract-list");
  const canceledList = document.getElementById("canceled-contract-list");

  // Clear existing lists
  [waitingList, paidList, canceledList].forEach(list => list.innerHTML = "");

  try {
    // Query PhanChiaCV to get contract IDs assigned to the employee
    const assignmentQuery = query(
      collection(db, "PhanChiaCV"),
      where("idNhanVien", "==", userId)
    );

    // Lắng nghe thay đổi bằng onSnapshot
    onSnapshot(assignmentQuery, async (assignmentSnapshot) => {
      if (assignmentSnapshot.empty) {
        waitingList.innerHTML = "<tr><td colspan='3'>Không có hợp đồng nào!</td></tr>";
        return;
      }

      // Clear lists again to handle live updates
      [waitingList, paidList, canceledList].forEach(list => list.innerHTML = "");
const promises = assignmentSnapshot.docs.map(async (assignmentDoc) => {
  const assignmentData = assignmentDoc.data();
  const contractRef = doc(db, "HopDong", assignmentData.idHopDong);
  const contractDoc = await getDoc(contractRef);

  if (contractDoc.exists()) {
    const contract = {
      id: contractDoc.id,
      ...contractDoc.data()
    };

    const trangThai = assignmentData.trangThai;
    const thoigian = assignmentData.thoigian; // Thời gian bắt đầu công việc (timestamp)
    
    // Tính toán thời gian kết thúc công việc
    const endTime = new Date(thoigian);
    endTime.setMinutes(endTime.getMinutes() + 5); // Thêm 5 phút
    
    console.log(`Thời gian kết thúc: ${endTime}`);
    


    // Xác định danh sách mục tiêu dựa trên trạng thái
    let targetList;
    switch (trangThai) {
      case 'PROCESSING':
        targetList = waitingList;
        break;
      case 'DONE':
        targetList = paidList;
        break;
      case 'AUTOCANCEL':
        targetList = canceledList;
        break;
      default:
        console.log('Trạng thái không xác định:', trangThai);
        targetList = waitingList; // Mặc định là danh sách chờ
    }

   
          // Tạo nội dung HTML cho hợp đồng
          let actionButtons = ''; // Nút hành động mặc định là rỗng
          if (trangThai === 'PROCESSING') {
            actionButtons = `
             <button class="btn btn-primary" onclick="openPaymentConfirmationDialog('${contract.id}')">Thanh toán</button>
          <button class="btn btn-danger" onclick="chuyenCongViec('${assignmentDoc.id}')">Chuyển công việc</button>
             `;
          }

  // Tạo nội dung HTML cho hợp đồng
const contractRow = `
<div class="contract-item">
  <div class="contract-info">
    <p>Thời gian còn lại: <span id="countdown-${thoigian}"></span></p>
    <p>Mã công việc: ${assignmentDoc.id}</p>
    <p>Mã hợp đồng: ${contract.id}</p>
    <p>Mã hóa đơn: ${contract.hoaDonHopDong?.idHoaDon || "Không rõ"}</p>
    <p>Người nhận: ${contract.chuNha?.hoTen || "Không rõ"}</p>
    <p>Người gửi: ${contract.nguoiThue?.hoTen || "Không rõ"}</p>
    <p>Ngày bắt đầu hợp đồng: ${contract.ngayBatDau || "Không rõ"}</p>
    <p>Ngày kết thúc hợp đồng: ${contract.ngayKetThuc || "Không rõ"}</p>
  </div>
  <div class="actions">
    ${actionButtons} <!-- Chỉ hiển thị nút khi trạng thái là PROCESSING -->
  </div>
</div>
`;



    // Thêm nội dung vào danh sách
    targetList.innerHTML += contractRow;

    // Tạo bộ đếm thời gian
    createCountdown(endTime.getTime(), `countdown-${thoigian}`);
  } else {
    console.error(`Hợp đồng với ID ${assignmentData.idHopDong} không tồn tại.`);
  }
});

// Chờ tất cả các Promise hoàn tất
await Promise.all(promises);
    });
  } catch (error) {
    console.error("Lỗi khi lắng nghe thay đổi hợp đồng:", error);
  }
}

window.thanhToan = async function (contractId) {
  try {
    // Validate input
    if (!contractId) {
      console.error('Invalid contract ID: undefined or null');
      return false;
    }

    // Fetch contract details first
    const contractRef = doc(db, 'HopDong', contractId);
    const contractDoc = await getDoc(contractRef);

    if (!contractDoc.exists()) {
      console.error('Contract not found');
      return false;
    }

    const contractData = {
      id: contractDoc.id,
      ...contractDoc.data()
    };


    // Query PhanChiaCV records related to this contract
    const phanChiaCVQuery = query(
      collection(db, 'PhanChiaCV'),
      where('idHopDong', '==', contractId),
      where('trangThai', '==', 'PROCESSING')
    );

    // Get the snapshot of matching tasks
    const phanChiaCVSnapshot = await getDocs(phanChiaCVQuery);

    // Check if any matching records exist
    if (phanChiaCVSnapshot.empty) {
      console.log(`No tasks found for contract ${contractId}`);
      return false;
    }
    const idPhong = contractData.thongtinphong.maPhongTro|| '';
    console.log(`ID phòng: ${idPhong}`);
    const phongRef = doc(db, 'PhongTro', idPhong);
    const phongDoc = await getDoc(phongRef);

    const phongData = {
      id: phongDoc.id,
      ...phongDoc.data()
    };

    const DcQuanHuyen = phongData.Dc_quanhuyen || '';
    const DcTinhThanhPho = phongData.Dc_tinhtp || '';

    console.log(`Địa chỉ quận huyện: ${dcQuanHuyen}`);
    console.log(`Địa chỉ tỉnh thành phố: ${DcTinhThanhPho}`);

    const batch = writeBatch(db);

    const paymentHistoryRef = doc(collection(db, 'LichSuTT'));

      // Ensure bill details exist and have default values
      const tienPhong = contractData.hoaDonHopDong?.tienPhong || 0;
      const tienCoc = contractData.hoaDonHopDong?.tienCoc || 0;
      const tongHoaDon = tienPhong + tienCoc;
      const tongTienDaTru = tongHoaDon * 0.1;
      const tongTienDaGui = tongHoaDon - tongTienDaTru;


        // Prepare payment history data
    const paymentHistoryData = {
      idNhanVien: currentUserId || '',
      idHopDong: contractId,
      idCongViec: phanChiaCVSnapshot.docs[0].id,
      tongHoaDon: tongHoaDon,
      tongTienDaTru: tongTienDaTru,
      tongTienDaGui: tongTienDaGui,
      Dc_quanhuyen: DcQuanHuyen,
      Dc_tinhthanhpho: DcTinhThanhPho,
      nguoiThue: {
        maNguoiDung: contractData.nguoiThue?.maNguoiDung || '',
        hoTen: contractData.nguoiThue?.hoTen || 'Không rõ'
      },
      chuNha: {
        maNguoiDung: contractData.chuNha?.maNguoiDung || '',
        hoTen: contractData.chuNha?.hoTen || 'Không rõ'
      },
      ngayThanhToan: serverTimestamp(),
      trangThai: 'DONE',
      chiTietHoaDon: {
        tienPhong: tienPhong,
        tienCoc: tienCoc
      }
    };
 // Add payment history record
 batch.set(paymentHistoryRef, paymentHistoryData);

    // Update each matching task
    phanChiaCVSnapshot.forEach((docSnapshot) => {
      const docRef = doc(db, 'PhanChiaCV', docSnapshot.id);
      batch.update(docRef, {
        trangThai: 'DONE',
        thoiGianHoanThanh: serverTimestamp(),
        ghiChu: 'Thanh toán thành công'
      });
    });

    // Update the contract status
    batch.update(contractRef, {
      trangThai: 'ACTIVE',
      // Use dot notation to update nested field
      'hoaDonHopDong.trangThai': 'DONE'
    });

    // Commit all updates in a single batch
    await batch.commit();
    console.log(`Updated status for contract ${contractId}`);
    return true;

  } catch (error) {
    console.error(`Error updating contract ${contractId} status:`, error);
    return false;
  }
};

function huyThanhToan(idHoaDon) {
  console.log(`Hủy thanh toán hóa đơn: ${idHoaDon}`);
}

// Function to open payment confirmation dialog
window.openPaymentConfirmationDialog = async function(contractId){
  try {
    // Fetch contract details
    const contractRef = doc(db, "HopDong", contractId);
    const contractDoc = await getDoc(contractRef);

    if (!contractDoc.exists()) {
      console.error('Contract not found');
      return;
    }

    const contract = {
      id: contractDoc.id,
      ...contractDoc.data()
    };

     // Lấy thông tin thanh toán của chủ nhà
     const thongTinThanhToan = await layThongTinThanhToan(contract.chuNha.maNguoiDung);


    // Create detailed dialog content
    const dialogContent = `
      <div class="payment-confirmation-dialog">

        <h2>Xác Nhận Thanh Toán</h2>
        <div class="content-left">
        <div class="contract-details">
          <p><strong>Mã hóa đơn:</strong> ${contract.hoaDonHopDong?.idHoaDon}</p>
          <p><strong>Bên gửi:</strong> ${contract.nguoiThue.hoTen || "Không rõ"}</p>
          <p><strong>Bên nhận:</strong> ${contract.chuNha.hoTen || "Không rõ"}</p>
          <p><strong>Ngày gửi:</strong> ${contract.ngayTao || "Không rõ"}</p>
          <p><strong>Tiền phòng:</strong> ${contract.hoaDonHopDong.tienPhong.toLocaleString('vi-VN') || "Không rõ"}</p>
          <p><strong>Tiền Cọc:</strong> ${contract.hoaDonHopDong?.tienCoc.toLocaleString('vi-VN') || "Không rõ"}</p>
     <p><strong>Tổng tiền:</strong> ${(contract.hoaDonHopDong.tienPhong + contract.hoaDonHopDong.tienCoc).toLocaleString('vi-VN')}</p>
<p><strong>Phí hoa hồng:</strong> - 10% (${((contract.hoaDonHopDong.tienPhong + contract.hoaDonHopDong.tienCoc) * 0.1).toLocaleString('vi-VN')})</p>
<p style="color: red; font-weight: bold; margin-top: 40px; "> Tổng cần thanh toán: ${(contract.hoaDonHopDong.tienPhong + contract.hoaDonHopDong.tienCoc - (contract.hoaDonHopDong.tienPhong + contract.hoaDonHopDong.tienCoc) * 0.1).toLocaleString('vi-VN')}</p>
      </div>
        <div class="content-right">
      <h3>Thông Tin Thanh Toán Của Chủ Nhà</h3>
            ${thongTinThanhToan ? `
              <p><strong>Số Tài Khoản:</strong> ${thongTinThanhToan.soTaiKhoan}</p>
              <p><strong>Tên Tài Khoản:</strong> ${thongTinThanhToan.tenTaiKhoan}</p>
              <p><strong>Mã QR Thanh Toán:</strong></p>
              <img src="${thongTinThanhToan.maQR}" alt="Mã QR Thanh Toán" style="max-width: 200px; max-height: 200px;">
            ` : '<p>Không tìm thấy thông tin thanh toán</p>'}

        </div>
        </div>
        <div class="dialog-actions">
          <button id="confirm-payment-btn" class="btn btn-success">Xác Nhận Đã Thanh Toán Thành Công</button>
          <button id="cancel-payment-btn" class="btn btn-secondary">Hủy Bỏ</button>
        </div>
      </div>
    `;

    // Open modal and set content
    openModal(dialogContent);

    // Add event listeners to buttons
    const confirmBtn = document.getElementById('confirm-payment-btn');
    const cancelBtn = document.getElementById('cancel-payment-btn');

    confirmBtn.addEventListener('click', async () => {
        const paymentResult = await thanhToan(contractId);
        if (paymentResult) {
          alert('Thanh toán thành công!');
          closeModal();
          [waitingList, paidList, canceledList].forEach(list => list.innerHTML = "");
          fetchContracts(currentUserId);
          
        } else {
          alert('Thanh toán thất bại. Vui lòng thử lại.');
        }
     
    });

    cancelBtn.addEventListener('click', () => {
      closeModal();
    });

    
  } catch (error) {
    console.error('Lỗi khi mở dialog thanh toán:', error);
    alert('Không thể mở dialog thanh toán. Vui lòng thử lại.');
  }
}



function createCountdown(endTime, elementId) {
  const updateCountdown = () => {
    const currentTime = Date.now(); // Current time in ms
    const timeRemaining = Math.max(endTime - currentTime, 0); // Ensure non-negative value

    // Convert remaining time to minutes and seconds
    const minutes = Math.floor(timeRemaining / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    const remainingTimeText = timeRemaining > 0
      ? `${minutes} phút, ${seconds} giây`
      : "Hết hạn";

    // Display countdown
    const countdownElement = document.getElementById(elementId);
    if (countdownElement) {
      countdownElement.innerText = remainingTimeText;
    }

    // Stop the countdown when time is over
    if (timeRemaining <= 0) {
      clearInterval(intervalId);
    }
  };

  // Update countdown every second
  const intervalId = setInterval(updateCountdown, 1000);
  updateCountdown(); // Initial update
}
// fetchContracts(currentUserId);   // Sử dụng biến này

console.log( "mã người dùng: "+currentUserId);


initializeStaynowApp().then(() => {
  if (currentUserId) {
    fetchContracts(currentUserId);
  }
});




document.getElementById("logoutButton").addEventListener("click", function () {
  
  // Hiển thị modal xác nhận đăng xuất
  showLogoutConfirmModal(logoutUser);
});

// Hàm hiển thị modal xác nhận logout
function showLogoutConfirmModal(logoutCallback) {
  const modal = document.getElementById("logoutConfirmModal");
  modal.classList.remove("modalHidden");
  modal.style.display = "block";

  // Xử lý khi nhấn đồng ý
  document.getElementById("confirmLogout").onclick = async function () {
    await logoutCallback();
    hideModalLogout(modal);
  };

  // Xử lý khi nhấn hủy
  document.getElementById("cancelLogout").onclick = () => hideModalLogout(modal);

  // Đóng modal khi nhấn ra ngoài
  window.onclick = function (event) {
    if (event.target === modal) {
      hideModalLogout(modal);
    }
  };
}

// Hàm ẩn modal xác nhận logout
function hideModalLogout(modal) {
  modal.classList.add("modalHidden");
  modal.style.display = "none";
}

// Hàm thực hiện đăng xuất
async function logoutUser() {
  try {
    await signOut(auth); // Đăng xuất khỏi Firebase
    localStorage.removeItem("userId"); // Xóa thông tin người dùng khỏi localStorage

    // Hiển thị modal thông báo thành công
    showToast("Đăng xuất thành công!");

    // Delay chuyển hướng sau khi Toast hiển thị
    setTimeout(() => {
      window.location.href = "../public/Login/Login.html"; // Chuyển hướng về trang chính
    }, 1500); // Chờ 3 giây để Toast hiển thị

  } catch (error) {
    alert("Đã xảy ra lỗi khi đăng xuất: " + error.message);
  }
}




function showToast(message) {
  const toastContainer = document.getElementById("toastContainer");

  // Kiểm tra xem phần tử toastContainer có tồn tại không
  if (!toastContainer) {
    console.error("Toast container not found!");
    return;
  }

  // Tạo toast
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  // Thêm toast vào container
  toastContainer.appendChild(toast);

  // Xóa toast sau khi animation kết thúc
  setTimeout(() => {
    toast.remove();
  },1500);
}



//lấy thông tin người dùng
document.addEventListener("DOMContentLoaded", () => {
  // Lấy `uid` từ `localStorage`
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "../../../public/Login/Login.html";
    return;
  }

  // Truy vấn thông tin người dùng từ Firebase
  const userRef = ref(database, "NguoiDung/" + userId);

  get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();

        // Hiển thị thông tin người dùng trên màn hình chính
        console.log("Thông tin người dùng:", userData);

        // Ví dụ: Cập nhật thông tin người dùng trên giao diện
        document.getElementById("userName").textContent = userData.ho_ten;
        document.getElementById("userAvatar").src =
          userData.anh_daidien || "default-avatar.png";
      } else {
        alert("Không tìm thấy thông tin người dùng!");
      }
    })
    .catch((error) => {
      console.error("Lỗi kết nối đến máy chủ:", error.message);
    });
});
