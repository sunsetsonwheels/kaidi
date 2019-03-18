var settingsLoaded = null;
function spawnNotification(title, body) {
    var options = {body: body,
                   icon: "/icons/icon48x48.png",
                   tag: 'kaidi-notify'};
    var n = new Notification(title, options);
    n.onclick = function(e) {
        e.preventDefault();
        n.close.bind(n);
        var playerWindow = new MozActivity({name: "me.jkelol111.kaidi.player",
                                            data: {}});
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
                spawnNotification("Playback started", j.params.data.item.title+" ("+j.params.data.item.type+")");
                break;
            default:
                console.log("[notifyWorker] Recieved unprogrammed response "+j.method+" with response: "+e.data);
        }
    }
    ws.onerror = function(e) {
        console.log("[notifyWorker] Unable to connect to Kodi.");
    }
    ws.onclose = function(e) {
        console.log("[notifyWorker] WebSocket connection with Kodi closed!");
        console.log("[notifyWorker] Closing worker because WebSocket closed.")
        self.close();
    }
}
