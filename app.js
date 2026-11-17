
// ===================================
// PINGME - PRIVATE CHAT APPLICATION
// ===================================

// Demo contacts for testing the interface.
// Real users will come from the backend later.
let users = [
  { name: "Rahul", username: "rahul" },
  { name: "Priya", username: "priya" },
  { name: "Amit", username: "amit" },
  { name: "Sneha", username: "sneha" }
];

let currentUser = null;
let selectedUser = null;
let messages = {};

// HTML elements
const authOverlay = document.getElementById("authOverlay");
const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authButton = document.getElementById("authButton");
const switchAuth = document.getElementById("switchAuth");

const nameInput = document.getElementById("nameInput");
const usernameInput = document.getElementById("usernameInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

const myName = document.getElementById("myName");
const userList = document.getElementById("userList");
const searchUser = document.getElementById("searchUser");

const welcome = document.getElementById("welcome");
const chatScreen = document.getElementById("chatScreen");

const chatName = document.getElementById("chatName");
const chatAvatar = document.getElementById("chatAvatar");
const chatStatus = document.getElementById("chatStatus");

const messagesBox = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

const logoutBtn = document.getElementById("logoutBtn");

let isLogin = false;

// ===================================
// LOGIN / REGISTER SWITCH
// ===================================

function updateAuthScreen() {
  authTitle.textContent = isLogin ? "Welcome Back" : "Create Account";
  authButton.textContent = isLogin ? "Login" : "Create Account";

  nameInput.classList.toggle("hidden", isLogin);
  emailInput.classList.toggle("hidden", isLogin);

  nameInput.required = !isLogin;
  emailInput.required = !isLogin;

  switchAuth.innerHTML = isLogin
    ? 'New to PingMe? <span>Create Account</span>'
    : 'Already have an account? <span>Login</span>';
}

switchAuth.addEventListener("click", () => {
  isLogin = !isLogin;
  authForm.reset();
  updateAuthScreen();
});

// ===================================
// REGISTER / LOGIN
// ===================================

authForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    alert("Username must be 3–20 characters and use only letters, numbers or underscores.");
    return;
  }

  if (password.length < 6) {
    alert("Password must contain at least 6 characters.");
    return;
  }

  if (!isLogin) {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();

    if (!name || !email) {
      alert("Please enter your name and email.");
      return;
    }

    if (users.some(user => user.username === username)) {
      alert("This username is already taken.");
      return;
    }

    const newUser = {
      name,
      username,
      email
    };

    users.push(newUser);
    currentUser = newUser;

  } else {
    const foundUser = users.find(
      user => user.username === username
    );

    if (!foundUser) {
      alert("Username not found. Create an account first.");
      return;
    }

    // Demo only: this does not verify a real password.
    currentUser = foundUser;
  }

  openApplication();
});

// ===================================
// OPEN APPLICATION
// ===================================

function openApplication() {
  authOverlay.classList.add("hidden");

  myName.textContent = currentUser.name;

  renderUsers();
  welcome.classList.remove("hidden");
  chatScreen.classList.add("hidden");

  selectedUser = null;
}

// ===================================
// DISPLAY USERS
// ===================================

function renderUsers(filter = "") {
  userList.innerHTML = "";

  const filteredUsers = users.filter(user => {
    return (
      user.username !== currentUser.username &&
      (
        user.username.includes(filter.toLowerCase()) ||
        user.name.toLowerCase().includes(filter.toLowerCase())
      )
    );
  });

  if (filteredUsers.length === 0) {
    userList.innerHTML = '<p class="empty">No users found</p>';
    return;
  }

  filteredUsers.forEach(user => {
    const item = document.createElement("div");

    item.className = "user-item";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = user.name.charAt(0).toUpperCase();

    const details = document.createElement("div");

    const heading = document.createElement("h4");
    heading.textContent = user.name;

    const username = document.createElement("p");
    username.textContent = "@" + user.username;

    details.append(heading, username);
    item.append(avatar, details);

    item.addEventListener("click", () => {
      openChat(user);
    });

    userList.appendChild(item);
  });
}

// ===================================
// SEARCH USERNAME
// ===================================

searchUser.addEventListener("input", () => {
  renderUsers(searchUser.value.trim());
});

// ===================================
// OPEN PRIVATE CHAT
// ===================================

function openChat(user) {
  selectedUser = user;

  welcome.classList.add("hidden");
  chatScreen.classList.remove("hidden");

  chatName.textContent = user.name;
  chatAvatar.textContent = user.name.charAt(0).toUpperCase();

  // Demo status only
  chatStatus.textContent = "Demo contact";

  const conversationId = getConversationId(
    currentUser.username,
    user.username
  );

  if (!messages[conversationId]) {
    messages[conversationId] = [];
  }

  renderMessages();
  messageInput.focus();

  document.querySelectorAll(".user-item").forEach(item => {
    item.classList.remove("active");
  });

  const selectedItem = [...userList.children].find(item =>
    item.textContent.includes("@" + user.username)
  );

  if (selectedItem) {
    selectedItem.classList.add("active");
  }
}

// ===================================
// UNIQUE CONVERSATION ID
// ===================================

function getConversationId(user1, user2) {
  return [user1, user2].sort().join("_");
}

// ===================================
// SEND MESSAGE
// ===================================

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();

  if (!text || !selectedUser || !currentUser) {
    return;
  }

  const conversationId = getConversationId(
    currentUser.username,
    selectedUser.username
  );

  const newMessage = {
    sender: currentUser.username,
    text,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  };

  messages[conversationId].push(newMessage);

  messageInput.value = "";
  renderMessages();
});

// ===================================
// DISPLAY MESSAGES
// ===================================

function renderMessages() {
  if (!selectedUser || !currentUser) return;

  const conversationId = getConversationId(
    currentUser.username,
    selectedUser.username
  );

  messagesBox.innerHTML = "";

  const conversation = messages[conversationId] || [];

  if (conversation.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Start your conversation 👋";
    messagesBox.appendChild(empty);
    return;
  }

  conversation.forEach(message => {
    const bubble = document.createElement("div");

    bubble.className = message.sender === currentUser.username
      ? "message sent"
      : "message received";

    const text = document.createElement("div");
    text.textContent = message.text;

    const time = document.createElement("small");
    time.textContent = message.time;

    bubble.append(text, time);
    messagesBox.appendChild(bubble);
  });

  messagesBox.scrollTop = messagesBox.scrollHeight;
}

// ===================================
// LOGOUT
// ===================================

logoutBtn.addEventListener("click", () => {
  currentUser = null;
  selectedUser = null;

  authForm.reset();
  searchUser.value = "";

  isLogin = true;
  updateAuthScreen();

  authOverlay.classList.remove("hidden");
  chatScreen.classList.add("hidden");
  welcome.classList.remove("hidden");
});

// Initial screen
updateAuthScreen();
