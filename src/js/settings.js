var KAIDI_VERSION = null

class KodiSettingsController {
  constructor () {

    this.isDonateOptionsMenuOpen = false

    if (settings.get('ip') == null) settings.set('ip', '192.168.0.123')
    if (settings.get('port') == null) settings.set('port', '8080')
    if (settings.get('notify') == null) settings.set('notify', 'true')

    document.getElementById('ip').innerText = settings.get('ip')
    document.getElementById('ip').onfocus = () => {
      this.setKodiIPAndPort('ip')
    }
    document.getElementById('ip').onblur = () => {
      naviBoard.getActiveElement().focus()
    }
    document.getElementById('port').innerText = settings.get('port')
    document.getElementById('port').onfocus = () => {
      this.setKodiIPAndPort('port')
    }
    document.getElementById('port').onblur = () => {
      naviBoard.getActiveElement().focus()
    }
    document.getElementById('theme').value = settings.get('theme')
    document.getElementById('theme').onchange = (e) => {
      if (this.setSelectSettings('theme', e.target.value)) switchTheme()
    }
    document.getElementById('theme').onblur = () => {
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
    //
    // Get the Kodi version
    //
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
    document.getElementById('options-list-paypal').onclick = () => {
      window.open('https://paypal.me/jkelol111')
      this.closeDonateOptionsMenu()
    }
    document.getElementById('options-list-buymeacoffee').onclick = () => {
      window.open('https://buymeacoffee.com/jkelol111')
      this.closeDonateOptionsMenu()
    }
    naviBoard.setNavigation('settings-content')
  }

  showSettingChangeSuccess () {
    newLocalizedToast('toast-setting-change-succeed', 'Setting changed successfully!', 'north', 2000, 'success')
  }

  showSettingChangeFailed () {
    newLocalizedToast('toast-setting-change-failed', 'Setting change failed!', 'north', 2000, 'error')
  }

  setKodiIPAndPort (setting) {
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

  openDonateOptionsMenu () {
    if (!this.isDonateOptionsMenuOpen) {
      naviBoard.destroyNavigation('settings-content')
      document.getElementById('options-container').style.display = 'initial'
      updateSoftkeysLocalization('close', 'donate', 'none')
      naviBoard.setNavigation('options-list')
      this.isDonateOptionsMenuOpen = true
    }
  }

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
      case 'Enter':
        if (!setting.isDonateOptionsMenuOpen) {
          naviBoard.getActiveElement().children[1].focus()
        } else {
          naviBoard.getActiveElement().click()
        }
        break
    }
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
