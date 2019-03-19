window.addEventListener('DOMContentLoaded', function() {
    var settingsLoaded;
    var kodiURL;
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
    fetch('/manifest.webapp')
    .then(responseRaw => responseRaw.text())
    .then(responseText => JSON.parse(responseText).version)
    .then(version => document.getElementById("kaidiVersionDiv").innerHTML = "Kaidi version "+version);
    function changeVolume(opt) {
        atomic(kodiURL, {method: "POST",
                         data: JSON.stringify({jsonrpc: "2.0", method: "Application.GetProperties", params: {properties: ["volume"]} , id: 1}),
                         headers: {"Content-Type": "application/json"}})
        .then(function(response) {
                var currentVolume = response.data.result.volume;
                switch(opt) {
                    case "Up":
                        if (currentVolume !== 100) {
                            currentVolume += 5;
                        } else {}
                        break;
                    case "Down":
                        if (currentVolume !== 0) {
                            currentVolume -= 5;
                        } else {}
                        break;
                    default:
                        return;
                        break;
                }
                atomic(kodiURL, {method: "POST",
                                 data: JSON.stringify({"jsonrpc": "2.0", "method": "Application.SetVolume", "params": {"volume": currentVolume}, "id": 1}),
                                 headers: {"Content-Type": "application/json"}})
                .then(function(response) {
                        document.getElementById("volumeBar").value = currentVolume;
                        document.getElementById("greyOutBox").style.visibility = "visible";
                        window.setTimeout(function(e) {
                            document.getElementById("greyOutBox").style.visibility = "hidden";
                        }, 1000);
                })
                .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
        })
        .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
    }
    function toggleMute() {
        atomic(kodiURL, {method: "POST",
                         data: JSON.stringify({jsonrpc: "2.0", method: "Application.GetProperties", params: {properties: ["muted"]} , id: 1}),
                         headers: {"Content-Type": "application/json"}})
        .then(function(response) {
                if (response.data.result.muted) {
                    atomic(kodiURL, {method: "POST",
                                     data: JSON.stringify({jsonrpc: "2.0", method: "Application.SetMute", params: {mute: false} , id: 1}),
                                     headers: {"Content-Type": "application/json"}})
                    .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
                } else {
                    atomic(kodiURL, {method: "POST",
                                     data: JSON.stringify({jsonrpc: "2.0", method: "Application.SetMute", params: {mute: true} , id: 1}),
                                     headers: {"Content-Type": "application/json"}})
                    .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
                }
        })
        .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
    } 
    function kodiInputHandler(button) {
        atomic(kodiURL, {method: "POST",
                         data: JSON.stringify({jsonrpc: "2.0", method: "Input."+button, id: 1}),
                         headers: {"Content-Type": "application/json"}})
        .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
    }
    function textToKodi(textToSend) {
        if (textToSend !== null) {
            atomic(kodiURL, {method: "POST",
                             data: JSON.stringify({jsonrpc: "2.0", method: "Input.SendText", params: {text: textToSend, done: true}, id: 1}),
                             headers: {"Content-Type": "application/json"}})
            .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"))
        } else {}
    }
    function testConnection() {
        atomic(kodiURL, {method: "POST",
                         data: JSON.stringify({jsonrpc: "2.0", method: "JSONRPC.ping", id: 1}),
                         headers: {"Content-Type": "application/json"}})
        .then(function(response) {
                if (response.data.result == "pong") {
                    toastr["success"]("Connected to Kodi at "+settingsLoaded.kodiIP+":"+settingsLoaded.kodiPort, "Connect success!");
                } else {
                    toastr["success"]("Connected to Kodi at "+settingsLoaded.kodiIP+":"+settingsLoaded.kodiPort, "Connect success!");
                }
                atomic(kodiURL, {method: "POST",
                                 data: JSON.stringify({jsonrpc: "2.0", method: "GUI.ShowNotification", params: {title: "Connected to Kaidi", message: "Kaidi is connected to this Kodi device."}, id: 1}),
                                 headers: {"Content-Type": "application/json"}})
                .then(function(response) {
                            if (response.data.result == "OK") {
                                toastr["success"]("Connected to Kodi at "+settingsLoaded.kodiIP+":"+settingsLoaded.kodiPort, "Connect success!");
                            } else {
                                toastr["success"]("Connected to Kodi at "+settingsLoaded.kodiIP+":"+settingsLoaded.kodiPort, "Connect success!");
                            }
                });
        })
        .catch(function (error) {
                toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!");
        });
    }
    if (localStorage.getItem("settingsKey_kodiIP") == null || localStorage.getItem("settingsKey_kodiPort") == null || localStorage.getItem("settingsKey_kodiNotificationsEnabled") == null) {
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
        }
    } else {
        settingsLoaded = {"kodiIP": localStorage.getItem("settingsKey_kodiIP"),
                          "kodiPort": localStorage.getItem("settingsKey_kodiPort"),
                          "kodiNotificationsEnabled": localStorage.getItem("settingsKey_kodiNotificationsEnabled")};
    }
    kodiURL = "http://"+settingsLoaded.kodiIP+":"+settingsLoaded.kodiPort+"/jsonrpc";
    testConnection();
    var notifyWorker;
    function registerNotifyWorker() {
        if (settingsLoaded.kodiNotificationsEnabled == "Turned on") {
            notifyWorker = new Worker('/js/notifyWorker.js');
            notifyWorker.postMessage(JSON.stringify(settingsLoaded));
        } else {}
    }
    registerNotifyWorker();
    window.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowLeft':
                kodiInputHandler("Left");
                break;
            case 'ArrowRight': 
                kodiInputHandler("Right");
                break;
            case 'ArrowUp':
                kodiInputHandler("Up");
                break;
            case 'ArrowDown':
                kodiInputHandler("Down");
                break;
            case 'Enter':
                kodiInputHandler("Select");
                break;
            case 'Call':
                kodiInputHandler("Back");
                break;
            case '1':
                kodiInputHandler("Home");
                break;
            case '2':
                kodiInputHandler("ContextMenu");
                break;
            case '3':
                kodiInputHandler("Info");
                break;
            case '4':
                var textToSend = window.prompt("Please input the text to send to Kodi:");
                textToKodi(textToSend);
                break;
            case '5':
                changeVolume("Up");
                break;
            case '8':
                changeVolume("Down");
                break;
            case '6':
                toggleMute();
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
                        if (typeof notifyWorker == "undefined") {
                            registerNotifyWorker();
                        } else {
                            console.log("[SoftRight] notifyWorker already running. Not starting a new one.")
                        }
                    } else {
                        notifyWorker.terminate();
                        delete notifyWorker;
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
}, false);