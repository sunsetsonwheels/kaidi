//
// /app/js/player.js
//
// This file handles the tasks required for the operation of player.html
//
// (C) jkelol111 and contributors 2020. Licensed under The Unlicense.
//

'use strict'

//
// Constant KodiMethods kodi
//
// Handles communication with Kodi and provides core functions for Kaidi
//
//

const kodi = new KodiMethods()

//
// Variables Object playerPlayingInfoElements, Object playerPlayingPlaybackElements, Object playerOptionMenuElements
//
// Names of the HTML elements that are commonly used throughout this script.
//

var playerPlayingInfoElements = {
  title: document.getElementById('player-playing-info-title'),
  artists: document.getElementById('player-playing-info-artists'),
  thumbnail: document.getElementById('player-playing-info-thumbnail')
}

var playerPlayingPlaybackElements = {
  throbber: document.getElementById('throbber'),
  container: document.getElementById('player-playing-playback'),
  repeat: document.getElementById('player-playing-playback-repeat'),
  shuffle: document.getElementById('player-playing-playback-shuffle'),
  playbackDuration: document.getElementById('player-playing-playback-duration-text'),
  playbackMeter: document.getElementById('player-playing-playback-duration-meter')
}

var playerOptionsMenuElements = {
  container: document.getElementById('player-options-container'),
  list: document.getElementById('player-options-list'),
  repeat: document.getElementById('player-options-list-repeat'),
  shuffle: document.getElementById('player-options-list-shuffle')
}

//
// Variables Boolean isPlaying , Date endingTime, Function,null ticker
//
// isPlaying: whether the player is playing or not.
//
// endingTime: the Date when the player finishes.
//
// timeTicker: setTimeout function if isPlaying is true, null if there is no ticker.
//

var isPlaying = false
var endingTime = new Date()
var timeTicker = null

//
// Function blankPlayer()
//
// Empties the player, returns it to not playing state.
//
// To be executed after ticker completes, Player.OnStop
//

function blankPlayer () {
  updateSoftkeys('none', 'none', 'none')
  changeLocalization(playerPlayingInfoElements.title, 'none')
  changeLocalization(playerPlayingInfoElements.artists, 'none')
  playerPlayingPlaybackElements.container.style.visibility = 'hidden'
  playerPlayingPlaybackElements.throbber.style.display = 'none'
  // isPlaying = false
}

//
// Function updatePlayerTime()
//
// Update the player playback (playback meter and playback label).
//

function updatePlayerTime () {
  // if (currentTimeHours > 0) {
  //   playerPlayingPlaybackElements.playbackDuration.innerText = currentTimeHours + ':' + ('0' + currentTimeMinutes).slice(-2) + ':' + ('0' + currentTimeSeconds).slice(-2) + '/' + maxTickableLabel.hours + ':' + ('0' + maxTickableLabel.minutes).slice(-2) + ':' + ('0' + maxTickableLabel.seconds).slice(-2)
  // } else {
  //   playerPlayingPlaybackElements.playbackDuration = ('0' + currentTimeMinutes).slice(-2) + ':' + ('0' + currentTimeSeconds).slice(-2) + '/' + ('0' + maxTickableLabel.minutes).slice(-2) + ':' + ('0' + maxTickableLabel.seconds).slice(-2)
  // }
}

//
// Function tickTimer()
//
// Ticks the time every one second for the ticker.
//
// If the ticked time has exceeded the maximum tick time, blank the player and stop the interval.
// And reset the timer, and blank out the page.
//
// Still under construction! Use with caution!
//

function tickTimer () {

}

//
// Function oldTickTimer()
//
// The old-implementation from Kaidi Remote (Alpha) rewriten with KodiRPC in mind.
//
// Contacts Kodi for the time every one second. This is the default behaviour before
// we have the new local ticking function sorted.
//
// To test out the new ticking function (tickTimer), set "beta.kaidi.useNewTicker" to "true".
//

