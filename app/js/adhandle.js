let adsEnabled = localStorage.getItem("alpha.kaidi.adsEnabled");

function handleLocationChange() {
  switch(window.location.hash) {
    case "home":
      window.location.assign("/apps/home.html");
      break;
    case "player":
      window.location.assign("/apps/player.html");
      break;
    case "settings":
      window.location.assign("/apps/settings.html")
      break;
    default:
      window.alert("Specified hash invalid. You will be redirected home.");
      window.location.assign("/apps/home.html");
      break;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  getKaiAd({publisher: 'c0dc495b-883a-4f7a-ac41-6e6cd754d52f',
            app: 'Kaidi Remote (Alpha)',
            slot: window.location.hash,
            timeout: 5000,
            onerror: err => handleLocationChange(),
            onready: ad => {
              ad.call("display");
              handleLocationChange();
            }
          });
});