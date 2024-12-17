
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";
import { signOut, getAuth} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const auth = getAuth(app); // Đảm bảo truyền app vào

// Firebase dữ liệu
let allData = [];
// Biến lưu trữ dữ liệu doanh thu
let revenueData = [];
// Biến lưu trữ dữ liệu thống kê nhân viên
let employeeRevenueData = [];

// Hàm lấy ngày đầu tháng và ngày hôm nay
const getDefaultDateRange = () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  //toda + thêm 1 ngày 
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return { startDate: firstDayOfMonth, endDate: today };
};

// Hàm chuyển đổi và chuẩn hóa ngày để so sánh
const convertToDate = (timestamp) => {
  if (!timestamp) return null;

  let date;
  // Nếu là số (timestamp Unix)
  if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  }
  // Nếu là object Date từ Firestore
  else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  }
  // Nếu là chuỗi ngày
  else {
    try {
      date = new Date(timestamp);
    } catch (error) {
      console.error('Không thể chuyển đổi thời gian:', timestamp);
      return null;
    }
  }

  // Đặt lại giờ, phút, giây và mili giây về 0 để so sánh chính xác ngày
  return new Date(
    date.getFullYear(), 
    date.getMonth(), 
    date.getDate()
  );
};

// Hàm so sánh ngày trong khoảng
const isDateInRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;
  
  // Chuyển đổi về múi giờ local để so sánh
  const normalizedDate = convertToDate(date);
  const normalizedStart = convertToDate(startDate);
  const normalizedEnd = convertToDate(endDate);

  return (
    normalizedDate >= normalizedStart && 
    normalizedDate <= normalizedEnd
  );
};

async function fetchDataPhongTro(startDate = null, endDate = null, selectedProvince  = null) {
  const dataRef = collection(db, "PhongTro");
  
  onSnapshot(dataRef, (querySnapshot) => {
    const regionData = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const province = data.Dc_tinhtp || "Khác";
      const region = `${province} - ${data.Dc_quanhuyen || "Khác"}`;
      
       // Kiểm tra bộ lọc tỉnh/thành phố
       if (selectedProvince) {
        // Chuyển đổi tên tỉnh để so sánh
        const normalizedProvince = province.toLowerCase().trim();
        const normalizedSelectedProvince = selectedProvince.toLowerCase().trim();
        
        // Kiểm tra xem tỉnh có khớp không
        if (normalizedProvince !== normalizedSelectedProvince) {
          return; // Bỏ qua nếu không khớp
        }
      }
    
      // Chuyển đổi thời gian tạo phòng
      const createdTime = convertToDate(data.ThoiGian_taophong);
      
      // Chuyển đổi thời gian thuê phòng
      const rentedTime = convertToDate(data.Ngay_duocthue);

      if (!regionData[region]) {
        regionData[region] = { rented: 0, created: 0 };
      }
    
      // Điều kiện cho phòng đã thuê
      const isRented = 
        data.Trang_thailuu === false &&
        data.Trang_thaiphong === true &&
        isDateInRange(rentedTime, startDate, endDate);
    
      // Điều kiện cho phòng đã tạo
      const isCreated = 
        data.Trang_thailuu === false &&
        data.Trang_thaiphong === false &&
        isDateInRange(createdTime, startDate, endDate);

      if (isRented) {
        regionData[region].rented++;
      }

      if (isCreated) {
        regionData[region].created++;
      }
    });
    
    // Chuyển đổi dữ liệu thành dạng mảng
    allData = Object.keys(regionData).map(region => {
      return {
        region,
        rented: regionData[region].rented,
        created: regionData[region].created
      };
    });

    updateUI();
  });
}

// Hàm lấy ngày bắt đầu và kết thúc của các khoảng thời gian
function getDateRange(type) {
  const now = new Date();
  let startDate, endDate;

  switch (type) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;

    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;

    case 'thisYear':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;

    default:
      return null;
  }

  return { startDate, endDate };
}

