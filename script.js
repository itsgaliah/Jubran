
const lockScreen = document.querySelector(".lock-screen");
const homeScreen = document.getElementById("home-screen");
const appScreen = document.getElementById("app-screen");

const appMessages = {
  Photos: "Your photo gallery",
  Camera: "Your camera",
  Notes: "Your notes",
  TikTok: "Your TikTok feed",
  Instagram: "Your Instagram feed",
  Music: "Your music library",
  Settings: "Your phone settings"
};

// STORAGE
function loadData(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

let contacts = loadData("myPhoneContacts");
let calls = loadData("myPhoneCalls");
let notes = loadData("myPhoneNotes");
let photos = loadData("myPhonePhotos");

let activeContact = null;
let cameraStream = null;

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    alert("Storage is full. Please remove some saved items.");
  }
}

function saveContacts() {
  saveData("myPhoneContacts", contacts);
}

function saveCalls() {
  saveData("myPhoneCalls", calls);
}

function saveNotes() {
  saveData("myPhoneNotes", notes);
}

function savePhotos() {
  saveData("myPhonePhotos", photos);
}

// UNLOCK
function unlockPhone() {
  lockScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
}

// APP NAVIGATION
const appElements = {
  Phone: "phone-app",
  Messages: "messages-app",
  Photos: "photos-app",
  Camera: "camera-app",
  Notes: "notes-app",
  TikTok: "tiktok-app",
  Instagram: "instagram-app",
  Music: "music-app",
  Settings: "settings-app"
};

document.querySelectorAll(".app").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.app;

    homeScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");

    Object.values(appElements).forEach(id => {
      document.getElementById(id).classList.add("hidden");
    });

    const target = document.getElementById(appElements[name]);

    if (target) {
      target.classList.remove("hidden");
    }

    if (name === "Messages") renderContacts();
    if (name === "Phone") renderCalls();
    if (name === "Photos") renderPhotos();
    if (name === "Notes") renderNotes();
  });
});

// BACK HOME
document.getElementById("back-home").addEventListener("click", () => {
  appScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");

  activeContact = null;
  stopCamera();
});

// MESSAGES
const conversationList = document.getElementById("conversation-list");
const chatView = document.getElementById("chat-view");
const chatName = document.getElementById("chat-name");
const chatMessages = document.getElementById("chat-messages");

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
      avatar.appendChild(img);
    } else {
      avatar.textContent = contact.name.charAt(0).toUpperCase();
    }

    const info = document.createElement("span");
    info.className = "conversation-info";

    const name = document.createElement("strong");
    name.textContent = contact.name;

    const lastMessage = document.createElement("small");
    const messages = contact.messages || [];

    lastMessage.textContent = messages.length
      ? messages[messages.length - 1].text
      : "No messages yet";

    info.append(name, lastMessage);
    button.append(avatar, info);

    button.addEventListener("click", () => openChat(contact));

    conversationList.appendChild(button);
  });
}

// ADD CONTACT
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
        name,
        photo,
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

      reader.onload = () => addContact(reader.result);
      reader.readAsDataURL(file);
    } else {
      addContact("");
    }
  });

// OPEN CHAT
function openChat(contact) {
  activeContact = contact;
  chatName.textContent = contact.name;

  conversationList.classList.add("hidden");
  chatView.classList.remove("hidden");

  renderMessages();
}

function renderMessages() {
  chatMessages.replaceChildren();

  if (!activeContact) return;

  activeContact.messages = activeContact.messages || [];

  activeContact.messages.forEach(message => {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble " + message.type;
    bubble.textContent = message.text;
    chatMessages.appendChild(bubble);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// SEND MESSAGE
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

    saveContacts();
    input.value = "";

    renderMessages();
    renderContacts();
  });

// RECEIVE MESSAGE
document.getElementById("receive-button")
  .addEventListener("click", () => {
    const input = document.getElementById("receive-input");
    const text = input.value.trim();

    if (!text || !activeContact) return;

    activeContact.messages.push({
      text,
      type: "received"
    });

    saveContacts();
    input.value = "";

    renderMessages();
    renderContacts();
  });

// BACK TO CONVERSATIONS
document.getElementById("back-messages")
  .addEventListener("click", () => {
    chatView.classList.add("hidden");
    conversationList.classList.remove("hidden");

    activeContact = null;
    renderContacts();
  });

// PHONE CALLS
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

// ADD CALL
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

// PHOTOS
const galleryUpload = document.getElementById("gallery-upload");
const photoGallery = document.getElementById("photo-gallery");

function renderPhotos() {
  photoGallery.replaceChildren();

  photos.forEach(photo => {
    const img = document.createElement("img");
    img.src = photo;
    img.alt = "Saved photo";
    photoGallery.appendChild(img);
  });
}

galleryUpload.addEventListener("change", () => {
  const files = Array.from(galleryUpload.files);

  files.forEach(file => {
    if (!file.type.startsWith("image/")) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Each photo must be smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      photos.push(reader.result);
      savePhotos();
      renderPhotos();
    };

    reader.readAsDataURL(file);
  });

  galleryUpload.value = "";
});

// CAMERA
const cameraPreview = document.getElementById("camera-preview");
const cameraCanvas = document.getElementById("camera-canvas");
const cameraMessage = document.getElementById("camera-message");

document.getElementById("start-camera")
  .addEventListener("click", async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        cameraMessage.textContent = "Camera is not supported here.";
        return;
      }

      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });

      cameraPreview.srcObject = cameraStream;
      cameraMessage.textContent = "Camera is ready!";
    } catch {
      cameraMessage.textContent =
        "Camera permission was denied or unavailable.";
    }
  });

document.getElementById("take-photo")
  .addEventListener("click", () => {
    if (!cameraStream || !cameraPreview.videoWidth) {
      cameraMessage.textContent = "Open the camera first.";
      return;
    }

    cameraCanvas.width = cameraPreview.videoWidth;
    cameraCanvas.height = cameraPreview.videoHeight;

    const context = cameraCanvas.getContext("2d");
    context.drawImage(
      cameraPreview,
      0,
      0,
      cameraCanvas.width,
      cameraCanvas.height
    );

    const photo = cameraCanvas.toDataURL("image/jpeg");

    photos.push(photo);
    savePhotos();

    cameraMessage.textContent = "Photo saved to Photos!";
  });

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }

  cameraPreview.srcObject = null;
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopCamera();
});

// NOTES
const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");
const notesList = document.getElementById("notes-list");

function renderNotes() {
  notesList.replaceChildren();

  notes.forEach((note, index) => {
    const item = document.createElement("div");
    item.className = "note-item";

    const title = document.createElement("h3");
    title.textContent = note.title || "Untitled";

    const content = document.createElement("p");
    content.textContent = note.content;

    const remove = document.createElement("button");
    remove.textContent = "Delete";

    remove.addEventListener("click", () => {
      notes.splice(index, 1);
      saveNotes();
      renderNotes();
    });

    item.append(title, content, remove);
    notesList.appendChild(item);
  });
}

document.getElementById("save-note")
  .addEventListener("click", () => {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (!title && !content) return;

    notes.unshift({ title, content });

    saveNotes();
    renderNotes();

    noteTitle.value = "";
    noteContent.value = "";
  });

// LIKE BUTTONS
document.querySelectorAll(".like-button").forEach(button => {
  button.addEventListener("click", () => {
    const liked = button.dataset.liked === "true";

    button.dataset.liked = String(!liked);
    button.textContent = liked ? "♡ Like" : "♥ Liked";
  });
});
