"use strict"

document.addEventListener("DOMContentLoaded", () => {
  fetch('/manifest.webapp')
  .then(responseRaw => responseRaw.text())
  .then(responseText => JSON.parse(responseText).version)
  .then(version => {
    navigator.mozL10n.formatValue("kaidi-version-prefix").then(str => {
      document.getElementById("kaidi-version-label").textContent = str+" "+version;
    })
    .catch(() => {
      document.getElementById("kaidi-version-label").textContent = "Kaidi version "+version
    });
  });
  switchTheme();
  arrivedAtPage();
});

window.addEventListener("keydown", (e) => {
  switch(e.key) {
    case "SoftRight":
      try{
        gotoPage("settings");
      } catch(err) {
        console.error(err);
      } 
      break;
  }
});