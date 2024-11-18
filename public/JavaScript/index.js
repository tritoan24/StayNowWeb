// Hàm để thiết lập trạng thái của các nút
window.setActive = function(div) {
    const buttons = document.querySelectorAll('.btn_chucnang');
    buttons.forEach(btn => btn.classList.remove('active'));

    div.classList.add('active');

    // Lấy giá trị title từ data-title của nút được click
    const title = div.getAttribute('data-title');

    switch (title) {
        case 'Trang Chủ':
            loadContent('trangchu.html');
            break;
        case 'Tìm Kiếm':
            loadContent('timkiem.html');
            break;
        case 'Danh Sách Người dùng':
            loadContent('danhsachnguoidung.html');
            break;
        default:
            break;
    }
}

// Hàm để tải nội dung từ các tệp HTML
function loadContent(fileName) {
    const contentElement = document.getElementById('content');
    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            contentElement.innerHTML = html; // Thay thế nội dung trong phần content
        })
        .catch(error => {
            console.error('Error fetching content:', error);
            contentElement.innerHTML = '<p>Không thể tải nội dung.</p>';
        });
}
