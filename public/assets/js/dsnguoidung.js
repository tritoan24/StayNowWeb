// Import các chức năng cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import {
    getAuth,
    signOut,
  } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Ẩn dialog khi tải lại trang
document.getElementById('userDialog').style.display = 'none';

// Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBmpKO0lDHFiYb3zklAJ2zz6qC-iQrypw0",
    authDomain: "staynowapp1.firebaseapp.com",
    databaseURL: "https://staynowapp1-default-rtdb.firebaseio.com",
    projectId: "staynowapp1",
    storageBucket: "staynowapp1.appspot.com",
    messagingSenderId: "918655571270",
    appId: "1:918655571270:web:94abfaf87fbbb3e4ecc147",
    measurementId: "G-PQP9CTPKGT"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app); // Khởi tạo Authentication


// add hovered class to selected list item
let list = document.querySelectorAll(".navigation li");

function activeLink() {
  list.forEach((item) => {
    item.classList.remove("hovered");
  });
  this.classList.add("hovered");
}

list.forEach((item) => item.addEventListener("mouseover", activeLink));

// Menu Toggle
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};

// Biến để lưu trữ người dùng
let allUsers = [];


// Hàm để lấy danh sách người dùng
function fetchUsers() {
    const usersRef = ref(database, 'NguoiDung');

    get(usersRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const users = snapshot.val();
                allUsers = []; // Reset danh sách người dùng

                const contentElement = document.getElementById('content');
                contentElement.innerHTML = ''; // Xóa nội dung cũ

                for (const userId in users) {
                    const user = users[userId];
                    allUsers.push(user); // Lưu trữ tất cả người dùng vào mảng

                    // Tạo HTML cho mỗi người dùng
                    const userItem = document.createElement('div');
                    userItem.classList.add('user-item');

                    // Ảnh đại diện
                    const avatar = document.createElement('img');
                    avatar.src = user.anh_daidien;
                    avatar.alt = user.ho_ten;

                    // Thông tin người dùng
                    const userDetails = document.createElement('div');
                    userDetails.classList.add('user-details');

                    const name = document.createElement('h3');
                    name.textContent = user.ho_ten;

                    const phone = document.createElement('p');
                    phone.textContent = `SĐT: ${user.sdt}`;



                    // Tạo trạng thái (online/offline)
                    const statusCircle = document.createElement('span');
                    statusCircle.classList.add('status-circle');
                    if (user.status === 'online') {
                        statusCircle.classList.add('online');
                    } else {
                        statusCircle.classList.add('offline');
            
                            // Tính thời gian offline
                            const lastOnline = new Date(user.lastActiveTime); // Giả sử `user.lastOnline` là thời gian cuối cùng online
                            const now = new Date();
                            const diffMs = now - lastOnline; // Chênh lệch thời gian (ms)
                            const diffMinutes = Math.floor(diffMs / 60000); // Đổi sang phút
                            const diffHours = Math.floor(diffMinutes / 60); // Đổi sang giờ
                            const diffDays = Math.floor(diffHours / 24); // Đổi sang ngày
            
                            let offlineTime = '';
                            if (diffDays > 0) {
                                offlineTime = `${diffDays} ngày trước`;
                            } else if (diffHours > 0) {
                                offlineTime = `${diffHours} giờ trước`;
                            } else {
                                offlineTime = `${diffMinutes} phút trước`;
                            }
            
                            // Thêm vào giao diện
                            const offlineInfo = document.createElement('p');
                            offlineInfo.textContent = `${offlineTime}`;
                            offlineInfo.classList.add('offline-info'); // CSS để tạo kiểu cho thông tin offline
                            statusCircle.appendChild(offlineInfo);
                        }
                    // Tạo nút chi tiết
                    const detailButton = document.createElement('button');
                    detailButton.classList.add('detail-button');

                    // Kiểm tra trạng thái tài khoản để đặt nhãn và màu cho nút
                    if (user.trang_thaitaikhoan === 'HoatDong') {
                        detailButton.textContent = 'Khóa Tài Khoản';
                        detailButton.classList.add('button-active'); // Thêm màu xanh cho nút
                    } else if (user.trang_thaitaikhoan === 'Khoa') {
                        detailButton.textContent = 'Mở Tài Khoản';
                        detailButton.classList.add('button-banned'); // Thêm màu đỏ cho nút
                    }

                    // Thêm sự kiện click cho nút
                    detailButton.addEventListener('click', (e) => {
                        e.stopPropagation(); // Ngăn chặn sự kiện click lan tỏa lên phần tử cha

                        if (user.trang_thaitaikhoan === 'HoatDong') {
                            // Hiển thị xác nhận khóa tài khoản
                            var r = confirm("Bạn có chắc chắn muốn Khóa tài khoản này hay không?");
                            if (r == true) {
                                // Đổi trạng thái tài khoản thành Khoa
                                const updates = {};
                                updates[`/NguoiDung/${user.ma_nguoidung}/trang_thaitaikhoan`] = 'Khoa';
                                updates[`/NguoiDung/${user.ma_nguoidung}/ngay_capnhat`] = new Date().toISOString();

                                update(ref(database), updates)
                                    .then(() => {
                                        alert('Tài khoản đã bị Khóa');
                                        fetchUsers(); // Tải lại danh sách người dùng
                                    })
                                    .catch((error) => {
                                        console.error("Error updating data: ", error);
                                    });
                            }
                        } else if (user.trang_thaitaikhoan === 'Khoa') {
                            // Hiển thị xác nhận mở tài khoản
                            var r = confirm("Bạn có chắc chắn muốn Mở tài khoản này không?");
                            if (r == true) {
                                // Đổi trạng thái tài khoản thành HoatDong
                                const updates = {};
                                updates[`/NguoiDung/${user.ma_nguoidung}/trang_thaitaikhoan`] = 'HoatDong';
                                updates[`/NguoiDung/${user.ma_nguoidung}/ngay_capnhat`] = new Date().toISOString();

                                update(ref(database), updates)
                                    .then(() => {
                                        alert('Tài khoản đã được Mở');
                                        fetchUsers(); // Tải lại danh sách người dùng
                                    })
                                    .catch((error) => {
                                        console.error("Error updating data: ", error);
                                    });
                            }
                        }
                    });






                    // Thêm các phần tử vào userItem
                    userDetails.appendChild(name);
                    userDetails.appendChild(phone);
                    userItem.appendChild(avatar);
                    userItem.appendChild(userDetails);
                    userItem.appendChild(statusCircle);
                    userItem.appendChild(detailButton);


                    // Thêm sự kiện click để hiển thị dialog
                    userItem.addEventListener('click', () => {
                        showUserDialog(user);
                    });

                    // Thêm userItem vào content
                    contentElement.appendChild(userItem);
                }
            } else {
                console.log("No data available");
            }
        })
        .catch((error) => {
            console.error("Error fetching data: ", error);
        });
}

