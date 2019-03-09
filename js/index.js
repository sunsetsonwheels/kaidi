window.addEventListener('DOMContentLoaded', function() {
    KAIDI_VERSION = "0.2.2"
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
    function testConnection() {
        getToKodi(settingsLoaded, "JSONRPC.ping");
        getToKodi(settingsLoaded, "GUI.ShowNotification", {"title": "Connected to Kaidi", "message": "Kaidi remote is now connected to your Kodi device. Start controlling now!"});
    }
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
            testConnection();
        }
    } else {
        settingsLoaded = {"kodiIP": localStorage.getItem("settingsKey_kodiIP"),
                          "kodiPort": localStorage.getItem("settingsKey_kodiPort")};
        testConnection();
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
            case '1':
                getToKodi(settingsLoaded, "Input.Home");
                break;
            case '2':
                getToKodi(settingsLoaded, "Input.ContextMenu");
                break;
            case '3':
                getToKodi(settingsLoaded, "Input.Info")
                break;
            case '4':
                var textToSend = window.prompt("Please input the text to send to Kodi:");
                if (textToSend == null) {
                    toastr["warning"]("User inputted nothing. Not sending!", "No input!");
                } else {
                    getToKodi(settingsLoaded, "Input.SendText", {"text": textToSend, "done": true});
                }
                break;
            case 'SoftLeft':
                var playerWindow = new MozActivity({
                    name: "me.jkelol111.kaidi.player",
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
                    testConnection();
                }
                break;
            case 'Backspace':
                e.preventDefault();
                if (confirm("Exit Kaidi Remote?")) {
                    window.close();
                } else {
                    //Do nothing.
                }
                break;
    }});
}, false);