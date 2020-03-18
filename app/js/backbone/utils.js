"use strict"

const KAIDI_ORIGIN = "beta.kaidi";

class LoggerFactory {
  constructor(moduleName) {
    this.logPrefix = "["+moduleName+"]";
    this.loggingEnabled = localStorage.getItem(KAIDI_ORIGIN+".debug");
    console.log("[LoggerFactory] LoggerFactory '"+moduleName+"' created.")
  }
  _getLogString(log) {
    return this.logPrefix+" "+String(log);
  }
  log(message) {
    if(this.loggingEnabled == "true") {
      console.debug(this._getLogString(message));
    }
  }
  error(error) {
    if(this.loggingEnabled == "true") {
      console.error(this._getLogString(error));
    }
  }
}

class SettingsManager {
  constructor() {
    this.settingsLogger = new LoggerFactory("SettingsManager");
  }
  set(key, value) {
    this.settingsLogger.log("Setting setting key '"+key+"' with value: "+value);
    if(key && value) {
      return localStorage.setItem(KAIDI_ORIGIN+"."+key, value);
    } else {
      throw new Error(this.LoggerFactory.error("Arguments not supplied!"));
    }
  }
  get(key) {
    this.settingsLogger.log("Getting setting key '"+key+"'.");
    if(key) {
      return localStorage.getItem(KAIDI_ORIGIN+"."+key);
    } else {
      throw new Error(this.LoggerFactory.error("Arguments not supplied!"));
    }
  }
  reset() {
    this.settingsLogger.log("Reseting settings and closing app.");
    localStorage.clear();
    window.close();
  }
}

let newToastLogger = new LoggerFactory("newToast");

function newToast(localizationKey, noLocalizationPlaceholder, toastPosition, toastTimeout, toastType) {
  newToastLogger.log("Creating new toast with localizationKey '"+localizationKey+"'.");
  navigator.mozL10n.formatValue(localizationKey).then((text) => {
    nativeToast({message: text,
                 position: toastPosition,
                 timeout: toastTimeout,
                 type: toastType});
    newToastLogger.log("Toast displayed successfully.");
  }).catch(() => {
    newToastLogger.log("Couldn't find localizationKey. Displaying toast with localizationPlaceholder.");
    nativeToast({message: noLocalizationPlaceholder,
                 position: toastPosition,
                 timeout: toastTimeout,
                 type: toastType});
    newToastLogger.log("Toast displayed successfully.");
  });
}

let pageNavLogger = new LoggerFactory("gotoPage");

function gotoPage(page) { 
  pageNavLogger.log("Going to page: "+page);
  pageNavLogger.log("Starting bluring transition animations.");
  document.body.classList.add("page-transition-blur-in");
  document.body.classList.remove("page-transition-blur-out");
  let adsEnabled = settings.get("ads");
  pageNavLogger.log("adsEnabled state: "+adsEnabled);
  setTimeout(() => {
    pageNavLogger.log("Changing page to: "+page);
    switch(page) {
      case "home":
        if(adsEnabled == "true") {
          window.location.assign("/app/ad.html#home");
        } else {
          window.location.assign("/app/home.html");
        }
        break;
      case "settings":
        if(adsEnabled == "true") {
          window.location.assign("/app/ad.html#settings");
        } else {
          window.location.assign("/app/settings.html");
        }
        break;
      case "player":
        if(adsEnabled == "true") {
          window.location.assign("/app/ad.html#player");
        } else {
          window.location.assign("/app/player.html");
        }
        break;
    }
  }, 680);
  
}

function arrivedAtPage() {
  pageNavLogger.log("Arrived at page. Removing transition animations.");
  document.body.classList.remove("page-transition-blur-in");
  document.body.classList.add("page-transition-blur-out");
}

let themeLogger = new LoggerFactory("switchTheme");

function switchTheme() {
  themeLogger.log("Switching theme.");
  let currentSelectedTheme = settings.get("theme");
  themeLogger.log("Currently selected theme: "+currentSelectedTheme);
  if(currentSelectedTheme == null) {
    settings.set("theme", "light");
  }
  let contentElements = document.querySelectorAll(".content");
  let softkeyBars = document.querySelectorAll(".softkeys-bar");
  let separatorElements = document.querySelectorAll(".separator");
  let settingsElements = document.querySelectorAll(".settings-entry");
  switch(currentSelectedTheme) {
    case "light":
      themeLogger.log("Changing .content to .theme-content-light");
      for(let contentElement of contentElements) {
        contentElement.classList.remove("theme-content-dark");
        contentElement.classList.add("theme-content-light");
      }
      themeLogger.log("Changing .softkeys-bar to .theme-softkeys-light");
      for(let softkeyBar of softkeyBars) {
        softkeyBar.classList.remove("theme-softkeys-dark");
        softkeyBar.classList.add("theme-softkeys-light");
      }
      themeLogger.log("Changing .separator to .theme-content-light");
      for(let separatorsElement of separatorElements) {
        separatorsElement.classList.remove("theme-separator-dark");
        separatorsElement.classList.add("theme-separator-light");
      };
      themeLogger.log("Changing .settings-entry to .theme-settings-light");
      for(let settingsElement of settingsElements) {
        settingsElement.classList.remove("theme-settings-dark");
        settingsElement.classList.add("theme-settings-light");
        settingsElement.children[1].classList.remove("theme-settings-dark");
        settingsElement.children[1].classList.add("theme-settings-light");
      }
      break;
    case "dark":
      themeLogger.log("Changing .content to .theme-content-dark");
      for(var contentElement of contentElements) {
        contentElement.classList.remove("theme-content-light");
        contentElement.classList.add("theme-content-dark");
      }
      themeLogger.log("Changing .softkeys-bar to .theme-softkeys-dark");
      for(var softkeyBar of softkeyBars) {
        softkeyBar.classList.remove("theme-softkeys-light");
        softkeyBar.classList.add("theme-softkeys-dark");
      }
      themeLogger.log("Changing .separator to .theme-content-dark");
      for(let separatorElement of separatorElements) {
        separatorElement.classList.remove("theme-separator-light");
        separatorElement.classList.add("theme-separator-dark");
      };
      themeLogger.log("Changing .settings-entry to .theme-settings-dark");
      for(let settingsElement of settingsElements) {
        settingsElement.classList.remove("theme-settings-light");
        settingsElement.classList.add("theme-settings-dark");
        settingsElement.children[1].classList.remove("theme-settings-light");
        settingsElement.children[1].classList.add("theme-settings-dark");
      }
      break;
    default:
      themeLogger.log("Theme '"+currentSelectedTheme+"' is not a valid theme. Switching back to light theme!");
      localStorage.setItem("beta.kaidi.theme", "light");
      switchTheme();
      break;
  }
}




