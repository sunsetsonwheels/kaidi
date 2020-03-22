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
// Variables Object playerPlayingInfoElements, Object playerPlayingPlaybackElements, Object playerSoftkeys
//
// Names of the HTML elements that are commonly used throughout this script.
//

var playerPlayingInfoElements = {"title": document.getElementById("player-playing-info-title"),
                                 "artists": document.getElementById("player-playing-info-artists")};

var playerPlayingPlaybackElements = {"throbber": document.getElementById("throbber"),
                                     "playbackContainer": document.getElementById("player-playing-playback")};

var playerSoftkeys = {"left": document.getElementById("softkey-left"),
                      "center": document.getElementById("softkey-center"),
                      "right": document.getElementById("softkey-right")};

//
// Function blankPlayer()
//
// Empties the player, returns it to not playing state.
//
// To be executed after ticker completes, Player.OnStop
//

function blankPlayer() {
  playerPlayingInfoElements["title"].setAttribute("data-l10n-id", "player-playing-info-title-none");
  playerPlayingInfoElements["artists"].setAttribute("data-l10n-id", "player-playing-info-artists-none");
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
// Function updatePlayerTime()
//
// Update the player playback (playback meter and playback label).
//

function updatePlayerTime() {
  // TODO: Code to pause or update the ticker
}

//
// Function tickTimer()
//
// Ticks the time every one second for the ticker.
//
// If the ticked time has exceeded the maximum tick time, blank the player and stop the interval.
// And reset the timer, and blank out the page.
//

function tickTimer() {
  ticked++;
  updatePlayerTime();
  if (ticked > maxTick) {
    if (typeof(ticker) == "function") {
      clearInterval(ticker);
    }
    ticked = 0;
    maxTick = 0;
    blankPlayer();
  }
}

//
// Function convertTimeToSeconds(Number hours, Number minutes, Number seconds)
//
// Converts the time data given by Kodi to seconds, for use with tickTimer()
//
// Return type: Number
//

function convertTimeToSeconds(hours, minutes, seconds) {
  if (typeof(hours) == "number" && typeof(minutes) == "number" && typeof(seconds) == "number") {
    return (((hours*60)+minutes)*60+seconds);
  } else {
    throw new TypeError("A supplied argument does not match the required type. Please check again.");
  }
}

//
// Function updatePlayerInfo(String title, String artists)
//
// Update the player info (title and artists).
//

function updatePlayerInfo(playerInfoObj) {
  if (typeof(playerInfoObj["title"]) == "string") {
    playerPlayingInfoElements["title"].removeAttribute("data-l10n-id");
    if (playerInfoObj["title"] != "") {
      playerPlayingInfoElements["title"].innerText = playerInfoObj["title"];
    } else {
      playerPlayingInfoElements["title"].setAttribute("data-l10n-id", "player-playing-info-title-none");
    }
  } else {
    playerPlayingInfoElements["title"].setAttribute("data-l10n-id", "player-playing-info-title-unavailable");
  }
  if (typeof(playerInfoObj["artists"]) == "string") {
    playerPlayingInfoElements["artists"].removeAttribute("data-l10n-id");
    if (playerInfoObj["artists"] != "") {
      playerPlayingInfoElements["artists"].innerText = playerInfoObj["artists"];
    } else {
      playerPlayingInfoElements["artists"].setAttribute("data-l10n-id", "player-playing-info-artists-none");
    }
  } else {
    playerPlayingInfoElements["artists"].setAttribute("data-l10n-id", "player-playing-info-artists-unavailable");
  }
}

//
// Function updatePlayerPlayPause(Number playerSpeed)
//
// Update the Play/Pause controls and status of this Player view.
//

function updatePlayerPlayPause(playerSpeed) {
  switch (playerSpeed) {
    case "0":
      playing = false;
      playerPlayingPlaybackElements["playbackContainer"].style.visibility = "hidden";
      playerSoftkeys["left"].setAttribute("data-l10n-id", "sk-none");
      playerSoftkeys["center"].setAttribute("data-l10n-id", "sk-pause");
      playerSoftkeys["right"].setAttribute("data-l10n-id", "sk-none");
      break;
  }
}

//
// Function updatePlaterRepeat(String repeatStatus)
//
// Update the Repeat controls and status of this Player view.
//

function updatePlayerRepeat(repeatStatus) {
  switch (repeatStatus) {
    case "off":
      document.getElementById("player-playing-playback-repeat").src = "/app/icons/repeat-grey_24.png";
      break;
    case "one":
    case "all":
      document.getElementById("player-playing-playback-repeat").src = "/app/icons/repeat_24.png";
      break;
    default:
      throw new TypeError("The supplied repeatStatus is invalid.");
      break;
  }
  switch (repeatStatus) {
    case "off":
      document.getElementById("player-options-list-repeat").setAttribute("data-l10n-id", "player-options-list-repeat-one");
      break;
    case "one":
      document.getElementById("player-options-list-repeat").setAttribute("data-l10n-id", "player-options-list-repeat-all");
      break;
    case "all":
      document.getElementById("player-options-list-repeat").setAttribute("data-l10n-id", "player-options-list-repeat-off");
      break;
    default:
      throw new TypeError("The supplied repeatStatus is invalid.");
      break;
  }
}

//
// Function updatePlayerShuffle(String shuffleStatus)
//
// Update the Shuffle controls and status of this Player view.
//

function updatePlayerShuffle(shuffleStatus) {
  switch (shuffleStatus) {
    case true:
      document.getElementById("player-playing-playback-shuffle").src = "/app/icons/shuffle_24.png";
      document.getElementById("player-options-list-shuffle").setAttribute("data-l10n-id", "player-options-list-shuffle-off");
      break;
    case false:
      document.getElementById("player-playing-playback-shuffle").src = "/app/icons/shuffle-grey_24.png";
      document.getElementById("player-options-list-shuffle").setAttribute("data-l10n-id", "player-options-list-shuffle-on");
      break;
    default:
      throw new TypeError("The supplied shuffleStatus is invalid.");
      break;
  }
}

// 
// Function updatePlayerThumbnail(String thumbnailUri)
//
// Gets and updates the player thumbnail from Kodi.
//

function updatePlayerThumbnail(thumbnailUri) {
  //TODO: fetch and update the thumbnail.
}

//
// Function initPlayer()
//
// Initializes the player view for the first time. Only if a player is active
// when this function is called will the app start sending information requests
// to Kodi for populating the UI.
//
// From here onwards, we will rely on the events Kodi supplies us with,
// to reduce the number of requests we have to make.
//

function initPlayer() {
  kodi.player("GetActivePlayers").then((response) => {
    if (response[0]) {
      tickTimer();
      kodi.player("GetItem", {"properties": ["title", "artist", "thumbnail"],
                              "playerid": response[0]["playerid"]}).then((response) => {
        var playerInfoObj = {}
        if (response["item"]["title"]) {
          playerInfoObj["title"] = response["item"]["title"];
        } else if (response["item"]["label"]) {
          playerInfoObj["title"] = response["item"]["label"];
        }
        if (response["item"]["artist"]) {
          playerInfoObj["artists"] = response["item"]["artist"];
          console.log("Player artists: "+JSON.stringify(response["item"]["artist"])+" (type: "+typeof(response["item"]["artist"]));
        }
        updatePlayerInfo(playerInfoObj);
      }).catch((err) => {
        tickTimer();
      });
      kodi.player("GetProperties", {"properties": ["speed", "repeat", "shuffled", "time", "totaltime"],
                                    "playerid": response[0]["playerid"]}).then((response) => {
        updatePlayerPlayPause(response["speed"]);
        updatePlayerRepeat(response["repeat"]);
        updatePlayerShuffle(response["shuffled"]);
        maxTick = convertTimeToSeconds(response["totaltime"]["hours"], 
                                       response["totaltime"]["minutes"], 
                                       response["totaltime"]["seconds"]);
        playerPlayingPlaybackElements["throbber"].style.display = "none";
        console.log(JSON.stringify(response));
      }).catch((err) => {
        // TODO: Fail gracefully
      });
    } else {
      tickTimer();
    }
  }).catch(() => {
    tickTimer();
  })
}

//
// Function playerEventHandler(Object kodiEventResponse)
//
// Handles the events from Kodi.
//

function playerEventHandler(kodiEventResponse) {
  switch (kodiEventResponse["event"]) {
    case "OnPause":
      // TODO: Handle the PlayPause event
      playing = false;
      break;
    case "OnPlay":
      // TODO: Handle the OnPlay event
      playing = true;
      break;
    case "OnStop":
      tickTimer();
      break;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  switchTheme();
  arrivedAtPage();
  //kodi.playbackRegisterEvents(getPlayer);
  initPlayer();
  window.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "SoftLeft":
        if (playing) {
          //TODO: open the Options menu.
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