//
// /app/js/backbone/kodieventsworker.js
//
// This file handles the task of listening to Kodi events and forwarding them back
// to the KodiRPC instance that initialized it.
//
// (C) jkelol111 and contributors 2020. Licensed under The Unlicense.
//

"use strict"

//
// Import all the scripts we will need in this Web Worker.
//

importScripts("/app/js/libs/reconnecting-websocket-iife.min.js",
              "/app/js/backbone/workerutils.js");

//
// Variables String workerStatus, NotificationFactory notif, LoggerFactory kodiEventsWorkerLogger 
//
// workerStatus: defines the current state of the Web Worker.
//
// notif: NotificationFactory instance to send notifications directly from this Web Worker, albeit
//        with no localization because we're not in the same scope as the main thread.
//
// kodiEventsWorkerLogger: LoggerFactory instance to log messages for debugging into the JavaScript
//                         console.
//

var workerStatus = "opening";
var notif = new NotificationFactory("KodiEventsWorker");
var kodiEventsWorkerLogger = new LoggerFactory("KodiEventsWorker");

//
// Function changeWorkerStatus()
//
// Quite self-explainatory, this function just changes the workerStatus variable to the desired value,
// and relaying the new status back to the main thread.
//

function changeWorkerStatus(status) {
  var oldWorkerStatus = workerStatus;
  workerStatus = status;
  postMessage({status: workerStatus});
  kodiEventsWorkerLogger.log("Changed worker status: "+oldWorkerStatus+" --> "+workerStatus);
}

//
// Variables Object kodiInfo, ReconnectingWebSocket,null ws
//
// kodiInfo: the IP address and port of Kodi
// 
// ws: If the Web Worker is opened, ws is a ReconnectingWebSocket, if not, it is null.
//

var kodiInfo = {};
var kodiNotificationsEnabled = null;
var ws = null;

//
// Function wsStart()
// Again, quite self-explainatory. This function starts the ReconnectingWebSocket.
//

function wsStart() {
  kodiEventsWorkerLogger.log("Starting ReconnectingWebSocket.");
  ws = new ReconnectingWebSocket("ws://"+kodiInfo["ip"]+":9090/jsonrpc");
  ws.onopen = () => {
    kodiEventsWorkerLogger.log("ReconnectingWebSocket has successfully connected to Kodi!");
  }
  ws.onmessage = (e) => {
    kodiEventsWorkerLogger.log("Received message from Kodi: "+JSON.stringify(e.data));
    try {
      let eventMessage = JSON.parse(e.data);
      if (eventMessage["method"] == "Player.OnPlay") {
      	// TODO: spawn a notification if something is playing.
      }
      postMessage({"command": "receive",
                   "event": eventMessage["method"],
                   "data": eventMessage["params"]});
    } catch (err) {
      kodiEventsWorkerLogger.error(new Error("Couldn't send event info back to KodiRPC instance."));
      kodiEventsWorkerLogger.error(err);
    }
  }
}

//
// Event self.onmessage
//
// Handles incoming requests from the KodiRPC instance which started this Web Worker.
//

self.onmessage = (e) => {
  kodiEventsWorkerLogger.log("Message received: "+JSON.stringify(e.data));
  try {
    switch (e.data["command"]) {
      case "init":
        if (workerStatus == "opened") {
          kodiEventsWorkerLogger.log("The worker has finished initalization already!");
        } else {
          try {
            kodiInfo = e.data["kodiInfo"];
            kodiNotificationsEnabled = e.data["notifications"];
            if (!ws) {
              wsStart();
            } else {
              kodiEventsWorkerLogger.log("ReconnectingWebSocket is already present!")
            }
            changeWorkerStatus("opened");
            // notif.spawnNotification("We're live!", "Hello from Kaidi webworker!")
          } catch (err) {
            kodiEventsWorkerLogger.error(new Error("'kodiInfo' is missing in message. Initilization of worker failed!"));
            kodiEventsWorkerLogger.error(err);
          }
        }
        break;
      case "close":
        ws.close();
        ws = null;
        changeWorkerStatus("closed");
        break;
      default:
        kodiEventsWorkerLogger.log("Unprogrammed command received: "+e.data["command"]);
        break;
    }
  } catch (err) {
    kodiEventsWorkerLogger.error(new Error("Command argument not supplied!: "+err.message));
  }
}
