"use strict"

document.addEventListener("DOMContentLoaded", () => {
  switchTheme();
  arrivedAtPage();
});

var kodi = new KodiMethods();
var playing = false;
var playlist = [];
var players = [];

var playlistPaneOpened = false;

function closePlaylistPane() {
  document.getElementById("player-playlist").classList.remove("content-visible-right");
  document.getElementById("player-playlist").classList.add("content-hidden-right");
  playlistPaneOpened = false;
}

function openPlaylistPane() {
  document.getElementById("player-playlist").classList.remove("content-hidden-right");
  document.getElementById("player-playlist").classList.add("content-visible-right");
  playlistPaneOpened = true;
}

window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "SoftLeft":
      if (playing) {
        if (playlistPaneOpened) {
          closePlaylistPane();
        }
      }
      break;
    case "SoftRight":
      if (playing) {
        if (!playlistPaneOpened) {
          openPlaylistPane();
        }
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
    case "Right":
      if (playing) {
        //TODO: port code from 0.4.7.3
      }
      break;
  }
});