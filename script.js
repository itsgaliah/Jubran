
const screen = document.getElementById("screen");

const apps = {
  Messages: "Your messages will appear here.",
  Photos: "Your photo gallery will appear here.",
  Notes: "Write your notes here.",
  Music: "Your music player will appear here.",
  Settings: "Phone settings.",
  Camera: "Your camera app."
};

document.querySelectorAll(".app").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.app;

    screen.innerHTML = `
      <h2>${name}</h2>
      <p>${apps[name]}</p>
    `;
  });
});

document.getElementById("home").addEventListener("click", () => {
  screen.innerHTML = `
    <h2>Welcome!</h2>
    <p>Choose an app to open.</p>
  `;
});
