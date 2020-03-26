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
    window.close()
  }
}

var settings = new SettingsManager()

function newToast (localizationKey, noLocalizationPlaceholder, toastPosition, toastTimeout, toastType) {
  navigator.mozL10n.formatValue(localizationKey).then((text) => {
    nativeToast({
      message: text, 
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

function changeLocalization (htmlElement, localizationKey) {
  console.log('Localizing "' + htmlElement.id + '" with "' + localizationKey + '"')
  try {
    htmlElement.setAttribute('data-l10n-id', htmlElement.id + '-' + localizationKey)
  } catch (err) {
    htmlElement.setAttribute('data-l10n-id', localizationKey)
  }
}

function removeLocalization (htmlElement) {
  htmlElement.removeAttribute('data-l10n-id')
}

var softkeyElements = {
  'left': document.getElementById('softkey-left'),
  'center': document.getElementById('softkey-center'),
  'right': document.getElementById('softkey-right')
}

function updateSoftkeys (localizationKeyLeft, localizationKeyCenter, localizationKeyRight) {
  changeLocalization(softkeyElements.left, localizationKeyLeft)
  changeLocalization(softkeyElements.center, localizationKeyCenter)
  changeLocalization(softkeyElements.right, localizationKeyRight)
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