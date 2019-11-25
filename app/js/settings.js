document.addEventListener("DOMContentLoaded", () => {
  switchTheme();
  naviBoard.setNavigation("settings-content");
  nativeToast({message: "Initialization complete!",
              position: 'south',
              timeout: 3000,
              type: "success"});
  arrivedAtPage();
});

window.addEventListener("keydown", (e) => {
  switch(e.key) {
    case "SoftLeft":
      gotoPage("home");
      break;
    case "SoftRight":
      navigator.mozL10n.formatValue("confirm-reset-settings").then(str => {
        if(confirm(str)) {
          settings.reset();
        }
      });
  }
});