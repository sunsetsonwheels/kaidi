"use strict"

document.addEventListener("DOMContentLoaded", () => {
  fetch('/manifest.webapp')
  .then(responseRaw => responseRaw.text())
  .then(responseText => JSON.parse(responseText).version)
  .then(version => document.getElementById("kaidi-version-label").textContent = "Kaidi version "+version);
  switchTheme();
  nativeToast({message: "Initialization complete!",
               position: 'south',
               timeout: 3000,
               type: "success"});
  arrivedAtPage();
});

window.addEventListener("keydown", (e) => {
  switch(e.key) {
    case "SoftRight":
      gotoPage("settings");
      break;
  }
});