"use strict"

document.addEventListener("DOMContentLoaded", () => {
  switchTheme();
  arrivedAtPage();
});

window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "Backspace":
      e.preventDefault();
      gotoPage("home");
      break;
  }
})