// Hàm thiết lập sự kiện cho dropdown
function setupQuickFilterDropdown() {
  const dropdown = document.getElementById('filterQuickOptions');
  if (dropdown) {
    dropdown.addEventListener('change', (event) => {
      const selectedValue = event.target.value;

      // Xác định tab đang active
      const activeTab = document.querySelector('.tab.active');

      // Lấy khoảng thời gian
      const dateRange = getDateRange(selectedValue);

      // Lấy giá trị lọc tỉnh
      const provinceFilter = document.getElementById('regionFilter').value;

      if (dateRange) {
        // Cập nhật input ngày
        document.getElementById('startDate').value = dateRange.startDate.toISOString().slice(0, 10);
        document.getElementById('endDate').value = dateRange.endDate.toISOString().slice(0, 10);

        // Gọi hàm phù hợp với tab đang active
        if (activeTab) {
          switch (activeTab.dataset.tab) {
            case 'rooms':
              fetchDataPhongTro(dateRange.startDate, dateRange.endDate, provinceFilter || null);
              break;
            case 'revenue':
              fetchRevenueData(dateRange.startDate, dateRange.endDate, provinceFilter || null);
              break;
            case 'employees':
              fetchEmployeeRevenueData(dateRange.startDate, dateRange.endDate, provinceFilter || null);
              break;
          }
        }
      }
    });
  }
}

// Gọi hàm thiết lập sự kiện khi trang tải
window.onload = () => {
  const { startDate, endDate } = getDefaultDateRange();

  // Hiển thị giá trị mặc định lên input
  document.getElementById('startDate').value = startDate.toISOString().slice(0, 10);
  document.getElementById('endDate').value = endDate.toISOString().slice(0, 10);

  // Lấy dữ liệu mặc định
  fetchDataPhongTro(startDate, endDate);

  // Thiết lập sự kiện cho dropdown
  setupQuickFilterDropdown();
};



// Hàm cập nhật UI
const updateUI = () => {
  const chartLabels = allData.map(item => item.region);
  const rentedData = allData.map(item => item.rented);
  const createdData = allData.map(item => item.created);

  updateChart(chartLabels, rentedData, createdData);
  updateTable(allData);
};
// Hàm cập nhật biểu đồ cột ghép của phòng trọ
const updateChart = (labels, rentedData, createdData) => {
  const ctx = document.getElementById('chart').getContext('2d');
  
  // Tạo gradient cho màu nền của cột
  const gradientRented = ctx.createLinearGradient(0, 0, 0, 400);
  gradientRented.addColorStop(0, 'rgba(76, 175, 80, 0.8)');   // Màu xanh lá nhạt ở trên
  gradientRented.addColorStop(0.5, 'rgba(76, 175, 80, 0.6)'); // Màu xanh lá ở giữa
  gradientRented.addColorStop(1, 'rgba(76, 175, 80, 0.4)');   // Màu xanh lá nhạt ở dưới

  const gradientCreated = ctx.createLinearGradient(0, 0, 0, 400);
  gradientCreated.addColorStop(0, 'rgba(255, 87, 34, 0.8)');   // Màu cam nhạt ở trên
  gradientCreated.addColorStop(0.5, 'rgba(255, 87, 34, 0.6)'); // Màu cam ở giữa
  gradientCreated.addColorStop(1, 'rgba(255, 87, 34, 0.4)');   // Màu cam nhạt ở dưới

  // Thiết lập các defaults
  Chart.defaults.plugins.tooltip.cornerRadius = 10;
  Chart.defaults.plugins.tooltip.displayColors = false;
  Chart.defaults.plugins.tooltip.titleAlign = 'center';
  Chart.defaults.plugins.tooltip.bodyAlign = 'center';
  
  Chart.defaults.color = 'rgba(0, 0, 0, 0.8)';   
  Chart.defaults.font.size = 14;
  Chart.defaults.font.family = 'Arial';
  Chart.defaults.font.color = 'black';
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.boxWidth = 10;
  Chart.defaults.plugins.legend.labels.padding = 20;

  // Hủy biểu đồ cũ nếu tồn tại
  if (window.myChart) {
    window.myChart.destroy();
  }

  // Tạo biểu đồ mới
  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Phòng đã tạo',
          data: createdData,
          backgroundColor: gradientRented,
          borderWidth: 2,
          barThickness: 15,
          borderRadius: 5
        },
        {
          label: 'Phòng đã thuê',
          data: rentedData,
          backgroundColor: gradientCreated,
          borderWidth: 2,
          barThickness: 15,
          borderRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        x: {
          stacked: false,
          grid: {
            display: false // Ẩn đường lưới trục x
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0,0,0,0.1)' // Làm mờ đường lưới trục y
          }
        }
      }
    }
  });
};

