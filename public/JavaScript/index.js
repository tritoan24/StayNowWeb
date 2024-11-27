// Hàm để thiết lập trạng thái của các nút
window.setActive = function (div) {
  const buttons = document.querySelectorAll(".btn_chucnang");
  buttons.forEach((btn) => btn.classList.remove("active"));

  div.classList.add("active");

  // Lấy giá trị title từ data-title của nút được click
  const title = div.getAttribute("data-title");

  switch (title) {
    case "Trang Chủ":
      loadContent("./Html/trangchu.html", title);
      break;
    case "Tìm Kiếm":
      loadContent("timkiem.html", title);
      break;
    case "Danh Sách Người dùng":
      loadContent("./Html/danhsachnguoidung.html", title);
      break;
    default:
      break;
  }
};


function loadContent(fileName, title) {
    const contentElement = document.getElementById("content");
    let historyStack = [];
    // Lưu trạng thái hiện tại vào stack trước khi tải nội dung mới
    historyStack.push(contentElement.innerHTML);
  
    fetch(fileName)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((html) => {
        contentElement.innerHTML = html;
        localStorage.setItem("currentContent", fileName);
        localStorage.setItem("currentTitle", title);
  
        if (fileName.includes("danhsachnguoidung.html")) {
          fetchUsers();
        }
      })
      .catch((error) => {
        console.error("Error fetching content:", error);
        contentElement.innerHTML = "<p>Không thể tải nội dung.</p>";
      });
  }


// Khôi phục nội dung khi tải lại trang
document.addEventListener("DOMContentLoaded", () => {
  const currentContent =
    localStorage.getItem("currentContent") || "trangchu.html"; // Mặc định là Home
  const currentTitle = localStorage.getItem("currentTitle") || "Trang Chủ";

  loadContent(currentContent, currentTitle); // Tải nội dung đã lưu

  const activeButton = document.querySelector(`[data-title="${currentTitle}"]`);
  if (activeButton) {
    activeButton.classList.add("active");
  }
});
