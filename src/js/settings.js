/*

/js/settings.js

This file handles the tasks required for the operation of settings.html

(C) jkelol111 and contributors 2018-present. Licensed under GPLv3 license.

*/

/*

String/null KAIDI_VERSION: the version from the app manifest. null if we cannot fetch
the app manifest.

*/
var KAIDI_VERSION = null

/*

Class KodiSettingsController

CLass controlling settings.html and handles app setting management tasks.

*/

class KodiSettingsController {
  constructor () {
    // Boolean isDonateOptionsMenuOpen: Shows whether the donate options menu is open.
    this.isDonateOptionsMenuOpen = false

    // Sets the initial values of basic configuration if it isn't.
    if (settings.get('ip') == null) settings.set('ip', '192.168.0.123')
    if (settings.get('port') == null) settings.set('port', '8080')
    if (settings.get('authentication') == null) settings.set('authentication', 'false')
    if (settings.get('username') == null) settings.set('username', 'kodi')
    if (settings.get('port') == null) settings.set('password', '')
    if (settings.get('ssl') == null) settings.set('ssl', 'false')
    if (settings.get('notify') == null) settings.set('notify', 'true')

    // Event listeners for the settings elements.
    document.getElementById('ip').innerText = settings.get('ip')
    document.getElementById('ip').onfocus = () => {
      this.setKodiConnectionSettings('ip')
    }
    document.getElementById('ip').onblur = () => {
      naviBoard.getActiveElement().focus()
    }
    document.getElementById('port').innerText = settings.get('port')
    document.getElementById('port').onfocus = () => {
      this.setKodiConnectionSettings('port')
    }
    document.getElementById('port').onblur = () => {
      naviBoard.getActiveElement().focus()
    }
    document.getElementById('authentication').value = settings.get('authentication')
    document.getElementById('authentication').onchange = (e) => {
      this.setSelectSettings('authentication', e.target.value)
      this.setAuthenticationSettingsVisibility()
      // Refresh navigation after showing/hiding username and password.
      // Needs to be called twice to always preserve focus (naviboard bug?)
      naviBoard.refreshNavigation('settings-content', 'destroy')
      naviBoard.refreshNavigation('settings-content', 'destroy')
    }
    document.getElementById('authentication').onblur = () => {
      naviBoard.getActiveElement().focus()
    }
    this.setAuthenticationSettingsVisibility()
    document.getElementById('username').innerText = settings.get('username')
    document.getElementById('username').onfocus = () => {
      this.setKodiConnectionSettings('username')
    }
    document.getElementById('username').onblur = () => {
      naviBoard.getActiveElement().focus()
    }
    document.getElementById('password').innerText = settings.get('password')
    document.getElementById('password').onfocus = () => {
      this.setKodiConnectionSettings('password')
    }
    document.getElementById('password').onblur = () => {
      naviBoard.getActiveElement().focus()
    }
    document.getElementById('ssl').value = settings.get('ssl')
    document.getElementById('ssl').onchange = (e) => {
      this.setSelectSettings('ssl', e.target.value)
    }
    document.getElementById('ssl').onblur = () => {
      naviBoard.getActiveElement().focus()
    }
    document.getElementById('theme').value = settings.get('theme')
    document.getElementById('theme').onchange = (e) => {
      if (this.setSelectSettings('theme', e.target.value)) switchTheme()
    }
    document.getElementById('theme').onblur = () => {
      naviBoard.getActiveElement().focus()
    }

    document.getElementById('animations').value = settings.get('animations')
    document.getElementById('animations').onchange = (e) => {
      this.setSelectSettings('animations', e.target.value)
    }
    document.getElementById('animations').onblur = () => {
      naviBoard.getActiveElement().focus()
    }

    document.getElementById('notify').value = settings.get('notify')
    document.getElementById('notify').onchange = (e) => {
      this.setSelectSettings('notify', e.target.value)
    }
    document.getElementById('notify').onblur = () => {
      naviBoard.getActiveElement().focus()
    }
    document.getElementById('ads').value = settings.get('ads')
    document.getElementById('ads').onchange = (e) => {
      if (e.target.value === 'false') {
        // Beg for a donation if ads are disabled. Nag once and forget. /s
        navigator.mozL10n.formatValue('text-donate', {
          newline: '\n\n'
        }).then((localizedText) => {
          alert(localizedText)
        }).catch(() => {
          alert('Please donate to us at:\n\n- https://paypal.me/jkelol111\n\n- https://buymeacoffee.com/jkelol111')
        })
      }
      this.setSelectSettings('ads', e.target.value)
    }
    document.getElementById('ads').onblur = () => {
      naviBoard.getActiveElement().focus()
    }
    document.getElementById('donate').onfocus = () => {
      this.openDonateOptionsMenu()
    }
    document.getElementById('donate').onblur = () => {
      naviBoard.getActiveElement().focus()
    }
    document.getElementById('version').onfocus = () => {
      navigator.mozL10n.formatValue('text-about', {
        version: KAIDI_VERSION,
        newline: '\n\n'
      }).then((localizedText) => {
        alert(localizedText)
      }).catch(() => {
        alert('Kaidi Remote version' + KAIDI_VERSION)
      })
    }
    document.getElementById('version').onblur = () => {
      naviBoard.getActiveElement().focus()
    }
    // Gets the app version from the manifest and stores it into KAIDI_VERSION.
    fetch('/manifest.webapp')
      .then(responseRaw => responseRaw.text())
      .then(responseText => JSON.parse(responseText).version)
      .then(version => {
        KAIDI_VERSION = version
        navigator.mozL10n.formatValue('version-secondary').then((str) => {
          document.getElementById('version').innerText = str + ' ' + version
        }).catch(() => {
          document.getElementById('version').innerText = 'version ' + version
        })
      })
    // Event listeners for the donaet options menu elements.
    document.getElementById('options-list-paypal').onclick = () => {
      window.open('https://paypal.me/jkelol111')
      this.closeDonateOptionsMenu()
    }
    document.getElementById('options-list-buymeacoffee').onclick = () => {
      window.open('https://buymeacoffee.com/jkelol111')
      this.closeDonateOptionsMenu()
    }
    // Everything has started nicely, T - 0 time!
    naviBoard.setNavigation('settings-content')
  }

