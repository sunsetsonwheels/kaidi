var KAIDI_VERSION = null

class KodiSettingsController {
  constructor () {
    this.settingsElements = {
      ip: document.getElementById('setting-ip'),
      port: document.getElementById('setting-port'),
      theme: document.getElementById('setting-theme'),
      notify: document.getElementById('setting-notify'),
      ads: document.getElementById('setting-ads'),
      donate: document.getElementById('setting-donate'),
      version: document.getElementById('setting-version')
    }
    this.settingsOptionsMenuElements = {
      container: document.getElementById('settings-options-menu-container'),
      list: {
        root: document.getElementById('settings-options-list'),
        donate: {
          paypal: document.getElementById('settings-options-list-paypal'),
          buymeacoffee: document.getElementById('settings-options-list-buymeacoffee')
        }
      }
    }

    this.isDonateOptionsMenuOpen = false

    if (settings.get('ip') == null) settings.set('ip', '192.168.0.123')
    if (settings.get('port') == null) settings.set('port', '8080')
    if (settings.get('notify') == null) settings.set('notify', 'true')

    this.settingsElements.ip.innerText = settings.get('ip')
    this.settingsElements.port.innerText = settings.get('port')
    this.settingsElements.theme.value = settings.get('theme')
    this.settingsElements.theme.onchange = (e) => {
      if (this.setSelectSettings('theme', e.target.value)) switchTheme()
    }
    this.settingsElements.notify.value = settings.get('notify')
    this.settingsElements.notify.onchange = (e) => {
      this.setSelectSettings('notify', e.target.value)
    }
    this.settingsElements.ads.value = settings.get('ads')
    this.settingsElements.ads.onchange = (e) => {
      if (e.target.value === 'false') {
        navigator.mozL10n.formatValue('text-donate', {
          newline: '\n\n'
        }).then((text) => {
          alert(text)
        }).catch(() => {
          alert('Please donate to us at:\n\n- https://paypal.me/jkelol111\n\n- https://buymeacoffee.com/jkelol111')
        })
      }
      this.setSelectSettings('ads', e.target.value)
    }
    fetch('/manifest.webapp')
      .then(responseRaw => responseRaw.text())
      .then(responseText => JSON.parse(responseText).version)
      .then(version => {
        KAIDI_VERSION = version
        navigator.mozL10n.formatValue('setting-version-prefix').then((str) => {
          this.settingsElements.version.innerText = str + ' ' + version
        }).catch(() => {
          this.settingsElements.version.innerText = 'version ' + version
        })
      })
    this.settingsElements.version.onfocus = () => {
      navigator.mozL10n.formatValue('text-about', {
        version: KAIDI_VERSION,
        newline: '\n\n'
      }).then((localizedText) => {
        alert(localizedText)
      }).catch(() => {
        alert('Kaidi Remote version ' + KAIDI_VERSION)
      })
    }
    this.settingsElements.ip.onfocus = () => {
      this.setKodiIPAndPort('ip')
    }
    this.settingsElements.port.onfocus = () => {
      this.setKodiIPAndPort('port')
    }
    this.settingsElements.donate.onfocus = () => {
      this.openDonateOptionsMenu()
    }
    this.settingsOptionsMenuElements.list.donate.paypal.onclick = () => {
      this.closeDonateOptionsMenu()
      window.open('https://paypal.me/jkelol111')
    }
    this.settingsOptionsMenuElements.list.donate.buymeacoffee.onclick = () => {
      this.closeDonateOptionsMenu()
      window.open('https://buymeacoffee.com/jkelol111')
    }
    for (var settingsElement in this.settingsElements) {
      this.settingsElements[settingsElement].onblur = () => {
        naviBoard.getActiveElement().focus()
      }
    }
    naviBoard.setNavigation('settings-content')
  }

  showSettingChangeSuccess () {
    newLocalizedToast('setting-change-succeed', 'Setting changed successfully!', 'north', 2000, 'success')
  }

  showSettingChangeFailed () {
    newLocalizedToast('setting-change-failed', 'Setting change failed!', 'north', 2000, 'error')
  }

  setKodiIPAndPort (setting) {
    newLocalizedPrompt('setting-' + setting + '-title', 'Kodi ' + setting).then((answer) => {
      try {
        settings.set(setting, answer)
        this.showSettingChangeSuccess()
        this.settingsElements[setting].innerText = settings.get(setting)
      } catch (err) {
        this.showSettingChangeFailed()
      }
    }).catch(() => {
      this.showSettingChangeFailed()
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

  openDonateOptionsMenu () {
    if (!this.isDonateOptionsMenuOpen) {
      naviBoard.destroyNavigation('settings-content')
      this.settingsOptionsMenuElements.container.style.display = 'initial'
      updateSoftkeysLocalization('close', 'donate', 'none')
      naviBoard.setNavigation(this.settingsOptionsMenuElements.list.root.id)
      this.isDonateOptionsMenuOpen = true
    }
  }

  closeDonateOptionsMenu () {
    if (this.isDonateOptionsMenuOpen) {
      naviBoard.destroyNavigation(this.settingsOptionsMenuElements.list.root.id)
      this.settingsOptionsMenuElements.container.style.display = 'none'
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
          newLocalizedConfirm('text-confirm-reset-settings', 'Reset the app settings? You will lose all of the app settings! The app will close.').then(() => {
            settings.reset()
          })
        }
        break
      case 'Enter':
        if (!setting.isDonateOptionsMenuOpen) {
          naviBoard.getActiveElement().children[1].focus()
        } else {
          naviBoard.getActiveElement().click()
        }
        break
      case 'Up':
      case 'Down':
        if (!setting.isDonateOptionsMenuOpen) {
          naviBoard.getActiveElement().scrollIntoView(true)
        }
        break
    }
    switch (naviBoard.getActiveElement().children[1].id) {
      case 'setting-donate':
        updateSoftkeysLocalization('back', 'donate', 'reset')
        break
      case 'setting-version':
        updateSoftkeysLocalization('back', 'about', 'reset')
        break
      default:
        updateSoftkeysLocalization('back', 'edit', 'reset')
        break
    }
  }
})
