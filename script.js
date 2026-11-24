
const lockScreen = document.querySelector(".lock-screen");
const homeScreen = document.getElementById("home-screen");
const appScreen = document.getElementById("app-screen");

const appTitle = document.getElementById("app-title");
const appContent = document.getElementById("app-content");

function unlockPhone() {
  lockScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
}

const appMessages = {
  Messages: "Your conversations will appear here.",
  Phone: "Recent calls will appear here.",
  Photos: "Your photo gallery will appear here.",
  Camera: "Camera screen",
  TikTok: "Your TikTok feed will appear here.",
  Instagram: "Your Instagram feed will appear here.",
  Notes: "Your notes will appear here.",
  Settings: "Your phone settings.",
  Music: "Your music will appear here."
};

document.querySelectorAll(".app").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.app;

    appTitle.textContent = name;
    appContent.textContent = appMessages[name];

    homeScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
  });
});

document.getElementById("back-home").addEventListener("click", () => {
  appScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
});
