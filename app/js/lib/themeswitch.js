function switchTheme() {
  let currentSelectedTheme = localStorage.getItem("beta.kaidi.theme");
  switch(currentSelectedTheme) {
    case "light":
      break;
    case "dark":
      break;
    case "system":
      break;
    default:
      console.error("[switchTheme] Theme %s is not available." % (currentSelectedTheme));
      break;
  }
}