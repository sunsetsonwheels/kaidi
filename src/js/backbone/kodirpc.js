/*

/js/backbone/kodirpc.js

This file is reponsible for the communcation with the Kodi device.

(C) jkelol111 and contributors 2020, 2023. Licensed under the GPLv3 license.

*/

// We're strict here because my Asian mom told me so /s.
'use strict'

/*

Class KodiResponseError <-- Error

This class represents the error:
'The response from Kodi contains an error field.'

Class constructor arguments:
- Error otherErr: Kodi error object.

*/

class KodiResponseError extends Error {
  constructor (otherErr) {
    super('We have a error in the response (' + otherErr + ').')
    this.name = 'KodiResponseError'
  }
}

/*

Class KodiXHRError <-- Error

This class represents the error:
'The XHR request to Kodi failed.'

Class constructor arguments:
- Number xhrErrorCode: The error code of the XHR request.
- String xhrErrorMessage: The error message of the XHR request.

*/

class KodiXHRError extends Error {
  constructor (xhrErrorCode, xhrErrorMessage) {
    super('Request to Kodi failed due to XHR error: ' + xhrErrorMessage + ' (' + xhrErrorCode + ').')
    this.name = 'KodiXHRError'
  }
}

/*

Class KodiRPC

This class handles XHR based communication with Kodi, along with Kodi events
via a worker listening with WebSocket.

Class constructor arguments:
- Boolean startWorker: Decides whether WebSockets functionality should be initiated.

*/

class KodiRPC {
  constructor (startWorker = undefined) {
    this.startWorker = startWorker
    this.kodiIP = settings.get('ip')
    this.kodiPort = settings.get('port')
    // Starts the worker if startWorker is true.
    if (this.startWorker) {
      this.listeningKodiEvents = {}
      this.eventWorker = new Worker('/js/backbone/workers/kodievents.js')
      // Looks like Kodi has left something for us to handle.
      this.eventWorker.onmessage = (e) => {
        try {
          if (e.data.command === 'receive') {
            if (e.data.event in this.listeningKodiEvents) {
              // Event is good this year, Santa shall deliver `data` to the event.
              this.listeningKodiEvents[e.data.event](e.data.data)
            }
          }
        } catch (err) {
          // Oops we got bamboozled by the worker!
          console.error(err)
          throw new KodiResponseError(err)
        }
      }
      // Effectively start the worker like my old Honda Super Cub.
      this.eventWorker.postMessage({
        command: 'init',
        kodiInfo: {
          ip: this.kodiIP,
          port: this.kodiPort
        },
        kodiNotifications: settings.get('notify')
      })
    }
  }

  /*

  Function kodiXmlHttpRequest (String/([String, Object/undefined][]) methodOrRequests,
    Object/undefined params)

  Starts a new XHR request to Kodi, using the provided IP address and port.
  Either the first parameter should be a method name and the second parameter its parameters,
  or the parameter should be an array of [method, params] pairs for batched requests.

  Returns: Promise (resolve: Object, reject: KodiResponseError/KodiXHRError)
  In the case of batched requests, the response is returned as is, is an array, and indiviual
  responses may contain errors. Otherwise only the result field is returned, and the promise
  is rejected in case of error.

  */

  kodiXmlHttpRequest (methodOrRequests, params = undefined) {
    // { mozSystem: true } since CORS. Uses `systemXHR` permission in manifest.
    var request = new XMLHttpRequest({ mozSystem: true })
    // Timeout so the app feels 'quicker'.
    request.timeout = 2000
    request.open('POST', 'http://' + this.kodiIP + ':' + this.kodiPort + '/jsonrpc', true)
    request.setRequestHeader('Content-Type', 'application/json')
    return new Promise((resolve, reject) => {
      request.onreadystatechange = () => {
        if (request.readyState !== 4) return
        if (request.status >= 200 && request.status < 300) {
          try {
            var reply = JSON.parse(request.responseText)
            if (reply instanceof Array)
              resolve(reply)
            // Checks for error field in response.
            if (reply.error) {
              reject(new KodiResponseError(new Error('Response contains error')))
            } else {
              // The request is delivered safe and sound to where it belongs (here of course).
              resolve(reply.result)
            }
          } catch (err) {
            // Looks like we got delivered some rotten JSON :(
            reject(new KodiResponseError(err))
          }
        } else {
          // Internet is real bad. The XHR request has failed.
          reject(new KodiXHRError(request.status, request.statusText))
        }
      }
      // Either Kodi is too slow or the device is slow. Either way the request is lost in translation and time.
      request.ontimeout = () => {
        reject(new KodiXHRError('unknown', 'The request timed out.'))
      }
      // An attempt to reduce the request size if `params` isn't even there.
      // Generates a random number so the requests (hopefully) doesn't get mixed up too.
      if (methodOrRequests instanceof Array)
        request.send(JSON.stringify(methodOrRequests.map(request => (request[1] ? {
          jsonrpc: '2.0',
          id: 'KodiRPCJavascript-' + Math.random().toString(36).substr(2, 5),
          method: request[0],
          params: request[1]
        } : {
          jsonrpc: '2.0',
          id: 'KodiRPCJavascript-' + Math.random().toString(36).substr(2, 5),
          method: request[0],
        }))))
      else if (params) {
        request.send(JSON.stringify({
          jsonrpc: '2.0',
          id: 'KodiRPCJavascript-' + Math.random().toString(36).substr(2, 5),
          method: methodOrRequests,
          params: params
        }))
      } else {
        request.send(JSON.stringify({
          jsonrpc: '2.0',
          id: 'KodiRPCJavascript-' + Math.random().toString(36).substr(2, 5),
          method: methodOrRequests
        }))
      }
    })
  }

