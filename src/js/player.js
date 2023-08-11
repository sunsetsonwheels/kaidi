/*

/js/player.js

This file handles the tasks required for the operation of player.html

(C) jkelol111 and contributors 2018-present. Licensed under GPLv3 license.

*/

// We're strict here because my Asian mom told me so /s.
'use strict'

/*

Class KodiPlayerTypeError <-- TypeError

This class represents the error:
'The supplied data from Kodi does not align with any of the handleable values.'

Class constructor arguments:
- String arg: Name of the argument triggering this error.
- String expected: List of the applicable values of the argument.
- String got: The value of the argument triggering the error.

*/

class KodiPlayerTypeError extends TypeError {
  constructor (arg, expected, got) {
    super('The supplied argument "' + arg + '" is not of expected values(s) "' + expected + '", got "' + got + '".')
    this.name = 'KodiTypeError'
  }
}

/*

tasktimer TaskTimer

TaskTimer for use with Kodi timer.

*/

const { TaskTimer } = tasktimer

/*

Class KodiPlayerController <-- KodiMethods <-- KodiRPC

CLass controlling player.html and handles Kodi player related events and tasks.

*/

class KodiPlayerController extends KodiMethods {
  constructor () {
    // Inititalize the KodiMethods parent class.
    super()

    /*
    Boolean isPlaying: Shows whether the player is playing or not, so we can act appropiately.

    Boolean isPlaybackOptionsOpen: Shows whether the playback options menu is open.
    */

    this.isPlaying = false
    this.isPlaybackOptionsOpen = false

    /*
    Initializes the player view for the first time. Only if a player is active
    when this function is called will the app start sending information requests
    to Kodi for populating the UI.

    From here onwards, we will rely on the events Kodi supplies us with (registered above),
    to reduce the number of requests we have to make.
    */

    this.getKodiActivePlayers().then((activePlayer) => {
      this.playerWrapper('GetItem', {
        properties: ['title', 'artist', 'thumbnail'],
        playerid: activePlayer
      }).then((response) => {
        var playerInfoObject = {}
        if (response.item.title) {
          playerInfoObject.title = response.item.title
        } else if (response.item.label) {
          playerInfoObject.title = response.item.label
        }
        if (response.item.artist) {
          playerInfoObject.artists = response.item.artist
        }
        if (response.item.thumbnail) {
          playerInfoObject.thumbnail = response.item.thumbnail
        }
        this.updatePlayerInfo(playerInfoObject)
      })
      this.playerWrapper('GetProperties', {
        properties: ['speed', 'repeat', 'shuffled'],
        playerid: activePlayer
      }).then((response) => {
        this.updatePlayerRepeat(response.repeat)
        this.updatePlayerShuffle(response.shuffled)
        this.updatePlayerPlayPause(response.speed)
        document.getElementById('throbber').style.display = 'none'
      }).catch(() => {
        this.blankPlayer()
      })
    }).catch(() => {
      newLocalizedToast('toast-player-inactive', 'No player active.', 'south', 3000, 'warning')
      this.blankPlayer()
    })

    /*

    Various Kodi event listeners are wired up in here:
    - Player.OnPlay: When Kodi starts playing something new.
    - Player.OnPause: When Kodi's player is paused.
    - Player.OnResume: When Kodi's player is resumed.
    - Player.OnStop: When Kodi's player is stopped (no longer playing something).
    - Player.OnPropertyChanged: When Kodi's repeat/shuffled status changes.

    NOTE: Kodi has a bug where where sometimes events aren't sent. There are remedies in
          this app to combat this; however, maybe I should report it to the Kodi
          developers sooner of later.

    */

    this.kodiRegisterEventListener('Player.OnPlay', (message) => {
      this.blankPlayer()
      document.getElementById('throbber').style.display = 'initial'
      this.getKodiActivePlayers().then((activePlayer) => {
        this.playerWrapper('GetItem', {
          properties: ['title', 'artist', 'thumbnail'],
          playerid: activePlayer
        }).then((response) => {
          var playerInfoObject = {}
          if (response.item.title) {
            playerInfoObject.title = response.item.title
          } else if (response.item.label) {
            playerInfoObject.title = response.item.label
          }
          if (response.item.artist) {
            playerInfoObject.artists = response.item.artist
          }
          if (response.item.thumbnail) {
            playerInfoObject.thumbnail = response.item.thumbnail
          }
          this.updatePlayerInfo(playerInfoObject)
          document.getElementById('throbber').style.display = 'none'
        })
      })
      this.updatePlayerPlayPause(message.data.player.speed)
    })

    this.kodiRegisterEventListener('Player.OnPause', (message) => {
      this.updatePlayerPlayPause(message.data.player.speed)
    })

    this.kodiRegisterEventListener('Player.OnResume', (message) => {
      this.updatePlayerPlayPause(message.data.player.speed)
    })

    this.kodiRegisterEventListener('Player.OnStop', () => {
      this.updatePlayerPlayPause(0)
      this.blankPlayer()
    })

    this.kodiRegisterEventListener('Player.OnPropertyChanged', (message) => {
      if ('repeat' in message.data.property) {
        this.updatePlayerRepeat(message.data.property.repeat)
      } else if ('shuffled' in message.data.property) {
        this.updatePlayerShuffle(message.data.property.shuffled)
      }
    })

    /*
    Kodi info ticking timer (in testing)

    (We have to poll the time because Kodi JSON-RPC interface still doesn't have a time change event).
    */

    this.timer = new TaskTimer(2000)
    this.timer.on('tick', () => {
      if (document.visibilityState === 'visible') {
        this.getKodiActivePlayers().then((activePlayer) => {
          this.playerWrapper('GetProperties', {
            properties: ['percentage', 'time', 'totaltime'],
            playerid: activePlayer
          }).then((response) => {
            document.getElementById('duration-text').innerText = response.time.hours + ':' + ('0' + response.time.minutes).slice(-2) + ':' + ('0' + response.time.seconds).slice(-2) + '/' + response.totaltime.hours + ':' + ('0' + response.totaltime.minutes).slice(-2) + ':' + ('0' + response.totaltime.seconds).slice(-2)
            document.getElementById('duration-meter').value = response.percentage
          })
        })
      }
    })

    /*

    Playback option menu list element event listeners are wired up in here:

    NOTE: Kodi has a bug where where sometimes events aren't sent. There are remedies in
          this app to combat this; however, maybe I should report it to the Kodi
          developers sooner of later.

    */

    document.getElementById('options-list-repeat').onclick = () => {
      this.getKodiActivePlayers().then((activePlayer) => {
        this.playerWrapper('SetRepeat', {
          repeat: 'cycle',
          playerid: activePlayer
        }).then(() => {
          this.closePlaybackOptionsMenu()
          // Patch for Kodi sometimes not firing events.
          this.getKodiActivePlayers().then((activePlayer) => {
            this.playerWrapper('GetProperties', {
              properties: ['repeat'],
              playerid: activePlayer
            }).then((response) => {
              this.updatePlayerRepeat(response.repeat)
            })
          })
        })
      })
    }

    document.getElementById('options-list-shuffle').onclick = () => {
      this.getKodiActivePlayers().then((activePlayer) => {
        this.playerWrapper('SetShuffle', {
          shuffle: 'toggle',
          playerid: activePlayer
        }).then(() => {
          this.closePlaybackOptionsMenu()
          // Patch for Kodi sometimes not firing events.
          this.getKodiActivePlayers().then((activePlayer) => {
            this.playerWrapper('GetProperties', {
              properties: ['shuffled'],
              playerid: activePlayer
            }).then((response) => {
              this.updatePlayerRepeat(response.shuffled)
            })
          })
        })
      })
    }
  }

