"use strict"

var kodi = new KodiMethods();

class KaidiPlayer {
  constructor() {
    this.playing = false;
    this.lastDuration = 0;
    this.endDuration = 0;
    this.ticker = null;
  }
  blankPlayer() {
    document.getElementById("player-playing-info-title").setAttribute("data-l10n-id", "player-playing-info-title-none");
    document.getElementById("player-playing-artists-title").setAttribute("data-l10n-id", "player-playing-info-artists-none");
    document.getElementById("player-playing-playback").style.visibility = "hidden";
    this.lastDuration = 0;
  }
  refreshPlayer() {
    function updatePlayingInfo(kodiResponse) {
      document.getElementById("player-playing-info-title").removeAttribute("data-l10n-id");
      document.getElementById("player-playing-info-artists").removeAttribute("data-l10n-id");
      var playingDetails = {"title": null,
                            "artists": null,
                            "art": null,
                            "totalDuration": null};
      if (kodiResponse["title"]) {
        playingDetails["title"] = kodiResponse["title"];
      } else if (kodiResponse["label"]) {
        playingDetails["title"] = kodiResponse["label"];
      }
      document.getElementById("player-playing-info-title").textContent = playingDetails["title"];
      document.getElementById("player-playing-info-artists").textContent = playingDetails["artists"];
      document.getElementById("player-playing-art").src = playingDetails["art"];
      this.endDuration = kodiResponse["totalDuration"];
    }
    function updatePlayback(kodiResponse) {
      document.getElementById("player-playing-playback").style.visibility = "";
    }
    kodi.player("GetActivePlayers").then((response) => {
      if (response[0]) {
        kodi.player("GetItem", {"properties": ["title", "label", "artist", "duration", "thumbnail"],
                              "playerid": response[0]["playerid"]}).then((response) => {
        updatePlayingInfo(response);
        }).catch((err) => {
          this.blankPlayer();
        });
      } else {
        this.blankPlayer();
      }
    }).catch((err) => {
      this.blankPlayer();
    });
  }
  playPauseEventHandler() {

  }
}

function blankPlayer() {
  document.getElementById("player-playing-info-title").setAttribute("data-l10n-id", "player-playing-info-title-none");
  document.getElementById("player-playing-artists-title").setAttribute("data-l10n-id", "player-playing-info-artists-none");
  document.getElementById("player-playing-playback").style.visibility = "hidden";
}

function initPlayer() {
  kodi.player("GetActivePlayers").then((response) => {
    if (response[0]) {
      kodi.player("GetItem", {"properties": ["title", "label", "artist", "duration", "thumbnail"],
                            "playerid": response[0]["playerid"]}).then((response) => {
      updatePlayingInfo(response);
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

document.addEventListener("DOMContentLoaded", () => {
  switchTheme();
  arrivedAtPage();
  var player = new KaidiPlayer();
  //kodi.playbackRegisterEvents(getPlayer);
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
        if (player.playing) {
          //TODO: port code from 0.4.7.3
        }
        break;
    }
  });
});