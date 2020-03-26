//
// /app/js/backbone/kodirpc.js
//
// This file is reponsible for the communcation with the Kodi device.
// Methods are almost self explainatory.
//
// (C) jkelol111 and contributors 2020
//

"use strict"

class KodiResponseError extends Error {
  constructor(otherErr) {
    super("We have a error in the response ("+otherErr+").");
    this.name = "KodiResponseError";
  }
}

class KodiXHRError extends Error {
  constructor(xhrErrorCode, xhrErrorMessage) {
    super("Request to Kodi failed due to XHR error: "+xhrErrorMessage+" ("+xhrErrorCode+").");
    this.name = "KodiXHRError";
  }
}

class KodiRPC {
  constructor(startWorker=undefined) { 
    this.startWorker = startWorker;
    this.kodiIP = settings.get("ip");
    this.kodiPort = settings.get("port");
    if (this.startWorker) {
      this.listeningKodiEvents = {};
      this.eventWorker = new Worker("/app/js/backbone/workers/kodieventsworker.js");
      this.eventWorker.onmessage = (e) => {
        try {
          if (e.data["command"] == "receive") {
            if(e.data["event"] in this.listeningKodiEvents) {
              this.listeningKodiEvents[e.data["event"]](e.data);
            }
          }
        } catch (err) {
          throw new KodiResponseError(err);
        }
      }
      this.eventWorker.postMessage({"command": "init",
                                    "kodiInfo": {ip: this.kodiIP,
                                                 port: this.kodiPort},
                                    "notifications": settings.get("notify")});    
    }
  }
  kodiXmlHttpRequest(method, params=undefined) {
    var request = new XMLHttpRequest({mozSystem: true});
    request.timeout = 2000;
    request.open("POST", "http://"+this.kodiIP+":"+this.kodiPort+"/jsonrpc", true);
    request.setRequestHeader("Content-Type", "application/json");
    return new Promise((resolve, reject) => {
      request.onreadystatechange = () => {
        if (request.readyState !== 4) return;
        if (request.status >= 200 && request.status < 300) {
          try {
            let reply = JSON.parse(request.responseText);
            if (reply["error"]) {
              reject(new KodiResponseError(new Error("Response contains error")));
            } else {
              resolve(reply["result"]);
            }
          } catch (err) {
            reject(new KodiResponseError(new Error("JSON couldn't be parsed!")));
          }
        } else {
          reject(new KodiXHRError(request.status, request.statusText));
        }
      };
      request.ontimeout = () => {
        reject(new KodiXHRError("unknown", "The request timed out."));
      }
      if (params) {
        request.send(JSON.stringify({jsonrpc: "2.0",
                                    id: "KodiRPCJavascript-"+method,
                                    method: method,
                                    params: params}));
      } else {
        request.send(JSON.stringify({jsonrpc: "2.0",
                                    id: "KodiRPCJavascript-"+method,
                                    method: method}));
      }
    });
  }
  kodiRegisterEventListener(kodiEvent, eventHandler) {
    if (this.startWorker) {
      if (typeof(eventHandler) == "function") {
        this.listeningKodiEvents[kodiEvent] = eventHandler;
      } else {
        throw new TypeError("The supplied event handler is not a function. Not adding to list.");
      }
    } else {
      throw new Error("This KodiRPC instance hasn't been started with a worker. Event-listening will not work.");
    }
  }
}

class KodiMethodsError extends Error {
  constructor(err) {
    super("The KodiMethod function didn't execute properly because of: "+err);
    this.name = "KodiMethodsError";
  }
}

class KodiMethods extends KodiRPC {
  constructor() {
    super(true);
    this.volumeElements = {"greyout": document.getElementById("volume-hud-greyout"),
                           "meter": document.getElementById("meter-volume")}
    this.ping();
  }
  errorOut(err) {
    newToast("kodi-request-failed", "Kodi request failed!", "south", 3000, "error");
    throw new KodiMethodsError(err); 
  }
  ping() {
    this.kodiXmlHttpRequest("JSONRPC.Ping").then((response) => {
      if (response == "pong") {
        newToast("kodi-connection-established-text", "Connected to Kodi!", "south", 2000, "success");
      } else {
        newToast("kodi-connection-unsure-text", "Connection to Kodi unsure!", "south", 2000, "success");
      }
    }).catch((err) => {
      this.errorOut(err);
    })
  }
  input(direction, params=undefined) {
    this.kodiXmlHttpRequest("Input."+direction, params).catch((err) => {
      this.errorOut(err);
    })
  }
  volume(direction, params=undefined) {
    if ( direction == "mute" ) {
      var method = "Application.SetMute";
      var params = { "mute": "toggle" };
    } else {
      var method = "Application.SetVolume";
      var params = { "volume": direction };
    }
    this.kodiXmlHttpRequest(method, params).then(() => {
      if (method == "Application.SetVolume") {
        this.kodiXmlHttpRequest("Application.GetProperties", {"properties": ["volume"]})
        .then((response) => {
          this.volumeElements["meter"].value = response["volume"];
          this.volumeElements["greyout"].classList.remove("volume-hud-transition-hide");
          this.volumeElements["greyout"].classList.add("volume-hud-transition-appear");
          setTimeout(() => {
            this.volumeElements["greyout"].classList.remove("volume-hud-transition-appear");
            this.volumeElements["greyout"].classList.add("volume-hud-transition-hide");
          }, 1500);
        })
        .catch((err) => {
          this.errorOut(err);
        });
      }   
    }).catch((err) => {
      this.errorOut(err);
    });
  }
}