// Hàm cập nhật bảng
const updateTable = (data) => {
  const tableBody = document.getElementById('statsTable');
  tableBody.innerHTML = '';
  data.forEach(item => {
    const row = `<tr>
      <td>${item.region}</td>
      <td>${item.created}</td>
      <td>${item.rented}</td>
    </tr>`;
    tableBody.innerHTML += row;
  });
};
// Khởi chạy tab đầu tiên





// Hàm lấy và xử lý dữ liệu doanh thu
async function fetchRevenueData(startDate = null, endDate = null, selectedProvince = null) {
  const db = getFirestore();
  const dataRef = collection(db, "LichSuTT");

  onSnapshot(dataRef, (querySnapshot) => {
    const revenueByRegion = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Kiểm tra trạng thái thanh toán
      if (data.trangThai !== "DONE") return;

      // Lấy thông tin địa điểm
      const province = data.Dc_tinhthanhpho ? data.Dc_tinhthanhpho.trim() : "Khác";
      const district = data.Dc_quanhuyen ? data.Dc_quanhuyen.trim() : "Khác";
      const region = `${province} - ${district}`;

      // Kiểm tra lọc tỉnh/thành phố
      if (selectedProvince) {
        const normalizedProvince = province.toLowerCase().trim();
        const normalizedSelectedProvince = selectedProvince.toLowerCase().trim();
        
        if (normalizedProvince !== normalizedSelectedProvince) {
          return;
        }
      }

      // Chuyển đổi ngày thanh toán
      const paymentDate = convertToDate(data.ngayThanhToan);

      // Kiểm tra ngày trong khoảng
      if (!isDateInRange(paymentDate, startDate, endDate)) return;

      // Khởi tạo dữ liệu cho khu vực nếu chưa tồn tại
      if (!revenueByRegion[region]) {
        revenueByRegion[region] = {
          totalRevenue: 0,
          transactionCount: 0 
        };
      }

      // Cập nhật dữ liệu
      revenueByRegion[region].totalRevenue += data.tongTienDaTru || 0;
      revenueByRegion[region].transactionCount += 1;
    });

    // Chuyển đổi dữ liệu thành mảng
    revenueData = Object.keys(revenueByRegion).map(region => ({
      region,
      ...revenueByRegion[region]
    }));

    updateRevenueUI();
  });
}

// Hàm cập nhật giao diện cho tab doanh thu
const updateRevenueUI = () => {
  const chartLabels = revenueData.map(item => item.region);
  const totalRevenueData = revenueData.map(item => item.totalRevenue);
  updateRevenueChart(chartLabels, totalRevenueData);
  updateRevenueTable(revenueData);
};

// Hàm cập nhật biểu đồ doanh thu
const updateRevenueChart = (labels, totalRevenueData) => {
  const ctx = document.getElementById('chart').getContext('2d');
  
  // Tạo gradient cho cột
  const gradientTotal = ctx.createLinearGradient(0, 0, 0, 400);
  gradientTotal.addColorStop(0, 'rgba(33, 150, 243, 0.8)');   // Xanh dương nhạt ở trên
  gradientTotal.addColorStop(0.5, 'rgba(33, 150, 243, 0.6)'); // Xanh dương ở giữa
  gradientTotal.addColorStop(1, 'rgba(33, 150, 243, 0.4)');   // Xanh dương nhạt ở dưới

  // Hủy biểu đồ cũ nếu tồn tại
  if (window.myChart) {
    window.myChart.destroy();
  }

  // Tạo biểu đồ mới
  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Tổng doanh thu',
          data: totalRevenueData,
          backgroundColor: gradientTotal,
          borderWidth: 2,
          barThickness: 15,
          borderRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('vi-VN', { 
                  style: 'currency', 
                  currency: 'VND' 
                }).format(context.parsed.y);
              }
              return label;
            }
          }
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        x: {
          stacked: false,
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0,0,0,0.1)'
          },
          ticks: {
            callback: function(value) {
              return new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
              }).format(value);
            }
          }
        }
      }
    }
  });
};


