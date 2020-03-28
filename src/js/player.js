//
// /app/js/player.js
//
// This file handles the tasks required for the operation of player.html
//
// (C) jkelol111 and contributors 2020. Licensed under The Unlicense.
//

'use strict'

//
// Class KodiPlayerTypeError (inherits: TypeError)
//
// The error to be triggered if the supplied data from Kodi does not align with any of the
// handleable values.
//

class KodiPlayerTypeError extends TypeError {
  constructor (arg, expected, got) {
    super('The supplied argument "' + arg + '" is not of expected values(s) "' + expected + '", got "' + got + '".')
    this.name = 'KodiTypeError'
  }
}

//
// Class KodiPlayerController (inherits: KodiMethods <-- KodiRPC)
//
// The class that basically controls the player view.
//

class KodiPlayerController extends KodiMethods {
  constructor () {
    //
    // Initialize the KodiMethod class here.
    //

    super()

    //
    // Variables Object playerPlayingInfoElements, Object playerPlayingPlaybackElements, Object playerOptionMenuElements
    //
    // Names of the HTML elements that are commonly used throughout this script.
    //

    this.playerPlayingInfoElements = {
      title: document.getElementById('player-playing-info-title'),
      artists: document.getElementById('player-playing-info-artists'),
      thumbnail: document.getElementById('player-playing-info-thumbnail')
    }
    this.playerPlayingPlaybackElements = {
      throbber: document.getElementById('throbber'),
      container: document.getElementById('player-playing-playback'),
      repeat: document.getElementById('player-playing-playback-repeat'),
      shuffle: document.getElementById('player-playing-playback-shuffle'),
      playbackDuration: document.getElementById('player-playing-playback-duration-text'),
      playbackMeter: document.getElementById('player-playing-playback-duration-meter')
    }
    this.playerOptionsMenuElements = {
      container: document.getElementById('player-options-menu-container'),
      list: document.getElementById('player-options-list'),
      repeat: document.getElementById('player-options-list-repeat'),
      shuffle: document.getElementById('player-options-list-shuffle')
    }

    //
    // Variable Boolean isPlaying, Boolean isPlaybackOptionsOpen, Function/null tickInterval
    //
    // isPlaying: Shows whether the player is playing or not, so we can act appropiately.
    //
    // isPlaybackOptionsOpen: Shows whether the playback options menu is open
    //
    // tickInterval: setTimeout() function if the player is playing, null if not.
    //

    this.isPlaying = false
    this.isPlaybackOptionsOpen = false
    this.timerInterval = null

    //
    // Initializes the player view for the first time. Only if a player is active
    // when this function is called will the app start sending information requests
    // to Kodi for populating the UI.
    //
    // From here onwards, we will rely on the events Kodi supplies us with (registered above),
    // to reduce the number of requests we have to make.
    //

    this._kodiGetActivePlayerMethodWrapper().then((response) => {
      this._methodWrapper('GetItem', {
        properties: ['title', 'artist', 'thumbnail'],
        playerid: response
      }).then((response2) => {
        console.log(JSON.stringify(response2))
        var playerInfoObject = {
          title: null,
          artists: null
        }
        if (response2.item.title) {
          playerInfoObject.title = response2.item.title
        } else if (response2.item.label) {
          playerInfoObject.title = response2.item.label
        }
        if (response2.item.artist) {
          playerInfoObject.artists = response2.item.artist
          console.log('Player artists: ' + JSON.stringify(response2.item.artist))
        }
        this.updatePlayerInfo(playerInfoObject)
        this.updatePlayerThumbnail(response2.item.thumbnail)
      })
      this._methodWrapper('GetProperties', {
        properties: ['speed', 'repeat', 'shuffled'],
        playerid: response
      }).then((response2) => {
        this.updatePlayerRepeat(response2.repeat)
        this.updatePlayerShuffle(response2.shuffled)
        this.updatePlayerPlayPause(response2.speed)
        this.playerPlayingPlaybackElements.throbber.style.display = 'none'
      })
    }).catch(() => {
      newToast('toast-playerinactive', 'No player active.', 'south', 3000, 'warning')
      this.blankPlayer()
    })

    //
    // Various Kodi event listeners wired up here...
    //

    this.kodiRegisterEventListener('Player.OnPlay', (message) => {
      this.playerPlayingPlaybackElements.throbber.style.display = 'initial'
      console.log('OnPlay: ' + JSON.stringify(message))
      var playerInfoObject = {}
      if (message.data.title) {
        playerInfoObject.title = message.data.title
      } else if (message.data.label) {
        playerInfoObject.title = message.data.label
      }
      this._kodiGetActivePlayerMethodWrapper().then((response) => {
        this._methodWrapper('GetItem', {
          properties: ['artist', 'thumbnail'],
          playerid: response
        }).then((response2) => {
          if (response2.item.artist) {
            playerInfoObject.artists = response2.item.artist
            console.log('Player artists: ' + JSON.stringify(response2.item.artist))
          }
          this.updatePlayerInfo(playerInfoObject)
          this.updatePlayerThumbnail(response2.item.thumbnail)
          this.playerPlayingPlaybackElements.throbber.style.display = 'none'
        })
      })
    })

    this.kodiRegisterEventListener('Player.OnPause', (message) => {
      this.updatePlayerPlayPause(message.data.player.speed)
    })

    this.kodiRegisterEventListener('Player.OnResume', (message) => {
      this.updatePlayerPlayPause(message.data.player.speed)
    })

    this.kodiRegisterEventListener('Player.OnStop', (message) => {
      this.updatePlayerPlayPause(0)
      this.blankPlayer()
    })
  }

