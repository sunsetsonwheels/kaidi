/*

/js/backbone/utils.js

This file contains common functions used throughout the app.

(C) jkelol111 and contributors 2020. Licensed under the GPLv3 license.

*/

// We're strict here because my Asian mom told me so /s.
'use strict'

// String KAIDI_ORIGIN: the origin of the app.
// I can fetch it from the manifest but it is a waste of time.
const KAIDI_ORIGIN = 'kaidiremote'

/*

Class SettingsManager

Modify Kaidi settings with localStorage with a shorter syntax.

*/

class SettingsManager {
  set (key, value) {
    return localStorage.setItem(KAIDI_ORIGIN + '.' + key, value)
  }

  get (key) {
    return localStorage.getItem(KAIDI_ORIGIN + '.' + key)
  }

  reset () {
    localStorage.clear()
  }
}

// Creates a SettingsManager for use throughout the app.
var settings = new SettingsManager()

/*

Function newLocalizedToast (String localizationKey, String noLocalizationPlaceholder, String toastPosition, Number toastTimerout, String toastType)

Creates a new nativeToast with the localized text or the non-available substitute.

*/
function newLocalizedToast (localizationKey, noLocalizationPlaceholder, toastPosition, toastTimeout, toastType) {
  navigator.mozL10n.formatValue(localizationKey).then((localizedText) => {
    kaiosToaster({
      message: localizedText,
      position: toastPosition,
      timeout: toastTimeout,
      type: toastType
    })
  }).catch(() => {
    kaiosToaster({
      message: noLocalizationPlaceholder,
      position: toastPosition,
      timeout: toastTimeout,
      type: toastType
    })
  })
}

/*

Function changeElementLocalization (HTMLElement htmlElement, String localizationKey)

Localizes the text content of the provided HTMLElement with the localizationKey using one of these two methods:
- Use the app-standardized localization schema (HTMLElement.id + localizationKey).
- Use the localizationKey directly because app-standardized localization is not available.

*/

function changeElementLocalization (htmlElement, localizationKey) {
  try {
    navigator.mozL10n.setAttributes(htmlElement, htmlElement.id + '-' + localizationKey)
  } catch (err) {
    navigator.mozL10n.setAttributes(htmlElement, localizationKey)
  }
}

/*

Function removeElementLocalization (HTMLElement htmlElement)

Removes the localization attribute of the given HTMLElement so we can write text directly into the HTMLElement.

*/

function removeElementLocalization (htmlElement) {
  htmlElement.removeAttribute('data-l10n-id')
}

/*

Function updateSoftkeysLocalization (String localizationKeyLeft, String localizationKeyCenter, String localizationKeyRight)

Localizes the softkey button labels.

*/

function updateSoftkeysLocalization (localizationKeyLeft, localizationKeyCenter, localizationKeyRight) {
  changeElementLocalization(document.getElementById('softkey-left'), localizationKeyLeft)
  changeElementLocalization(document.getElementById('softkey-center'), localizationKeyCenter)
  changeElementLocalization(document.getElementById('softkey-right'), localizationKeyRight)
}

/*

Function gotoPage (String page)

Navigates to the given page with ads or none, depending on settings.

*/

function gotoPage (page) {
  if (settings.get('animations') === 'false') {
    document.body.classList.add('page-transitions-disable')
  }
  document.body.classList.add('page-transition-blur-in')
  document.body.classList.remove('page-transition-blur-out')

  setTimeout(() => {
    if (settings.get('ads') === 'true') {
      switch (page) {
        case 'home':
          window.location.assign('/ad.html#home')
          break
        case 'settings':
          window.location.assign('/ad.html#settings')
          break
        case 'player':
          window.location.assign('/ad.html#player')
          break
      }
    } else {
      switch (page) {
        case 'home':
          window.location.assign('/home.html')
          break
        case 'settings':
          window.location.assign('/settings.html')
          break
        case 'player':
          window.location.assign('/player.html')
          break
      }
    }
  }, 680)
}

/*

Function arrivedAtPage ()

Remove the 'blur' on the page when page navigation has completed successfully.

*/

function arrivedAtPage () {
  if (settings.get('animations') === 'false') {
    document.body.classList.add('page-transitions-disable')
  }
  document.body.classList.remove('page-transition-blur-in')
  document.body.classList.add('page-transition-blur-out')
}

/*

Function switchTheme ()

Switches to the set theme, or applies a default theme if there is no theme set in the settings.

*/

function switchTheme () {
  var contentElements = document.querySelectorAll('.content')
  var softkeyBars = document.querySelectorAll('.softkeys-bar')
  var separatorElements = document.querySelectorAll('.separator')
  var settingsElements = document.querySelectorAll('.settings-entry')
  var optionMenuElements = document.querySelectorAll('.options-menu')
  switch (settings.get('theme')) {
    case 'light':
      for (var contentElement of contentElements) {
        contentElement.classList.remove('theme-content-dark')
        contentElement.classList.add('theme-content-light')
      }
      for (var softkeyBar of softkeyBars) {
        softkeyBar.classList.remove('theme-softkeys-dark')
        softkeyBar.classList.add('theme-softkeys-light')
      }
      for (var separatorsElement of separatorElements) {
        separatorsElement.classList.remove('theme-separator-dark')
        separatorsElement.classList.add('theme-separator-light')
      }
      for (var settingsElement of settingsElements) {
        settingsElement.classList.remove('theme-settings-dark')
        settingsElement.classList.add('theme-settings-light')
        settingsElement.children[1].classList.remove('theme-settings-dark')
        settingsElement.children[1].classList.add('theme-settings-light')
      }
      for (var optionMenuElement of optionMenuElements) {
        optionMenuElement.children[0].classList.remove('theme-options-menu-title-dark')
        optionMenuElement.children[0].classList.add('theme-options-menu-title-light')
        optionMenuElement.children[1].classList.remove('theme-options-menu-list-dark')
        optionMenuElement.children[1].classList.add('theme-options-menu-list-light')
      }
      break
    case 'dark':
      for (var contentElement of contentElements) {
        contentElement.classList.remove('theme-content-light')
        contentElement.classList.add('theme-content-dark')
      }
      for (var softkeyBar of softkeyBars) {
        softkeyBar.classList.remove('theme-softkeys-light')
        softkeyBar.classList.add('theme-softkeys-dark')
      }
      for (var separatorElement of separatorElements) {
        separatorElement.classList.remove('theme-separator-light')
        separatorElement.classList.add('theme-separator-dark')
      }
      for (var settingsElement of settingsElements) {
        settingsElement.classList.remove('theme-settings-light')
        settingsElement.classList.add('theme-settings-dark')
        settingsElement.children[1].classList.remove('theme-settings-light')
        settingsElement.children[1].classList.add('theme-settings-dark')
      }
      for (var optionMenuElement of optionMenuElements) {
        optionMenuElement.children[0].classList.remove('theme-options-menu-title-light')
        optionMenuElement.children[0].classList.add('theme-options-menu-title-dark')
        optionMenuElement.children[1].classList.remove('theme-options-menu-list-light')
        optionMenuElement.children[1].classList.add('theme-options-menu-list-dark')
      }
      break
    default:
      settings.set('theme', 'light')
      switchTheme()
      break
  }
}
