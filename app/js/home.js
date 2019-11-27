"use strict"

if(settings.get("ip") == null || settings.get("port") == null) {
  navigator.mozL10n.formatValue("welcome-text", {newline: "\n\n"}).then((text) => {
    alert(text);
    gotoPage("settings");
  }).catch(() => {
    alert("Please input the IP address and port of your device in the next page!");
    gotoPage("settings");
  })
}

document.addEventListener("DOMContentLoaded", () => {
  fetch('/manifest.webapp')
  .then(responseRaw => responseRaw.text())
  .then(responseText => JSON.parse(responseText).version)
  .then(version => {
    navigator.mozL10n.formatValue("kaidi-version-prefix").then(str => {
      document.getElementById("kaidi-version-label").textContent = str+" "+version;
    })
    .catch(() => {
      document.getElementById("kaidi-version-label").textContent = "Kaidi version "+version;
    });
  });
  switchTheme();
  arrivedAtPage();
});

window.addEventListener("keydown", (e) => {
  switch(e.key) {
    case "SoftRight":
      try {
        gotoPage("settings");
      } catch(err) {
        arrivedAtPage();
        console.error(err);
      } 
      break;
    case "ArrowUp":
      keyNav("Up");
      break;
    case "ArrowLeft":
      keyNav("Left");
      break;
    case "ArrowRight":
      keyNav("Right");
      break;
    case "ArrowDown":
      keyNav("Down");
      break;
  }
});