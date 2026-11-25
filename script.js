/* ===== IPHONE ELEMENTS ===== */

const lockScreen = document.querySelector(".lock-screen");
const homeScreen = document.getElementById("home-screen");
const appScreen = document.getElementById("app-screen");

/* ===== STORAGE ===== */

function loadData(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    alert("Storage is full. Please remove some saved items.");
  }
}

let contacts = loadData("myPhoneContacts");
let calls = loadData("myPhoneCalls");
let notes = loadData("myPhoneNotes");
let photos = loadData("myPhonePhotos");

let activeContact = null;
let cameraStream = null;
let selectedPhoto = null;
let editingNoteId = null;

let musicFiles = [];
let activeMusicIndex = -1;

/* ===== GENERAL ===== */

function makeId() {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

function unlockPhone() {
  lockScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
}

/* ===== APP NAVIGATION ===== */

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
    const appId = appElements[name];

    if (!appId) return;

    Object.values(appElements).forEach(id => {
      document.getElementById(id).classList.add("hidden");
    });

    homeScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");

    document.getElementById(appId).classList.remove("hidden");

    if (name === "Messages") renderContacts();
    if (name === "Phone") renderCalls();
    if (name === "Photos") renderPhotos();
    if (name === "Notes") renderNotes();
    if (name === "Music") renderMusic();

    if (name !== "Camera") stopCamera();
  });
});

document.getElementById("back-home").addEventListener("click", () => {
  stopCamera();

  appScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");

  activeContact = null;
  closePhotoViewer();
});

/* ===== MESSAGES ===== */

const conversationList = document.getElementById("conversation-list");
const chatView = document.getElementById("chat-view");
const chatName = document.getElementById("chat-name");
const chatMessages = document.getElementById("chat-messages");

function renderContacts() {
  conversationList.replaceChildren();

  if (!contacts.length) {
    conversationList.textContent = "No conversations yet. Add someone!";
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

    const last = document.createElement("small");
    const messages = contact.messages || [];

    last.textContent = messages.length
      ? messages[messages.length - 1].text
      : "No messages yet";

    info.append(name, last);
    button.append(avatar, info);

    button.addEventListener("click", () => openChat(contact));

    conversationList.appendChild(button);
  });
}