// Hàm hiển thị dialog người dùng
function showUserDialog(user) {
    const dialog = document.getElementById('userDialog');
    dialog.style.display = 'block';

    document.getElementById('dialogName').textContent = user.ho_ten;
    document.getElementById('dialogAvatar').src = user.anh_daidien;
    document.getElementById('dialogPhone').textContent = `SĐT: ${user.sdt}`;
    document.getElementById('dialogEmail').textContent = `Email: ${user.email || 'Không có'}`;
    document.getElementById('dialogAccountType').textContent = `Loại tài khoản: ${user.loai_taikhoan}`;
    document.getElementById('dialogUserId').textContent = `Mã người dùng: ${user.ma_nguoidung}`;
    document.getElementById('dialogAccountStatus').textContent = `Trạng thái tài khoản: ${user.trang_thaitaikhoan}`;
    document.getElementById('dialogCreatedDate').textContent = `Ngày tạo: ${new Date(user.ngay_taotaikhoan).toLocaleString()}`;
    document.getElementById('dialogUpdatedDate').textContent = `Ngày cập nhật: ${new Date(user.ngay_capnhat).toLocaleString()}`;
    document.getElementById('dialogBookingCount').textContent = `Số lượt đặt lịch: ${user.so_luotdatlich}`;
}