function oldTickTimer () {
  if (document.visibilityState == "visible" && isPlaying) {
    kodi.kodiXmlHttpRequest('Player.GetActivePlayers').then((response) => {
      if (response[0]) {
        kodi.kodiXmlHttpRequest('Player.GetProperties', {
          properties: ['percentage', 'time', 'totaltime'],
          playerid: response[0].playerid
        }).then((response2) => {
          const TIME_IN = response2.time
          const TIME_OUT = response2.totaltime
          if (TIME_IN === TIME_OUT) {
            if (typeof tickTimer === 'function') {
              clearInterval(tickTimer)
            }
            blankPlayer()
          } else {
            if (response2.time.hours > 0) {
              playerPlayingPlaybackElements.playbackDuration.innerText = response2.time.hours + ':' + ('0' + response2.time.minutes).slice(-2) + ':' + ('0' + response2.time.seconds).slice(-2) + '/' + response2.totaltime.hours + ':' + ('0' + response2.totaltime.minutes).slice(-2) + ('0' + response2.totaltime.seconds).slice(-2)
            } else {
              playerPlayingPlaybackElements.playbackDuration.innerText = ('0' + response2.time.minutes).slice(-2) + ':' + ('0' + response2.time.seconds).slice(-2) + '/' + ('0' + response2.totaltime.minutes).slice(-2) + ':' + ('0' + response2.totaltime.seconds).slice(-2)
            }
            playerPlayingPlaybackElements.playbackMeter.value = response2.percentage
          }
        }).catch((err) => {
          kodi.errorOut(err)
        })
      } else {
        if (typeof tickTimer === 'function') {
          clearInterval(tickTimer)
        }
        newToast('toast-playerinactive', 'No player active.', 'south', 3000, 'warning')
        blankPlayer()
      }
    }).catch((err) => {
      kodi.errorOut(err)
    })
  } else {
    if (typeof tickTimer === 'function') {
      clearInterval(tickTimer)
    }
    blankPlayer()
  }
}

//
// Function updatePlayerInfo(String title, String artists)
//
// Update the player info (title and artists).
//

function updatePlayerInfo (playerInfoObject) {
  if (typeof playerInfoObject.title === 'string') {
    removeLocalization(playerPlayingInfoElements.title)
    if (playerInfoObject.title !== '') {
      playerPlayingInfoElements.title.innerText = playerInfoObject.title
    } else {
      changeLocalization(playerPlayingInfoElements.title, 'none')
    }
  } else {
    changeLocalization(playerPlayingInfoElements.title, 'unavailable')
  }
  if (typeof playerInfoObject.artists === 'string') {
    removeLocalization(playerPlayingInfoElements.artists)
    if (playerInfoObject.artists !== '') {
      playerPlayingInfoElements.artists.innerText = playerInfoObject.artists
    } else {
      changeLocalization(playerPlayingInfoElements.artists, 'none')
    }
  } else {
    changeLocalization(playerPlayingInfoElements.artists, 'unavailable')
  }
}

class KodiPlayerTypeError extends TypeError {
  constructor (arg, expected, got) {
    super('The supplied argument "' + arg + '" is not of expected values(s) "' + expected + '", got "' + got + '.')
    this.name = 'KodiTypeError'
  }
}

//
// Function updatePlayerPlayPause(Number playerSpeed)
//
// Update the Play/Pause controls and status of this Player view.
//

function updatePlayerPlayPause (playerSpeed) {
  switch (playerSpeed) {
    case 0:
      isPlaying = false
      playerPlayingPlaybackElements.container.style.visibility = 'hidden'
      updateSoftkeys('none', 'play', 'none')
      if (typeof tickTimer === 'function') {
        clearInterval(tickTimer)
      } else {
        console.log('The timer might not be running yet?')
      }
      break
    case 1:
      isPlaying = true
      playerPlayingPlaybackElements.container.style.visibility = 'initial'
      updateSoftkeys('playback', 'pause', 'none')
      break
  }
}

//
// Function updatePlayerRepeat(String repeatStatus)
//
// Update the Repeat controls and status of this Player view.
//

