// Import các chức năng cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";


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

                    const nutXoa = document.createElement('button');
                    nutXoa.textContent = 'Xóa';

                    // Thêm các phần tử vào userItem
                    userDetails.appendChild(name);
                    userDetails.appendChild(phone);
                    userItem.appendChild(avatar);
                    userItem.appendChild(userDetails);
                    

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
document.getElementById('closeDialog').onclick = function() {
    document.getElementById('userDialog').style.display = "none";
}

// Hàm tìm kiếm người dùng
function searchUsers() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    const contentElement = document.getElementById('content');
    contentElement.innerHTML = ''; // Xóa nội dung cũ

    allUsers.forEach(user => {
        if (user.ho_ten.toLowerCase().includes(searchInput)) {
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

            // Thêm các phần tử vào userItem
            userDetails.appendChild(name);
            userDetails.appendChild(phone);
            userItem.appendChild(avatar);
            userItem.appendChild(userDetails);

            // Thêm sự kiện click để hiển thị dialog
            userItem.addEventListener('click', () => {
                showUserDialog(user);
            });

            // Thêm userItem vào content
            contentElement.appendChild(userItem);
        }
    });
}

// Thêm sự kiện cho nút tìm kiếm
document.querySelector('button[type="submit"]').addEventListener('click', (e) => {
    e.preventDefault(); // Ngăn chặn gửi biểu mẫu
    searchUsers();
});

// Gán fetchUsers vào window để có thể gọi từ HTML
window.fetchUsers = fetchUsers;
