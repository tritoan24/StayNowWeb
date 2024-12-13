// Import các chức năng cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  update,
  set,
  push,
  onChildAdded,
  onChildChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import {
  getAuth,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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
const auth = getAuth(app); // Khởi tạo Authentication


// add hovered class to selected list item
let list = document.querySelectorAll(".navigation li");

function activeLink() {
  list.forEach((item) => {
    item.classList.remove("hovered");
  });
  this.classList.add("hovered");
}

list.forEach((item) => item.addEventListener("mouseover", activeLink));

// Menu Toggle
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};


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

    const userId = chat.otherUserId;
    messageItem.addEventListener("click", () => {
      console.log("id: ", userId);
      
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
const displayedMessageIds = new Set(); // Lưu trữ các ID tin nhắn đã hiển thị

function fetchChatDetails(chatId) {
  const chatRef = ref(database, `Chats/${chatId}/messages`);

  // Lấy toàn bộ danh sách tin nhắn ban đầu
  get(chatRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const messages = snapshot.val();

        // Chuyển đổi thành mảng và render danh sách tin nhắn
        const messageList = Object.keys(messages).map((messageId) => {
          displayedMessageIds.add(messageId); // Đánh dấu tin nhắn đã hiển thị
          return { id: messageId, ...messages[messageId] };
        });

        renderChatMessages(messageList, chatId);
      } else {
        console.log("No messages found for this chat.");
        renderChatMessages([], chatId);
      }
    })
    .catch((error) => {
      console.error("Error fetching chat details:", error);
    });

  // Lắng nghe tin nhắn mới
  onChildAdded(chatRef, (snapshot) => {
    const newMessageId = snapshot.key;

    // Kiểm tra xem tin nhắn đã được hiển thị hay chưa
    if (!displayedMessageIds.has(newMessageId)) {
      const newMessage = { id: newMessageId, ...snapshot.val() };
      displayedMessageIds.add(newMessageId); // Đánh dấu tin nhắn mới
      addNewMessage(newMessage); // Thêm tin nhắn mới vào UI
    }
  });
}


function formatChatId(chatId, userId) {
  // Loại bỏ userId và dấu _
  return chatId.replace(userId, "").replace("_", "");
}
// Hàm lấy thông tin người nhận từ chatId
function fetchReceiverDetails(chatId) {
  const currentUserId = localStorage.getItem("userId"); //id nguoi gui
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
  receiverName.textContent =
    userDetails.ho_ten || "Người nhận chưa cập nhật tên";
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
    status.textContent = `Hoạt động ${formatLastActiveTime(lastActiveTime)}`;
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

function addNewMessage(message) {
  const chatViewElement = document.querySelector(".chat-content");

  // Tạo div cho tin nhắn mới
  const messageItem = document.createElement("div");
  messageItem.classList.add("message-text-item");

  const messageContent = document.createElement("p");
  messageContent.classList.add("message-content");
  messageContent.textContent = message.message;
  const currentUserId = localStorage.getItem("userId"); //id nguoi gui

  // Phân loại tin nhắn gửi hoặc nhận
  if (message.senderId === currentUserId) {
    messageItem.classList.add("message-sender");
  } else {
    messageItem.classList.add("message-receiver");
  }

  messageItem.appendChild(messageContent);
  chatViewElement.appendChild(messageItem);

  // Tự động cuộn xuống cuối
  chatViewElement.scrollTop = chatViewElement.scrollHeight;
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
    const currentUserId = localStorage.getItem("userId"); //id nguoi gui

    // Tạo div cho tin nhắn gửi hoặc nhận
    if (message.senderId === currentUserId) {

      messageItem.classList.add("message-sender"); // Tin nhắn của người gửi sẽ ở bên phải
    } else {
      messageItem.classList.add("message-receiver"); // Tin nhắn của người nhận sẽ ở bên trái
    }

    messageItem.appendChild(messageContent);
    chatViewElement.appendChild(messageItem);
    
  });

  // Tự động cuộn xuống dưới
  chatViewElement.scrollTop = chatViewElement.scrollHeight;

  document.querySelector(".chat-modal").style.display = "flex";
}


// Lắng nghe sự kiện quay lại
document.getElementById("back-button").addEventListener("click", () => {
  const chatModal = document.querySelector(".chat-modal");
  chatModal.style.display = "none"; // Ẩn modal khi quay lại
});


