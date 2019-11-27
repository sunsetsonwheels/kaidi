let xhrLogger = new Logger("kodiXmlHttpRequest");

let kodiIP = settings.get("ip");
let kodiPort = settings.get("port");

function kodiXmlHttpRequest(ip, port, method, params=undefined) {
  if(params) {
    xhrLogger.log("XML request invoked for Kodi method '"+method+"' and params '"+params+"'.");
  } else {
    xhrLogger.log("XML request invoked for Kodi method '"+method+"'.");
  }
  let request = new XMLHttpRequest({mozSystem: true});
  return new Promise((resolve, reject) => {
    request.onreadystatechange = () => {
      if (request.readyState !== 4) return;
      if (request.status >= 200 && request.status < 300) {
        xhrLogger.log("Received response for method '"+method+"': "+request.responseText);
        try {
          resolve(JSON.parse(request.responseText));
        } catch (err) {
          resolve(request.responseText);
        }
      } else {
        reject(new Error(request.status+": "+request.statusText));
      }
    };
    request.open("POST", "http://"+ip+":"+port+"/jsonrpc", true);
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

function showToastRequestFailed() {
  navigator.mozL10n.formatValue("requestfailed-text").then((text) => {
    nativeToast({message: text,
                 type: "success",
                 direction: "north",
                 timeout: 2000});
  }).catch(() => {
    nativeToast({message: "Kodi request failed!",
                 type: "success",
                 direction: "north",
                 timeout: 2000});
  })
}

let keyNavLogger = new Logger("keyNav")

function keyNav(direction) {
  if(["Left", "Right", "Up", "Down"].indexOf(direction) > -1) {
    keyNavLogger.log("Navigating: "+direction);
    kodiXmlHttpRequest(kodiIP, kodiPort, "Input."+direction).catch(() => {
      showToastRequestFailed();
      keyNavLogger.log("Navigating to '"+direction+"' failed!");
    })
  } else {
    keyNavLogger.error(new Error("Direction '"+direction+"' not in supported directions."));
  }
}

// function keyNav(direction) {
//   if(["Left", "Right", "Up", "Down"].indexOf(direction) > -1) {
//     keyNavLogger.log("Navigating: "+direction);
//     atomic("http://"+kodiIP+":"+kodiPort+"/jsonrpc", {method: "POST",
//                                                       data: JSON.stringify({jsonrpc: "2.0", 
//                                                                             method: "Input."+direction,
//                                                                           }),
//                                                       headers: {"Content-Type": "application/json"}
//                                                      }).then((response) => {console.log(response)})
//                                                      .catch((err) => {console.error(err)})
//   } else {
//     keyNavLogger.error(new Error("Direction '"+direction+"' not in supported directions."));
//   }
// }