  /*

  Function playerWrapper(String subcommand, Object/undefined params)

  Wraps Player.* Kodi methods in an easily consumable manner (avoids repetition).

  Returns: Promise (resolve: Object, reject Error)

  */

  playerWrapper (subcommand, params = undefined) {
    return new Promise((resolve, reject) => {
      this.kodiXmlHttpRequest('Player.' + subcommand, params).then((response) => {
        resolve(response)
      }).catch((err) => {
        this.methodErrorOut(err)
        reject(err)
      })
    })
  }

  /*

  Function getKodiActivePlayers()

  Wraps Player.GetActivePlayer method in an easily consumable manner (avoids repetition).

  Returns Promise (resolve: Number, reject: Error)

  */

  getKodiActivePlayers () {
    return new Promise((resolve, reject) => {
      this.playerWrapper('GetActivePlayers').then((response) => {
        if (response[0]) {
          resolve(response[0].playerid)
        } else {
          reject(new Error())
        }
      })
    })
  }

  /*

  Function blankPlayer()

  Empties the player, returns it to not playing state

  To be executed on Player.OnStop, or when no player is active.

  */

  blankPlayer () {
    updateSoftkeysLocalization('none', 'none', 'none')
    changeElementLocalization(document.getElementById('title'), 'none')
    changeElementLocalization(document.getElementById('artists'), 'none')
    document.getElementById('playing-status').style.visibility = 'hidden'
    document.getElementById('thumbnail').src = '/icons/kaidi_112.png'
    document.getElementById('throbber').style.display = 'none'
    this.timer.stop()
    this.isPlaying = false
  }

