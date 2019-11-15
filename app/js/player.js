window.addEventListener('DOMContentLoaded', function() {
    var activityHandler;
    navigator.mozSetMessageHandler('activity', function(activityRequest) {
        let option = activityRequest.source;
        if(option.name == "me.jkelol111.kaidi.alpha.player") {
            activityHandler = activityRequest;
        }
    });
    var playing = false;
    settingsLoaded = {"kodiIP": localStorage.getItem("settingsKey_kodiIP"),
                      "kodiPort": localStorage.getItem("settingsKey_kodiPort")};
    var kodiURL = "http://"+settingsLoaded.kodiIP+":"+settingsLoaded.kodiPort+"/jsonrpc";
    var timeIn;
    var timeOut;
    //Thanks to speedUpLoop for the idea, https://stackoverflow.com/users/10198411/wali-waqar on SO for the solution.
    function updateTime() {
        if(document.visiblityState == 'hidden') {}
        else if(document.visibilityState == 'visible') {
            atomic(kodiURL, {method: "POST",
                                data: JSON.stringify({jsonrpc: "2.0", method: "Player.GetActivePlayers", id: 1}),
                                headers: {"Content-Type": "application/json"}})
            .then(response => {
                if (response.data.result[0]) {
                    atomic(kodiURL, {method: "POST",
                                        data: JSON.stringify({jsonrpc: "2.0", method: "Player.GetProperties", params: {properties: ["percentage", "time", "totaltime"], playerid: response.data.result[0].playerid}, id: 1}),
                                        headers: {"Content-Type": "application/json"}})
                    .then(response2 => {
                        timeIn = response2.data.result.time;
                        timeOut = response2.data.result.totaltime;
                        if (timeIn == timeOut) {
                        } else {
                            document.getElementById("labelPlayerIndicatorWhite").innerHTML = timeIn.minutes+":"+('0' + timeIn.seconds).slice(-2)+"/"+timeOut.minutes+":"+('0' + timeOut.seconds).slice(-2);
                            document.getElementById("playerMeterBar").value = response2.data.result.percentage;  
                        }
                    })
                    .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!")); 
                }
                else {
                    document.getElementById("playerMeterBar").value = 0;
                    document.getElementById("labelPlayerIndicatorWhite").innerHTML = "0:00/0:00";
                    toastr["warning"]("Cannot perform action because player is not active", "Cannot run method!");
                }
            })
            .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
        }
        if (playing) {
            window.setTimeout(updateTime, 1000);
        } else {}
    }
    function updateLabels() {
        atomic(kodiURL, {method: "POST",
                         data: JSON.stringify({jsonrpc: "2.0", method: "Player.GetActivePlayers", id: 1}),
                         headers: {"Content-Type": "application/json"}})
        .then(response => {
                if (response.data.result[0]) {
                    atomic(kodiURL, {method: "POST",
                                     data: JSON.stringify({jsonrpc: "2.0", method: "Player.GetProperties", params: {properties: ["speed", "repeat", "shuffled"], playerid: response.data.result[0].playerid}, id: 1}),
                                     headers: {"Content-Type": "application/json"}})
                    .then(response => {
                            if (response.data.result.speed !== 0) {
                                playing = true;
                                if (response.data.result.shuffled) {
                                    document.getElementById("playerShuffleIndicator").src = "/icons/shuffle24x24.png";
                                    document.getElementById("softkey-left").innerHTML = "Shuffle-";
                                } else {
                                    document.getElementById("playerShuffleIndicator").src = "/icons/shuffle-grey24x24.png";
                                    document.getElementById("softkey-left").innerHTML = "Shuffle";
                                }
                                document.getElementById("softkey-center").innerHTML = "PAUSE";
                                if (response.data.result.repeat == "all" || response.data.result.repeat == "one") {
                                    document.getElementById("playerRepeatIndicator").src = "/icons/repeat24x24.png";
                                    document.getElementById("softkey-right").innerHTML = "Repeat-";
                                } else {
                                    document.getElementById("playerRepeatIndicator").src = "/icons/repeat-grey24x24.png";
                                    document.getElementById("softkey-right").innerHTML = "Repeat";
                                }
                            } else {
                                playing = false;
                                document.getElementById("softkey-left").innerHTML = "";
                                document.getElementById("softkey-center").innerHTML = "PLAY";
                                document.getElementById("softkey-right").innerHTML = "";
                            }
                            if (playing) {
                                document.getElementById("playerStatusContainer").style.visibility = "visible";
                            } else {
                                document.getElementById("playerStatusContainer").style.visibility = "hidden";
                            }
                            updateTime();
                    })
                    .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
                    atomic(kodiURL, {method: "POST",
                                     data: JSON.stringify({jsonrpc: "2.0", method: "Player.GetItem", params: {properties: ["title", "artist", "duration"], playerid: response.data.result[0].playerid}, id: 1}),
                                     headers: {"Content-Type": "application/json"}})
                    .then(response => {
                            if (response.data.result.item.title == "") {
                                document.getElementById("currentPlayingTitle").innerHTML = response.data.result.item.label;
                            } else {
                                document.getElementById("currentPlayingTitle").innerHTML = response.data.result.item.title;
                            }
                            if (response.data.result.item.artist == "") {
                                document.getElementById("currentPlayingArtist").innerHTML = "by artist info unavailable!";
                            } else {
                                document.getElementById("currentPlayingArtist").innerHTML = "by "+response.data.result.item.artist;
                            }
                    })
                    .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
                } else {
                    toastr["warning"]("Cannot perform action because player is not active", "Cannot run method!");
                }
        })
        .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
    }
    function playerControlHandler(control) {
        atomic(kodiURL, {method: "POST",
                         data: JSON.stringify({jsonrpc: "2.0", method: "Player.GetActivePlayers", id: 1}),
                         headers: {"Content-Type": "application/json"}})
        .then(response => {
                if (response.data.result[0]) {
                    switch(control) {
                        case "PlayPause":
                            atomic(kodiURL, {method: "POST",
                                             data: JSON.stringify({jsonrpc: "2.0", method: "Player.PlayPause", params: {playerid: response.data.result[0].playerid}, id: 1}),
                                             headers: {"Content-Type": "application/json"}})
                            .then(function(response) {
                                updateLabels();
                            })
                            .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
                            break;
                        case "Next":
                            atomic(kodiURL, {method: "POST",
                                             data: JSON.stringify({jsonrpc: "2.0", method: "Player.GoTo", params: {to: "next", playerid: response.data.result[0].playerid}, id: 1}),
                                             headers: {"Content-Type": "application/json"}})
                            .then(function(response) {
                                updateLabels();
                            })
                            .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
                        case "Previous":
                            atomic(kodiURL, {method: "POST",
                                             data: JSON.stringify({jsonrpc: "2.0", method: "Player.GoTo", params: {to: "previous", playerid: response.data.result[0].playerid}, id: 1}),
                                             headers: {"Content-Type": "application/json"}})
                            .then(function(response) {
                                updateLabels();
                            })
                            .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
                            break;
                        case "ShuffleCycle":
                            var toShuffled;
                            atomic(kodiURL, {method: "POST",
                                             data: JSON.stringify({jsonrpc: "2.0", method: "Player.GetProperties", params: {properties: ["shuffled"], playerid: response.data.result[0].playerid}, id: 1}),
                                             headers: {"Content-Type": "application/json"}})
                            .then(function(response2) {
                                if (response2.data.result.shuffled) {
                                    atomic(kodiURL, {method: "POST",
                                             data: JSON.stringify({jsonrpc: "2.0", method: "Player.SetShuffle", params: {shuffle: false, playerid: response.data.result[0].playerid}, id: 1}),
                                             headers: {"Content-Type": "application/json"}})
                                    .then(function(response) {
                                        updateLabels();
                                    })
                                    .catch(error => toastr["error"]("[g] Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
                                } else {
                                    atomic(kodiURL, {method: "POST",
                                             data: JSON.stringify({jsonrpc: "2.0", method: "Player.SetShuffle", params: {shuffle: true, playerid: response.data.result[0].playerid}, id: 1}),
                                             headers: {"Content-Type": "application/json"}})
                                    .then(function(response) {
                                        updateLabels();
                                    })
                                    .catch(error => toastr["error"]("[g] Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
                                }
                            })
                            .catch(error => toastr["error"]("[b] Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
                            break;
                        case "RepeatCycle":
                            atomic(kodiURL, {method: "POST",
                                            data: JSON.stringify({jsonrpc: "2.0", method: "Player.SetRepeat", params: {repeat: "cycle", playerid: response.data.result[0].playerid}, id: 1}),
                                            headers: {"Content-Type": "application/json"}})
                            .then(function(response) {
                                updateLabels();
                            })
                            .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
                            break;
                        case "SeekForward":
                            atomic(kodiURL, {method: "POST",
                                             data: JSON.stringify({jsonrpc: "2.0", method: "Player.Seek", params: {value: "smallforward", playerid: response.data.result[0].playerid}, id: 1}),
                                             headers: {"Content-Type": "application/json"}})
                            .then(function(response) {
                                updateLabels();
                            })
                            .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"))
                            break;
                        case "SeekBackward":
                            atomic(kodiURL, {method: "POST",
                                             data: JSON.stringify({jsonrpc: "2.0", method: "Player.Seek", params: {value: "smallbackward", playerid: response.data.result[0].playerid}, id: 1}),
                                             headers: {"Content-Type": "application/json"}})
                            .then(function(response) {
                                updateLabels();
                            })
                            .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"))
                            break;
                        default:
                            toastr["error"]("Supplied argument to playerControlHandler incorrect", "Argument error!");
                            break;
                    }
                } else {
                    toastr["warning"]("Cannot perform action because player is not active", "Cannot run method!");
                }
        })
        .catch(error => toastr["error"]("Unable to connect to Kodi ("+error.status+": "+error.statusText+")", "Connect failed!"));
    }
    function changeVolume(opt) {
        atomic(kodiURL, {method: "POST",
                         data: JSON.stringify({jsonrpc: "2.0", method: "Application.GetProperties", params: {properties: ["volume"]} , id: 1}),
                         headers: {"Content-Type": "application/json"}})
        .then(response => {
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
                        toastr["error"]("Argument error.");
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
    var ws = new WebSocket('ws://'+settingsLoaded.kodiIP+':9090'+'/jsonrpc');
    ws.onmessage = function(e) {
        var j = JSON.parse(e.data);
        switch(j.method) {
            case "Player.OnAVStart":
            case "Player.OnAVChange":
            case "Player.OnPlay":
            case "Player.OnPause":
            case "Player.OnResume":
                updateLabels();
                break;
            case "Player.OnSpeedChanged":
                break;
            case "Player.OnStop":
                playing = false;
                document.getElementById("softkey-left").innerHTML = "";
                document.getElementById("softkey-center").innerHTML = "";
                document.getElementById("softkey-right").innerHTML = "";
                document.getElementById("currentPlayingTitle").innerHTML = "Not playing anything.";
                document.getElementById("currentPlayingArtist").innerHTML = "To play something, go back and navigate to what you want to play.";
                document.getElementById("playerShuffleIndicator").src = "";
                document.getElementById("playerRepeatIndicator").src= "";
                document.getElementById("playerMeterBar").value = 0;
                document.getElementById("labelPlayerIndicatorWhite").innerHTML = "0:00/0:00";
                document.getElementById("playerStatusContainer").style.visibility = "hidden";
                break;
            default:
                //toastr["info"]("Method: "+j.method+"\nData:\n"+e.data);
                break;
        }
    }
    ws.onclose = function(e) {
        activityHandler.postResult({});
    }
    updateLabels();
    var beginKeydown = 0;
    var showBackWarn = localStorage.getItem("settingsKey_showPlayerWarn");
    if (!showBackWarn) {
        localStorage.setItem("settingsKey_showPlayerWarn", true);
    } else {}
    if (localStorage.getItem("settingsKey_showPlayerWarn")) {
        showBackWarn = true;
    } else {
        showBackWarn = false;
    }
    window.addEventListener('keyup', function(e) {
        if (playing) {
            if (e.key == "ArrowLeft" || e.key == "ArrowRight") {
                if ((new Date()).getTime() - beginKeydown >= 500) {
                    beginKeydown = 0; 
                    if (showBackWarn) {
                        localStorage.setItem("settingsKey_showBackWarn", false);
                        window.alert("This is the last time you will see this message, I promise. To seek backwards/forwards, hold on the left/right button.");
                    } else {}
                    if (e.key == "ArrowLeft") {
                        playerControlHandler("SeekBackward");
                    } else if (e.key == "ArrowRight") {
                        playerControlHandler("SeekForward");
                    }
                } else {
                    if (e.key == "ArrowLeft") {
                        playerControlHandler("Previous");
                    } else if (e.key == "ArrowRight") {
                        playerControlHandler("Next");
                    }
                }
            }
        } else {}
    })
    window.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'SoftLeft':
                if (playing) {
                    playerControlHandler("ShuffleCycle");
                }
                break;
            case 'SoftRight':
                if (playing) {
                    playerControlHandler("RepeatCycle");
                }
                break;
            case 'ArrowUp':
                changeVolume("Up");
                break;
            case 'ArrowDown':
                changeVolume("Down");
                break;
            case 'ArrowLeft':
                beginKeydown = (new Date()).getTime();
                break;
            case 'ArrowRight':
                beginKeydown = (new Date()).getTime();
                break;
            case 'Enter':
                playerControlHandler("PlayPause");
                break;
            case 'Backspace':
                e.preventDefault();
                ws.close();
                break;
    }});
}, false);