  /*

  Function showSettingChangeSuccess ()
  Shows a toast message when a setting is changed successfully.

  */
  showSettingChangeSuccess () {
    newLocalizedToast('toast-setting-change-succeed', 'Setting changed successfully!', 'north', 2000, 'success')
  }

  /*

  Function showSettingChangeFailed ()
  Shows a toast message when a setting changed failed.

  */

  showSettingChangeFailed () {
    newLocalizedToast('toast-setting-change-failed', 'Setting change failed!', 'north', 2000, 'error')
  }

  /*

  Function setKodiConnectionSettings (String setting)

  Opens a prompt and saves the IP, port, username or password of Kodi upon focus on the
  respective setting elements

  */

  setKodiConnectionSettings (setting) {
    navigator.mozL10n.formatValue(setting + '-title').then((localizedText) => {
      var input = prompt(localizedText + ':')
      if (input) {
        settings.set(setting, input)
        this.showSettingChangeSuccess()
        document.getElementById(setting).innerText = settings.get(setting)
      }
    }).catch(() => {
      var input = prompt('Kodi' + setting + ':')
      if (input) {
        settings.set(setting, input)
        this.showSettingChangeSuccess()
        document.getElementById(setting).innerText = settings.get(setting)
      }
    })
  }

  /*

  Function setSelectSettings (String setting, String value)

  Saves the value of a setting. Used with the <select> kind of settings.

  */

