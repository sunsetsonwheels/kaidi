"use strict"

function switchTheme() {
  try{
  let currentSelectedTheme = localStorage.getItem("beta.kaidi.theme");
  if(currentSelectedTheme == null) {
    localStorage.setItem("beta.kaidi.theme", "light");
  }
  let contentElements = document.querySelectorAll(".content");
  let softkeyBars = document.querySelectorAll(".softkeys-bar");
  switch(currentSelectedTheme) {
    case "light":
      for(var contentElement of contentElements) {
        contentElement.classList.remove("theme-content-dark");
        contentElement.classList.add("theme-content-light");
      }
      for(var softkeyBar of softkeyBars) {
        softkeyBar.classList.remove("theme-softkeys-dark");
        softkeyBar.classList.add("theme-softkeys-light");
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
      break;
    default:
      console.error("[switchTheme] Theme %s is not available. Switching back to light theme!" % (currentSelectedTheme));
      localStorage.setItem("beta.kaidi.theme", "light");
      for(var contentElement of contentElements) {
        contentElement.classList.remove("theme-content-dark");
        contentElement.classList.add("theme-content-light");
      }
      for(var softkeyBar of softkeyBars) {
        softkeyBar.classList.remove("theme-softkeys-dark");
        softkeyBar.classList.add("theme-softkeys-light");
      }
      break;
  }} catch(err) {console.error(err)}
}