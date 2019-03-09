window.addEventListener('DOMContentLoaded', function() {
    KAIDI_VERSION = "0.1.1"
    var settingsLoaded = null;
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-full-width",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "slideDown",
        "hideMethod": "slideUp"
    }
    document.getElementById("kaidiVersionDiv").innerHTML = "Kaidi version "+KAIDI_VERSION;
    if (localStorage.getItem("settingsKey_kodiIP") == null || localStorage.getItem("settingsKey_kodiPort") == null) {
        window.alert("Welcome to Kaidi, the remote app for Kodi on KaiOS. Let's start by configuring our IP and Port.");
        var settingsWindow = new MozActivity({
            name: "me.jkelol111.kaidi.settings",
            data: {}
        });
        settingsWindow.onsuccess = function() {
            window.alert("Now that configuration is complete, we will try to\
                          connect to the Kodi device. Please turn on 'Allow\
                          control of Kodi via HTTP' in 'System/Settings\
                          Network/Services' if you have not yet.");
            settingsLoaded = {"kodiIP": localStorage.getItem("settingsKey_kodiIP"),
                              "kodiPort": localStorage.getItem("settingsKey_kodiPort")};
            getToKodi(settingsLoaded, "JSONRPC.ping");
        }
    } else {
        settingsLoaded = {"kodiIP": localStorage.getItem("settingsKey_kodiIP"),
                          "kodiPort": localStorage.getItem("settingsKey_kodiPort")};
        getToKodi(settingsLoaded, "JSONRPC.ping");
    }
    window.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowLeft':
                getToKodi(settingsLoaded, "Input.Left");
                break;
            case 'ArrowRight': 
                getToKodi(settingsLoaded, "Input.Right");
                break;
            case 'ArrowUp':
                getToKodi(settingsLoaded, "Input.Up");
                break;
            case 'ArrowDown':
                getToKodi(settingsLoaded, "Input.Down");
                break;
            case 'Enter':
                getToKodi(settingsLoaded, "Input.Select");
                break;
            case 'Call':
                getToKodi(settingsLoaded, "Input.Back");
                break;
            case 'SoftLeft':
                var moreControlsWindow = new MozActivity({
                    name: "me.jkelol111.kaidi.morecontrols",
                    data: {}
                });
                break;
            case 'SoftRight':
                var settingsWindow = new MozActivity({
                    name: "me.jkelol111.kaidi.settings",
                    data: {}
                });
                settingsWindow.onsuccess = function() {
                    settingsLoaded = {"kodiIP": localStorage.getItem("settingsKey_kodiIP"),
                                      "kodiPort": localStorage.getItem("settingsKey_kodiPort")};
                    getToKodi(settingsLoaded, "JSONRPC.ping");
                }
                break;
            case 'Backspace':
                if (window.confirm("Close Kaidi Remote?")) {
                    window.close();
                } else {
                    //Do nothing...
                }
                break;
    }});
}, false);