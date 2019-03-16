window.addEventListener('DOMContentLoaded', function() {
    var activityHandler = null;
    navigator.mozSetMessageHandler('activity', function(activityRequest) {
        let option = activityRequest.source;
        if(option.name == "me.jkelol111.kaidi.player") {
            activityHandler = activityRequest;
        }
    });
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
    try {
    var playing = false;
    var dirtytemp = null;
    settingsLoaded = {"kodiIP": localStorage.getItem("settingsKey_kodiIP"),
                      "kodiPort": localStorage.getItem("settingsKey_kodiPort")};
    var request = new XMLHttpRequest({mozSystem: true});
    function getToKodi2(kodiMethod, inParams, callback) {
        if (settingsLoaded === null) {
            //Do nothing.
        } else {
            var returnMessage = null;
            var constructRequest = {"jsonrpc": "2.0", 
                                    "method": kodiMethod, 
                                    "id": 1};
            if (typeof inParams == "object" && inParams != {}) {
                constructRequest.params = inParams;
            }
            request.open("POST", "http://"+settingsLoaded.kodiIP+":"+settingsLoaded.kodiPort+"/jsonrpc", true);
            request.setRequestHeader("Content-Type", "application/json");
            request.onload =  function() {
                var responseParsed = JSON.parse(request.responseText);
                if (responseParsed.error) {
                    toastr["error"]("Error: "+responseParsed.error.message+"("+responseParsed.error.code+").", "Request failed!");
                } else {
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
                    } else {}
                }
                if (returnMessage != null) {
                    if (typeof callback == "function") {
                        callback(returnMessage);
                    } else {}
                } else {}
            }
            request.onerror = function () {
                if (request.status == 404 || request.status == 403 || request.status == 401) {
                    toastr["error"]("Unable to connect to Kodi server.", "Request failed!");
                } else if (request.status == 0) {
                    toastr["error"]("Unable to connect to Kodi server.", "Request failed!");
                }
            }
            request.send(JSON.stringify(constructRequest));
        }
    }
    function updateLabelsEvent(data) {
        if (playing) {
            document.getElementById("softkey-center").innerHTML = "PAUSE";
            document.getElementById("softkey-left").innerHTML = "Shuffle";
            document.getElementById("softkey-right").innerHTML = "Repeat";
        } else {
            document.getElementById("softkey-center").innerHTML = "PLAY";
            document.getElementById("softkey-left").innerHTML = "";
            document.getElementById("softkey-right").innerHTML = "";
        }
        document.getElementById("currentPlayingTitle").innerHTML = data.item.label;
        if (data.item.artist == "") {
            document.getElementById("currentPlayingArtist").innerHTML = "by artist info unavailable!";
        } else {
            document.getElementById("currentPlayingArtist").innerHTML = "by "+data.item.artist;
        }
    }
    function updateLabelsEventShim(data) {
        if (data[0]) {
            dirtytemp = data[0].type;
            if (dirtytemp == "audio") {
                getToKodi2("Player.GetItem", {"properties": ["title", "album", "artist", "duration", "thumbnail", "file", "fanart", "streamdetails"], "playerid": data[0].playerid}, updateLabelsEvent);
            } else if (dirtytemp == "video") {
                getToKodi2("Player.GetItem", {"properties": ["title", "album", "artist", "season", "episode", "duration", "showtitle", "tvshowid", "thumbnail", "file", "fanart", "streamdetails"], "playerid": data[0].playerid}, updateLabelsEvent);
            } else {
                //Invalid
            }    
        } else {}
    }
    function updatePlayingStatusEvent(data) {
        if (data[0].playerid == 0 || data[0].playerid == 1) {
            playing = true;
        } else {
            playing = false;
        }
    }

    function playPauseEvent(data) {
        getToKodi2("Player.PlayPause", {"playerid": data[0].playerid});
    }
    function previousEvent(data) {
        getToKodi2("Player.GoTo", {"playerid": data[0].playerid, "to": "previous"});
    }
    function nextEvent(data) {
        getToKodi2("Player.GoTo", {"playerid": data[0].playerid, "to": "previous"});
    }
    function setRepeatEvent(data) {
        getToKodi2("Player.SetRepeat", {"playerid": data[0].playerid, "repeat": "cycle"});
    }
    var ws = new WebSocket('ws://'+settingsLoaded.kodiIP+':9090'+'/jsonrpc');
    ws.onmessage = function(e) {
        var j = JSON.parse(e.data);
        switch(j.method) {
            case "Player.OnAVStart":
                playing = true;
                getToKodi2("Player.GetActivePlayers", {}, updateLabelsEventShim);
                break;
            case "Player.OnAVChange":
                playing = true;
                getToKodi2("Player.GetActivePlayers", {}, updateLabelsEventShim);
                break;
            case "Player.OnPlay":
                playing = true;
                getToKodi2("Player.GetActivePlayers", {}, updateLabelsEventShim);
                break;
            case "Player.OnPause":
                playing = false;
                getToKodi2("Player.GetActivePlayers", {}, updateLabelsEventShim);
                break;
            case "Player.OnResume":
                playing = true;
                getToKodi2("Player.GetActivePlayers", {}, updateLabelsEventShim);
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
                document.getElementById("currentPlayingTime").innerHTML = "This page helps you control Kodi's player.";
                break;
            default:
                toastr["info"](j.method);
        }
    }
    ws.onerror = function(e) {
        toastr["error"]("Unable to connect to Kodi server via WebSocket.", "Request failed!");
    }
    ws.onclose = function(e) {
        activityHandler.postResult({});
    }
    getToKodi2("Player.GetActivePlayers", {}, updatePlayingStatusEvent);
    window.setTimeout(function() {
        getToKodi2("Player.GetActivePlayers", {}, updateLabelsEventShim);
    }, 500);
    window.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'SoftLeft':
                if (playing) {
                    getToKodi2("Player.GetActivePlayers", {}, setShuffleEvent);
                } else {}
                break;
            case 'SoftRight':
                if (playing) {
                    getToKodi2("Player.GetActivePlayers", {}, setRepeatEvent);
                } else {}
                break;
            case 'ArrowLeft':
                if (playing) {
                    getToKodi2("Player.GetActivePlayers", {}, previousEvent);
                } else {}
                break;
            case 'ArrowRight':
                if (playing) {
                    getToKodi2("Player.GetActivePlayers", {}, nextEvent);
                }
                break;
            case 'Enter':
                if (playing) {
                    getToKodi2("Player.GetActivePlayers", {}, playPauseEvent);
                } else {}
                break;
            case 'Backspace':
                e.preventDefault();
                ws.close();
                break;
    }});
    } catch (err) {
        toastr["error"]("Error:"+err);
    }
    
}, false);