// Hàm cập nhật danh sách chat
function updateChatList(chatId, lastMessage, lastMessageTime, senderId) {
  const chatListRefSender = ref(database, `ChatList/${senderId}/${chatId}`);
  const otherUserId = chatId.replace(senderId, "").replace("_", "");
  const chatListRefReceiver = ref(database, `ChatList/${otherUserId}/${chatId}`);

  // Cập nhật lại tin nhắn mới và thời gian trong danh sách của người gửi
  update(chatListRefSender, { lastMessage, lastMessageTime });

  // Cập nhật danh sách chat của người nhận
  get(chatListRefReceiver).then((snapshot) => {
    const unreadCount = snapshot.exists() ? snapshot.val().unreadCount || 0 : 0;
    update(chatListRefReceiver, {
      lastMessage,
      lastMessageTime,
      unreadCount: unreadCount + 1,
    });
  });

  // Cập nhật lại giao diện danh sách chat mà không tải lại toàn bộ
  const messageListElement = document.querySelector(".message-list");
  const messageItems = messageListElement.querySelectorAll(".message-item");

  // Tìm item trong danh sách chat và cập nhật
  messageItems.forEach((item) => {
    if (item.dataset.chatId === chatId) {
      const messageContent = item.querySelector(".message-content p");
      const messageTime = item.querySelector("span");

      // Cập nhật nội dung tin nhắn mới và thời gian
      messageContent.textContent = lastMessage;
      messageTime.textContent = formatTimestamp(lastMessageTime);
    }
  });
}

document.getElementById("send-button").addEventListener("click", () => {
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value.trim();

  if (message) {
    const chatId = document
      .getElementById("chat-title")
      .getAttribute("data-chat-id"); // Lấy chatId từ tiêu đề
    console.log("idd: ", chatId);

    const senderId = localStorage.getItem("userId"); //id nguoi gui
    // Thêm tin nhắn vào Firebase Realtime Database
    const chatRef = ref(database, `Chats/${chatId}/messages`); // Tham chiếu đến trường messages trong cuộc hội thoại
    const newMessageRef = push(chatRef); // Tạo ID mới tự động cho tin nhắn
    const timestamp = Date.now();
    // Ghi tin nhắn vào Firebase
    set(newMessageRef, {
      message: message,
      senderId: senderId,
      timestamp: timestamp,
    })
      .then(() => {
        // Cập nhật ChatList và làm mới giao diện
        updateChatList(chatId, message, timestamp, senderId, () => {
          fetchUserChatList(senderId); // Làm mới danh sách ChatList
        });
        fetchChatDetails(chatId); // Lấy lại chi tiết đoạn chat
        messageInput.value = ""; // Xóa nội dung ô nhập
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  }
});




function listenForAutoReply(chatId, adminId) {
  const chatRef = ref(database, `Chats/${chatId}/messages`);
  const chatMetaRef = ref(database, `Chats/${chatId}`);

  onChildAdded(chatRef, async (snapshot) => {
    const message = snapshot.val();

    // Kiểm tra nếu tin nhắn này không phải từ admin
    if (message.senderId !== adminId) {
      const chatMeta = await get(chatMetaRef); // Lấy thông tin chat
      const isReplied = chatMeta.exists() && chatMeta.val().isReplied;

      if (!isReplied) {
        sendAutoReply(chatId, adminId);

        // Cập nhật trạng thái đã trả lời
        update(chatMetaRef, { isReplied: true }).catch((error) => {
          console.error("Lỗi khi cập nhật trạng thái isReplied:", error);
        });
      }
    }
  });
}

// Hàm gửi tin nhắn tự động
function sendAutoReply(chatId, adminId) {
  const chatRef = ref(database, `Chats/${chatId}/messages`);
  const newMessageRef = push(chatRef);
  const timestamp = Date.now();
  const messageAuto = "Xin chào! Rất vui được gặp bạn. Bạn cần hỗ trợ gì không?"

  set(newMessageRef, {
    message: messageAuto,
    senderId: adminId,
    timestamp: timestamp,
  })
    .then(() => {
      // Cập nhật ChatList và làm mới giao diện
      updateChatList(chatId, messageAuto, timestamp, adminId, () => {
        fetchUserChatList(adminId); // Làm mới danh sách ChatList
      });
      fetchChatDetails(chatId); // Lấy lại chi tiết đoạn chat
      messageInput.value = ""; // Xóa nội dung ô nhập
      console.log("Admin đã tự động gửi phản hồi.");
    })
    .catch((error) => {
      console.error("Lỗi khi gửi phản hồi tự động từ admin:", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const adminId = localStorage.getItem("userId"); //id nguoi gui
  const chatListRef = ref(database, "Chats");

  


  // Tùy chọn: Lắng nghe cập nhật danh sách chat (nếu cần)
  onChildChanged(chatListRef, (snapshot) => {
    console.log(`Chat ${snapshot.key} đã được cập nhật.`);
  });

  
});


// Gọi hàm với userId cụ thể khi trang tải
document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId"); // Thay ID người dùng ở đây
  fetchUserChatList(userId);
});




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
  const userRef = ref(database, "NguoiDung/" + userId);

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



document.getElementById("logoutButton").addEventListener("click", function () {
  signOut(auth)
    .then(() => {
      localStorage.removeItem("userId");

      alert("Bạn đã đăng xuất thành công.");
      window.location.href = "../public/Login/Login.html";
    })
    .catch((error) => {
      alert("Đã xảy ra lỗi khi đăng xuất: " + error.message);
    });
});