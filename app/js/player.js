//
// /app/js/player.js
//
// This file handles the tasks required for the operation of player.html
//
// (C) jkelol111 and contributors 2020. Licensed under The Unlicense.
//

"use strict";

//
// Constant KodiMethods kodi
// 
// Handles communication with Kodi and provides core functions for Kaidi
//
//

const kodi = new KodiMethods();

//
// Variables Object playerPlayingInfoElements, Object playerPlayingPlaybackElements, Object playerOptionMenuElements,Object playerSoftkeyElements
//
// Names of the HTML elements that are commonly used throughout this script.
//

var playerPlayingInfoElements = {"title": document.getElementById("player-playing-info-title"),
                                 "artists": document.getElementById("player-playing-info-artists"),
                                 "thumbnail": document.getElementById("player-playing-info-thumbnail")};

var playerPlayingPlaybackElements = {"throbber": document.getElementById("throbber"),
                                     "playbackContainer": document.getElementById("player-playing-playback"),
                                     "repeat": document.getElementById("player-playing-playback-repeat"),
                                     "shuffle": document.getElementById("player-playing-playback-shuffle"),
                                     "playbackDuration": document.getElementById("player-playing-playback-duration-text"),
                                     "playbackMeter": document.getElementById("player-playing-playback-duration-meter")};

var playerOptionsMenuElements = {"optionsMenu": document.getElementById("player-options"),
                                 "repeat": document.getElementById("player-options-list-repeat"),
                                 "shuffle": document.getElementById("player-options-list-shuffle")}

var playerSoftkeyElements = {"left": document.getElementById("softkey-left"),
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
  changeLocalization(playerPlayingInfoElements["title"], "none");
  changeLocalization(playerPlayingInfoElements["artists"], "none");
  playerPlayingPlaybackElements["playbackContainer"].style.visibility = "hidden";
  playerPlayingPlaybackElements["throbber"].style.display = "none";
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
  return (((hours*60)+minutes)*60+seconds);
}

//
// Function updatePlayerInfo(String title, String artists)
//
// Update the player info (title and artists).
//

function updatePlayerInfo(playerInfoObject) {
  if (typeof(playerInfoObject["title"]) == "string") {
    removeLocalization(playerPlayingInfoElements["title"]);
    if (playerInfoObject["title"] != "") {
      playerPlayingInfoElements["title"].innerText = playerInfoObject["title"];
    } else {
      changeLocalization(playerPlayingInfoElements["title"], "none");
    }
  } else {
    changeLocalization(playerPlayingInfoElements["title"], "unavailable");
  }
  if (typeof(playerInfoObject["artists"]) == "string") {
    removeLocalization(playerPlayingInfoElements["artists"]);
    if (playerInfoObject["artists"] != "") {
      playerPlayingInfoElements["artists"].innerText = playerInfoObject["artists"];
    } else {
      changeLocalization(playerPlayingInfoElements["artists"], "none");
    }
  } else {
    changeLocalization(playerPlayingInfoElements["artists"], "unavailable");
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
      changeLocalization(playerSoftkeyElements["left"], "none")
      changeLocalization(playerSoftkeyElements["center"], "play");
      changeLocalization(playerSoftkeyElements["right"], "none");
      break;
    default:
      playing = true;
      playerPlayingPlaybackElements["playbackContainer"].style.visibility = "initial";
      changeLocalization(playerSoftkeyElements["left"], "playback");
      changeLocalization(playerSoftkeyElements["center"], "pause");
      changeLocalization(playerSoftkeyElements["right"], "none");
      break;
  }
}

class KodiPlayerTypeError extends TypeError {
  constructor(arg, expected, got) {
    super("The supplied argument '"+arg+"' is not of expected values(s) '"+expected+"', got '"+got+".");
    this.name = "KodiTypeError"
  }
}

//
// Function updatePlayerRepeat(String repeatStatus)
//
// Update the Repeat controls and status of this Player view.
//