document.getElementById("add-contact-form").addEventListener("submit", event => {
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

    saveData("myPhoneContacts", contacts);
    renderContacts();

    nameInput.value = "";
    photoInput.value = "";
  }

  if (file) {
    if (!file.type.startsWith("image/") || file.size > 1024 * 1024) {
      alert("Choose an image smaller than 1 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => addContact(reader.result);
    reader.readAsDataURL(file);
  } else {
    addContact("");
  }
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

function addMessage(type, inputId) {
  const input = document.getElementById(inputId);
  const text = input.value.trim();

  if (!text || !activeContact) return;

  activeContact.messages.push({
    text,
    type
  });

  saveData("myPhoneContacts", contacts);

  input.value = "";

  renderMessages();
  renderContacts();
}

document.getElementById("send-message-form").addEventListener("submit", event => {
  event.preventDefault();
  addMessage("sent", "message-input");
});

document.getElementById("receive-button").addEventListener("click", () => {
  addMessage("received", "receive-input");
});

document.getElementById("back-messages").addEventListener("click", () => {
  chatView.classList.add("hidden");
  conversationList.classList.remove("hidden");

  activeContact = null;

  renderContacts();
});

/* ===== PHONE ===== */

function renderCalls() {
  const list = document.getElementById("call-list");

  list.replaceChildren();

  if (!calls.length) {
    list.textContent = "No recent calls";
    return;
  }

  calls.forEach(call => {
    const item = document.createElement("div");
    item.className = "call-item";

    const name = document.createElement("strong");
    name.textContent = call.name;

    const details = document.createElement("small");
    details.textContent = call.time;

    const direction = document.createElement("span");
    direction.textContent = call.type;
    direction.className = "call-direction";

    const info = document.createElement("div");

    info.append(name, details, direction);
    item.appendChild(info);

    list.appendChild(item);
  });
}

document.getElementById("add-call").addEventListener("click", () => {
  const name = prompt("Enter the person's name:");

  if (!name || !name.trim()) return;

  const incoming = confirm(
    "Incoming call? OK = Incoming, Cancel = Outgoing"
  );

  calls.unshift({
    name: name.trim(),
    type: incoming ? "Incoming call" : "Outgoing call",
    time: new Date().toLocaleString()
  });

  saveData("myPhoneCalls", calls);
  renderCalls();
});

/* ===== PHOTOS ===== */

const galleryUpload = document.getElementById("gallery-upload");
const photoGallery = document.getElementById("photo-gallery");
const photoViewer = document.getElementById("photo-viewer");
const largePhoto = document.getElementById("large-photo");

function renderPhotos() {
  photoGallery.replaceChildren();

  photos.forEach((photo, index) => {
    const img = document.createElement("img");

    img.src = photo;
    img.alt = "Saved photo";

    img.addEventListener("click", () => openPhoto(index));

    photoGallery.appendChild(img);
  });
}

galleryUpload.addEventListener("change", () => {
  Array.from(galleryUpload.files).forEach(file => {
    if (!file.type.startsWith("image/")) return;

    if (file.size > 1024 * 1024) {
      alert("Each photo must be smaller than 1 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      photos.push(reader.result);

      saveData("myPhonePhotos", photos);
      renderPhotos();
    };

    reader.readAsDataURL(file);
  });

  galleryUpload.value = "";
});

function openPhoto(index) {
  selectedPhoto = index;

  largePhoto.src = photos[index];
  photoViewer.classList.remove("hidden");
}

function closePhotoViewer() {
  photoViewer.classList.add("hidden");
  largePhoto.src = "";

  selectedPhoto = null;
}

document.getElementById("close-photo").addEventListener("click", closePhotoViewer);

document.getElementById("delete-photo").addEventListener("click", () => {
  if (selectedPhoto === null) return;

  photos.splice(selectedPhoto, 1);

  saveData("myPhonePhotos", photos);

  closePhotoViewer();
  renderPhotos();
});

/* ===== CAMERA ===== */

const cameraPreview = document.getElementById("camera-preview");
const cameraCanvas = document.getElementById("camera-canvas");
const cameraMessage = document.getElementById("camera-message");

document.getElementById("start-camera").addEventListener("click", async () => {
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraMessage.textContent = "Camera is not supported here.";
      return;
    }

    stopCamera();

    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment"
      },
      audio: false
    });

    cameraPreview.srcObject = cameraStream;

    cameraMessage.textContent = "Camera is ready!";
  } catch {
    cameraMessage.textContent = "Camera permission denied or unavailable.";
  }
});

document.getElementById("take-photo").addEventListener("click", () => {
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
    0
  );

  const photo = cameraCanvas.toDataURL("image/jpeg", 0.7);

  photos.push(photo);

  saveData("myPhonePhotos", photos);

  cameraMessage.textContent = "Photo saved to Photos!";
});

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }

  if (cameraPreview) {
    cameraPreview.srcObject = null;
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopCamera();
});

/* ===== NOTES ===== */

const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");
const notesList = document.getElementById("notes-list");
const cancelEdit = document.getElementById("cancel-edit");

function renderNotes() {
  notesList.replaceChildren();

  notes.forEach((note, index) => {
    const item = document.createElement("div");
    item.className = "note-item";

    const title = document.createElement("h3");
    title.textContent = note.title || "Untitled";

    const content = document.createElement("p");
    content.textContent = note.content;

    const edit = document.createElement("button");
    edit.textContent = "Edit";

    edit.addEventListener("click", () => {
      editingNoteId = note.id;

      noteTitle.value = note.title || "";
      noteContent.value = note.content || "";

      cancelEdit.classList.remove("hidden");

      noteTitle.focus();
    });

    const remove = document.createElement("button");
    remove.textContent = "Delete";

    remove.addEventListener("click", () => {
      notes.splice(index, 1);

      saveData("myPhoneNotes", notes);
      renderNotes();
    });

    item.append(title, content, edit, remove);

    notesList.appendChild(item);
  });
}

