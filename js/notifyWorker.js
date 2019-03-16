var settingsLoaded = null;
function spawnNotification(title, body) {
    var options = {body: body,
                   icon: "/icons/icon48x48.png"};
    var n = new Notification(title, options);
    n.onclick = function(e) {
        e.preventDefault();
        var playerWindow = new MozActivity({name: "me.jkelol111.kaidi.player",
                                            data: {}});
    }
}
onmessage = function(e) {
    console.log('[notifyWorker] Settings recieved from index.');
    settingsLoaded = JSON.parse(e.data);
    var ws = new WebSocket('ws://'+settingsLoaded.kodiIP+':9090'+'/jsonrpc');
    ws.onmessage = function(e) {
        var j = JSON.parse(e.data);
        switch(j.method) {
            case "Player.OnAVStart":
                spawnNotification("Playback started", j.params.data.item.title+"("+j.params.data.item.type+")");
                break;
            case "Player.OnAVChange":
                spawnNotification("Playback changed", j.params.data.item.title+"("+j.params.data.item.type+")");
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
        self,close();
    }
}
