

const lockScreen = document.querySelector(".lock-screen");
const homeScreen = document.getElementById("home-screen");
const appScreen = document.getElementById("app-screen");

const genericApp = document.getElementById("generic-app");
const messagesApp = document.getElementById("messages-app");

const appTitle = document.getElementById("app-title");
const appContent = document.getElementById("app-content");

const conversationList = document.getElementById("conversation-list");
const chatView = document.getElementById("chat-view");
const chatName = document.getElementById("chat-name");
const chatMessages = document.getElementById("chat-messages");

let contacts = [];
let activeContact = null;

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

function unlockPhone() {
  lockScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
}

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
    } else {
      messagesApp.classList.add("hidden");
      genericApp.classList.remove("hidden");
      appTitle.textContent = name;
      appContent.textContent = appMessages[name] || "";
    }
  });
});

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

document.getElementById("add-contact-form")
  .addEventListener("submit", event => {
    event.preventDefault();

    const nameInput = document.getElementById("contact-name");
    const photoInput = document.getElementById("contact-photo");

    const name = nameInput.value.trim();
    const photo = photoInput.value.trim();

    if (!name) return;

    contacts.push({
      name,
      photo,
      messages: []
    });

    nameInput.value = "";
    photoInput.value = "";

    renderContacts();
  });

function openChat(contact) {
  activeContact = contact;
  chatName.textContent = contact.name;

  conversationList.classList.add("hidden");
  chatView.classList.remove("hidden");

  renderMessages();
}

function renderMessages() {
  chatMessages.replaceChildren();

  activeContact.messages.forEach(message => {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble " + message.type;
    bubble.textContent = message.text;
    chatMessages.appendChild(bubble);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.getElementById("send-message-form")
  .addEventListener("submit", event => {
    event.preventDefault();

    const input = document.getElementById("message-input");
    const text = input.value.trim();

    if (!text || !activeContact) return;

    activeContact.messages.push({
      text,
      type: "sent"
    });

    input.value = "";
    renderMessages();
    renderContacts();
  });

document.getElementById("back-messages")
  .addEventListener("click", () => {
    chatView.classList.add("hidden");
    conversationList.classList.remove("hidden");
    activeContact = null;
    renderContacts();
  });

document.getElementById("back-home")
  .addEventListener("click", () => {
    appScreen.classList.add("hidden");
    messagesApp.classList.add("hidden");
    genericApp.classList.remove("hidden");
    homeScreen.classList.remove("hidden");
    activeContact = null;
  });
