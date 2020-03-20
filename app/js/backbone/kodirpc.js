//
// /app/js/backbone/kodirpc.js
//
// This file is reponsible for the communcation with the Kodi device
// Methods are almost self explainatory
//
// (C) jkelol111 and contributors 2020
//

"use strict"

class KodiRPC {
  constructor(startWorker=undefined) { 
    this.startWorker = startWorker;
    this.xhrLogger = new LoggerFactory("KodiRPC.kodiXmlHttpRequest");
    this.kodiIP = settings.get("ip");
    this.kodiPort = settings.get("port");
    if (this.startWorker) {
      this.listeningKodiEvents = {};
      this.eventWorkerLogger = new LoggerFactory("KodiRPC:Events");
      this.eventWorkerLogger.log("Starting Kodi events worker.");
      this.eventWorker = new Worker("/app/js/backbone/workers/kodieventsworker.js");
      this.eventWorker.onmessage = (e) => {
        this.eventWorkerLogger.log("Message received from Worker: "+JSON.stringify(e.data));
        try {
          if (e.data["command"] == "receive") {
            if(e.data["event"] in this.listeningKodiEvents) {
              this.listeningKodiEvents[e.data["event"]](e.data);
            } else {
              this.eventWorkerLogger.log("Event '"+e.data["event"]+"' is not a registered one. Not doing anything.");
            }
          }
        } catch (err) {
          this.eventWorkerLogger.error(new Error("An error occured handling the worker message."));
          this.eventWorkerLogger.error(err);
        }
      }
      this.eventWorker.postMessage({"command": "init",
                                    "kodiInfo": {ip: this.kodiIP,
                                                port: this.kodiPort}
                                   });
      
    }
  }
  kodiXmlHttpRequest(method, params=undefined) {
    if (params) {
      this.xhrLogger.log("XML request invoked for Kodi method '"+method+"' and params '"+JSON.stringify(params)+"'.");
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
            this.xhrLogger.log("Response JSON parsed successfully.");
            if (reply["error"]) {
              this.xhrLogger.log("Got error in Kodi response. Erroring out.")
              reject(reply);
            } else {
              resolve(reply);
            }
          } catch (err) {
            this.xhrLogger.log("Unable to parse JSON. Erroring out.");
            reject(new Error("JSON couldn't be parsed!"));
          }
        } else {
          this.xhrLogger.error("Request for method '"+method+"' unsuccessful.");
          reject(new Error("XMLHttpRequest failed with error codes: "+request.status+" ("+request.statusText+")."));
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
    if (this.startWorker) {
      if (typeof(eventHandler) == "function") {
        this.listeningKodiEvents[kodiEvent] = eventHandler;
        this.eventWorkerLogger.log("Successfully added event handler for Kodi event '"+kodiEvent+"'.");
      } else {
        this.eventWorkerLogger.error(new Error("The supplied event handler is not a function. Not adding to list."));
      }
    } else {
      this.eventWorkerLogger.error(new Error("This KodiRPC instance hasn't been started with a worker. Event-listening will not work."));
    }
  }
}