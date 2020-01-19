// kodirpc.js
// This file is reponsible for the communcation with the Kodi device
// Methods are almost self explainatory

class KodiRPC {
  constructor() { 
    this.xhrLogger = new Logger("KodiRPC.kodiXmlHttpRequest");
    this.kodiIP = settings.get("ip");
    this.kodiPort = settings.get("port");
  }
  kodiXmlHttpRequest(method, params=undefined) {
    if(params) {
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
            resolve(JSON.parse(request.responseText));
          } catch (err) {
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
}