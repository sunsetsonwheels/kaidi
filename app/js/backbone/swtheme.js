"use strict"

const themeLogger = new Logger("switchTheme");

function switchTheme() {
  themeLogger.log("Switching theme.");
  let currentSelectedTheme = settings.get("theme");
  themeLogger.log("Currently selected theme: "+currentSelectedTheme);
  if(currentSelectedTheme == null) {
    localStorage.setItem("beta.kaidi.theme", "light");
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
      console.error("[switchTheme] Theme %s is not available. Switching back to light theme!" % (currentSelectedTheme));
      localStorage.setItem("beta.kaidi.theme", "light");
      switchTheme();
      break;
  }
}