document.getElementById("save-note").addEventListener("click", () => {
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();

  if (!title && !content) return;

  if (editingNoteId) {
    const note = notes.find(item => item.id === editingNoteId);

    if (note) {
      note.title = title;
      note.content = content;
    }
  } else {
    notes.unshift({
      id: makeId(),
      title,
      content
    });
  }

  saveData("myPhoneNotes", notes);

  noteTitle.value = "";
  noteContent.value = "";

  editingNoteId = null;

  cancelEdit.classList.add("hidden");

  renderNotes();
});

cancelEdit.addEventListener("click", () => {
  editingNoteId = null;

  noteTitle.value = "";
  noteContent.value = "";

  cancelEdit.classList.add("hidden");
});

/* ===== TIKTOK & INSTAGRAM ===== */

document.querySelectorAll(".like-button").forEach(button => {
  button.addEventListener("click", () => {
    const liked = button.dataset.liked === "true";

    button.dataset.liked = String(!liked);

    button.textContent = liked ? "♡ Like" : "♥ Liked";
  });
});

/* ===== MUSIC ===== */

const musicUpload = document.getElementById("music-upload");
const musicList = document.getElementById("music-list");
const musicPlayer = document.getElementById("music-player");

const musicControls = document.createElement("div");
musicControls.className = "music-controls";

const previousMusic = document.createElement("button");
previousMusic.textContent = "⏮ Previous";

const nextMusic = document.createElement("button");
nextMusic.textContent = "Next ⏭";

const currentMusic = document.createElement("p");
currentMusic.textContent = "No song playing";

musicControls.append(
  previousMusic,
  nextMusic,
  currentMusic
);

musicPlayer.parentNode.insertBefore(
  musicControls,
  musicPlayer
);

musicUpload.addEventListener("change", () => {
  Array.from(musicUpload.files).forEach(file => {
    if (!file.type.startsWith("audio/")) return;

    musicFiles.push({
      name: file.name,
      url: URL.createObjectURL(file)
    });
  });

  musicUpload.value = "";

  renderMusic();
});

function playMusic(index) {
  if (index < 0 || index >= musicFiles.length) return;

  activeMusicIndex = index;

  musicPlayer.src = musicFiles[index].url;

  currentMusic.textContent =
    "♪ " + musicFiles[index].name;

  musicPlayer.play().catch(() => {
    currentMusic.textContent = "Press play to start the song";
  });

  renderMusic();
}

