var getToKodi = function(settingsLoaded, kodiMethod, inParams={}) {
    var returnMessage = null;
    if (settingsLoaded === null) {
        return returnMessage;
    } else {
        var constructRequest = {"jsonrpc": "2.0", 
                                "method": kodiMethod, 
                                params: inParams,
                                "id": 1};
        var request = new XMLHttpRequest({mozSystem: true});
        console.log("[getToKodi] Sending POST to: 'http://"+settingsLoaded.kodiIP+":"+settingsLoaded.kodiPort+"/jsonrpc' with content '"+JSON.stringify(constructRequest)+"'.");
        request.open("POST", "http://"+settingsLoaded.kodiIP+":"+settingsLoaded.kodiPort+"/jsonrpc", true);
        request.setRequestHeader("Content-Type", "application/json");
        request.onreadystatechange = function () {
            if (request.readyState == XMLHttpRequest.DONE && request.status == 200) {
                console.log("[getToKodi] Recieved response: "+request.responseText);
                console.log("[getToKodi] Parsing response: '"+request.responseText+"' from method '"+kodiMethod+"'.")
                var responseParsed = JSON.parse(request.responseText);
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
                        } else if (kodiMethod == "Input.Up" || kodiMethod == "Input.Down" || kodiMethod == "Input.Left" || kodiMethod == "Input.Right" || kodiMethod == "Input.Select" || kodiMethod == "Input.Back") {
                            if (responseParsed.result != "OK") {
                                toastr["warning"]("Connected but invalid response from method '"+kodiMethod+"'.", "Request OK-ish!");
                            } else {
                                //Do nothing.
                            }
                        }
                    } else {
                        console.log("[getToKodi] No 'result' in response!")
                    }
                }
                console.log("[getToKodi] Finished parse of response.")
            } else if (request.readyState == 4 && request.status == 404 || request.status == 403 || request.status == 401) {
                console.log("[getToKodi] Server not found/forbidden ("+request.status+").");
                toastr["error"]("Unable to connect to Kodi server.", "Request failed!");
            } else if (request.readyState == XMLHttpRequest.DONE && request.status == 0) {
                console.log("[getToKodi] Server offline.")
                toastr["error"]("Unable to connect to Kodi server.", "Request failed!");
            }
        };
        request.send(JSON.stringify(constructRequest));
    }
    return returnMessage;
}