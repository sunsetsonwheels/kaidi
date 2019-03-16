window.addEventListener('DOMContentLoaded', function() {
    KAIDI_VERSION = "0.4.3"
    var settingsLoaded = null;
    var changeVolumeOpt = null;
    console.log("[init] Setting toastr options.")
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-bottom-full-width",
        "preventDuplicates": true,
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
    console.log("[init] Setting version in index.html.");
    document.getElementById("kaidiVersionDiv").innerHTML = "Kaidi version "+KAIDI_VERSION;
    console.log("[init] Create new XMLHttpRequest object.");
    var request = new XMLHttpRequest({mozSystem: true});
    function getToKodi(kodiMethod, inParams, callback) {
        if (settingsLoaded === null) {
            console.log("[getToKodi] Configuration not available. Not doing anything.");
        } else {
            var returnMessage = null;
            var constructRequest = {"jsonrpc": "2.0", 
                                    "method": kodiMethod, 
                                    "id": 1};
            if (typeof inParams == "object" && inParams != {}) {
                constructRequest.params = inParams;
            }
            console.log("[getToKodi] Sending POST to: 'http://"+settingsLoaded.kodiIP+":"+settingsLoaded.kodiPort+"/jsonrpc' with content '"+JSON.stringify(constructRequest)+"'.");
            request.open("POST", "http://"+settingsLoaded.kodiIP+":"+settingsLoaded.kodiPort+"/jsonrpc", true);
            request.setRequestHeader("Content-Type", "application/json");
            request.onload =  function() {
                var responseParsed = JSON.parse(request.responseText);
                console.log("[getToKodi] Recieved response: "+request.responseText);
                console.log("[getToKodi] Parsing response: '"+request.responseText+"' from method '"+kodiMethod+"'.");
                if (responseParsed.error) {
                    console.log("[getToKodi] Error found in response ("+responseParsed.error.code+").");
                    toastr["error"]("Error: "+responseParsed.error.message+"("+responseParsed.error.code+").", "Request failed!");
                } else {
                    console.log("[getToKodi] No error found in response, continuing parse.");
                    if (responseParsed.result) {
                        if (kodiMethod == "JSONRPC.ping") {
                            if (responseParsed.result == "pong") {
                                toastr["success"]("Connected to Kodi at "+settingsLoaded.kodiIP+":"+settingsLoaded.kodiPort, "Request OK!");
                            } else {
                                toastr["warning"]("Connected but non-standard response from method '"+kodiMethod+"'.", "Request OK-ish!");
                            }
                        } else {
                            returnMessage = responseParsed.result;
                        }
                    } else {
                        console.log("[getToKodi] No 'result' in response!");
                    }
                }
                console.log("[getToKodi] Finished parse of response.");
                if (returnMessage != null) {
                    if (typeof callback == "function") {
                        console.log("[getToKodi] Callback is set properly. Calling now.")
                        callback(returnMessage);
                    } else {
                        console.log("[getToKodi] Callback set but not a function. Not calling.")
                    }
                } else {
                   console.log("[getToKodi] Nothing to return, so not running callback.")
                }
            }
            request.onerror = function () {
                if (request.status == 404 || request.status == 403 || request.status == 401) {
                    console.log("[getToKodi] Server not found/forbidden ("+request.status+").");
                    toastr["error"]("Unable to connect to Kodi server.", "Request failed!");
                } else if (request.status == 0) {
                    console.log("[getToKodi] Server offline.")
                    toastr["error"]("Unable to connect to Kodi server.", "Request failed!");
                }
            }
            request.send(JSON.stringify(constructRequest));
        }
    }
    function changeVolume(data) {
        var currentVolume = data.volume;
        if (changeVolumeOpt == "Up") {
            if (currentVolume = 100) {
                //Do nothing
            } else {
                currentVolume = data.volume + 5;
            }
        } else if (changeVolumeOpt == "Down") {
            if (currentVolume < 0) {
                currentVolume = 0;
            } else {
                currentVolume = data.volume - 5;
            }
        } else {
            console.log("[changeVolume] Invalid input. Not doing anything.");
        }
        getToKodi("Application.SetVolume", {"volume": currentVolume});
        changeVolumeOpt = null;
        document.getElementById("volumeBar").value = currentVolume;
        document.getElementById("greyOutBox").style.visibility = "visible";
        window.setTimeout(function(e) {
            document.getElementById("greyOutBox").style.visibility = "hidden";
        }, 1000);
    }
    function setMute(data) {
        if (data.muted) {
            getToKodi("Application.SetMute", {"mute": false});
        } else {
            getToKodi("Application.SetMute", {"mute": true});
        }
    } 
    function testConnection() {
        getToKodi("JSONRPC.ping");
        getToKodi("GUI.ShowNotification", {"title": "Connected to Kaidi", "message": "Kaidi remote is now connected to your Kodi device. Start controlling now!"});
    }
    console.log("[init] Checking if configuration exists.");
    if (localStorage.getItem("settingsKey_kodiIP") == null || localStorage.getItem("settingsKey_kodiPort") == null || localStorage.getItem("settingsKey_kodiNotificationsEnabled") == null) {
        console.log("[init] Configuration doesn't exist, prompting create.");
        window.alert("Welcome to Kaidi, the remote app for Kodi on KaiOS. Let's start by configuring our IP and Port.");
        var settingsWindow = new MozActivity({
            name: "me.jkelol111.kaidi.settings",
            data: {}
        });
        settingsWindow.onsuccess = function() {
            window.alert("Now that configuration is complete, we will try to\
                          connect to the Kodi device. Please turn on 'Allow\
                          control of Kodi via HTTP' in 'Settings/Services'\
                          if you have not yet.");
            settingsLoaded = {"kodiIP": localStorage.getItem("settingsKey_kodiIP"),
                              "kodiPort": localStorage.getItem("settingsKey_kodiPort"),
                              "kodiNotificationsEnabled": localStorage.getItem("settingsKey_kodiNotificationsEnabled")};
            testConnection();
        }
    } else {
        console.log("[init] Configuration exists, trying it out.");
        settingsLoaded = {"kodiIP": localStorage.getItem("settingsKey_kodiIP"),
                          "kodiPort": localStorage.getItem("settingsKey_kodiPort"),
                          "kodiNotificationsEnabled": localStorage.getItem("settingsKey_kodiNotificationsEnabled")};
        testConnection();
    }
    console.log("[init] Registering web worker.")
    var notifyWorker = null;
    function registerNotifyWorker() {
        if (settingsLoaded.kodiNotificationsEnabled == "Turned on") {
            notifyWorker = new Worker('/js/notifyWorker.js');
            notifyWorker.postMessage(JSON.stringify(settingsLoaded));
        } else {
            console.log("[registerNotifyWorker] Notify worker option is off in settings. Not starting web worker.")
        }
    }
    registerNotifyWorker();
    window.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowLeft':
                getToKodi("Input.Left");
                break;
            case 'ArrowRight': 
                getToKodi("Input.Right");
                break;
            case 'ArrowUp':
                getToKodi("Input.Up");
                break;
            case 'ArrowDown':
                getToKodi("Input.Down");
                break;
            case 'Enter':
                getToKodi("Input.Select");
                break;
            case 'Call':
                getToKodi("Input.Back");
                break;
            case '1':
                getToKodi("Input.Home");
                break;
            case '2':
                getToKodi("Input.ContextMenu");
                break;
            case '3':
                getToKodi("Input.Info")
                break;
            case '4':
                var textToSend = window.prompt("Please input the text to send to Kodi:");
                if (textToSend == null) {
                    //Do nothing.
                } else {
                    getToKodi("Input.SendText", {"text": textToSend, "done": true});
                }
                break;
            case '5':
                changeVolumeOpt = "Up";
                getToKodi("Application.GetProperties", {"properties": ["volume", "muted"]}, changeVolume);
                break;
            case '8':
                changeVolumeOpt = "Down";
                getToKodi("Application.GetProperties", {"properties": ["volume", "muted"]}, changeVolume);
                break;
            case '6':
                getToKodi("Application.GetProperties", {"properties": ["volume", "muted"]}, setMute);
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
                                      "kodiPort": localStorage.getItem("settingsKey_kodiPort"),
                                      "kodiNotificationsEnabled": localStorage.getItem("settingsKey_kodiNotificationsEnabled")};
                    testConnection();
                    if (settingsLoaded.kodiNotificationsEnabled == "Turned on") {
                        console.log("[SoftRight] Registering notify worker.")
                        registerNotifyWorker();
                    } else {
                        notifyWorker.terminate();
                        console.log("[SoftRight] Disabling any active notify workers.");
                    }
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
    console.log("[init] Application fully initialized successfully.");
}, false);