function renderMusic() {
  musicList.replaceChildren();

  if (!musicFiles.length) {
    musicList.textContent = "No music added yet.";
    currentMusic.textContent = "No song playing";
    return;
  }

  musicFiles.forEach((track, index) => {
    const item = document.createElement("div");
    item.className = "music-track";

    const playButton = document.createElement("button");

    playButton.textContent =
      (index === activeMusicIndex ? "♪ " : "▶ ") +
      track.name;

    playButton.addEventListener("click", () => {
      playMusic(index);
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "✕";

    deleteButton.addEventListener("click", () => {
      const wasPlaying = activeMusicIndex === index;

      URL.revokeObjectURL(track.url);

      musicFiles.splice(index, 1);

      if (wasPlaying) {
        musicPlayer.pause();
        musicPlayer.removeAttribute("src");

        activeMusicIndex = -1;
        currentMusic.textContent = "No song playing";
      } else if (activeMusicIndex > index) {
        activeMusicIndex--;
      }

      renderMusic();
    });

    item.append(playButton, deleteButton);

    musicList.appendChild(item);
  });
}

previousMusic.addEventListener("click", () => {
  if (!musicFiles.length) return;

  const index = activeMusicIndex <= 0
    ? musicFiles.length - 1
    : activeMusicIndex - 1;

  playMusic(index);
});

nextMusic.addEventListener("click", () => {
  if (!musicFiles.length) return;

  const index = activeMusicIndex >= musicFiles.length - 1
    ? 0
    : activeMusicIndex + 1;

  playMusic(index);
});

musicPlayer.addEventListener("ended", () => {
  if (musicFiles.length) {
    nextMusic.click();
  }
});

/* ===== SETTINGS ===== */

const darkMode = document.getElementById("dark-mode");

darkMode.checked =
  localStorage.getItem("myPhoneDarkMode") === "true";

document.body.classList.toggle(
  "dark-mode",
  darkMode.checked
);

darkMode.addEventListener("change", () => {
  document.body.classList.toggle(
    "dark-mode",
    darkMode.checked
  );

  localStorage.setItem(
    "myPhoneDarkMode",
    String(darkMode.checked)
  );
});

// Change phone name

const settingItems = document.querySelectorAll(".setting-item");
const phoneNameItem = settingItems[1];

if (phoneNameItem) {
  const nameDisplay = phoneNameItem.querySelector("strong");

  const savedName =
    localStorage.getItem("myPhoneName") || "My iPhone";

  if (nameDisplay) {
    nameDisplay.textContent = savedName;
    nameDisplay.style.cursor = "pointer";

    nameDisplay.addEventListener("click", () => {
      const newName = prompt(
        "Enter your phone name:",
        localStorage.getItem("myPhoneName") || "My iPhone"
      );

      if (newName && newName.trim()) {
        const cleanName = newName.trim();

        nameDisplay.textContent = cleanName;

        localStorage.setItem("myPhoneName", cleanName);
      }
    });
  }
}

/* ===== OLD NOTES SUPPORT ===== */

notes.forEach(note => {
  if (!note.id) {
    note.id = makeId();
  }
});

saveData("myPhoneNotes", notes);

/* ===== LIVE IPHONE CLOCK & STATUS BAR ===== */

(function updateIPhoneDisplay() {
  const clock = document.getElementById("clock");
  const day = document.querySelector(".day");

  function updateDisplay() {
    const now = new Date();

    const time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
    .replace(" AM", "")
    .replace(" PM", "");

    const date = now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    });

    if (clock) {
      clock.textContent = time;
    }

    if (day) {
      day.textContent = date;
    }

    document.querySelectorAll(".status-bar, .home-status")
      .forEach(bar => {
        const first = bar.querySelector("span");

        if (first) {
          first.textContent = time;
        }

        const second = bar.querySelectorAll("span")[1];

        if (second) {
          second.innerHTML = `
            <span class="status-icons">
              <span>▂▄▆</span>
              <span>◉</span>
              <span class="battery-icon">
                <span class="battery-level"></span>
              </span>
            </span>
          `;
        }
      });
  }

  updateDisplay();

  setInterval(updateDisplay, 1000);
})();

/* ===== IPHONE NOTIFICATIONS ===== */

const notificationBanner = document.getElementById("notification-banner");
const notificationTitle = document.getElementById("notification-title");
const notificationText = document.getElementById("notification-text");

let notificationTimer;

function showNotification(title, message) {
  if (!notificationBanner) return;

  notificationTitle.textContent = title;
  notificationText.textContent = message;

  notificationBanner.classList.remove("hidden");

  clearTimeout(notificationTimer);

  notificationTimer = setTimeout(() => {
    notificationBanner.classList.add("hidden");
  }, 3500);
}

/* Show notification when receiving a message */

const originalAddMessage = addMessage;

addMessage = function(type, inputId) {
  const messageText = document.getElementById(inputId)?.value.trim();
  const senderName = activeContact?.name || "Messages";

  originalAddMessage(type, inputId);

  if (type === "received" && messageText) {
    showNotification(senderName, messageText);
  }
};

/* ===== INCOMING CALL SCREEN ===== */

const incomingCallScreen = document.getElementById("incoming-call");
const callerNameDisplay = document.getElementById("caller-name");

const simulateCallButton = document.createElement("button");
simulateCallButton.id = "simulate-incoming-call";
simulateCallButton.textContent = "☎ Simulate Incoming Call";

document.getElementById("add-call").after(simulateCallButton);

let currentCaller = "";

function startIncomingCall(name) {
  currentCaller = name;

  callerNameDisplay.textContent = name;

  incomingCallScreen.classList.remove("hidden");
}