// Hàm cập nhật bảng doanh thu
const updateRevenueTable = (data) => {
  const tableBody = document.getElementById('statsTable');
  tableBody.innerHTML = '';
  data.forEach(item => {
    const row = `<tr>
      <td>${item.region}</td>
      <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalRevenue)}</td>
      <td>${item.transactionCount}</td>
    </tr>`;
    tableBody.innerHTML += row;
  });
};





// Hàm lấy và xử lý dữ liệu doanh thu theo nhân viên
async function fetchEmployeeRevenueData(startDate = null, endDate = null, selectedProvince = null) {
  const dataRef = collection(db, "LichSuTT");
  const usersRef = ref(rtdb, "NguoiDung");

  try {
    // Lấy thông tin người dùng từ Realtime Database
    const usersSnapshot = await get(usersRef);
    const users = usersSnapshot.val();

    const employeeRevenueByRegion = {};

    console.log(users); 


  // Lấy dữ liệu thanh toán
  onSnapshot(dataRef, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Kiểm tra trạng thái thanh toán
      if (data.trangThai !== "DONE") return;

      // Kiểm tra và lấy thông tin nhân viên
      const employeeId = data.idNhanVien;
      if (!employeeId) return;
      console.log(employeeId);
      

      // Lấy thông tin tỉnh/thành phố
      const province = data.Dc_tinhthanhpho ? data.Dc_tinhthanhpho.trim() : "Khác";

      // Kiểm tra lọc tỉnh/thành phố
      if (selectedProvince) {
        const normalizedProvince = province.toLowerCase().trim();
        const normalizedSelectedProvince = selectedProvince.toLowerCase().trim();
        
        if (normalizedProvince !== normalizedSelectedProvince) {
          return;
        }
      }

      // Chuyển đổi ngày thanh toán
      const paymentDate = convertToDate(data.ngayThanhToan);

      // Kiểm tra ngày trong khoảng
      if (!isDateInRange(paymentDate, startDate, endDate)) return;

      // Lấy tên nhân viên từ bảng NguoiDung
      const employeeName = users && users[employeeId] ? users[employeeId].ho_ten : "Không xác định";

      // Khởi tạo dữ liệu cho nhân viên nếu chưa tồn tại
      if (!employeeRevenueByRegion[employeeId]) {
        employeeRevenueByRegion[employeeId] = {
          name: employeeName,
          totalRevenue: 0,
          transactionCount: 0
        };
      }

      // Cập nhật dữ liệu
      employeeRevenueByRegion[employeeId].totalRevenue += data.tongTienDaTru || 0;
      employeeRevenueByRegion[employeeId].transactionCount += 1;
    });

    // Chuyển đổi dữ liệu thành mảng
    const employeeRevenueData = Object.keys(employeeRevenueByRegion).map(employeeId => ({
      employeeId,
      ...employeeRevenueByRegion[employeeId]
    }));

    updateEmployeeRevenueUI(employeeRevenueData);
  });
} catch (error) {
  console.error("Lỗi khi lấy dữ liệu nhân viên:", error);
}
}

// Hàm cập nhật giao diện cho tab nhân viên
const updateEmployeeRevenueUI = (data) => {
  const chartLabels = data.map(item => item.name);
  const totalRevenueData = data.map(item => item.totalRevenue);
  updateEmployeeRevenueChart(chartLabels, totalRevenueData);
  updateEmployeeRevenueTable(data);
};

