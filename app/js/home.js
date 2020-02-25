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

let kodi = new KodiMethods();

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
      kodi.input("Up");
      break;
    case "ArrowLeft":
      kodi.input("Left");
      break;
    case "ArrowRight":
      kodi.input("Right");
      break;
    case "ArrowDown":
      kodi.input("Down");
      break;
    case "Enter":
      kodi.input("Select");
      break;
    case "1":
      kodi.input("Home");
      break;
    case "5":
      kodi.volume("increment");
      break;
    case "8":
      kodi.volume("decrement");
      break;
    case "6":
      kodi.volume("mute");
      break;
    case "4":
      kodi.input("Back");
      break;
  }
});