  setSelectSettings (setting, value) {
    try {
      settings.set(setting, value)
      this.showSettingChangeSuccess()
      return true
    } catch (err) {
      this.showSettingChangeFailed()
      console.error(err)
      return false
    }
  }

  /*

  Function setAuthenticationSettingsVisibility ()

  Sets the visibility of the username and password settings based on whether
  authentication is enabled.

  */

  setAuthenticationSettingsVisibility () {
    if (settings.get('authentication') === 'true') {
      document.getElementById('settings-entry-username').classList.remove('hidden')
      document.getElementById('settings-entry-username').classList.add('settings-entry', 'navigable')
      document.getElementById('settings-entry-password').classList.remove('hidden')
      document.getElementById('settings-entry-password').classList.add('settings-entry', 'navigable')
    } else {
      document.getElementById('settings-entry-username').classList.remove('settings-entry', 'navigable')
      document.getElementById('settings-entry-username').classList.add('hidden')
      document.getElementById('settings-entry-password').classList.remove('settings-entry', 'navigable')
      document.getElementById('settings-entry-password').classList.add('hidden')
    }
  }

  /*

  Function confirmResetSettings ()

  Opens a confirm dialog, and if agreed to, resets the app's settings and closes the app.

  */

  confirmResetSettings () {
    navigator.mozL10n.formatValue('text-confirm-reset-settings').then((localizedText) => {
      if (confirm(localizedText)) {
        settings.reset()
        window.close()
      }
    }).catch(() => {
      if (confirm('Reset all app settings? The app will close.')) {
        settings.reset()
        window.close()
      }
    })
  }

  /*

  Function openDonateOptionsMenu()

  Opens the donate options menu if it isn't opened yet.

  */

  openDonateOptionsMenu () {
    if (!this.isDonateOptionsMenuOpen) {
      naviBoard.destroyNavigation('settings-content')
      document.getElementById('options-container').style.display = 'initial'
      updateSoftkeysLocalization('close', 'donate', 'none')
      naviBoard.setNavigation('options-list')
      this.isDonateOptionsMenuOpen = true
    }
  }

  /*

  Function closeDonateOptionsMenu()

  Closes the donate options menu if it is already opened.

  */

  closeDonateOptionsMenu () {
    if (this.isDonateOptionsMenuOpen) {
      naviBoard.destroyNavigation('options-list')
      document.getElementById('options-container').style.display = 'none'
      updateSoftkeysLocalization('back', 'donate', 'reset')
      naviBoard.setNavigation('settings-content')
      this.isDonateOptionsMenuOpen = false
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  switchTheme()
  arrivedAtPage()
  var setting = new KodiSettingsController()
  window.onkeydown = (e) => {
    switch (e.key) {
      case 'SoftLeft':
        if (!setting.isDonateOptionsMenuOpen) {
          gotoPage('home')
        } else {
          setting.closeDonateOptionsMenu()
        }
        break
      case 'SoftRight':
        if (!setting.isDonateOptionsMenuOpen) {
          setting.confirmResetSettings()
        }
        break
      case 'ArrowUp':
        naviBoard.getActiveElement().scrollIntoView({
          block: 'start'
        })
        break
      case 'ArrowDown':
        naviBoard.getActiveElement().scrollIntoView({
          block: 'end'
        })
        break
      case 'Enter':
        if (!setting.isDonateOptionsMenuOpen) {
          naviBoard.getActiveElement().children[1].focus()
        } else {
          naviBoard.getActiveElement().click()
        }
        break
    }
    // Changes the center softkey label on some special setting elements.
    switch (naviBoard.getActiveElement().children[1].id) {
      case 'donate':
        updateSoftkeysLocalization('back', 'donate', 'reset')
        break
      case 'version':
        updateSoftkeysLocalization('back', 'about', 'reset')
        break
      default:
        updateSoftkeysLocalization('back', 'edit', 'reset')
        break
    }
  }
})
