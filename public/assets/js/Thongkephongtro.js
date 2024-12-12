import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
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
let data = [];
let alldata = []; // Danh sách gốc

// Hàm lấy dữ liệu từ Firestore
// Hàm lắng nghe thay đổi dữ liệu Firestore
function fetchData() {
  const dataref = collection(db, "PhongTro");

  // Theo dõi sự thay đổi của dữ liệu
  onSnapshot(dataref, (querySnapshot) => {
    alldata = []; // Reset dữ liệu

    querySnapshot.forEach((doc) => {
      const room = { id: doc.id, ...doc.data() };
      alldata.push(room); // Lưu dữ liệu vào alldata
    });

    console.log("Dữ liệu mới nhất:", alldata);
    
    // Cập nhật dữ liệu hiển thị
    updateUI();
  });
}
  
  // Gọi fetchData để log dữ liệu khi trang được tải


// Gọi fetchData để log dữ liệu khi trang được tải
function generateStatistics(data) {
  const roomsByDate = data.reduce((acc, room) => {
    const date = new Date(room.ThoiGian_taophong).toLocaleDateString('vi-VN');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Số lượng phòng theo tháng tạo
  const roomsByMonth = data.reduce((acc, room) => {
    const month = new Date(room.ThoiGian_taophong).toLocaleString('vi-VN', { month: 'numeric', year: 'numeric' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

   // Sắp xếp 10 phòng có lượt xem cao nhất
   const topViewedRooms = [...data]
   .sort((a, b) => b.luotXem - a.luotXem)
   .slice(0, 10);

  
  return {
   
    roomsByDate,
    roomsByMonth,
    topViewedRooms,

  };

  // Cập nhật nội dung với tổng số phòng
}


let currentChart;

// Tạo biểu đồ cột với kiểu giao diện đẹp hơn
function drawBarChart(labels, data, chartTitle) {
    const ctx = document.getElementById('barChart').getContext('2d');

    if (currentChart) {
        currentChart.destroy();
    }

    // Tạo gradient cho màu nền của cột
    const gradient = ctx.createLinearGradient(0, 0, 0, 400); // Tạo gradient từ trên xuống
    gradient.addColorStop(0, 'rgba(138, 43, 226, 0.8)');   // Màu tím nhạt ở trên
    gradient.addColorStop(0.5, 'rgba(100, 149, 237, 0.8)'); // Màu xanh da trời ở giữa
    gradient.addColorStop(1, 'rgba(173, 216, 230, 0.8)');   // Màu xanh nhạt ở dưới
    //bo tròn phần trên của cột
    Chart.defaults.plugins.tooltip.cornerRadius = 10;
    Chart.defaults.plugins.tooltip.displayColors = false;
    Chart.defaults.plugins.tooltip.titleAlign = 'center';
    Chart.defaults.plugins.tooltip.bodyAlign = 'center';
   // custom cho đẹp hơn 
    Chart.defaults.color = 'rgba(0, 0, 0, 0.8)';   
    Chart.defaults.font.size = 14;
    Chart.defaults.font.family = 'Arial';
    Chart.defaults.font.color = 'black';
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 10;
    Chart.defaults.plugins.legend.labels.padding = 20;
  

   currentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels, // Các nhãn trên trục X (ngày hoặc tháng)
        datasets: [{
          label: chartTitle,
          data: data, // Dữ liệu số lượng phòng trọ
          backgroundColor: gradient, // Màu nền với gradient
          borderWidth: 2,
          barThickness: 15, // Điều chỉnh độ dày của cột
            borderRadius: 5, // Bo tròn góc
        }]
      },
      options: {
        responsive: true, // Đảm bảo biểu đồ tự động điều chỉnh kích thước theo kích thước màn hình
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: 'top', // Vị trí legend
          },
        }
      }
    });
}
window.changeSelect = function() {
    const selectValue = document.getElementById('select').value;

    // Lấy thống kê
    const stats = generateStatistics(alldata);

    if (selectValue === '1') {
        // Vẽ biểu đồ theo ngày
        const labelsByDate = Object.keys(stats.roomsByDate);
        const dataByDate = Object.values(stats.roomsByDate);
        drawBarChart(labelsByDate, dataByDate, 'Số lượng phòng trọ theo ngày');
    } else if (selectValue === '2') {
        // Vẽ biểu đồ theo tháng
        const labelsByMonth = Object.keys(stats.roomsByMonth);
        const dataByMonth = Object.values(stats.roomsByMonth);
        drawBarChart(labelsByMonth, dataByMonth, 'Số lượng phòng trọ theo tháng');
    }
    
};


// Hàm để cập nhật giao diện
function updateUI() {
    const stats = generateStatistics(alldata);
  
    // Cập nhật tổng số phòng
    document.getElementById('totalRooms').textContent = alldata.length;
  
    // Cập nhật biểu đồ
    changeSelect();
  
    // Cập nhật top 10 phòng có lượt xem cao nhất
    displayTopViewedRooms(stats.topViewedRooms);
  }
  
  
function displayTopViewedRooms(rooms) {
    const tbody = document.getElementById('topView');
    tbody.innerHTML = ''; // Xóa nội dung cũ

    
  
    rooms.forEach((room, index) => {
        // Định dạng giá phòng thành VND
    const formattedPrice = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(room.Gia_phong);
      const row = `
       <div class="room-card">
      <div class="room-image">
          <img src="${room.imageUrls[0]}" alt="${room.Ten_phongtro}" />
      </div>
      <div class="room-info">
          <h4 class="room-countview">${room.So_luotxemphong}</h4>
          <h3 class="room-title">${room.Ten_phongtro}</h3>


                    <div class="room-price">
                     <p>${formattedPrice}</p>
                    </div>
          <div class="room-details">
              <span class="details-link" onclick="viewDetails('${room.id}')">Xem chi tiết</span>
          </div>
      </div>
    </div>
      `;
      tbody.innerHTML += row;
    });
  }
fetchData()
  