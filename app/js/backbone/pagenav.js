function gotoPage(page) { 
  document.body.classList.add("blur-in");
  document.body.classList.remove("blur-out");
  setTimeout(() => {
    switch(page) {
      case "home":
        window.location.assign("/app/ad.html#home");
        break;
      case "settings":
        window.location.assign("/app/ad.html#settings");
        break;
      case "player":
        window.location.assign("/app/ad.html#player");
        break;
    }
  }, 680);
  
}

function arrivedAtPage() {
  document.body.classList.remove("blur-in");
  document.body.classList.add("blur-out");
}