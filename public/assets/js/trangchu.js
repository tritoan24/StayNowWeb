// Định nghĩa hàm navigateTo
function navigateTo(url) {
    window.location.href = url; // Chuyển hướng trình duyệt đến URL được truyền vào
}


document.getElementById('main').addEventListener('click', function (event) {
    if (event.target && event.target.id === 'btnPhongTro') {
        navigateTo('QuanLyPhongTro.html');
    }
    if (event.target && event.target.id === 'btnthongtin') {
        navigateTo('QuanLyThongTin.html');
    }
    if (event.target && event.target.id === 'btndichvu') {
        navigateTo('QuanLyDichVu.html');
    }
    if (event.target && event.target.id === 'btntiennghi') {
        navigateTo('QuanLyTienNghi.html');
    }
    if (event.target && event.target.id === 'btnnoihthat') {
        navigateTo('QuanLyNoiThat.html');
    }
});
