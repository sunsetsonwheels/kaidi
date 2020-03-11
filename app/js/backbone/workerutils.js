"use strict"


class Logger {
  constructor(moduleName) {
    this.logPrefix = "["+moduleName+"]";
    console.log("[WorkerLogger] Logger '"+moduleName+"' created.")
  }
  log(message) {
    let displayedLog = this.logPrefix+" "+message;
    console.log(displayedLog);
    return displayedLog;
  }
  error(error) {
    let displayedError = this.logPrefix+" "+error;
    console.error(displayedError);
    return displayedError;
  }
}