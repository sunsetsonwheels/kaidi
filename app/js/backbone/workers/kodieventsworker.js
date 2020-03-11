"use strict"

importScripts("/app/js/libs/reconnecting-websocket.min.js",
              "/app/js/backbone/workerutils.js", 
              "/app/js/backbone/notifications.js");

var workerStatus = "opening";
var notif = new NotificationFactory("KodiEventsWorker");
var kodiEventsWorkerLogger = new Logger("KodiEventsWorker");

function changeWorkerStatus(status) {
  var oldWorkerStatus = workerStatus;
  workerStatus = status;
  postMessage({status: workerStatus});
  kodiEventsWorkerLogger.log("Changed worker status: "+oldWorkerStatus+" --> "+workerStatus);
}

var kodiIP = null;
var listeningEvents = [];
var ws = null;

function wsStart() {
  ws = new ReconnectingWebSocket("ws://"+settings.get("ip")+":9090/jsonrpc");
}

onmessage = (e) => {
  kodiEventsWorkerLogger.log("Message received: "+JSON.stringify(e.data));
  try {
    switch (e.data["command"]) {
      case "init":
        notif.spawnNotificationNoLocalization("Test Notification", "Init!", "kodi-event");
        changeWorkerStatus("opened");
        break;
      case "close":
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
