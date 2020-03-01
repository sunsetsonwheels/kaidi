class KodiMethods {
  constructor() {
    this.kodiMethodsLogger = new Logger("KodiMethods");
    this.kodi = new KodiRPC();
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
    this.kodi.kodiXmlHttpRequest("JSONRPC.Ping").then((response) => {
      try {
        try {
          if (response["result"] == "pong") {
            newToast("kodi-connection-established-text", "Connection to Kodi successful!", "south", 2000, "success");
          } else {
            this.showToastResponseUndetermined();
          }
        } catch (err) {
          this.showToastResponseUndetermined();
        }
      } catch (err) {
        this.showToastResponseUndetermined();
      }
    }).catch(() => {
      this.showToastRequestFailed();
    })
  }
  input(direction) {
    if(["Up", "Down", "Right", "Left", "Select", "Home", "Back"].indexOf(direction) > -1) {
      this.kodi.kodiXmlHttpRequest("Input."+direction).then(() => {
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
  volume(direction) {
    if(["increment", "decrement", "mute"].indexOf(direction) > -1) {
      if ( direction == "mute" ) {
         var method = "Application.SetMute";
         var param = { "mute": "toggle" };
      } else {
         var method = "Application.SetVolume";
         var param = { "volume": direction };
      }
      this.kodi.kodiXmlHttpRequest(method, param).then(() => {
        this.kodi.kodiXmlHttpRequest("Application.GetProperties", {"properties": ["volume"]})
        .then((response) => {
          document.querySelector("#meter-volume").value = response["result"]["volume"];
          this.successfulLog("Input", direction);
          document.querySelector(".volume-hud-greyout").classList.remove("volume-hud-transition-hide");
          document.querySelector(".volume-hud-greyout").classList.add("volume-hud-transition-appear");
          setTimeout(() => {
            document.querySelector(".volume-hud-greyout").classList.remove("volume-hud-transition-appear");
            document.querySelector(".volume-hud-greyout").classList.add("volume-hud-transition-hide");
          }, 1500);
        }).catch((err) => {
          this.unsuccessfulLog(method, param);
          this.kodiMethodsLogger.error(err);
          this.showToastRequestFailed();
        });
      }).catch((err) => {
        this.unsuccessfulLog(method, param);
        this.kodiMethodsLogger.error(err);
        this.showToastRequestFailed();
      });
    } else {
      this.unsuccessfulLog(method, param);
      this.showToastRequestFailed();
    }
  }
}
