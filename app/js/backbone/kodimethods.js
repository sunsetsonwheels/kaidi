class KodiMethods {
  constructor() {
    this.kodiMethodsLogger = new Logger("KodiMethods");
    this.kodi = new KodiRPC();
  }
  successfulLog(cls, method) {
    this.kodiMethodsLogger.log(cls+" command triggered for: "+method);
  }
  unsuccessfulLog(cls, method) {
    this.kodiMethodsLogger.error(cls+" command not triggered for: "+method);
  }
  showToastRequestFailed() {
    navigator.mozL10n.formatValue("requestfailed-text").then((text) => {
      nativeToast({message: text,
                   type: "success",
                   direction: "north",
                   timeout: 2000});
    }).catch(() => {
      nativeToast({message: "Kodi request failed!",
                   type: "success",
                   direction: "north",
                   timeout: 2000});
    });
  }
  input(direction) {
    if(["Up", "Down", "Right", "Left", "Select", "Home"].indexOf(direction) > -1) {
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
}
