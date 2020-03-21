"use strict"

class KodiMethods {
  constructor() {
    this.kodiMethodsLogger = new LoggerFactory("KodiMethods");
    this.kodirpc = new KodiRPC(true);
    this.ping();
  }
  successfulLog(cls, method) {
    this.kodiMethodsLogger.log(cls+" command triggered for: "+method);
  }
  unsuccessfulLog(cls, method) {
    this.kodiMethodsLogger.error(cls+" command not triggered for: "+method);
  }
  showToastRequestFailed() {
    newToast("request-failed-text", "Kodi request failed", "south", 2000, "error");
  }
  showToastResponseUndetermined() {
    newToast("response-undetermined-response-text", "Undertermined Ping response.", "south", 4000, "warning");
  }
  ping() {
    this.kodirpc.kodiXmlHttpRequest("JSONRPC.Ping").then((response) => {
      try {
        if (response["result"] == "pong") {
          this.successfulLog("JSONRPC", "Ping");
          newToast("kodi-connection-established-text", "Connection to Kodi successful!", "south", 2000, "success");
        } else {
          this.unsuccessfulLog("JSONRPC", "Ping");
          this.showToastResponseUndetermined();
        }
      } catch (err) {
        this.unsuccessfulLog("JSONRPC", "Ping");
        this.kodiMethodsLogger.error(err);
        this.showToastResponseUndetermined();
      }
    }).catch((err) => {
      this.unsuccessfulLog("JSONRPC", "Ping");
      this.kodiMethodsLogger.error(err);
      this.showToastRequestFailed();
    })
  }
  input(direction, params=undefined) {
    if (["Up", "Down", "Right", "Left", "Select", "Home", "Back", "ContentMenu","SendText"].indexOf(direction) > -1) {
      this.kodirpc.kodiXmlHttpRequest("Input."+direction, params).then(() => {
        this.successfulLog("Input", direction);
      }).catch((err) => {
        this.unsuccessfulLog("Input", direction);
        this.kodiMethodsLogger.error(err);
        this.showToastRequestFailed();
      });
    } else {
      this.unsuccessfulLog("Input", direction);
      this.showToastRequestFailed();
    }
  }
  inputRegisterEvent(inputEventHandler) {
    this.kodirpc.kodiRegisterEventListener("Input.OnInputRequested", inputEventHandler);
  } 
  gui(subcommand, params=undefined) {
    if (["SetFullscreen"].indexOf(subcommand) > -1) {
      this.kodirpc.kodiXmlHttpRequest("GUI."+subcommand, params).then(() => {
        this.successfulLog("GUI", subcommand);
      }).catch((err) => {
        this.unsuccessfulLog("GUI", subcommand);
        this.kodiMethodsLogger.error(err);
        this.showToastRequestFailed();
      });
    } else {
      this.unsuccessfulLog("GUI", subcommand);
      this.showToastRequestFailed();
    }
  }
  volume(direction) {
    if(["increment", "decrement", "mute"].indexOf(direction) > -1) {
      if ( direction == "mute" ) {
         var method = "Application.SetMute";
         var param = { "mute": "toggle" };
      } else {
         var method = "Application.SetVolume";
         var param = { "volume": direction };
      }
      this.kodirpc.kodiXmlHttpRequest(method, param).then(() => {
        this.kodirpc.kodiXmlHttpRequest("Application.GetProperties", {"properties": ["volume"]})
        .then((response) => {
          document.querySelector("#meter-volume").value = response["result"]["volume"];
          this.successfulLog("Volume", direction);
          document.querySelector(".volume-hud-greyout").classList.remove("volume-hud-transition-hide");
          document.querySelector(".volume-hud-greyout").classList.add("volume-hud-transition-appear");
          setTimeout(() => {
            document.querySelector(".volume-hud-greyout").classList.remove("volume-hud-transition-appear");
            document.querySelector(".volume-hud-greyout").classList.add("volume-hud-transition-hide");
          }, 1500);
        }).catch((err) => {
          this.unsuccessfulLog("Volume", subcommand);
          this.kodiMethodsLogger.error(err);
          this.showToastRequestFailed();
        });
      }).catch((err) => {
        this.unsuccessfulLog("Volume", subcommand);
        this.kodiMethodsLogger.error(err);
        this.showToastRequestFailed();
      });
    } else {
      this.unsuccessfulLog(method, param);
      this.showToastRequestFailed();
    }
  }
  player(subcommand, params=undefined) {
    if (["GetActivePlayers", "GetItem", "GetProperties", "PlayPause"].indexOf(subcommand) > -1) {
      return new Promise((resolve, reject) => {
        this.kodirpc.kodiXmlHttpRequest("Player."+subcommand, params).then((response) => {
          try {
            this.successfulLog("Player", subcommand);
            resolve(response["result"]);
          } catch (err) {
            this.unsuccessfulLog("Player", subcommand);
            this.kodiMethodsLogger.error(err);
            this.showToastRequestFailed();
            reject(err);
          }
        }).catch((err) => {
          this.unsuccessfulLog(method, param);
          this.kodiMethodsLogger.error(err);
          this.showToastRequestFailed();
        });
      });
    } else {
      this.unsuccessfulLog("Player", subcommand);
      this.showToastRequestFailed();
    }
  }
  playbackRegisterEvents(cb) {
    this.kodirpc.kodiRegisterEventListener("Player.OnPlay", cb);
    this.kodirpc.kodiRegisterEventListener("Player.OnPause", cb);
    this.kodirpc.kodiRegisterEventListener("Player.OnStop", cb);
  }
}
