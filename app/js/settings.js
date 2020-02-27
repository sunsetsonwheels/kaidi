let KAIDI_VERSION = null;

function showToastSuccess() {
  navigator.mozL10n.formatValue("setting-change-succeed").then((str) => {
    nativeToast({message: str,
                 position: "north",
                 timeout: 3000,
                 type: "success"});
  }).catch(() => {
    nativeToast({message: "Setting changed successfully!",
                 position: "north",
                 timeout: 3000,
                 type: "success"});
  });
}

function showToastFailed() {
  navigator.mozL10n.formatValue("setting-change-failed").then((str) => {
    nativeToast({message: str,
                 position: "north",
                 timeout: 3000,
                 type: "error"});
  }).catch(() => {
    nativeToast({message: "Setting change failed!",
                 position: "north",
                 timeout: 3000,
                 type: "error"});
  });
}

function changeKodiSettings(setting) {
  navigator.mozL10n.formatValue("setting-"+setting+"-title").then((str) => {
    let newValue = prompt(str+":");
    try {
      if(newValue != null) {
        settings.set(setting, newValue);
        showToastSuccess();
      }
      document.getElementById("setting-"+setting).textContent = settings.get(setting);
    } catch(err) {
      showToastFailed();
    }
  }).catch((err) => {
    alert("Localization not available. '"+setting+"' cannot be changed at the moment.");
  })
}

function changeSelectSettings(setting, value) {
  try {
    settings.set(setting, value);
    showToastSuccess();
    return true;
  } catch(err) {
    showToastFailed();
    return false
  }
}


document.addEventListener("DOMContentLoaded", () => {
  switchTheme();
  naviBoard.setNavigation("settings-content");
  for(let settingsElement of document.querySelectorAll(".settings-entry")) {
    settingsElement.children[1].addEventListener("blur", () => {
      naviBoard.getActiveElement().focus();
    })
  }
  if(settings.get("ip") == null) settings.set("ip", "192.168.0.123");
  if(settings.get("port") == null) settings.set("port", "8080");
  if(settings.get("notify") == null) settings.set("notify", "true");
  document.getElementById("setting-ip").textContent = settings.get("ip");
  document.getElementById("setting-ip").addEventListener("focus", () => {
    changeKodiSettings("ip");
  });
  document.getElementById("setting-port").textContent = settings.get("port");
  document.getElementById("setting-port").addEventListener("focus", () => {
    changeKodiSettings("port");
  });
  document.getElementById("setting-theme").value = settings.get("theme");
  document.getElementById("setting-theme").addEventListener("change", (e) => {
    if(changeSelectSettings("theme", e.target.value)) switchTheme();
  })
  document.getElementById("setting-notify").value = settings.get("notify");
  document.getElementById("setting-notify").addEventListener("change", (e) => {
    changeSelectSettings("notify", e.target.value);
  })
  document.getElementById("setting-ads").value= settings.get("ads");
  document.getElementById("setting-ads").addEventListener("change", (e) => {
    if(e.target.value == "false") {
      navigator.mozL10n.formatValue("donate-text").then((text) => {
        alert(text);
      }).catch(() => {
        alert("Please donate to us: paypal.me/jkelol111");
      })
    }
    changeSelectSettings("ads", e.target.value);
  })
  fetch('/manifest.webapp')
  .then(responseRaw => responseRaw.text())
  .then(responseText => JSON.parse(responseText).version)
  .then(version => {
    KAIDI_VERSION = version;
    navigator.mozL10n.formatValue("setting-about-prefix").then(str => {
      document.getElementById("settings-version").textContent = str+" "+version;
    })
    .catch(() => {
      document.getElementById("setting-version").textContent = "version "+version;
    });
  });
  document.getElementById("setting-version").addEventListener("focus", () => {
    navigator.mozL10n.formatValue("about-text", {"version": KAIDI_VERSION,
                                                 "newline": "\n\n"})
    .then((text) => {
      window.alert(text);
    }).catch((err) => {
      window.alert("Kaidi Remote version "+KAIDI_VERSION);
    })
  });
  arrivedAtPage();
});

window.addEventListener("keydown", (e) => {
  switch(e.key) {
    case "SoftLeft":
      gotoPage("home");
      break;
    case "SoftRight":
      navigator.mozL10n.formatValue("confirm-reset-settings").then((str) => {
        if(confirm(str)) {
          settings.reset();
        }
      });
      break;
    case "Enter":
      naviBoard.getActiveElement().children[1].focus();
      break;
    case "Up":
    case "Down":
      naviBoard.getActiveElement().scrollIntoView(true);
      break;
  }
});