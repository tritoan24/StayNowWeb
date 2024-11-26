// Định nghĩa hàm navigateTo
function navigateTo(url) {
    window.location.href = url; // Chuyển hướng trình duyệt đến URL được truyền vào
}


document.getElementById('content').addEventListener('click', function (event) {
    if (event.target && event.target.id === 'btnPhongTro') {
        navigateTo('./Html/QuanLyPhongTro.html');
    }
    if (event.target && event.target.id === 'btnNguoiDung') {
        navigateTo('quanlynguoidung.html');
    }
    if (event.target && event.target.id === 'btnDonToCao') {
        navigateTo('quanlydontocao.html');
    }
    if (event.target && event.target.id === 'btnTienIch') {
        navigateTo('quanlytienich.html');
    }
});
