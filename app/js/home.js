"use strict"

if (settings.get("ip") == null || settings.get("port") == null) {
  navigator.mozL10n.formatValue("welcome-text", {newline: "\n\n"}).then((text) => {
    alert(text);
    gotoPage("settings");
  }).catch(() => {
    alert("Please input the IP address and port of your device in the next page!");
    gotoPage("settings");
  });
}

var kodi = new KodiMethods();

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

kodi.inputRegisterEvent(() => {
  function promptInputText(text) {
    let inputtedText = prompt(text);
    if (inputtedText) {
      kodi.input("SendText", {"text": inputtedText, 
                              "done": true});
    }
  }
  navigator.mozL10n.formatValue("input-text").then((text) => {
    promptInputText(text);
  }).catch(() => {
    promptInputText("Input text");
  });
});

window.addEventListener("keydown", (e) => {
  switch(e.key) {
    case "SoftLeft":
      alert("The player view hasn't been revamped yet. Come back later!");
      break;
    case "SoftRight":
      gotoPage("settings");
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
    case "Call":
      kodi.input("Back");
      break;
    case "1":
      kodi.input("Home");
      break;
    case "2":
      kodi.input("ContextMenu");
      break;
    case "3":
      kodi.gui("SetFullscreen");
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
  }
});
