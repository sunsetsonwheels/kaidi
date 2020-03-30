//
// /app/js/player.js
//
// This file handles the tasks required for the operation of player.html
//
// (C) jkelol111 and contributors 2020. Licensed under GPLv3 license.
//

'use strict'

class KodiHomeController extends KodiMethods {
  constructor () {
    //
    // Initialize the KodiMethod class here.
    //
    super()
    this.isControlOptionsMenuOpen = false
    this.homeOptionsMenuElements = {
      container: document.getElementById('home-options-menu-container'),
      list: {
        root: document.getElementById('home-options-list'),
        inputText: document.getElementById('home-options-list-input'),
        goHome: document.getElementById('home-options-list-home'),
        exitKaidi: document.getElementById('home-options-list-exit')
      }
    }
    this.kodiRegisterEventListener('Input.OnInputRequested', this.promptInputText)
    this.homeOptionsMenuElements.list.inputText.onclick = () => {
      this.closeControlOptionsMenu()
      this.promptInputText()
    }
    this.homeOptionsMenuElements.list.goHome.onclick = () => {
      this.closeControlOptionsMenu()
      this.inputWrapper('Home')
    }
    this.homeOptionsMenuElements.list.exitKaidi.onclick = () => {
      this.closeControlOptionsMenu()
      newLocalizedConfirm('text-exit', 'Exit Kaidi Remote?').then(() => {
        window.close()
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
    newLocalizedPrompt('text-input', 'Input text').then((inputtedText) => {
      this.inputWrapper('SendText', {
        text: inputtedText,
        done: true
      })
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
      this.homeOptionsMenuElements.container.style.display = 'initial'
      updateSoftkeysLocalization('close', 'toggle', 'none')
      naviBoard.setNavigation(this.homeOptionsMenuElements.list.root.id)
      this.isControlOptionsMenuOpen = true
    }
  }

  closeControlOptionsMenu () {
    if (this.isControlOptionsMenuOpen) {
      naviBoard.destroyNavigation(this.homeOptionsMenuElements.list.root.id)
      this.homeOptionsMenuElements.container.style.display = 'none'
      updateSoftkeysLocalization('player', 'select', 'settings')
      this.isControlOptionsMenuOpen = false
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  switchTheme()
  arrivedAtPage()
  if (settings.get('ip') == null || settings.get('port') == null) {
    navigator.mozL10n.formatValue('welcome-text', { newline: '\n\n' }).then((text) => {
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