  //
  // Function _methodWrapper(String subcommand, Object/undefined params)
  //
  // Wraps Player.* Kodi methods in an easily consumable manner (avoids repetition).
  //

  _methodWrapper (subcommand, params = undefined) {
    return new Promise((resolve, reject) => {
      this.kodiXmlHttpRequest('Player.' + subcommand, params).then((response) => {
        resolve(response)
      }).catch((err) => {
        this.methodErrorOut(err)
      })
    })
  }

  _kodiGetActivePlayerMethodWrapper () {
    return new Promise((resolve, reject) => {
      this._methodWrapper('GetActivePlayers').then((response) => {
        if (response[0]) {
          resolve(response[0].playerid)
        } else {
          reject(new Error())
        }
      })
    })
  }

  //
  // Function blankPlayer()
  //
  // Empties the player, returns it to not playing state.
  //
  // To be executed after ticker completes, Player.OnStop
  //

  blankPlayer () {
    updateSoftkeys('none', 'none', 'none')
    changeLocalization(this.playerPlayingInfoElements.title, 'none')
    changeLocalization(this.playerPlayingInfoElements.artists, 'none')
    this.playerPlayingPlaybackElements.container.style.visibility = 'hidden'
    this.playerPlayingInfoElements.thumbnail.src = '/icons/kaidi_112.png'
    this.playerPlayingPlaybackElements.throbber.style.display = 'none'
    clearInterval(this.timerInterval)
    this.isPlaying = false
  }

  //
  // Function tickTimer()
  //
  // The old-implementation from Kaidi Remote (Alpha) rewriten with KodiRPC in mind.
  //
  // Contacts Kodi for the time every one second. This is the default behaviour before
  // we have the new local ticking function sorted.
  //

