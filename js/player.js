window.addEventListener('DOMContentLoaded', function() {
    var activityHandler = null;
    navigator.mozSetMessageHandler('activity', function(activityRequest) {
        let option = activityRequest.source
        if(option.name == "me.jkelol111.kaidi.player") {
            activityHandler = activityRequest;
        }
    });
    settingsLoaded = {"kodiIP": localStorage.getItem("settingsKey_kodiIP"),
                      "kodiPort": localStorage.getItem("settingsKey_kodiPort")};
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