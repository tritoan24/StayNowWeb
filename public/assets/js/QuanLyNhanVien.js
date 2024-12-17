import { auth, database } from "./FireBaseConfig.js";

import {
  ref,
  get,
  update,
  set
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

document.getElementById("userDialog").style.display = "none";


// Biến toàn cục để lưu trữ danh sách phòng trọ
let staffs = [];
let allStaff = []; // Danh sách gốc

function fetchStaffs() {
  const usersRef = ref(database, "NguoiDung");

  get(usersRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const users = snapshot.val();

        const contentElement = document.getElementById("staffList");
        contentElement.innerHTML = ""; // Xóa nội dung cũ

        for (const userId in users) {
          const user = users[userId];

          // Chỉ xử lý người dùng có loai_taikhoan là NhanVien
          if (user.loai_taikhoan === "NhanVien") {
            allStaff.push(user);

            // Tạo HTML cho mỗi nhân viên
            const userItem = document.createElement("div");
            userItem.classList.add("user-item");

            // Ảnh đại diện
            const avatar = document.createElement("img");
            avatar.src = user.anh_daidien || "default-avatar.png"; // Thêm ảnh mặc định nếu thiếu ảnh đại diện
            avatar.alt = user.ho_ten;

            // Thông tin người dùng
            const userDetails = document.createElement("div");
            userDetails.classList.add("user-details");

            const name = document.createElement("h3");
            name.textContent = user.ho_ten;

            // Tạo trạng thái (online/offline)
            const statusCircle = document.createElement("span");
            statusCircle.classList.add("status-circle");
            if (user.status === "online") {
              statusCircle.classList.add("online");
            } else {
              statusCircle.classList.add("offline");

              // Tính thời gian offline
              const lastOnline = new Date(user.lastActiveTime); // Giả sử `user.lastOnline` là thời gian cuối cùng online
              const now = new Date();
              const diffMs = now - lastOnline; // Chênh lệch thời gian (ms)
              const diffMinutes = Math.floor(diffMs / 60000); // Đổi sang phút
              const diffHours = Math.floor(diffMinutes / 60); // Đổi sang giờ
              const diffDays = Math.floor(diffHours / 24); // Đổi sang ngày

              let offlineTime = "";
              if (diffDays > 0) {
                offlineTime = `${diffDays} ngày trước`;
              } else if (diffHours > 0) {
                offlineTime = `${diffHours} giờ trước`;
              } else {
                offlineTime = `${diffMinutes} phút trước`;
              }

              // Thêm vào giao diện
              const offlineInfo = document.createElement("p");
              offlineInfo.textContent = `${offlineTime}`;
              offlineInfo.classList.add("offline-info"); // CSS để tạo kiểu cho thông tin offline
              statusCircle.appendChild(offlineInfo);
            }

            // Tạo nút chi tiết
            const detailButton = document.createElement("button");
            detailButton.classList.add("detail-button");

            // Kiểm tra trạng thái tài khoản để đặt nhãn và màu cho nút
            if (user.trang_thaitaikhoan === "HoatDong") {
              detailButton.textContent = "Khóa Tài Khoản";
              detailButton.classList.add("button-active"); // Thêm màu xanh cho nút
            } else if (user.trang_thaitaikhoan === "Khoa") {
              detailButton.textContent = "Mở Tài Khoản";
              detailButton.classList.add("button-banned"); // Thêm màu đỏ cho nút
            }

            // Thêm sự kiện click cho nút
            detailButton.addEventListener("click", (e) => {
              e.stopPropagation(); // Ngăn chặn sự kiện click lan tỏa lên phần tử cha

              if (user.trang_thaitaikhoan === "HoatDong") {
                const confirmLock = confirm(
                  "Bạn có chắc chắn muốn khóa tài khoản này không?"
                );
                if (confirmLock) {
                  const updates = {};
                  updates[`/NguoiDung/${userId}/trang_thaitaikhoan`] = "Khoa";
                  updates[`/NguoiDung/${userId}/ngay_capnhat`] =
                    new Date().toISOString();

                  update(ref(database), updates)
                    .then(() => {
                      alert("Tài khoản đã bị khóa");
                      fetchStaffs(); // Tải lại danh sách nhân viên
                    })
                    .catch((error) => {
                      console.error("Error updating data:", error);
                    });
                }
              } else if (user.trang_thaitaikhoan === "Khoa") {
                const confirmUnlock = confirm(
                  "Bạn có chắc chắn muốn mở tài khoản này không?"
                );
                if (confirmUnlock) {
                  const updates = {};
                  updates[`/NguoiDung/${userId}/trang_thaitaikhoan`] =
                    "HoatDong";
                  updates[`/NguoiDung/${userId}/ngay_capnhat`] =
                    new Date().toISOString();

                  update(ref(database), updates)
                    .then(() => {
                      alert("Tài khoản đã được mở");
                      fetchStaffs(); // Tải lại danh sách nhân viên
                    })
                    .catch((error) => {
                      console.error("Error updating data:", error);
                    });
                }
              }
            });

            // Thêm các phần tử vào userItem
            userDetails.appendChild(name);
            userItem.appendChild(avatar);
            userItem.appendChild(userDetails);
            userItem.appendChild(statusCircle);
            userItem.appendChild(detailButton);

            // Thêm sự kiện click để hiển thị dialog
            userItem.addEventListener("click", () => {
              showUserDialog(user);
            });

            // Thêm userItem vào content
            contentElement.appendChild(userItem);
          }
        }
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function showUserDialog(user) {
  const dialog = document.getElementById("userDialog");
  dialog.style.display = "block";

  document.getElementById("dialogName").textContent = user.ho_ten;
  document.getElementById("dialogAvatar").src = user.anh_daidien;
  document.getElementById("dialogPhone").textContent = `SĐT: ${user.sdt}`;
  document.getElementById("dialogEmail").textContent = `Email: ${
    user.email || "Không có"
  }`;
  document.getElementById(
    "dialogAccountType"
  ).textContent = `Loại tài khoản: ${user.loai_taikhoan}`;
  document.getElementById(
    "dialogUserId"
  ).textContent = `Mã người dùng: ${user.ma_nguoidung}`;
  document.getElementById(
    "dialogAccountStatus"
  ).textContent = `Trạng thái tài khoản: ${user.trang_thaitaikhoan}`;
  document.getElementById(
    "dialogCreatedDate"
  ).textContent = `Ngày tạo: ${new Date(
    user.ngay_taotaikhoan
  ).toLocaleString()}`;
  document.getElementById(
    "dialogUpdatedDate"
  ).textContent = `Ngày cập nhật: ${new Date(
    user.ngay_capnhat
  ).toLocaleString()}`;
}

// Thêm sự kiện click để đóng dialog
document.getElementById("closeDialog").onclick = function () {
  document.getElementById("userDialog").style.display = "none";
};

function searchUsers() {
  staffs = []
  const searchInput = document
    .getElementById("searchStaff")
    .value.trim()
    .toLowerCase(); // Loại bỏ khoảng trắng và chuyển chữ thường
  const contentElement = document.getElementById("staffList");
  contentElement.innerHTML = ""; // Xóa nội dung cũ trước khi thêm kết quả tìm kiếm

  allStaff.forEach((user) => {
    const hoTen = user.ho_ten?.toLowerCase() || ""; // Xử lý nếu ho_ten bị null hoặc undefined
    const maNguoiDung = user.ma_nguoidung?.toLowerCase() || ""; // Xử lý nếu ma_nguoidung bị null hoặc undefined

    // Kiểm tra điều kiện tìm kiếm
    if (hoTen.includes(searchInput) || maNguoiDung.includes(searchInput)) {
      // Tạo HTML cho mỗi người dùng
      const userItem = document.createElement("div");
      userItem.classList.add("user-item");

      // Ảnh đại diện
      const avatar = document.createElement("img");
      avatar.src = user.anh_daidien;
      avatar.alt = user.ho_ten;

      // Thông tin người dùng
      const userDetails = document.createElement("div");
      userDetails.classList.add("user-details");

      const name = document.createElement("h3");
      name.textContent = user.ho_ten;

      const phone = document.createElement("p");
      phone.textContent = `SĐT: ${user.sdt}`;

      // Tạo trạng thái (online/offline)
      const statusCircle = document.createElement("span");
      statusCircle.classList.add("status-circle");
      if (user.status === "online") {
        statusCircle.classList.add("online");
      } else {
        statusCircle.classList.add("offline");

        // Tính thời gian offline
        const lastOnline = new Date(user.lastActiveTime); // Giả sử `user.lastOnline` là thời gian cuối cùng online
        const now = new Date();
        const diffMs = now - lastOnline; // Chênh lệch thời gian (ms)
        const diffMinutes = Math.floor(diffMs / 60000); // Đổi sang phút
        const diffHours = Math.floor(diffMinutes / 60); // Đổi sang giờ
        const diffDays = Math.floor(diffHours / 24); // Đổi sang ngày

        let offlineTime = "";
        if (diffDays > 0) {
          offlineTime = `${diffDays} ngày trước`;
        } else if (diffHours > 0) {
          offlineTime = `${diffHours} giờ trước`;
        } else {
          offlineTime = `${diffMinutes} phút trước`;
        }

        // Thêm vào giao diện
        const offlineInfo = document.createElement("p");
        offlineInfo.textContent = `${offlineTime}`;
        offlineInfo.classList.add("offline-info"); // CSS để tạo kiểu cho thông tin offline
        statusCircle.appendChild(offlineInfo);
      }
      // Tạo nút chi tiết
      const detailButton = document.createElement("button");
      detailButton.classList.add("detail-button");

      // Kiểm tra trạng thái tài khoản để đặt nhãn và màu cho nút
      if (user.trang_thaitaikhoan === "HoatDong") {
        detailButton.textContent = "Khóa Tài Khoản";
        detailButton.classList.add("button-active"); // Thêm màu xanh cho nút
      } else if (user.trang_thaitaikhoan === "Khoa") {
        detailButton.textContent = "Mở Tài Khoản";
        detailButton.classList.add("button-banned"); // Thêm màu đỏ cho nút
      }

      // Thêm sự kiện click cho nút
      detailButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Ngăn chặn sự kiện click lan tỏa lên phần tử cha

        if (user.trang_thaitaikhoan === "HoatDong") {
          // Hiển thị xác nhận khóa tài khoản
          var r = confirm(
            "Bạn có chắc chắn muốn Khóa tài khoản này hay không?"
          );
          if (r == true) {
            // Đổi trạng thái tài khoản thành Khoa
            const updates = {};
            updates[`/NguoiDung/${user.ma_nguoidung}/trang_thaitaikhoan`] =
              "Khoa";
            updates[`/NguoiDung/${user.ma_nguoidung}/ngay_capnhat`] =
              new Date().toISOString();

            update(ref(database), updates)
              .then(() => {
                alert("Tài khoản đã bị Khóa");
                fetchUsers(); // Tải lại danh sách người dùng
              })
              .catch((error) => {
                console.error("Error updating data: ", error);
              });
          }
        } else if (user.trang_thaitaikhoan === "Khoa") {
          // Hiển thị xác nhận mở tài khoản
          var r = confirm("Bạn có chắc chắn muốn Mở tài khoản này không?");
          if (r == true) {
            // Đổi trạng thái tài khoản thành HoatDong
            const updates = {};
            updates[`/NguoiDung/${user.ma_nguoidung}/trang_thaitaikhoan`] =
              "HoatDong";
            updates[`/NguoiDung/${user.ma_nguoidung}/ngay_capnhat`] =
              new Date().toISOString();

            update(ref(database), updates)
              .then(() => {
                alert("Tài khoản đã được Mở");
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
      userItem.addEventListener("click", () => {
        showUserDialog(user);
      });
      contentElement.appendChild(userItem); // Thêm userItem vào content
    }
  });

  // Nếu không có kết quả, hiển thị thông báo
  if (contentElement.innerHTML === "") {
    const noResults = document.createElement("p");
    noResults.textContent = "Không tìm thấy kết quả nào.";
    noResults.style.color = "gray";
    noResults.style.textAlign = "center";
    contentElement.appendChild(noResults);
  }
}

async function handleFormSubmit(event) {
  event.preventDefault(); // Ngăn trang không bị reload

  // Lấy giá trị từ các trường input
  const staffName = document.getElementById("staffName").value.trim();
  const staffPhone = document.getElementById("staffPhone").value.trim();
  const staffAvt = document.getElementById("staffAvt").value.trim();
  const staffEmail = document.getElementById("staffEmail").value.trim();
  const staffPassword = document.getElementById("staffPassword").value.trim();
  const staffRePassword = document.getElementById("staffRePassword").value.trim();

  let hasError = false;

  // Kiểm tra lỗi đầu vào
  if (!staffName) {
    document.getElementById("staffNameError").classList.remove("hidden");
    document.getElementById("nameErrorMessage").textContent =
      "Họ tên không được để trống";
    hasError = true;
    return;
  } else {
    document.getElementById("staffNameError").classList.add("hidden");
  }

  if (!staffPhone || !/^\d{10}$/.test(staffPhone)) {
    document.getElementById("phoneErrorMessage").textContent =
      "Số điện thoại không hợp lệ (yêu cầu 10 chữ số)";
    document.getElementById("staffPhoneError").classList.remove("hidden");
    hasError = true;
    return;
  } else {
    document.getElementById("staffPhoneError").classList.add("hidden");
  }

  if (!staffAvt) {
    document.getElementById("avtErrorMessage").textContent =
      "Vui lòng thêm url ảnh đại diện";
    document.getElementById("staffAvtError").classList.remove("hidden");
    hasError = true;
    return;
  } else {
    document.getElementById("staffAvtError").classList.add("hidden");
  }

  if (!staffEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffEmail)) {
    document.getElementById("staffEmailError").classList.remove("hidden");
    document.getElementById("emailErrorMessage").textContent =
      "Email không hợp lệ";
    hasError = true;
    return;
  } else {
    document.getElementById("staffEmailError").classList.add("hidden");
  }

  if (!staffPassword || staffPassword.length < 6) {
    document.getElementById("passwordErrorMessage").textContent =
      "Mật khẩu phải có ít nhất 6 ký tự";
    document.getElementById("staffPasswordError").classList.remove("hidden");
    hasError = true;
    return;
  } else {
    document.getElementById("staffPasswordError").classList.add("hidden");
  }

  if (staffPassword !== staffRePassword) {
    document.getElementById("rePasswordErrorMessage").textContent =
      "Mật khẩu xác nhận không khớp";
    document.getElementById("staffRePasswordError").classList.remove("hidden");
    hasError = true;
    return;
  } else {
    document.getElementById("staffRePasswordError").classList.add("hidden");
  }

  if (hasError) return; // Nếu có lỗi, dừng xử lý

  try {
    // Tạo người dùng với email và mật khẩu trong Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      staffEmail,
      staffPassword
    );

    const userId = userCredential.user.uid;

    // Lưu thông tin nhân viên vào Realtime Database
    const staffRef = ref(database, `NguoiDung/${userId}`);
    const newStaff = {
      ma_nguoidung: userId,
      ho_ten: staffName,
      sdt: staffPhone,
      anh_daidien: staffAvt || null, // Ảnh đại diện có thể để trống
      email: staffEmail,
      loai_taikhoan: "NhanVien",
      trang_thaitaikhoan: "HoatDong",
      ngay_taotaikhoan: new Date().toISOString(),
      ngay_capnhat: new Date().toISOString(),
      lastActiveTime: new Date().getTime(),
    };

    await set(staffRef, newStaff);

    // Thông báo thành công
    showSuccessModal("Nhân viên đã được thêm thành công.", () => {
      clearForm();
      fetchStaffs(); // Tải lại danh sách nhân viên
    });

  } catch (error) {
    console.error("Lỗi khi thêm nhân viên:", error);
    alert("Có lỗi xảy ra khi thêm nhân viên. Vui lòng thử lại.");
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



// Ẩn modal
function hideModal() {
  const modal = document.getElementById("successModal");
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
  document.getElementById("staffName").value = "";
  document.getElementById("staffEmail").value = "";
  document.getElementById("staffPhone").value = "";
  document.getElementById("staffAvt").value = "";
  document.getElementById("staffPassword").value = "";
  document.getElementById("staffRePassword").value = "";

  const form = document.getElementById("addStaffForm");
  form.setAttribute("data-mode", "add");
  form.removeAttribute("data-service-id"); // Xóa ID dịch vụ nếu có

  // Đặt lại nút submit về trạng thái "Thêm dịch vụ"
  const submitButton = document.getElementById("submitStaffBtn");
  submitButton.textContent = "Thêm nhân viên";
}

// Lắng nghe sự kiện DOMContentLoaded và gọi hàm fetchAllRooms
document.addEventListener("DOMContentLoaded", () => {
  fetchStaffs(); // Gọi hàm để tải danh sách phòng trọ khi trang tải xong
});

document.getElementById("clearFormBtn").addEventListener("click", clearForm);
document.getElementById("searchStaff").addEventListener("input", searchUsers);
document.getElementById("submitStaffBtn").addEventListener("click", handleFormSubmit);
window.searchUsers = searchUsers;
window.goBack = goBack;
window.clearForm = clearForm;
window.handleFormSubmit = handleFormSubmit;
window.fetchStaffs = fetchStaffs;