  /*

  Function updatePlayerInfo(Object playerInfoObject)

  Update the player info (title, artists and thumbnail).

  */

  updatePlayerInfo (playerInfoObject) {
    if (typeof playerInfoObject.title === 'string') {
      removeElementLocalization(document.getElementById('title'))
      if (playerInfoObject.title !== '') {
        document.getElementById('title').innerText = playerInfoObject.title
      } else {
        changeElementLocalization(document.getElementById('title'), 'none')
      }
    } else {
      changeElementLocalization(document.getElementById('title'), 'unavailable')
    }
    if (typeof playerInfoObject.artists === 'object') {
      removeElementLocalization(document.getElementById('artists'))
      if (playerInfoObject.artists.length > 0) {
        var displayedArtists = ''
        for (var artist of playerInfoObject.artists) {
          if (displayedArtists !== '') {
            displayedArtists += ', ' + artist
          } else {
            displayedArtists += artist
          }
        }
        document.getElementById('artists').innerText = displayedArtists
      } else {
        changeElementLocalization(document.getElementById('artists'), 'none')
      }
    } else {
      changeElementLocalization(document.getElementById('artists'), 'unavailable')
    }
    if (typeof playerInfoObject.thumbnail === 'string') {
      this.kodiXmlHttpRequest('Files.PrepareDownload', {
        path: playerInfoObject.thumbnail
      }).then((response) => {
        document.getElementById('thumbnail').src = 'http://' + this.kodiIP + ':' + this.kodiPort + '/' + response.details.path
      })
    }
  }

  /*

  Function updatePlayerPlayPause(Number playerSpeed)

  Update the Play/Pause controls and status of this player.

  */

  updatePlayerPlayPause (playerSpeed) {
    this.timer.stop()
    switch (playerSpeed) {
      case 0:
        this.isPlaying = false
        document.getElementById('playing-status').style.visibility = 'hidden'
        updateSoftkeysLocalization('previous', 'play', 'next')
        break
      case 1:
        this.isPlaying = true
        document.getElementById('playing-status').style.visibility = 'initial'
        this.timer.start()
        updateSoftkeysLocalization('previous', 'pause', 'next')
        break
      default:
        throw new KodiPlayerTypeError('playerSpeed', '0, 1', playerSpeed)
    }
  }

  /*

  Function updatePlayerRepeat(String repeatStatus)

  Update the Repeat controls and status of this player.

  */

  updatePlayerRepeat (repeatStatus) {
    switch (repeatStatus) {
      case 'off':
        document.getElementById('repeat').src = 'icons/repeat-grey_24.png'
        break
      case 'one':
      case 'all':
        document.getElementById('repeat').src = 'icons/repeat_24.png'
        break
      default:
        throw new KodiPlayerTypeError('repeatStatus', 'off, one, all', repeatStatus)
    }
    switch (repeatStatus) {
      case 'off':
        changeElementLocalization(document.getElementById('options-list-repeat'), 'all')
        break
      case 'all':
        changeElementLocalization(document.getElementById('options-list-repeat'), 'one')
        break
      case 'one':
        changeElementLocalization(document.getElementById('options-list-repeat'), 'off')
        break
      default:
        throw new KodiPlayerTypeError('repeatStatus', 'off, one, all', repeatStatus)
    }
  }

  /*

  Function updatePlayerShuffle(String shuffleStatus)

  Update the Shuffle controls and status of this player.

  */

  updatePlayerShuffle (shuffleStatus) {
    switch (shuffleStatus) {
      case true:
        document.getElementById('shuffle').src = 'icons/shuffle_24.png'
        changeElementLocalization(document.getElementById('options-list-shuffle'), 'off')
        break
      case false:
        document.getElementById('shuffle').src = 'icons/shuffle-grey_24.png'
        changeElementLocalization(document.getElementById('options-list-shuffle'), 'on')
        break
      default:
        throw new KodiPlayerTypeError('shuffleStatus', 'off, on', shuffleStatus)
    }
  }

