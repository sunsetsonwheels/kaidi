/*

/js/backbone/kodirpc.js

This file is reponsible for the communcation with the Kodi device.

(C) jkelol111 and contributors 2020. Licensed under the GPLv3 license.

*/

// We're strict here because my Asian mom told me so /s.
'use strict'

/*

Class KodiPlayerController <-- KodiMethods <-- KodiRPC

CLass controlling home.html and handles Kodi control related events and tasks.

*/

class KodiHomeController extends KodiMethods {
  constructor () {
    // Inititalize the KodiMethods parent class.
    super()
    this.isControlOptionsMenuOpen = false
    this.kodiRegisterEventListener('Input.OnInputRequested', () => {
      this.promptInputText()
    })
    document.getElementById('options-list-input').onclick = () => {
      this.closeControlOptionsMenu()
      this.promptInputText()
    }
    document.getElementById('options-list-home').onclick = () => {
      this.closeControlOptionsMenu()
      this.inputWrapper('Home')
    }
    document.getElementById('options-list-exit').onclick = () => {
      this.closeControlOptionsMenu()
      navigator.mozL10n.formatValue('text-exit').then((localizedText) => {
        if (confirm(localizedText)) {
          window.close()
        }
      }).catch(() => {
        if (confirm('Exit Kaidi Remote?')) {
          window.close()
        }
      })
    }
  }

  inputWrapper (subcommand, params = undefined) {
    return new Promise((resolve, reject) => {
      this.kodiXmlHttpRequest('Input.' + subcommand, params).then((response) => {
        resolve(response)
      }).catch((err) => {
        this.methodErrorOut(err)
      })
    })
  }

  promptInputText () {
    navigator.mozL10n.formatValue('text-input').then((localizedText) => {
      var inputtedText = prompt(localizedText + ':')
      if (inputtedText) {
        this.inputWrapper('SendText', {
          text: inputtedText,
          done: true
        })
      }
    }).catch(() => {
      var inputtedText = prompt('Input text:')
      if (inputtedText) {
        this.inputWrapper('SendText', {
          text: inputtedText,
          done: true
        })
      }
    })
  }

  toggleFullScreen () {
    this.kodiXmlHttpRequest('GUI.SetFullscreen', {
      fullscreen: 'toggle'
    }).catch((err) => {
      this.methodErrorOut(err)
    })
  }

  openControlOptionsMenu () {
    if (!this.isControlOptionsMenuOpen) {
      document.getElementById('options-container').style.display = 'initial'
      updateSoftkeysLocalization('close', 'toggle', 'none')
      naviBoard.setNavigation('options-list')
      this.isControlOptionsMenuOpen = true
    }
  }

  closeControlOptionsMenu () {
    if (this.isControlOptionsMenuOpen) {
      naviBoard.destroyNavigation('options-list')
      document.getElementById('options-container').style.display = 'none'
      updateSoftkeysLocalization('player', 'select', 'settings')
      this.isControlOptionsMenuOpen = false
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  switchTheme()
  arrivedAtPage()
  if (settings.get('ip') == null || settings.get('port') == null) {
    navigator.mozL10n.formatValue('text-welcome', { newline: '\n\n' }).then((text) => {
      alert(text)
      gotoPage('settings')
    }).catch(() => {
      alert('Please input the IP address and port of your device in the next page!')
      gotoPage('settings')
    })
  }
  var home = new KodiHomeController()
  window.onkeydown = (e) => {
    switch (e.key) {
      case 'SoftLeft':
        if (!home.isControlOptionsMenuOpen) {
          gotoPage('player')
        } else {
          home.closeControlOptionsMenu()
        }
        break
      case 'SoftRight':
        if (!home.isControlOptionsMenuOpen) {
          gotoPage('settings')
        }
        break
      case 'ArrowUp':
        if (!home.isControlOptionsMenuOpen) {
          home.inputWrapper('Up')
        }
        break
      case 'ArrowLeft':
        if (!home.isControlOptionsMenuOpen) {
          home.inputWrapper('Left')
        }
        break
      case 'ArrowRight':
        if (!home.isControlOptionsMenuOpen) {
          home.inputWrapper('Right')
        }
        break
      case 'ArrowDown':
        if (!home.isControlOptionsMenuOpen) {
          home.inputWrapper('Down')
        }
        break
      case 'Enter':
        if (home.isControlOptionsMenuOpen) {
          naviBoard.getActiveElement().click()
        } else {
          home.inputWrapper('Select')
        }
        break
      case 'Call':
        if (!home.isControlOptionsMenuOpen) {
          home.inputWrapper('Back')
        }
        break
      case '1':
        if (!home.isControlOptionsMenuOpen) {
          home.inputWrapper('Home')
        }
        break
      case '2':
        if (!home.isControlOptionsMenuOpen) {
          home.inputWrapper('ContextMenu')
        }
        break
      case '3':
        if (!home.isControlOptionsMenuOpen) {
          home.toggleFullScreen()
        }
        break
      case '5':
        if (!home.isControlOptionsMenuOpen) {
          home.volumeWrapper('increment')
        }
        break
      case '8':
        if (!home.isControlOptionsMenuOpen) {
          home.volumeWrapper('decrement')
        }
        break
      case '6':
        if (!home.isControlOptionsMenuOpen) {
          home.volumeWrapper('mute')
        }
        break
      case '#':
        home.openControlOptionsMenu()
        break
    }
  }
})

window.onerror = (err) => {
  console.debug(err)
}
