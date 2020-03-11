// kodirpc.js
// This file is reponsible for the communcation with the Kodi device
// Methods are almost self explainatory

"use strict"

class KodiRPC {
  constructor() { 
    this.xhrLogger = new LoggerFactory("KodiRPC.kodiXmlHttpRequest");
    this.eventWorkerLogger = new LoggerFactory("KodiRPC.eventWorker")
    this.kodiIP = settings.get("ip");
    this.kodiPort = settings.get("port");
    this.listeningKodiEvents = {};
    this.eventWorkerLogger.log("Starting Kodi events worker.");
    this.eventWorker = new Worker("/app/js/backbone/workers/kodieventsworker.js");
    this.eventWorker.onmessage = (e) => {
      this.eventWorkerLogger.log("Message received from Worker: "+JSON.stringify(e.data));
      //TODO: complete listening logic
    }
    this.eventWorker.postMessage({"command": "init",
                                  "kodiInfo": {ip: this.kodiIP,
                                               port: this.kodiPort}
                                 });
  }
  kodiXmlHttpRequest(method, params=undefined) {
    if (params) {
      this.xhrLogger.log("XML request invoked for Kodi method '"+method+"' and params '"+params+"'.");
    } else {
      this.xhrLogger.log("XML request invoked for Kodi method '"+method+"'.");
    }
    let request = new XMLHttpRequest({mozSystem: true});
    return new Promise((resolve, reject) => {
      request.onreadystatechange = () => {
        if (request.readyState !== 4) return;
        if (request.status >= 200 && request.status < 300) {
          this.xhrLogger.log("Received response for method '"+method+"': "+request.responseText);
          try {
            this.xhrLogger.log("Attempting response JSON parse.");
            let reply = JSON.parse(request.responseText);
            if (reply["code"]) {
              reject(reply);
            } else {
              resolve(reply);
            }
          } catch (err) {
            this.xhrLogger.log("Unable to parse JSON. Returning responsetext.");
            resolve(request.responseText);
          }
        } else {
          this.xhrLogger.error("Request for method '"+method+"' unsuccessful.");
          reject(request.status+":"+request.statusText);
        }
      };
      request.open("POST", "http://"+this.kodiIP+":"+this.kodiPort+"/jsonrpc", true);
      request.setRequestHeader("Content-Type", "application/json");
      if(params) {
        request.send(JSON.stringify({jsonrpc: "2.0",
                                    id: "KodiRPCJavascript",
                                    method: method,
                                    params: params}));
      } else {
        request.send(JSON.stringify({jsonrpc: "2.0",
                                    id: "KodiRPCJavascript",
                                    method: method}));
      }
    });
  }
  kodiRegisterEventListener(kodiEvent, eventHandler) {
    this.listeningEvents[kodiEvent] = eventHandler;
  }
  kodiOnEventReceived() {}
}