function finishCall(type) {
  if (!currentCaller) return;

  calls.unshift({
    name: currentCaller,
    type: type,
    time: new Date().toLocaleString()
  });

  saveData("myPhoneCalls", calls);

  incomingCallScreen.classList.add("hidden");

  renderCalls();

  if (type === "Incoming call") {
    showNotification("Phone", "Call with " + currentCaller);
  }

  currentCaller = "";
}

/* Choose who is calling */

simulateCallButton.addEventListener("click", () => {
  const names = contacts.map(contact => contact.name);

  let name;

  if (names.length > 0) {
    name = prompt(
      "Who is calling you?\n\nSaved contacts:\n" +
      names.join("\n") +
      "\n\nType the caller's name:"
    );
  } else {
    name = prompt("Enter caller name:");
  }

  if (name && name.trim()) {
    startIncomingCall(name.trim());
  }
});

/* Accept call */

document.getElementById("accept-call").addEventListener("click", () => {
  finishCall("Incoming call");
});

/* Decline call */

document.getElementById("decline-call").addEventListener("click", () => {
  finishCall("Missed call");
});

/* ===== TOUCH SOUNDS ===== */

let audioContext;

function playTouchSound() {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 650;

    gain.gain.setValueAtTime(0.035, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.06
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.06);
  } catch (error) {
    // Sound is optional.
  }
}

document.addEventListener("click", event => {
  const target = event.target.closest("button, .app");

  if (target && !target.disabled) {
    playTouchSound();
  }
});

/* ===== NOTIFICATION TAP ===== */

if (notificationBanner) {
  notificationBanner.addEventListener("click", () => {
    const title = notificationTitle.textContent;

    notificationBanner.classList.add("hidden");

    Object.values(appElements).forEach(id => {
      document.getElementById(id).classList.add("hidden");
    });

    homeScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");

    const targetApp = title === "Phone"
      ? "phone-app"
      : "messages-app";

    document.getElementById(targetApp).classList.remove("hidden");

    if (targetApp === "phone-app") {
      renderCalls();
    } else {
      renderContacts();
    }
  });
}
/* ===== CUSTOM WALLPAPER ===== */

const wallpaperUpload = document.getElementById("wallpaper-upload");
const resetWallpaper = document.getElementById("reset-wallpaper");

function applyWallpaper(image) {
  const screens = [
    lockScreen,
    homeScreen
  ];

  screens.forEach(screen => {
    if (image) {
      screen.style.backgroundImage =
        `linear-gradient(#00000020, #00000020), url("${image}")`;

      screen.style.backgroundSize = "cover";
      screen.style.backgroundPosition = "center";
      screen.style.backgroundRepeat = "no-repeat";
    } else {
      screen.style.backgroundImage = "";
      screen.style.backgroundSize = "";
      screen.style.backgroundPosition = "";
      screen.style.backgroundRepeat = "";
    }
  });
}

/* Load saved wallpaper */

const savedWallpaper = localStorage.getItem("myPhoneWallpaper");

if (savedWallpaper) {
  applyWallpaper(savedWallpaper);
}

/* Upload new wallpaper */

if (wallpaperUpload) {
  wallpaperUpload.addEventListener("change", () => {
    const file = wallpaperUpload.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");

        const maxWidth = 1200;
        const scale = Math.min(1, maxWidth / image.width);

        canvas.width = image.width * scale;
        canvas.height = image.height * scale;

        const context = canvas.getContext("2d");

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const compressedImage = canvas.toDataURL(
          "image/jpeg",
          0.75
        );

        try {
          localStorage.setItem(
            "myPhoneWallpaper",
            compressedImage
          );

          applyWallpaper(compressedImage);
          alert("Wallpaper updated!");
        } catch {
          alert("Image is too large. Try another photo.");
        }
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
    wallpaperUpload.value = "";
  });
}

/* Reset wallpaper */

if (resetWallpaper) {
  resetWallpaper.addEventListener("click", () => {
    localStorage.removeItem("myPhoneWallpaper");

    applyWallpaper(null);

    alert("Wallpaper reset!");
  });
}