  /*

  Function kodiRegisterEventListener (String kodiEvent, Function eventHandler)

  Registers an event Handler for a Kodi event.

  */

  kodiRegisterEventListener (kodiEvent, eventHandler) {
    if (this.startWorker) {
      if (typeof eventHandler === 'function') {
        this.listeningKodiEvents[kodiEvent] = eventHandler
      } else {
        // Are you sure what you gave us was a function?
        throw new TypeError('The supplied event handler is not a function. Not adding to list.')
      }
    } else {
      // Yo you forgot to start KodiRPC with the workers. Oops.
      throw new Error('This KodiRPC instance has not been started with a worker. Event-listening will not work.')
    }
  }

  /*

  Function kodiCloseEventListener ()

  Closes the WebSocket connection with Kodi. It won't be start again in the current KodiRPC
  instance.

  WebSockets are usually closed before the page is transitioned for a clean exit.

  */

  kodiCloseEventWorker () {
    this.eventWorker.postMessage({
      command: 'close'
    })
  }
}

/*

Class KodiMethodsError <-- Error

This class represents the error:
'The KodiMethod function encountered an exception in its execution.'

Class constructor arguments:
- Error otherErr: Kodi error object.

*/

class KodiMethodsError extends Error {
  constructor (otherErr) {
    super('The KodiMethod function did not execute properly because of another error: ' + otherErr)
    this.name = 'KodiMethodsError'
  }
}

/*

Class KodiMethods <-- KodiRPC

This class contains common Kodi methods used both my the main remote and the player.

*/

class KodiMethods extends KodiRPC {
  constructor () {
    // Inititalize the KodiRPC parent class.
    super(true)
    this.ping()
  }

  /*

  Function methodErrorOut (Error err)

  The standard 'exception' encountered error helper function.

  */

  methodErrorOut (err) {
    newLocalizedToast('toast-kodi-request-failed', 'Kodi request failed!', 'south', 3000, 'error')
    console.error(err)
    throw new KodiMethodsError(err)
  }

  /*

  Function ping ()

  Pings Kodi for a response, confirming that Kodi is indeed awake.
  */

  ping () {
    this.kodiXmlHttpRequest('JSONRPC.Ping').then((response) => {
      // Ping...Pong (get it? My jokes are terrible.)
      if (response === 'pong') {
        newLocalizedToast('toast-kodi-connection-established-text', 'Connected to Kodi!', 'south', 2000, 'success')
      } else {
        newLocalizedToast('toast-kodi-connection-unsure-text', 'Connection to Kodi unsure!', 'south', 2000, 'success')
      }
    }).catch((err) => {
      this.methodErrorOut(err)
    })
  }

  /*

  Function volumeWrapper (String direction, Object params)

  Controls the volume and displays/hides the volume HUD.

  */

  volumeWrapper (direction, params = undefined) {
    if (direction === 'mute') {
      var method = 'Application.SetMute'
      var params = { mute: 'toggle' }
    } else {
      var method = 'Application.SetVolume'
      var params = { volume: direction }
    }
    this.kodiXmlHttpRequest(method, params).then(() => {
      if (method === 'Application.SetVolume') {
        this.kodiXmlHttpRequest('Application.GetProperties', {
          properties: ['volume']
        }).then((response) => {
          document.getElementById('meter-volume').value = response.volume
          document.getElementById('volume-hud-greyout').classList.remove('volume-hud-transition-hide')
          document.getElementById('volume-hud-greyout').classList.add('volume-hud-transition-appear')
          setTimeout(() => {
            document.getElementById('volume-hud-greyout').classList.remove('volume-hud-transition-appear')
            document.getElementById('volume-hud-greyout').classList.add('volume-hud-transition-hide')
          }, 1500)
        }).catch((err) => {
          this.errorOut(err)
        })
      }
    }).catch((err) => {
      this.errorOut(err)
    })
  }
}
