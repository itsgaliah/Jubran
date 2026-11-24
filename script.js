
const lockScreen = document.querySelector(".lock-screen");
const homeScreen = document.getElementById("home-screen");
const appScreen = document.getElementById("app-screen");

const genericApp = document.getElementById("generic-app");
const messagesApp = document.getElementById("messages-app");
const phoneApp = document.getElementById("phone-app");
const otherApp = document.getElementById("other-app");

const appTitle = document.getElementById("app-title");
const appContent = document.getElementById("app-content");

const conversationList = document.getElementById("conversation-list");
const chatView = document.getElementById("chat-view");
const chatName = document.getElementById("chat-name");
const chatMessages = document.getElementById("chat-messages");

// Contacts
let contacts = JSON.parse(
  localStorage.getItem("myPhoneContacts") || "[]"
);

let activeContact = null;

function saveContacts() {
  localStorage.setItem(
    "myPhoneContacts",
    JSON.stringify(contacts)
  );
}

// Calls
let calls = JSON.parse(
  localStorage.getItem("myPhoneCalls") || "[]"
);

function saveCalls() {
  localStorage.setItem(
    "myPhoneCalls",
    JSON.stringify(calls)
  );
}

// App messages
const appMessages = {
  Phone: "Recent calls will appear here.",
  Photos: "Your photo gallery will appear here.",
  Camera: "Camera screen.",
  TikTok: "Your TikTok feed will appear here.",
  Instagram: "Your Instagram feed will appear here.",
  Notes: "Your notes will appear here.",
  Settings: "Your phone settings.",
  Music: "Your music will appear here."
};

// Unlock phone
function unlockPhone() {
  lockScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
}

// Open apps
document.querySelectorAll(".app").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.app;

    homeScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");

    if (name === "Messages") {
      genericApp.classList.add("hidden");
      messagesApp.classList.remove("hidden");
      chatView.classList.add("hidden");
      conversationList.classList.remove("hidden");
      renderContacts();

    } else if (name === "Phone") {
      messagesApp.classList.add("hidden");
      genericApp.classList.remove("hidden");
      phoneApp.classList.remove("hidden");
      otherApp.classList.add("hidden");
      renderCalls();

    } else {
      messagesApp.classList.add("hidden");
      genericApp.classList.remove("hidden");
      phoneApp.classList.add("hidden");
      otherApp.classList.remove("hidden");

      appTitle.textContent = name;
      appContent.textContent = appMessages[name] || "";
    }
  });
});

// Render contacts
function renderContacts() {
  conversationList.replaceChildren();

  if (contacts.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No conversations yet. Add someone!";
    conversationList.appendChild(empty);
  }

  contacts.forEach(contact => {
    const button = document.createElement("button");
    button.className = "conversation";

    const avatar = document.createElement("span");
    avatar.className = "avatar";

    if (contact.photo) {
      const img = document.createElement("img");
      img.src = contact.photo;
      img.alt = "";
      avatar.appendChild(img);
    } else {
      avatar.textContent = contact.name.charAt(0).toUpperCase();
    }

    const info = document.createElement("span");
    info.className = "conversation-info";

    const name = document.createElement("strong");
    name.textContent = contact.name;

    const lastMessage = document.createElement("small");
    lastMessage.textContent =
      contact.messages.length
        ? contact.messages[contact.messages.length - 1].text
        : "No messages yet";

    info.append(name, lastMessage);
    button.append(avatar, info);

    button.addEventListener("click", () => openChat(contact));

    conversationList.appendChild(button);
  });
}

// Add contact
document.getElementById("add-contact-form")
  .addEventListener("submit", event => {
    event.preventDefault();

    const nameInput = document.getElementById("contact-name");
    const photoInput = document.getElementById("contact-photo");

    const name = nameInput.value.trim();
    const file = photoInput.files[0];

    if (!name) return;

    function addContact(photo) {
      contacts.push({
        name: name,
        photo: photo,
        messages: []
      });

      saveContacts();
      renderContacts();

      nameInput.value = "";
      photoInput.value = "";
    }

    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please choose an image.");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert("Choose a photo smaller than 2 MB.");
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        addContact(reader.result);
      };

      reader.readAsDataURL(file);

    } else {
      addContact("");
    }
  });

// Open chat
function openChat(contact) {
  activeContact = contact;
  chatName.textContent = contact.name;

  conversationList.classList.add("hidden");
  chatView.classList.remove("hidden");

  renderMessages();
}

// Render messages
function renderMessages() {
  chatMessages.replaceChildren();

  if (!activeContact) return;

  activeContact.messages.forEach(message => {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble " + message.type;
    bubble.textContent = message.text;
    chatMessages.appendChild(bubble);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message
document.getElementById("send-message-form")
  .addEventListener("submit", event => {
    event.preventDefault();

    const input = document.getElementById("message-input");
    const text = input.value.trim();

    if (!text || !activeContact) return;

    activeContact.messages.push({
      text: text,
      type: "sent"
    });

    saveContacts();

    input.value = "";
    renderMessages();
    renderContacts();
  });

// Receive message
document.getElementById("receive-button")
  .addEventListener("click", () => {
    const input = document.getElementById("receive-input");
    const text = input.value.trim();

    if (!text || !activeContact) return;

    activeContact.messages.push({
      text: text,
      type: "received"
    });

    saveContacts();
    input.value = "";

    renderMessages();
    renderContacts();
  });

// Back to conversations
document.getElementById("back-messages")
  .addEventListener("click", () => {
    chatView.classList.add("hidden");
    conversationList.classList.remove("hidden");

    activeContact = null;
    renderContacts();
  });

// Back home
document.getElementById("back-home")
  .addEventListener("click", () => {
    appScreen.classList.add("hidden");
    messagesApp.classList.add("hidden");
    genericApp.classList.remove("hidden");
    phoneApp.classList.add("hidden");
    otherApp.classList.remove("hidden");
    homeScreen.classList.remove("hidden");

    activeContact = null;
  });

// Render calls
function renderCalls() {
  const callList = document.getElementById("call-list");
  callList.replaceChildren();

  if (calls.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No recent calls";
    callList.appendChild(empty);
    return;
  }

  calls.forEach(call => {
    const item = document.createElement("div");
    item.className = "call-item";

    const contact = contacts.find(
      person => person.name.toLowerCase() === call.name.toLowerCase()
    );

    const avatar = document.createElement("span");
    avatar.className = "avatar";

    if (contact && contact.photo) {
      const img = document.createElement("img");
      img.src = contact.photo;
      avatar.appendChild(img);
    } else {
      avatar.textContent = call.name.charAt(0).toUpperCase();
    }

    const info = document.createElement("div");

    const name = document.createElement("strong");
    name.textContent = call.name;

    const details = document.createElement("small");
    details.textContent = call.time;

    const direction = document.createElement("span");
    direction.className = "call-direction " +
      (call.type === "Incoming call" ? "incoming" : "outgoing");

    direction.textContent =
      call.type === "Incoming call" ? "↙ Incoming" : "↗ Outgoing";

    info.append(name, details, direction);
    item.append(avatar, info);

    callList.appendChild(item);
  });
}

// Add call
document.getElementById("add-call")
  .addEventListener("click", () => {
    const name = prompt("Enter the person's name:");

    if (!name || !name.trim()) return;

    const incoming = confirm(
      "Incoming call? Press OK for Incoming or Cancel for Outgoing."
    );

    calls.unshift({
      name: name.trim(),
      type: incoming ? "Incoming call" : "Outgoing call",
      time: new Date().toLocaleString()
    });

    saveCalls();
    renderCalls();
  });
