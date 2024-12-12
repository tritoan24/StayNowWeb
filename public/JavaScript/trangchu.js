// Định nghĩa hàm navigateTo
function navigateTo(url) {
    window.location.href = url; // Chuyển hướng trình duyệt đến URL được truyền vào
}


document.getElementById('content').addEventListener('click', function (event) {
    if (event.target && event.target.id === 'btnPhongTro') {
        navigateTo('./Html/QuanLyPhongTro.html');
    }
    if (event.target && event.target.id === 'btnThongTin') {
        navigateTo('./Html/QuanLyThongTin.html');
    }
    if (event.target && event.target.id === 'btnDichVu') {
        navigateTo('./Html/QuanLyDichVu.html');
    }
    if (event.target && event.target.id === 'btnNoiThat') {
        navigateTo('./Html/QuanLyNoiThat.html');
    }
});
