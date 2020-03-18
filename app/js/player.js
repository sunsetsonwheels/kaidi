"use strict"

var kodi = new KodiMethods();
var playing = false;
var currentPlayer = [];

let getPlayerLogger = new LoggerFactory("getPlayer");

function getPlayer() {
  return new Promise((resolve, reject) => {
    kodi.player("GetActivePlayers").then((response) => {
      try {
        kodi.player("GetItem", {"player": response["result"][0]}).then((response) => {

        }).catch((err) => {
          getPlayerLogger.error(new Error("Couldn't complete refresh of player details. Blanking it out"));
        })
      } catch (err) {

      }
    })
  })
}

document.addEventListener("DOMContentLoaded", () => {
  switchTheme();
  arrivedAtPage();
});

window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "SoftLeft":
      if (playing) {

      }
      break;
    case "Backspace":
      e.preventDefault();
      gotoPage("home");
      break;
    case "ArrowUp":
      kodi.volume("increment");
      break;
    case "ArrowDown":
      kodi.volume("decrement");
      break;
    case "Left":
      if (playing) {
        //TODO: port code from 0.4.7.3
      }
      break;
    case "Enter":
      if (playing) {
        kodi.player("PlayPause");
      }
      break;
    case "Right":
      if (playing) {
        //TODO: port code from 0.4.7.3
      }
      break;
  }
});