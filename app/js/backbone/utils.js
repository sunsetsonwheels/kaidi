"use strict"

const KAIDI_ORIGIN = "beta.kaidi";

class Logger {
  constructor(moduleName) {
    this.logPrefix = "["+moduleName+"]";
    this.loggingEnabled = localStorage.getItem(KAIDI_ORIGIN+".debug");
    console.log("[Logger] Logger '"+moduleName+"' created.")
  }
  log(message) {
    if(this.loggingEnabled == "true") {
      let displayedLog = this.logPrefix+" "+message;
      console.log(displayedLog);
      return displayedLog;
    }
  }
  error(error) {
    if(this.loggingEnabled == "true") {
      let displayedError = this.logPrefix+" "+error;
      console.error(displayedError);
      return displayedError;
    }
  }
}

class SettingsManager {
  constructor() {
    this.logger = new Logger("SettingsManager");
  }
  set(key, value) {
    this.logger.log("Setting setting key '"+key+"' with value: "+value);
    if(key && value) {
      return localStorage.setItem(KAIDI_ORIGIN+"."+key, value);
    } else {
      throw new Error(this.logger.error("Arguments not supplied!"));
    }
  }
  get(key) {
    this.logger.log("Getting setting key '"+key+"'.");
    if(key) {
      return localStorage.getItem(KAIDI_ORIGIN+"."+key);
    } else {
      throw new Error(this.logger.error("Arguments not supplied!"));
    }
  }
  reset() {
    this.logger.log("Reseting settings and closing app.");
    localStorage.clear();
    window.close();
  }
}

function newToast(localizationKey, noLocalizationPlaceholder, toastPosition, toastTimeout, toastType) {
  navigator.mozL10n.formatValue(localizationKey).then((text) => {
    nativeToast({message: text,
                 direction: toastPosition,
                 timeout: toastTimeout,
                 type: toastType});
  }).catch(() => {
    nativeToast({message: noLocalizationPlaceholder,
                 direction: toastPosition,
                 timeout: toastTimeout,
                 type: toastType});
  });
}




