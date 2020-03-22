"use strict"

const KAIDI_ORIGIN = "beta.kaidi";

class SettingsManager {
  constructor() {}
  set(key, value) {
    return localStorage.setItem(KAIDI_ORIGIN+"."+key, value);
  }
  get(key) {
    return localStorage.getItem(KAIDI_ORIGIN+"."+key);
  }
  reset() {
    localStorage.clear();
    window.close();
  }
}

var settings = new SettingsManager();

function newToast(localizationKey, noLocalizationPlaceholder, toastPosition, toastTimeout, toastType) {
  navigator.mozL10n.formatValue(localizationKey).then((text) => {
    nativeToast({message: text,
                 position: toastPosition,
                 timeout: toastTimeout,
                 type: toastType});
  }).catch(() => {
    nativeToast({message: noLocalizationPlaceholder,
                 position: toastPosition,
                 timeout: toastTimeout,
                 type: toastType});
  });
}


function gotoPage(page) {
  document.body.classList.add("page-transition-blur-in");
  document.body.classList.remove("page-transition-blur-out");
  let adsEnabled = settings.get("ads");
  setTimeout(() => {
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
  document.body.classList.remove("page-transition-blur-in");
  document.body.classList.add("page-transition-blur-out");
}


function switchTheme() {
  let currentSelectedTheme = settings.get("theme");
  if(currentSelectedTheme == null) {
    settings.set("theme", "light");
  }
  let contentElements = document.querySelectorAll(".content");
  let softkeyBars = document.querySelectorAll(".softkeys-bar");
  let separatorElements = document.querySelectorAll(".separator");
  let settingsElements = document.querySelectorAll(".settings-entry");
  switch(currentSelectedTheme) {
    case "light":
      for(let contentElement of contentElements) {
        contentElement.classList.remove("theme-content-dark");
        contentElement.classList.add("theme-content-light");
      }
      for(let softkeyBar of softkeyBars) {
        softkeyBar.classList.remove("theme-softkeys-dark");
        softkeyBar.classList.add("theme-softkeys-light");
      }
      for(let separatorsElement of separatorElements) {
        separatorsElement.classList.remove("theme-separator-dark");
        separatorsElement.classList.add("theme-separator-light");
      };
      for(let settingsElement of settingsElements) {
        settingsElement.classList.remove("theme-settings-dark");
        settingsElement.classList.add("theme-settings-light");
        settingsElement.children[1].classList.remove("theme-settings-dark");
        settingsElement.children[1].classList.add("theme-settings-light");
      }
      break;
    case "dark":
      for(var contentElement of contentElements) {
        contentElement.classList.remove("theme-content-light");
        contentElement.classList.add("theme-content-dark");
      }
      for(var softkeyBar of softkeyBars) {
        softkeyBar.classList.remove("theme-softkeys-light");
        softkeyBar.classList.add("theme-softkeys-dark");
      }
      for(let separatorElement of separatorElements) {
        separatorElement.classList.remove("theme-separator-light");
        separatorElement.classList.add("theme-separator-dark");
      };
      for(let settingsElement of settingsElements) {
        settingsElement.classList.remove("theme-settings-light");
        settingsElement.classList.add("theme-settings-dark");
        settingsElement.children[1].classList.remove("theme-settings-light");
        settingsElement.children[1].classList.add("theme-settings-dark");
      }
      break;
    default:
      settings.set("theme", "light");
      switchTheme();
      break;
  }
}