  /*

  Function openPlaybackOptionsMenu()

  If the player is playing, and the options menu isn't opened yet will
  this function is called in the keydown event listener.

  */

  openPlaybackOptionsMenu () {
    if (!this.isPlaybackOptionsOpen) {
      document.getElementById('options-container').style.display = 'initial'
      updateSoftkeysLocalization('none', 'toggle', 'none')
      naviBoard.setNavigation(document.getElementById('options-list').id)
      this.isPlaybackOptionsOpen = true
    }
  }

  /*

  Function closePlaybackOptionsMenu()

  If the options menu is opened, close it. This function is called in the
  keydown event listener.

  */

  closePlaybackOptionsMenu () {
    if (this.isPlaybackOptionsOpen) {
      naviBoard.destroyNavigation(document.getElementById('options-list').id)
      document.getElementById('options-container').style.display = 'none'
      this.playerWrapper('GetActivePlayers').then((response) => {
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

  /*

  Function togglePlayPause()

  Toggles Kodi's Play/Pause state

  */

  togglePlayPause () {
    this.getKodiActivePlayers().then((activePlayer) => {
      this.playerWrapper('PlayPause', {
        play: 'toggle',
        playerid: activePlayer
      }).then((response2) => {
        // Patch for Kodi sometimes not firing events.
        this.updatePlayerPlayPause(response2.speed)
      })
    })
  }

  /*

  Function goForward()

  Skips one item ahead in the Kodi playlist.

  */

  goForward () {
    this.getKodiActivePlayers().then((activePlayer) => {
      this.playerWrapper('GoTo', {
        to: 'next',
        playerid: activePlayer
      })
    })
  }

  /*

  Function seekForward()

  Seeks the player forward by a small margin. Hooked up to keyup event, if
  the time difference is >= 40, this function will be invoked.

  */

  seekForward () {
    this.getKodiActivePlayers().then((activePlayer) => {
      this.playerWrapper('Seek', {
        value: { step: 'smallforward' },
        playerid: activePlayer
      })
    })
  }

  /*

  Function goBackward()

  Goes back one item ahead in the Kodi playlist.

  */

  goBackward () {
    this.getKodiActivePlayers().then((activePlayer) => {
      this.playerWrapper('GoTo', {
        to: 'previous',
        playerid: activePlayer
      })
    })
  }

  /*

  Function seekBackward()

  Seeks the player backwards by a small margin. Hooked up to keyup event, if
  the time difference is >= 40, this function will be invoked.

  */

  seekBackward () {
    this.getKodiActivePlayers().then((activePlayer) => {
      this.playerWrapper('Seek', {
        value: { step: 'smallbackward' },
        playerid: activePlayer
      })
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  switchTheme()
  arrivedAtPage()
  var player = new KodiPlayerController()
  var interval = null
  window.onkeydown = (e) => {
    switch (e.key) {
      case 'Call':
        if (player.isPlaying) {
          player.openPlaybackOptionsMenu()
        }
        break
      case 'Backspace':
        e.preventDefault()
        if (player.isPlaybackOptionsOpen) {
          player.closePlaybackOptionsMenu()
        } else {
          player.kodiCloseEventWorker()
          // Tiny wait so the worker can close, if it doesn't close in time, we force it.
          setTimeout(() => {
            gotoPage('home')
          }, 100)
        }
        break
      case 'ArrowUp':
        if (!player.isPlaybackOptionsOpen) {
          player.volumeWrapper('increment')
        }
        break
      case 'ArrowDown':
        if (!player.isPlaybackOptionsOpen) {
          player.volumeWrapper('decrement')
        }
        break
      case 'ArrowRight':
        if (!interval) {
          player.seekForward()
          interval = setInterval(() => player.seekForward(), 250)
        }
        break
      case 'ArrowLeft':
        if (!interval) {
          player.seekBackward()
          interval = setInterval(() => player.seekBackward(), 250)
        }
        break
      case 'SoftRight':
        player.goForward()
        break
      case 'SoftLeft':
        player.goBackward()
        break
      case 'Enter':
        if (player.isPlaybackOptionsOpen) {
          naviBoard.getActiveElement().click()
        } else {
          player.togglePlayPause()
        }
        break
    }
  }
  window.addEventListener('keyup', () => {
    clearInterval(interval)
    interval = null
  })
})

window.onerror = (e) => {
  console.error(e)
}
