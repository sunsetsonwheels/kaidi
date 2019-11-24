"use strict"

function handleLocationChange() {
  switch(window.location.hash) {
    case "#home":
      window.location.assign("/app/home.html");
      break;
    case "#player":
      window.location.assign("/app/player.html");
      break;
    case "#settings":
      window.location.assign("/app/settings.html");
      break;
    default:
      window.alert("[handleLocationChange] Specified hash invalid. You will be redirected home.");
      window.location.assign("/app/home.html");
      break;
  }
}

console.log(window.location);

document.addEventListener("DOMContentLoaded", () => {
  let adsEnabled = localStorage.getItem("beta.kaidi.adsEnabled");
  if(adsEnabled == "true") {
    getKaiAd({publisher: 'c0dc495b-883a-4f7a-ac41-6e6cd754d52f',
              app: 'Kaidi Remote (Beta)',
              slot: window.location.hash,
              timeout: 5000,
              onerror: err => {
                console.log("Ad display error: "+err);
                handleLocationChange();
              },
              onready: ad => {
                ad.call("display");
                ad.on("close", () => handleLocationChange());
              }
            });
  } else if(adsEnabled == null) {
    localStorage.setItem("beta.kaidi.adsEnabled", true);
    window.alert("Hello, it looks like it's your first time here. \
                  We show ads for monetization purposes, but if \
                  you want to opt out of ads, go to:\n\n\
                  Settings -> Enable monetization.\n\n\
                  If you do find the ads intrusive of your experience, \
                  please file an issue at github.com/jkelol111/kaidi/issues.");
    handleLocationChange();
  }
});