function updatePlayerRepeat (repeatStatus) {
  switch (repeatStatus) {
    case 'off':
      playerPlayingPlaybackElements.repeat.src = 'icons/repeat-grey_24.png'
      break
    case 'one':
    case 'all':
      playerPlayingPlaybackElements.repeat.src = 'icons/repeat_24.png'
      break
    default:
      throw new KodiPlayerTypeError('repeatStatus', 'off, one, all', repeatStatus)
  }
  switch (repeatStatus) {
    case 'off':
      changeLocalization(playerOptionsMenuElements.repeat, 'one')
      break
    case 'one':
      changeLocalization(playerOptionsMenuElements.repeat, 'all')
      break
    case 'all':
      changeLocalization(playerOptionsMenuElements.repeat, 'off')
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

function updatePlayerShuffle (shuffleStatus) {
  switch (shuffleStatus) {
    case true:
      playerPlayingPlaybackElements.shuffle.src = 'icons/shuffle_24.png'
      changeLocalization(playerOptionsMenuElements.shuffle, 'off')
      break
    case false:
      playerPlayingPlaybackElements.shuffle.src = 'icons/shuffle-grey_24.png'
      changeLocalization(playerOptionsMenuElements.shuffle, 'on')
      break
    default:
      throw new KodiPlayerTypeError('shuffleStatus', 'off, on', shuffleStatus)
  }
}

//
// Function updatePlayerThumbnail(String thumbnailUri)
//
// Gets and updates the player thumbnail from Kodi.
//

function updatePlayerThumbnail (thumbnailUri) {
  kodi.kodiXmlHttpRequest('Files.PrepareDownload', {
    path: thumbnailUri
  }).then((response) => {
    // Not sure if this is right but whatever. I'm coding this at 1:15am.
    playerPlayingInfoElements.thumbnail.src = 'http://' + kodi.kodiIP + ':' + kodi.kodiPort + '/' + response.details.path
  })
}

//
// Function initPlayer()
//
// Initializes the player view for the first time. Only if a player is active
// when this function is called will the app start sending information requests
// to Kodi for populating the UI.
//
// From here onwards, we will rely on the events Kodi supplies us with,
// to reduce the number of requests we have to make.
//

function initPlayer () {
  kodi.kodiXmlHttpRequest('Player.GetActivePlayers').then((response) => {
    if (response[0]) {
      var activePlayer = response[0].playerid
      kodi.kodiXmlHttpRequest('Player.GetItem', {
        properties: ['title', 'artist', 'thumbnail', 'starttime', 'endtime'],
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
          console.log('Player artists: ' + JSON.stringify(response.item.artist))
        }
        updatePlayerInfo(playerInfoObject)
        updatePlayerThumbnail(response.item.thumbnail)
        kodi.kodiXmlHttpRequest('Player.GetProperties', {
          properties: ['speed', 'repeat', 'shuffled', 'time', 'totaltime'],
          playerid: activePlayer
        }).then((response) => {
          updatePlayerRepeat(response.repeat)
          updatePlayerShuffle(response.shuffled)
          // try {
          //   updatePlayerTime()
          // } catch (err) {
          //   console.error(err)
          // }
          updatePlayerPlayPause(response.speed)
          playerPlayingPlaybackElements.throbber.style.display = 'none'
        }).catch((err) => {
          kodi.errorOut(err)
        })
      }).catch((err) => {
        blankPlayer()
        kodi.errorOut(err)
      })
    } else {
      newToast('toast-playerinactive', 'No player active.', 'south', 3000, 'warning')
      blankPlayer()
    }
  }).catch((err) => {
    blankPlayer()
    kodi.errorOut(err)
  })
}

kodi.kodiRegisterEventListener('Player.OnPause', (message) => {
  console.log('OnPause: ' + JSON.stringify(message))
  //updatePlayerPlayPause(message.player.speed)
})

//
// Function openOptionsMenu()
//
// If the player is playing, and the options menu isn't opened yet will
// this function be called in the keydown event listener.
//

function openOptionsMenu () {
  playerOptionsMenuElements.container.style.display = 'initial'
  updateSoftkeys('none', 'toggle', 'none')
  naviBoard.setNavigation(playerOptionsMenuElements.list)
}

//
// Function closeOptionsMenu()
//
// If the options menu is opened, close it. This function be called in the
// keydown event listener.
//

function closeOptionsMenu () {
  naviBoard.destroyNavigation(playerOptionsMenuElements.list)
  playerOptionsMenuElements.container.style.display = 'none'
  kodi.kodiXmlHttpRequest('Player.GetActivePlayers').then((response) => {
    if (response[0]) {
      kodi.kodiXmlHttpRequest('Player.GetProperties', {
        properties: ['speed'],
        playerid: response[0].playerid
      }).then((response) => {
        updatePlayerPlayPause(response.speed)
      }).catch((err) => {
        kodi.errorOut(err)
      })
    }
  })
}

document.addEventListener('DOMContentLoaded', () => {
  switchTheme()
  arrivedAtPage()
  initPlayer()
  var isOptionsMenuOpen = false
  window.onkeydown = (e) => {
    switch (e.key) {
      case 'SoftLeft':
        if (isPlaying) {
          if (!isOptionsMenuOpen) {
            try {
              openOptionsMenu()
            } catch (err) {
              console.error(err)
            }
            isOptionsMenuOpen = true
          }
        }
        break
      case 'Backspace':
        e.preventDefault()
        if (isOptionsMenuOpen) {
          closeOptionsMenu()
          isOptionsMenuOpen = false
        } else {
          gotoPage('home')
        }
        break
      case 'ArrowUp':
        kodi.volume('increment')
        break
      case 'ArrowDown':
        kodi.volume('decrement')
        break
      case 'ArrowLeft':
        if (isPlaying) {
          //TODO: port code from 0.4.7.3
        }
        break
      case 'Enter':
        if (isPlaying) {
          // TODO: remake this shit.
          // kodi.player('PlayPause')
        }
        break
      case 'ArrowRight':
        if (isPlaying) {
          //TODO: port code from 0.4.7.3
        }
        break
    }
  }
})
