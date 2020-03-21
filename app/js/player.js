//
// /app/js/player.js
//
// This file handles the tasks required for the operation of player.html
//
// (C) jkelol111 and contributors 2020
//

"use strict"

//
// Constant KodiMethods kodi
// 
// Handles communication with Kodi and provides core functions for Kaidi
//

const kodi = new KodiMethods();

//
// Constant Object PLAYERPLAYINGINFOELEMENTS
//
// Names of the HTML elements that comprise the player playing information card
//

const PLAYERPLAYINGINFOELEMENTS = {"title": "player-playing-info-title",
                                   "artists": "player-playing-info-artists"};

//
// Function blankPlayer()
//
// Empties the player, returns it to not playing state.
//
// To be executed after ticker completes, Player.OnStop
//

function blankPlayer() {
  document.getElementById(PLAYERPLAYINGINFOELEMENTS["title"]).setAttribute("data-l10n-id", "player-playing-info-title-none");
  document.getElementById(PLAYERPLAYINGINFOELEMENTS["artists"]).setAttribute("data-l10n-id", "player-playing-info-artists-none");
  document.getElementById("player-playing-playback").style.visibility = "hidden";
}

//
// Variables Boolean playing, Number ticked , Number maxTick, Function,null ticker
//
// Local time ticker to update the playback time meter and labels.
//
// Boolean to determine player state.
//

var playing = false;
var ticked = 0;
var maxTick = 0;
var ticker = null;

//
// Function tickTimer()
//
// Ticks the time every one second for the ticker.
//
// If the ticked time has exceeded the maximum tick time, blank the player and stop the interval.
// And reset the timer.
//

function tickTimer() {
  tick++;
  updatePlayerPlayback();
  if (ticked > maxTick) {
    if (typeof ticker == "function") {
      clearInterval(ticker);
      ticked = 0;
      maxTick = 0;
      blankPlayer();
    }
  }
}

//
// Function updatePlayerInfo(String title, String artists)
//
// Update the player info (title and artists).
//

function updatePlayerInfo(title, artists) {
  if (typeof title == "string") {
    document.getElementById(PLAYERPLAYINGINFOELEMENTS["title"]).textContent = title;
  } else {
    document.getElementById(PLAYERPLAYINGINFOELEMENTS["title"]).setAttribute("data-l10n-id", "player-playing-info-title-unavailable");
  }
  if (typeof artists == "string") {
    document.getElementById(PLAYERPLAYINGINFOELEMENTS["artists"]).textContent = artists;
  } else {
    document.getElementById(PLAYERPLAYINGINFOELEMENTS["artists"]).setAttribute("data-l10n-id", "player-playing-info-artists-unavailable");
  }
}

//
// Function updatePlaybackInfo()
//
// Update the player playback (playback meter and playback label).
//

function updatePlayerPlayback() {
  // TODO: Code to pause or update the ticker
}

//
// Function initPlayer()
//
// Initializes the player view for the first time. 
//
// From here onwards, we will rely on the events Kodi supplies us with,
// to reduce the number of requests we have to make.
//

function initPlayer() {
  kodi.player("GetActivePlayers").then((response) => {
    if (response[0]) {
      kodi.player("GetProperties", {"properties": ["title", "artist", "duration", "thumbnail"],
                            "playerid": response[0]["playerid"]}).then((response) => {
        blankPlayer();
        if (response["title"]) {
          updatePlayerInfo(response["title"], undefined);
        } else {
          document.getElementById(PLAYERPLAYINGINFOELEMENTS["title"]).setAttribute("data-l10n-id", "player-playing-info-title-unavailable");
        }
        if (response["artist"]) {
          updatePlayerInfo(undefined, response["artist"]);
        } else {
          document.getElementById(PLAYERPLAYINGINFOELEMENTS["artists"]).setAttribute("data-l10n-id", "player-playing-info-artists-unavailable");
        }
        console.log("Player duration: "+response["duration"]);
        console.log("Player thumbnail: "+response["thumbnail"]);
      }).catch((err) => {
        this.blankPlayer();
      });
    } else {
      this.blankPlayer();
    }
  }).catch(() => {
    blankPlayer();
  })
}

//
// Function playerEventHandler(Object kodiEventResponse)
//
// Handles the events from Kodi.
//

function playerEventHandler(kodiEventResponse) {
  switch (kodiEventResponse["event"]) {
    case "PlayPause":
      // TODO: Handle the PlayPause event
      break;
    case "OnStop":
      blankPlayer();
      tick = maxTick + 1;
      break;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  switchTheme();
  arrivedAtPage();
  //kodi.playbackRegisterEvents(getPlayer);
  //initPlayer();
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
});