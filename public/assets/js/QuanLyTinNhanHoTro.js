// Import các chức năng cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  update,
  set,
  push,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Cấu hình Firebase
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

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function fetchUserDetails(userId) {
  const userRef = ref(database, `NguoiDung/${userId}`);

  return get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val(); // Trả về thông tin người dùng
      } else {
        console.log(`No user data found for ID: ${userId}`);
        return null; // Trả về null nếu không tìm thấy
      }
    })
    .catch((error) => {
      console.error("Error fetching user details:", error);
      return null; // Trả về null nếu có lỗi
    });
}

// Hàm lấy danh sách chat của người dùng cụ thể
function fetchUserChatList(userId) {
  const userChatListRef = ref(database, `ChatList/${userId}`);

  get(userChatListRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const userChatData = snapshot.val();
        renderChatList(userChatData); // Gọi hàm render danh sách chat
      } else {
        console.log("No chat data found for this user.");
      }
    })
    .catch((error) => {
      console.error("Error fetching user chat data:", error);
    });
}

// Hàm hiển thị danh sách chat
async function renderChatList(userChatData) {
  const chatListElement = document.querySelector(".message-list");
  chatListElement.innerHTML = ""; // Xóa danh sách cũ

  for (const chatId in userChatData) {
    const chat = userChatData[chatId];
    const otherUserId = chat.otherUserId;

    // Lấy thông tin người dùng khác
    const userDetails = await fetchUserDetails(otherUserId);

    const messageItem = document.createElement("div");
    messageItem.classList.add("message-item");
    messageItem.dataset.chatId = chatId;

    // Avatar (nếu có thông tin người dùng, hiển thị avatar từ đó; nếu không, dùng placeholder)
    const avatar = document.createElement("img");
    avatar.src = userDetails?.anh_daidien || `https://via.placeholder.com/50`;
    avatar.alt = `Avatar của ${userDetails?.ho_ten}`;
    avatar.classList.add("avatar");

    // Nội dung chat
    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");

    const userName = document.createElement("h2");
    userName.classList.add("user-name");
    userName.textContent = userDetails?.ho_ten || `Người dùng ${otherUserId}`; // Nếu có tên thì hiển thị tên, nếu không thì hiển thị ID.

    const lastMessage = document.createElement("p");
    lastMessage.classList.add("last-message");
    lastMessage.textContent = chat.lastMessage;

    const messageTime = document.createElement("span");
    messageTime.classList.add("message-time");
    messageTime.textContent = formatTimestamp(chat.lastMessageTime);

    messageContent.appendChild(userName);
    messageContent.appendChild(lastMessage);

    messageItem.appendChild(avatar);
    messageItem.appendChild(messageContent);
    messageItem.appendChild(messageTime);
    messageItem.addEventListener("click", () => {
      const chatTitleElement = document.getElementById("chat-title");
      chatTitleElement.setAttribute("data-chat-id", chatId);
      fetchChatDetails(chatId); // Gọi hàm lấy chi tiết đoạn chat
    });
    chatListElement.appendChild(messageItem);
  }
}
// Hàm định dạng thời gian
function formatTimestamp(timestamp) {
  const messageDate = new Date(timestamp);
  const now = new Date();

  const diffMs = now - messageDate;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return diffDays === 1 ? "Hôm qua" : `${diffDays} ngày trước`;
  } else if (diffHours > 0) {
    return `${diffHours} giờ trước`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} phút trước`;
  } else {
    return "Vừa xong";
  }
}
function fetchChatDetails(chatId) {
  const chatRef = ref(database, `Chats/${chatId}/messages`);

  get(chatRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const messages = snapshot.val();

        // Chuyển đổi các tin nhắn thành mảng
        const messageList = Object.keys(messages).map((messageId) => {
          return { id: messageId, ...messages[messageId] };
        });

        // Gọi hàm render để hiển thị chi tiết tin nhắn trong modal
        renderChatMessages(messageList, chatId);
      } else {
        console.log("No messages found for this chat.");
        renderChatMessages([], chatId); // Hiển thị đoạn chat rỗng
      }
    })
    .catch((error) => {
      console.error("Error fetching chat details:", error);
    });
}
function formatChatId(chatId, userId) {
  // Loại bỏ userId và dấu _
  return chatId.replace(userId, "").replace("_", "");
}
// Hàm lấy thông tin người nhận từ chatId
function fetchReceiverDetails(chatId) {
  const currentUserId = "BCvWcFi8M9PAeMnKLv2SefBzRe23"; // Thay bằng ID người dùng thực tế
  const formattedChatId = formatChatId(chatId, currentUserId);

  // Gọi hàm fetchUserDetails để lấy thông tin người nhận
  fetchUserDetails(formattedChatId)
    .then((userDetails) => {
      if (userDetails) {
        console.log("Thông tin người nhận:", userDetails);
        // Cập nhật tiêu đề với tên người nhận
        updateChatTitle(userDetails);
      } else {
        console.log("Không tìm thấy thông tin người nhận.");
      }
    })
    .catch((error) => {
      console.error("Lỗi khi lấy thông tin người nhận:", error);
    });
}
function updateChatTitle(userDetails) {
    const chatTitleElement = document.querySelector("#chat-title");
    chatTitleElement.innerHTML = ""; // Xóa nội dung cũ
  
    // Avatar
    const avatar = document.createElement("img");
    avatar.src = userDetails.anh_daidien || "https://via.placeholder.com/50"; // Đường dẫn ảnh mặc định
    avatar.alt = `Avatar của ${userDetails.ho_ten}`;
    avatar.classList.add("chat-avatar");
  
    // Container thông tin
    const infoContainer = document.createElement("div");
    infoContainer.classList.add("chat-info");
  
    // Tên người nhận
    const receiverName = document.createElement("span");
    receiverName.textContent = userDetails.ho_ten || "Người nhận chưa cập nhật tên";
    receiverName.classList.add("receiver-name");
  
    // Trạng thái
    const status = document.createElement("span");
    const now = Date.now();
    const lastActiveTime = userDetails.lastActiveTime || 0;
    const isOnline = now - lastActiveTime < 60000; // Nếu hoạt động trong 1 phút, coi là online
  
    if (isOnline) {
      status.textContent = "Đang hoạt động";
      status.classList.add("status-online");
    } else {
      status.textContent = `Ngoại tuyến ${formatLastActiveTime(lastActiveTime)}`;
      status.classList.add("status-offline");
    }
  
    // Gắn tên và trạng thái vào container thông tin
    infoContainer.appendChild(receiverName);
    infoContainer.appendChild(status);
  
    // Gắn avatar và container thông tin vào tiêu đề
    chatTitleElement.appendChild(avatar);
    chatTitleElement.appendChild(infoContainer);
  }
  
  // Hàm định dạng thời gian hoạt động cuối cùng
  function formatLastActiveTime(lastActiveTime) {
    const elapsedMinutes = Math.floor((Date.now() - lastActiveTime) / 60000);
    if (elapsedMinutes < 60) {
      return `${elapsedMinutes} phút trước`;
    }
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) {
      return `${elapsedHours} giờ trước`;
    }
    const elapsedDays = Math.floor(elapsedHours / 24);
    return `${elapsedDays} ngày trước`;
  }
  
  

function renderChatMessages(messageList, chatId) {
  const chatViewElement = document.querySelector(".chat-content");
  chatViewElement.innerHTML = ""; // Xóa nội dung cũ

  fetchReceiverDetails(chatId);

  if (messageList.length === 0) {
    chatViewElement.textContent = "Không có tin nhắn.";
    return;
  }

  messageList.forEach((message) => {
    const messageItem = document.createElement("div");
    messageItem.classList.add("message-text-item");

    // Nội dung tin nhắn
    const messageContent = document.createElement("p");
    messageContent.classList.add("message-content");
    messageContent.textContent = message.message;

    // Tạo div cho tin nhắn gửi hoặc nhận
    if (message.senderId === "BCvWcFi8M9PAeMnKLv2SefBzRe23") {
      // Giả sử ID của người gửi là "BCvWcFi8M9PAeMnKLv2SefBzRe23"
      messageItem.classList.add("message-sender"); // Tin nhắn của người gửi sẽ ở bên phải
    } else {
      messageItem.classList.add("message-receiver"); // Tin nhắn của người nhận sẽ ở bên trái
    }

    messageItem.appendChild(messageContent);
    chatViewElement.appendChild(messageItem);
  });

  // Hiển thị modal
  document.querySelector(".chat-modal").style.display = "flex";
}

// Lắng nghe sự kiện quay lại
document.getElementById("back-button").addEventListener("click", () => {
  const chatModal = document.querySelector(".chat-modal");
  chatModal.style.display = "none"; // Ẩn modal khi quay lại
});

document.getElementById("send-button").addEventListener("click", () => {
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value.trim();

  if (message) {
    const chatId = document
      .getElementById("chat-title")
      .getAttribute("data-chat-id"); // Lấy chatId từ tiêu đề
    console.log("idd: ", chatId);

    const senderId = "BCvWcFi8M9PAeMnKLv2SefBzRe23"; // ID người gửi (có thể lấy từ session hoặc user hiện tại)

    // Thêm tin nhắn vào Firebase Realtime Database
    const chatRef = ref(database, `Chats/${chatId}/messages`); // Tham chiếu đến trường messages trong cuộc hội thoại
    const newMessageRef = push(chatRef); // Tạo ID mới tự động cho tin nhắn

    // Ghi tin nhắn vào Firebase
    set(newMessageRef, {
      message: message,
      senderId: senderId,
      timestamp: Date.now(),
    })
      .then(() => {
        fetchChatDetails(chatId); // Lấy lại chi tiết cuộc hội thoại sau khi gửi tin nhắn
        messageInput.value = ""; // Xóa nội dung ô nhập
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  }
});

// Gọi hàm với userId cụ thể khi trang tải
document.addEventListener("DOMContentLoaded", () => {
  const userId = "BCvWcFi8M9PAeMnKLv2SefBzRe23"; // Thay ID người dùng ở đây
  fetchUserChatList(userId);
});
