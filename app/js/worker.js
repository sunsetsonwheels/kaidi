var settingsLoaded = null;
function endWorker() {
    self.postMessage("CLOSED");
    self.close();
}
function spawnNotification(title, body) {
    if (Notification.permission == "granted") {
        var options = {body: body,
                    icon: "/app/icons/kaidi_56.png",
                    tag: 'kaidi-notify'};
        var n = new Notification(title, options);
        n.onclick = function(e) {
            n.close.bind(n);
            window.open('app://kaidi.jkelol111.me');
        }
    } else {
        console.log("[notifyWorker] Notififcation permission not granted. Shutting down worker.");
        endWorker();
    }
}
self.onmessage = function(e) {
    console.log('[notifyWorker] Settings recieved from index.');
    settingsLoaded = JSON.parse(e.data);
    var ws = new WebSocket('ws://'+settingsLoaded.kodiIP+':9090'+'/jsonrpc');
    ws.onopen = function(e) {
        console.log("[notifyWorker] Now listening for Kodi notifications.")
    }
    ws.onmessage = function(e) {
        var j = JSON.parse(e.data);
        switch(j.method) {
            case "Player.OnPlay":
                if (j.params.data.item.title == undefined) {
                    spawnNotification("Playback started", j.params.data.item.label+" ("+j.params.data.item.type+")");
                } else {
                    spawnNotification("Playback started", j.params.data.item.title+" ("+j.params.data.item.type+")");
                }
                break;
            default:
                console.log("[notifyWorker] Recieved unprogrammed response "+j.method+" with response: "+e.data);
                break;
        }
    }
    ws.onerror = function(e) {
        console.log("[notifyWorker] Unable to connect to Kodi.");
    }
    ws.onclose = function(e) {
        console.log("[notifyWorker] WebSocket connection with Kodi closed!");
        console.log("[notifyWorker] Closing worker because WebSocket closed.")
        endWorker();
    }
}