function updatePlayerRepeat(repeatStatus) {
  switch (repeatStatus) {
    case "off":
      playerPlayingPlaybackElements["repeat"].src = "/app/icons/repeat-grey_24.png";
      break;
    case "one":
    case "all":
      playerPlayingPlaybackElements["repeat"].src = "/app/icons/repeat_24.png";
      break;
    default:
      throw new KodiPlayerTypeError("repeatStatus", "off, one, all", repeatStatus);
      break;
  }
  switch (repeatStatus) {
    case "off":
      changeLocalization(playerOptionsMenuElements["repeat"], "one");
      break;
    case "one":
      changeLocalization(playerOptionsMenuElements["repeat"], "all");
      break;
    case "all":
      changeLocalization(playerOptionsMenuElements["repeat"], "off");
      break;
    default:
      throw new KodiPlayerTypeError("repeatStatus", "off, one, all", repeatStatus);
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
      playerPlayingPlaybackElements["shuffle"].src = "/app/icons/shuffle_24.png";
      changeLocalization(playerOptionsMenuElements["shuffle"], "off");
      break;
    case false:
      playerPlayingPlaybackElements["shuffle"].src = "/app/icons/shuffle-grey_24.png";
      changeLocalization(playerOptionsMenuElements["shuffle"], "on");
      break;
    default:
      throw new KodiPlayerTypeError("shuffleStatus", "off, on", shuffleStatus);
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
  kodi.kodiXmlHttpRequest("Files.PrepareDownload", {"path": thumbnailUri})
  .then((response) => {
    // Not sure if this is right but whatever. I'm coding this at 1:15am.
    playerPlayingInfoElements["thumbnail"].src = "http://"+kodi.kodiIP+":"+kodi.kodiPort+"/"+response["details"]["path"];
  })
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
  kodi.kodiXmlHttpRequest("Player.GetActivePlayers").then((response) => {
    if(response[0]) {
      var activePlayer = response[0]["playerid"];
      kodi.kodiXmlHttpRequest("Player.GetItem", {"properties": ["title", "artist", "thumbnail"],
                                                 "playerid": activePlayer})
      .then((response) => {
        var playerInfoObject = {};
        if (response["item"]["title"]) {
          playerInfoObject["title"] = response["item"]["title"];
        } else if (response["item"]["label"]) {
          playerInfoObject["title"] = response["item"]["label"];
        }
        if (response["item"]["artist"]) {
          playerInfoObject["artists"] = response["item"]["artist"];
          console.log("Player artists: "+JSON.stringify(response["item"]["artist"])+" (type: "+typeof(response["item"]["artist"]));
        }
        updatePlayerInfo(playerInfoObject);
        updatePlayerThumbnail(response["item"]["thumbnail"]);
        kodi.kodiXmlHttpRequest("Player.GetProperties", {"properties": ["speed", "repeat", "shuffled", "time", "totaltime"],
                                                         "playerid": activePlayer})
        .then((response) => {
          updatePlayerPlayPause(response["speed"]);
          updatePlayerRepeat(response["repeat"]);
          updatePlayerShuffle(response["shuffled"]);
          ticked = convertTimeToSeconds(response["time"]["hours"], 
                                        response["time"]["minutes"], 
                                        response["time"]["seconds"]);
          maxTick = convertTimeToSeconds(response["totaltime"]["hours"], 
                                         response["totaltime"]["minutes"], 
                                         response["totaltime"]["seconds"]);
          playerPlayingPlaybackElements["playbackContainer"].style.visibility = "initial";
        })
        .catch((err) => {
          kodi.errorOut(err);
        });
      }).catch((err) => {
        blankPlayer();
        kodi.errorOut(err);
      });
    } else {
      newToast("toast-playerinactive", "No player active.", "south", 3000, "warning");
      blankPlayer();
    }
  })
}

document.addEventListener("DOMContentLoaded", () => {
  switchTheme();
  arrivedAtPage();
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
      case "ArrowLeft":
        if (playing) {
          //TODO: port code from 0.4.7.3
        }
        break;
      case "Enter":
        if (playing) {
          // TODO: remake this shit.
          // kodi.player("PlayPause");
        }
        break;
      case "ArrowRight":
        if (playing) {
          //TODO: port code from 0.4.7.3
        }
        break;
    }
  });
});