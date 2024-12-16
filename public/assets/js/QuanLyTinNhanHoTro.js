
// Import các chức năng cần thiết từ Firebase SDK
import { database } from "./FireBaseConfig.js"; // Import database và auth đã khởi tạo
import {
  ref,
  get,
  update,
  set,
  push,
  onChildAdded,
  onValue,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";


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


// Hàm lắng nghe danh sách chat
function listenToChatList(senderId) {
  const chatListRef = ref(database, `ChatList/${senderId}`);

  // Lắng nghe sự thay đổi trong danh sách chat
  onValue(chatListRef, (snapshot) => {
    if (snapshot.exists()) {
      const chatListData = snapshot.val();
      renderChatList(chatListData); // Cập nhật giao diện
    }
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
  return new Promise((resolve, reject) => {
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
          resolve(); // Đảm bảo trả về promise khi thành công
        } else {
          console.log("No messages found for this chat.");
          renderChatMessages([], chatId);
          resolve(); // Trả về promise khi không có tin nhắn
        }
      })
      .catch((error) => {
        console.error("Error fetching chat details:", error);
        reject(error); // Trả về lỗi khi có lỗi
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
  console.log("chatId: ", chatId);

  // Tự động cuộn xuống dưới
  chatViewElement.scrollTop = chatViewElement.scrollHeight;

  document.querySelector(".chat-modal").style.display = "flex";

  if (messageList.length == 0) {
    chatViewElement.textContent = "Không có tin nhắn";
    return;
  }

  if (chatId) {
    fetchReceiverDetails(chatId);
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
  const chatListRefReceiver = ref(
    database,
    `ChatList/${otherUserId}/${chatId}`
  );

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
          listenToChatList(senderId); // Làm mới danh sách ChatList
        });
        fetchChatDetails(chatId); // Lấy lại chi tiết đoạn chat
        messageInput.value = ""; // Xóa nội dung ô nhập
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  }
});

// Gọi hàm với userId cụ thể khi trang tải
document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId"); // Thay ID người dùng ở đây
listenToChatList(userId);
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


document.addEventListener("DOMContentLoaded", () => {
  const userChatId = localStorage.getItem("chatUserId"); // id người nhận
  const currentUserId = localStorage.getItem("userId"); // id người gửi

  if (userChatId && currentUserId) {
    // Tạo chatId và chatId2
    const chatId = `${currentUserId}_${userChatId}`;
    const chatId2 = `${userChatId}_${currentUserId}`;

    const chatListRef = ref(database, `ChatList/${currentUserId}/${chatId}`);
    const chatsRef = ref(database, `Chats/${chatId}`);
    const chatListIds = ref(database, `ChatList/${currentUserId}`);
    const timestamp = Date.now();
   
    let checkId = false
    get(chatListIds)
      .then((snapshot) => {
        
        if (snapshot.exists()) {
          const chats = snapshot.val();  // Dữ liệu của tất cả các chat
          const chatIds = Object.keys(chats);  // Lấy ra danh sách chatId từ các khóa của đối tượng chats      

          for (const id of chatIds) {
            if (id === chatId || id === chatId2) {
              localStorage.removeItem("chatUserId");
              console.log("Lấy thành công đoạn chat với id: ", id);
              const chatTitleElement = document.getElementById("chat-title");
              chatTitleElement.setAttribute("data-chat-id", id);
              fetchChatDetails(id);
              checkId = true;
              break; // Thoát sớm khỏi vòng lặp
            }
          }

          if (checkId == false) {
            console.log("Không có chat nào trong bảng Chats.");


          }
        }
        if (checkId == false) {
          console.log("tao thanh cong doan chat moi");

          set(chatListRef, {
            chatId: chatId,
            otherUserId: userChatId,
            unreadCount: 0,
          });

          set(chatsRef, {
            messages: [],
          });

          const chatRef = ref(database, `Chats/${chatId}/messages`); // Tham chiếu đến trường messages trong cuộc hội thoại
          const newMessageRef = push(chatRef); // Tạo ID mới tự động cho tin nhắn
          const messageInput = document.getElementById("message-input");
          const message = messageInput.value.trim();

          // Ghi tin nhắn vào Firebase
          set(newMessageRef, {
            message: "Admin xin chào!",
            senderId: currentUserId,
            timestamp: timestamp,
          })
            .then(() => {
              // Cập nhật ChatList và làm mới giao diện
              updateChatList(chatId, message, timestamp, currentUserId, () => {
                listenToChatList(currentUserId); // Làm mới danh sách ChatList
              });


              // Gọi fetchChatDetails với chatId, nếu lỗi thì thử với chatId2
              fetchChatDetails(chatId)
                .then(() => {
                  const chatTitleElement = document.getElementById("chat-title");
                  chatTitleElement.setAttribute("data-chat-id", chatId);
                  console.log("Lấy đoạn chat thành công với chatId!");
                  localStorage.removeItem("chatUserId");
                })
                .catch((error) => {
                  console.error("Không lấy được đoạn chat với chatId:", error);

                  // Thử lại với chatId2
                  fetchChatDetails(chatId2)
                    .then(() => {
                      const chatTitleElement = document.getElementById("chat-title");
                      chatTitleElement.setAttribute("data-chat-id", chatId2);
                      console.log("Lấy đoạn chat thành công với chatId2!");
                      localStorage.removeItem("chatUserId");
                    })
                    .catch((err) => {
                      console.error("Không lấy được đoạn chat với chatId2:", err);
                    });
                });

              messageInput.value = ""; // Xóa nội dung ô nhập
            })
            .catch((error) => {
              console.error("Error sending message:", error);
            });


        }
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách chatId:", error);
      });

  }
});

