//
// /app/js/backbone/kodieventsworker.js
//
// This file handles the task of listening to Kodi events and forwarding them back
// to the KodiRPC instance that initialized it.
//
// (C) jkelol111 and contributors 2020. Licensed under the GPLv3 license.
//

'use strict'

//
// Import all the scripts we will need in this Web Worker.
//

importScripts('/js/libs/reconnecting-websocket-iife.min.js')

//
// Class NotificationFactory
//
// NotificationFactory for Kodi event worker.
// Stripped localization because we cannot access l10n from Web Worker context.
//

class NotificationPermissionDeniedError extends Error {
  constructor (notificationContent) {
    super('Cannot send notification with content "' + JSON.stringify(notificationContent) + '" since notification permission was denied.')
    this.name = 'NotificationPermissionDeniedError'
  }
}

class NotificationFactory {
  constructor (notificationID) {
    this.notificationID = notificationID
  }

  _notify (title, body) {
    if (Notification.permission === 'granted') {
      var n = new Notification(title, {
        body: body,
        icon: '/icons/kaidi_56.png',
        id: this.notificationID
      })
      n.onclick = () => {
        n.close.bind(n)
        window.open('app://beta.kaidi.jkelol111.me')
      }
    } else {
      throw new NotificationPermissionDeniedError({
        title: title,
        body: body,
        id: this.notificationID
      })
    }
  }

  spawnNotification (title, body) {
    this._notify(title, body)
  }
}

//
// Variables String workerStatus, NotificationFactory notif
//
// workerStatus: defines the current state of the Web Worker.
//
// notif: NotificationFactory instance to send notifications directly from this Web Worker, albeit
//        with no localization because we're not in the same scope as the main thread.
//

var workerStatus = 'opening'
var notif = new NotificationFactory('KodiEventsWorker')
const LOG_PREFIX = '[Worker: KodiEvents] '

//
// Function changeWorkerStatus()
//
// Quite self-explainatory, this function just changes the workerStatus variable to the desired value,
// and relaying the new status back to the main thread.
//

function changeWorkerStatus (status) {
  var oldWorkerStatus = workerStatus
  workerStatus = status
  postMessage({ status: workerStatus })
  console.log(LOG_PREFIX + 'Changed worker status: ' + oldWorkerStatus + ' --> ' + workerStatus)
}

//
// Variables Object kodiInfo, Boolean kodiNotificationsEnabled, ReconnectingWebSocket,null ws
//
// kodiInfo: the IP address and port of Kodi
//
// kodiNotificationsEnabled: whether we should display Kodi Now Playing notifications.
//
// ws: If the Web Worker is opened, ws is a ReconnectingWebSocket, if not, it is null.
//

var kodiInfo = {}
var kodiNotificationsEnabled = false
var ws = null

//
// Function wsStart()
// Again, quite self-explainatory. This function starts the ReconnectingWebSocket.
//

function wsStart () {
  console.log(LOG_PREFIX + 'Starting ReconnectingWebSocket.')
  ws = new ReconnectingWebSocket('ws://' + kodiInfo.ip + ':9090/jsonrpc')
  ws.onopen = () => {
    console.log(LOG_PREFIX + 'ReconnectingWebSocket has successfully connected to Kodi!')
  }
  ws.onmessage = (e) => {
    console.log(LOG_PREFIX + 'Received message from Kodi: ' + JSON.stringify(e.data))
    try {
      var eventMessage = JSON.parse(e.data)
      if (eventMessage.method === 'Player.OnPlay') {
        if (kodiNotificationsEnabled) {
          notif.spawnNotification(eventMessage.params, eventMessage.params)
        }
      }
      postMessage({
        command: 'receive',
        event: eventMessage.method,
        data: eventMessage.params
      })
    } catch (err) {
      throw new Error('Could not send event info back to KodiRPC instance. Error: ' + err)
    }
  }
}

//
// EventHandler self.onmessage
//
// Handles incoming requests from the KodiRPC instance which started this Web Worker.
//

self.onmessage = (e) => {
  console.log(LOG_PREFIX + 'Message received: ' + JSON.stringify(e.data))
  try {
    switch (e.data.command) {
      case 'init':
        if (workerStatus === 'opened') {
          console.log(LOG_PREFIX + 'The worker has finished initalization already!')
        } else {
          try {
            kodiInfo = e.data.kodiInfo
            kodiNotificationsEnabled = e.data.kodiNotifications
            if (!ws) {
              wsStart()
            } else {
              console.log(LOG_PREFIX + 'ReconnectingWebSocket is already present!')
            }
            changeWorkerStatus('opened')
            // notif.spawnNotification('We're live!', 'Hello from Kaidi webworker!')
          } catch (err) {
            throw new Error('kodiInfo is missing in message. Initilization of worker failed! (Error: ' + err + ')')
          }
        }
        break
      case 'close':
        ws.close()
        ws = null
        changeWorkerStatus('closed')
        break
      default:
        console.log(LOG_PREFIX + 'Unprogrammed command received: ' + e.data.command)
        break
    }
  } catch (err) {
    throw new Error('Command argument not supplied! (Error: ' + err + ')')
  }
}
