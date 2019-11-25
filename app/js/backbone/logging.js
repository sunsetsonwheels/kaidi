"use strict"

class Logger {
  constructor(moduleName) {
    this.logPrefix = "["+moduleName+"]";
    this.loggingEnabled = localStorage.getItem(KAIDI_ORIGIN+".debug");
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
      let displayedError = this.logPrefix+" "+this.error.message;
      console.error(displayedError);
      return displayedError;
    }
  }
}