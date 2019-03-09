window.addEventListener('DOMContentLoaded', function() {
    var activityHandler = null;
    navigator.mozSetMessageHandler('activity', function(activityRequest) {
        let option = activityRequest.source
        if(option.name == "me.jkelol111.kaidi.morecontrols") {
            activityHandler = activityRequest;
        }
    });
    settingsLoaded = {"kodiIP": localStorage.getItem("settingsKey_kodiIP"),
                      "kodiPort": localStorage.getItem("settingsKey_kodiPort")};
    window.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'SoftLeft':
                var textToSend = window.prompt("Please input the text to send to Kodi:");
                if (textToSend == null) {
                    window.alert("You cannot send nothing! Please try again.");
                } else {
                    getToKodi(settingsLoaded, "Input.SendText", {"text": textToSend, "done": true});
                }
                break;
            case 'SoftRight':
                break;
            case 'Backspace':
                e.preventDefault();
                activityHandler.postResult({});
                break;
    }});
}, false);