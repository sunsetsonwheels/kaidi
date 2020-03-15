"use strict"

importScripts("/app/js/libs/reconnecting-websocket-iife.min.js",
              "/app/js/backbone/workerutils.js");

var workerStatus = "opening";
var notif = new NotificationFactory("KodiEventsWorker");
var kodiEventsWorkerLogger = new LoggerFactory("KodiEventsWorker");

function changeWorkerStatus(status) {
  var oldWorkerStatus = workerStatus;
  workerStatus = status;
  postMessage({status: workerStatus});
  kodiEventsWorkerLogger.log("Changed worker status: "+oldWorkerStatus+" --> "+workerStatus);
}

var kodiInfo = {};
var ws = null;

function wsStart() {
  kodiEventsWorkerLogger.log("Starting ReconnectingWebSocket.");
  ws = new ReconnectingWebSocket("ws://"+kodiInfo["ip"]+":9090/jsonrpc");
  ws.onopen = () => {
    kodiEventsWorkerLogger.log("ReconnectingWebSocket has successfully connected to Kodi!");
  }
  ws.onmessage = (e) => {
    kodiEventsWorkerLogger.log("Received message from Kodi: "+JSON.stringify(e.data));
    try {
      postMessage({"command": "receive",
                    "event": JSON.parse(e.data)["method"]});
    } catch (err) {
      kodiEventsWorkerLogger.error(new Error("Couldn't send event info back to KodiRPC instance."));
      kodiEventsWorkerLogger.error(err);
    }
  }
}

onmessage = (e) => {
  kodiEventsWorkerLogger.log("Message received: "+JSON.stringify(e.data));
  try {
    switch (e.data["command"]) {
      case "init":
        if (workerStatus == "opened") {
          kodiEventsWorkerLogger.log("The worker has finished initalization already!");
        } else {
          try {
            kodiInfo = e.data["kodiInfo"];
            if (!ws) {
              wsStart();
            } else {
              kodiEventsWorkerLogger.log("ReconnectingWebSocket is already present!")
            }
            changeWorkerStatus("opened");
            notif.spawnNotification("G")
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