  tickTimer () {
    if (document.visibilityState === 'visible') {
      this._kodiGetActivePlayerMethodWrapper().then((response) => {
        console.log("Test: "+response)
      })
      this._kodiGetActivePlayerMethodWrapper().then((response) => {
        this._methodWrapper('GetProperties', {
          properties: ['percentage', 'time', 'totaltime'],
          playerid: response
        }).then((response2) => {
          try {
            const TIME_IN = response2.time
            const TIME_OUT = response2.totaltime
            if (TIME_IN === TIME_OUT) {
              clearInterval(this.timerInterval)
              this.blankPlayer()
            } else {
              console.log("hey! t="+TIME_IN+";tt="+TIME_OUT)
              if (response2.time.hours > 0) {
                this.playerPlayingPlaybackElements.playbackDuration.innerText = response2.time.hours + ':' + ('0' + response2.time.minutes).slice(-2) + ':' + ('0' + response2.time.seconds).slice(-2) + '/' + response2.totaltime.hours + ':' + ('0' + response2.totaltime.minutes).slice(-2) + ('0' + response2.totaltime.seconds).slice(-2)
              } else {
                this.playerPlayingPlaybackElements.playbackDuration.innerText = ('0' + response2.time.minutes).slice(-2) + ':' + ('0' + response2.time.seconds).slice(-2) + '/' + ('0' + response2.totaltime.minutes).slice(-2) + ':' + ('0' + response2.totaltime.seconds).slice(-2)
              }
              this.playerPlayingPlaybackElements.playbackMeter.value = response2.percentage
            }
          } catch(err) {
            console.error(err)
          }
        })
      })
    }
  }

  //
  // Function updatePlayerInfo(String title, String artists)
  //
  // Update the player info (title and artists).
  //

  updatePlayerInfo (playerInfoObject) {
    if (typeof playerInfoObject.title === 'string') {
      removeLocalization(this.playerPlayingInfoElements.title)
      if (playerInfoObject.title !== '') {
        this.playerPlayingInfoElements.title.innerText = playerInfoObject.title
      } else {
        changeLocalization(this.playerPlayingInfoElements.title, 'none')
      }
    } else {
      changeLocalization(this.playerPlayingInfoElements.title, 'unavailable')
    }
    if (typeof playerInfoObject.artists === 'string') {
      removeLocalization(this.playerPlayingInfoElements.artists)
      if (playerInfoObject.artists !== '') {
        this.playerPlayingInfoElements.artists.innerText = playerInfoObject.artists
      } else {
        changeLocalization(this.playerPlayingInfoElements.artists, 'none')
      }
    } else {
      changeLocalization(this.playerPlayingInfoElements.artists, 'unavailable')
    }
  }

  //
  // Function updatePlayerThumbnail(String thumbnailUri)
  //
  // Gets and updates the player thumbnail from Kodi.
  //

  updatePlayerThumbnail (thumbnailUri) {
    this.kodiXmlHttpRequest('Files.PrepareDownload', {
      path: thumbnailUri
    }).then((response) => {
      // Not sure if this is right but whatever. I'm coding this at 1:15am.
      this.playerPlayingInfoElements.thumbnail.src = 'http://' + this.kodiIP + ':' + this.kodiPort + '/' + response.details.path
    })
  }

  //
  // Function updatePlayerPlayPause(Number playerSpeed)
  //
  // Update the Play/Pause controls and status of this Player view.
  //

  updatePlayerPlayPause (playerSpeed) {
    switch (playerSpeed) {
      case 0:
        this.isPlaying = false
        this.playerPlayingPlaybackElements.container.style.visibility = 'hidden'
        clearInterval(this.timerInterval)
        updateSoftkeys('none', 'play', 'none')
        break
      case 1:
        this.isPlaying = true
        this.playerPlayingPlaybackElements.container.style.visibility = 'initial'
        this.timerInterval = setInterval(this.tickTimer, 1000)
        updateSoftkeys('playback', 'pause', 'none')
        break
    }
  }

  //
  // Function updatePlayerRepeat(String repeatStatus)
  //
  // Update the Repeat controls and status of this Player view.
  //

