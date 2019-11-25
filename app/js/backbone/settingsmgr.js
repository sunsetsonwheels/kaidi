"use strict"

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
}