// Thêm sự kiện click để đóng dialog
document.getElementById('closeDialog').onclick = function () {
    document.getElementById('userDialog').style.display = "none";
}
function searchUsers() {
    const searchInput = document.getElementById('search').value.trim().toLowerCase(); // Loại bỏ khoảng trắng và chuyển chữ thường
    const contentElement = document.getElementById('content');
    contentElement.innerHTML = ''; // Xóa nội dung cũ trước khi thêm kết quả tìm kiếm

    allUsers.forEach(user => {
        const hoTen = user.ho_ten?.toLowerCase() || ''; // Xử lý nếu ho_ten bị null hoặc undefined
        const maNguoiDung = user.ma_nguoidung?.toLowerCase() || ''; // Xử lý nếu ma_nguoidung bị null hoặc undefined

        // Kiểm tra điều kiện tìm kiếm
        if (hoTen.includes(searchInput) || maNguoiDung.includes(searchInput)) {
             // Tạo HTML cho mỗi người dùng
             const userItem = document.createElement('div');
             userItem.classList.add('user-item');

             // Ảnh đại diện
             const avatar = document.createElement('img');
             avatar.src = user.anh_daidien;
             avatar.alt = user.ho_ten;

             // Thông tin người dùng
             const userDetails = document.createElement('div');
             userDetails.classList.add('user-details');

             const name = document.createElement('h3');
             name.textContent = user.ho_ten;

             const phone = document.createElement('p');
             phone.textContent = `SĐT: ${user.sdt}`;



             // Tạo trạng thái (online/offline)
             const statusCircle = document.createElement('span');
             statusCircle.classList.add('status-circle');
             if (user.status === 'online') {
                 statusCircle.classList.add('online');
             } else {
                 statusCircle.classList.add('offline');
     
                     // Tính thời gian offline
                     const lastOnline = new Date(user.lastActiveTime); // Giả sử `user.lastOnline` là thời gian cuối cùng online
                     const now = new Date();
                     const diffMs = now - lastOnline; // Chênh lệch thời gian (ms)
                     const diffMinutes = Math.floor(diffMs / 60000); // Đổi sang phút
                     const diffHours = Math.floor(diffMinutes / 60); // Đổi sang giờ
                     const diffDays = Math.floor(diffHours / 24); // Đổi sang ngày
     
                     let offlineTime = '';
                     if (diffDays > 0) {
                         offlineTime = `${diffDays} ngày trước`;
                     } else if (diffHours > 0) {
                         offlineTime = `${diffHours} giờ trước`;
                     } else {
                         offlineTime = `${diffMinutes} phút trước`;
                     }
     
                     // Thêm vào giao diện
                     const offlineInfo = document.createElement('p');
                     offlineInfo.textContent = `${offlineTime}`;
                     offlineInfo.classList.add('offline-info'); // CSS để tạo kiểu cho thông tin offline
                     statusCircle.appendChild(offlineInfo);
                 }
             // Tạo nút chi tiết
             const detailButton = document.createElement('button');
             detailButton.classList.add('detail-button');

             // Kiểm tra trạng thái tài khoản để đặt nhãn và màu cho nút
             if (user.trang_thaitaikhoan === 'HoatDong') {
                 detailButton.textContent = 'Khóa Tài Khoản';
                 detailButton.classList.add('button-active'); // Thêm màu xanh cho nút
             } else if (user.trang_thaitaikhoan === 'Khoa') {
                 detailButton.textContent = 'Mở Tài Khoản';
                 detailButton.classList.add('button-banned'); // Thêm màu đỏ cho nút
             }

             // Thêm sự kiện click cho nút
             detailButton.addEventListener('click', (e) => {
                 e.stopPropagation(); // Ngăn chặn sự kiện click lan tỏa lên phần tử cha

                 if (user.trang_thaitaikhoan === 'HoatDong') {
                     // Hiển thị xác nhận khóa tài khoản
                     var r = confirm("Bạn có chắc chắn muốn Khóa tài khoản này hay không?");
                     if (r == true) {
                         // Đổi trạng thái tài khoản thành Khoa
                         const updates = {};
                         updates[`/NguoiDung/${user.ma_nguoidung}/trang_thaitaikhoan`] = 'Khoa';
                         updates[`/NguoiDung/${user.ma_nguoidung}/ngay_capnhat`] = new Date().toISOString();

                         update(ref(database), updates)
                             .then(() => {
                                 alert('Tài khoản đã bị Khóa');
                                 fetchUsers(); // Tải lại danh sách người dùng
                             })
                             .catch((error) => {
                                 console.error("Error updating data: ", error);
                             });
                     }
                 } else if (user.trang_thaitaikhoan === 'Khoa') {
                     // Hiển thị xác nhận mở tài khoản
                     var r = confirm("Bạn có chắc chắn muốn Mở tài khoản này không?");
                     if (r == true) {
                         // Đổi trạng thái tài khoản thành HoatDong
                         const updates = {};
                         updates[`/NguoiDung/${user.ma_nguoidung}/trang_thaitaikhoan`] = 'HoatDong';
                         updates[`/NguoiDung/${user.ma_nguoidung}/ngay_capnhat`] = new Date().toISOString();

                         update(ref(database), updates)
                             .then(() => {
                                 alert('Tài khoản đã được Mở');
                                 fetchUsers(); // Tải lại danh sách người dùng
                             })
                             .catch((error) => {
                                 console.error("Error updating data: ", error);
                             });
                     }
                 }
             });






             // Thêm các phần tử vào userItem
             userDetails.appendChild(name);
             userDetails.appendChild(phone);
             userItem.appendChild(avatar);
             userItem.appendChild(userDetails);
             userItem.appendChild(statusCircle);
             userItem.appendChild(detailButton);


             // Thêm sự kiện click để hiển thị dialog
             userItem.addEventListener('click', () => {
                 showUserDialog(user);
             });
            contentElement.appendChild(userItem); // Thêm userItem vào content
        }
    });

    // Nếu không có kết quả, hiển thị thông báo
    if (contentElement.innerHTML === '') {
        const noResults = document.createElement('p');
        noResults.textContent = 'Không tìm thấy kết quả nào.';
        noResults.style.color = 'gray';
        noResults.style.textAlign = 'center';
        contentElement.appendChild(noResults);
    }
}


// Gán sự kiện input cho ô tìm kiếm
document.getElementById('search').addEventListener('input', searchUsers);

// Gọi fetchUsers tự động khi trang được tải
document.addEventListener('DOMContentLoaded', fetchUsers);

// Gán fetchUsers vào window để có thể gọi từ HTML
window.fetchUsers = fetchUsers;



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


  
  document.getElementById("logoutButton").addEventListener("click", function () {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("userId");
  
        alert("Bạn đã đăng xuất thành công.");
        window.location.href = "../public/Login/Login.html";
      })
      .catch((error) => {
        alert("Đã xảy ra lỗi khi đăng xuất: " + error.message);
      });
  });