  updatePlayerRepeat (repeatStatus) {
    switch (repeatStatus) {
      case 'off':
        this.playerPlayingPlaybackElements.repeat.src = 'icons/repeat-grey_24.png'
        break
      case 'one':
      case 'all':
        this.playerPlayingPlaybackElements.repeat.src = 'icons/repeat_24.png'
        break
      default:
        throw new KodiPlayerTypeError('repeatStatus', 'off, one, all', repeatStatus)
    }
    switch (repeatStatus) {
      case 'off':
        changeLocalization(this.playerOptionsMenuElements.repeat, 'one')
        break
      case 'one':
        changeLocalization(this.playerOptionsMenuElements.repeat, 'all')
        break
      case 'all':
        changeLocalization(this.playerOptionsMenuElements.repeat, 'off')
        break
      default:
        throw new KodiPlayerTypeError('repeatStatus', 'off, one, all', repeatStatus)
    }
  }

  //
  // Function updatePlayerShuffle(String shuffleStatus)
  //
  // Update the Shuffle controls and status of this Player view.
  //

  updatePlayerShuffle (shuffleStatus) {
    switch (shuffleStatus) {
      case true:
        this.playerPlayingPlaybackElements.shuffle.src = 'icons/shuffle_24.png'
        changeLocalization(this.playerOptionsMenuElements.shuffle, 'off')
        break
      case false:
        this.playerPlayingPlaybackElements.shuffle.src = 'icons/shuffle-grey_24.png'
        changeLocalization(this.playerOptionsMenuElements.shuffle, 'on')
        break
      default:
        throw new KodiPlayerTypeError('shuffleStatus', 'off, on', shuffleStatus)
    }
  }

  //
  // Function openPlaybackOptionsMenu()
  //
  // If the player is playing, and the options menu isn't opened yet will
  // this function be called in the keydown event listener.
  //

  openPlaybackOptionsMenu () {
    if (!this.isPlaybackOptionsOpen) {
      this.playerOptionsMenuElements.container.style.display = 'initial'
      updateSoftkeys('none', 'toggle', 'none')
      naviBoard.setNavigation(this.playerOptionsMenuElements.list)
      this.isPlaybackOptionsOpen = true
    }
  }

  //
  // Function closePlaybackOptionsMenu()
  //
  // If the options menu is opened, close it. This function be called in the
  // keydown event listener.
  //

  closePlaybackOptionsMenu () {
    if (this.isPlaybackOptionsOpen) {
      naviBoard.destroyNavigation(this.playerOptionsMenuElements.list)
      this.playerOptionsMenuElements.container.style.display = 'none'
      this._methodWrapper('GetActivePlayers').then((response) => {
        if (response[0]) {
          if (this.isPlaying) {
            this.updatePlayerPlayPause(1)
          } else {
            this.updatePlayerPlayPause(0)
          }
        } else {
          this.blankPlayer()
        }
        this.isPlaybackOptionsOpen = false
      })
    }
  }

  //
  // Function togglePlayPause()
  //
  // Toggles Kodi's Play/Pause state
  //

  togglePlayPause () {
    this._kodiGetActivePlayerMethodWrapper().then((response) => {
      this._methodWrapper('PlayPause', {
        play: 'toggle',
        playerid: response
      })
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  switchTheme()
  arrivedAtPage()
  var player = new KodiPlayerController()
  window.onkeydown = (e) => {
    switch (e.key) {
      case 'SoftLeft':
        player.openPlaybackOptionsMenu()
        break
      case 'Backspace':
        e.preventDefault()
        if (player.isPlaybackOptionsOpen) {
          player.closePlaybackOptionsMenu()
        } else {
          gotoPage('home')
        }
        break
      case 'ArrowUp':
        if (!player.isPlaybackOptionsOpen) {
          player.volume('increment')
        }
        break
      case 'ArrowDown':
        if (!player.isPlaybackOptionsOpen) {
          player.volume('decrement')
        }
        break
      case 'ArrowLeft':
        if (player.isPlaying) {
          //TODO: port code from 0.4.7.3
        }
        break
      case 'Enter':
        player.togglePlayPause()
        break
      case 'ArrowRight':
        if (player.isPlaying) {
          //TODO: port code from 0.4.7.3
        }
        break
    }
  }
})

window.onerror = (e) => {
  console.error(e)
}
