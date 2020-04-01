//
// /app/js/backbone/utils.js
//
// Contains utility functions used throughout the app
//
// (C) jkelol111 and contributors 2020. Licensed under The Unlicense.
//

'use strict'

const KAIDI_ORIGIN = 'beta.kaidi'

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

var settings = new SettingsManager()

function newLocalizedToast (localizationKey, noLocalizationPlaceholder, toastPosition, toastTimeout, toastType) {
  navigator.mozL10n.formatValue(localizationKey).then((localizedText) => {
    nativeToast({
      message: localizedText,
      position: toastPosition,
      timeout: toastTimeout,
      type: toastType
    })
  }).catch(() => {
    nativeToast({
      message: noLocalizationPlaceholder,
      position: toastPosition,
      timeout: toastTimeout,
      type: toastType
    })
  })
}

function changeElementLocalization (htmlElement, localizationKey) {
  try {
    navigator.mozL10n.setAttributes(htmlElement, htmlElement.id + '-' + localizationKey)
  } catch (err) {
    navigator.mozL10n.setAttributes(htmlElement, localizationKey)
  }
}

function removeElementLocalization (htmlElement) {
  htmlElement.removeAttribute('data-l10n-id')
}

function updateSoftkeysLocalization (localizationKeyLeft, localizationKeyCenter, localizationKeyRight) {
  changeElementLocalization(document.getElementById('softkey-left'), localizationKeyLeft)
  changeElementLocalization(document.getElementById('softkey-center'), localizationKeyCenter)
  changeElementLocalization(document.getElementById('softkey-right'), localizationKeyRight)
}

function gotoPage (page) {
  document.body.classList.add('page-transition-blur-in')
  document.body.classList.remove('page-transition-blur-out')
  const adsEnabled = settings.get('ads')
  setTimeout(() => {
    switch (page) {
      case 'home':
        if (adsEnabled === 'true') {
          window.location.assign('/ad.html#home')
        } else {
          window.location.assign('/home.html')
        }
        break
      case 'settings':
        if (adsEnabled === 'true') {
          window.location.assign('/ad.html#settings')
        } else {
          window.location.assign('/settings.html')
        }
        break
      case 'player':
        if (adsEnabled === 'true') {
          window.location.assign('/ad.html#player')
        } else {
          window.location.assign('/player.html')
        }
        break
    }
  }, 680)
}

function arrivedAtPage () {
  document.body.classList.remove('page-transition-blur-in')
  document.body.classList.add('page-transition-blur-out')
}

function switchTheme () {
  const currentSelectedTheme = settings.get('theme')
  if (currentSelectedTheme == null) {
    settings.set('theme', 'light')
  }
  var contentElements = document.querySelectorAll('.content')
  var softkeyBars = document.querySelectorAll('.softkeys-bar')
  var separatorElements = document.querySelectorAll('.separator')
  var settingsElements = document.querySelectorAll('.settings-entry')
  switch (currentSelectedTheme) {
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
      break
    default:
      settings.set('theme', 'light')
      switchTheme()
      break
  }
}
