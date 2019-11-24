"use strict"

document.addEventListener("DOMContentLoaded", () => {
  switchTheme();
  nativeToast({message: "Inititalization complete!",
               position: 'north',
               timeout: 3000,
               type: "success"});
});