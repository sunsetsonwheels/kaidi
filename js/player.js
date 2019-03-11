window.addEventListener('DOMContentLoaded', function() {
    var activityHandler = null;
    navigator.mozSetMessageHandler('activity', function(activityRequest) {
        let option = activityRequest.source;
        if(option.name == "me.jkelol111.kaidi.player") {
            activityHandler = activityRequest;
        }
    });
    settingsLoaded = {"kodiIP": localStorage.getItem("settingsKey_kodiIP"),
                      "kodiPort": localStorage.getItem("settingsKey_kodiPort")};
    var wsObject = new WebSocket("ws://"+settingsLoaded.kodiIP+":"+settingsLoaded.kodiPort+"/jsonrpc");
    wsObject.onmessage = function(event) {
        var parsedResponse = JSON.parse(event.data);
    }
    function getToKodiWs(method, params) {
        var msg = {
            "jsonrpc": "2.0", 
            "method": method, 
            "id": method
        };
        if (params) {
            msg.params = params;
        }
        wsObject.send(JSON.stringify(msg));
    }
    window.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'SoftLeft':
                break;
            case 'SoftRight':
                break;
            case 'Backspace':
                e.preventDefault();
                activityHandler.postResult({});
                break;
    }});
}, false);