// Hàm cập nhật biểu đồ doanh thu nhân viên
const updateEmployeeRevenueChart = (labels, totalRevenueData) => {
  const ctx = document.getElementById('chart').getContext('2d');
  
  // Tạo gradient cho cột
  const gradientTotal = ctx.createLinearGradient(0, 0, 0, 400);
  gradientTotal.addColorStop(0, 'rgba(76, 175, 80, 0.8)');   // Xanh lá nhạt ở trên
  gradientTotal.addColorStop(0.5, 'rgba(76, 175, 80, 0.6)'); // Xanh lá ở giữa
  gradientTotal.addColorStop(1, 'rgba(76, 175, 80, 0.4)');   // Xanh lá nhạt ở dưới

  // Hủy biểu đồ cũ nếu tồn tại
  if (window.myChart) {
    window.myChart.destroy();
  }

  // Tạo biểu đồ mới
  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Doanh thu nhân viên',
          data: totalRevenueData,
          backgroundColor: gradientTotal,
          borderWidth: 2,
          barThickness: 15,
          borderRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('vi-VN', { 
                  style: 'currency', 
                  currency: 'VND' 
                }).format(context.parsed.y);
              }
              return label;
            }
          }
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        x: {
          stacked: false,
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0,0,0,0.1)'
          },
          ticks: {
            callback: function(value) {
              return new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
              }).format(value);
            }
          }
        }
      }
    }
  });
};

// Hàm cập nhật bảng doanh thu nhân viên
const updateEmployeeRevenueTable = (data) => {
  const tableBody = document.getElementById('statsTable');
  tableBody.innerHTML = '';
  data.forEach(item => {
    const row = `<tr>
      <td>${item.name}</td>
      <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalRevenue)}</td>
      <td>${item.transactionCount}</td>
    </tr>`;
    tableBody.innerHTML += row;
  });
};



// Thêm sự kiện cho các tab
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // Loại bỏ lớp active khỏi tất cả các tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    
    // Thêm lớp active cho tab được chọn
    tab.classList.add('active');

     // Lấy tab hiện tại
     const activeTab = tab.dataset.tab;
 
     // Cập nhật hiển thị bảng
     updateTableHeader(activeTab);
 

    const { startDate, endDate } = getDefaultDateRange();
    const provinceFilter = document.getElementById('regionFilter').value;

    // Kiểm tra tab nào được chọn
    switch(tab.dataset.tab) {
      case 'rooms':
        fetchDataPhongTro(startDate, endDate, provinceFilter || null);
        break;
      case 'revenue':
        fetchRevenueData(startDate, endDate, provinceFilter || null);
        break;
      case 'employees':
        fetchEmployeeRevenueData(startDate, endDate, provinceFilter || null);
        break;
    }
  });
});

// Sự kiện khi nhấn nút "Áp dụng" với tab hiện tại
document.getElementById('applyFilters').addEventListener('click', () => {
  const startDateInput = document.getElementById('startDate').value;
  const endDateInput = document.getElementById('endDate').value;
  const provinceFilter = document.getElementById('regionFilter').value;

  if (!startDateInput || !endDateInput) {
    alert('Vui lòng chọn khoảng thời gian!');
    return;
  }

  const startDate = new Date(startDateInput);
  const endDate = new Date(endDateInput);

  // Xác định tab đang active
  const activeTab = document.querySelector('.tab.active');
  const hiddenTab = document.querySelector('.tab.hidden');
  
  if (activeTab) {
    switch(activeTab.dataset.tab) {
      case 'rooms':
        fetchDataPhongTro(startDate, endDate, provinceFilter || null);
        break;
      case 'revenue':
        fetchRevenueData(startDate, endDate, provinceFilter || null);
        break;
      case 'employees':
        fetchEmployeeRevenueData(startDate, endDate, provinceFilter || null);
        break;
    }
  }
});

// Hàm cập nhật hiển thị của bảng
const updateTableHeader = (activeTab) => {
  // Ẩn tất cả các tiêu đề bảng
  document.getElementById('roomsHeader').style.display = 'none';
  document.getElementById('revenueHeader').style.display = 'none';
  document.getElementById('employeesHeader').style.display = 'none';

  // Hiển thị tiêu đề tương ứng với tab
  switch (activeTab) {
    case 'rooms':
      document.getElementById('roomsHeader').style.display = 'table-header-group';
      break;
    case 'revenue':
      document.getElementById('revenueHeader').style.display = 'table-header-group';
      break;
    case 'employees':
      document.getElementById('employeesHeader').style.display = 'table-header-group';
      break;
  }
};

// Hiển thị mặc định tab đầu tiên
document.querySelector('.tab[data-tab="rooms"]').click();



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
    console.error("loi dang xuat: ", error);
    
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
  const userRef = ref(rtdb, "NguoiDung/" + userId);

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
