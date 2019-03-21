window.addEventListener('DOMContentLoaded', function() {
    var activityHandler = null;
    var selectedElement = 0;
    navigator.mozSetMessageHandler('activity', function(activityRequest) {
        let option = activityRequest.source
        if(option.name == "me.jkelol111.kaidi.settings") {
            activityHandler = activityRequest;
        }
    });
    //Taken from David Walsh's blog. Thanks a lot :)
    function moveCursorToEnd(el) {
        if (typeof el.selectionStart == "number") {
            el.selectionStart = el.selectionEnd = el.value.length;
        } else if (typeof el.createTextRange != "undefined") {
            el.focus();
            var range = el.createTextRange();
            range.collapse(false);
            range.select();
        }
    }
    function handleUpDownKeys() {
        if (selectedElement == 0) {
            document.getElementById("container2").style.backgroundColor = '#ffffff';
            document.getElementById("label2").style.color = '#323232';
            document.getElementById("kodiNotificationButton").style.backgroundColor = '#ffffff';
            document.getElementById("kodiNotificationButton").style.color = '#323232';
            document.getElementById("kodiNotificationButton").blur();
            document.getElementById("container1").style.backgroundColor = '#ffffff';
            document.getElementById("label1").style.color = '#323232';
            document.getElementById("kodiPortInput").blur();
            document.getElementById("container0").style.backgroundColor = '#1BC1C4';
            document.getElementById("label0").style.color = '#ffffff';
            document.getElementById("kodiIPInput").focus();
            moveCursorToEnd(document.getElementById('kodiIPInput'));
            document.getElementById("softkey-center").innerHTML = "";
        } else if (selectedElement == 1) {
            document.getElementById("container2").style.backgroundColor = '#ffffff';
            document.getElementById("label2").style.color = '#323232';
            document.getElementById("kodiNotificationButton").style.backgroundColor = '#ffffff';
            document.getElementById("kodiNotificationButton").style.color = '#323232';
            document.getElementById("kodiNotificationButton").blur();
            document.getElementById("container0").style.backgroundColor = '#ffffff';
            document.getElementById("label0").style.color = '#323232';
            document.getElementById("kodiIPInput").blur();
            document.getElementById("container1").style.backgroundColor = '#1BC1C4';
            document.getElementById("label1").style.color = '#ffffff';
            document.getElementById("kodiPortInput").focus();
            moveCursorToEnd(document.getElementById('kodiPortInput'));
            document.getElementById("softkey-center").innerHTML = "";
        } else if (selectedElement == 2) {
            document.getElementById("container2").style.backgroundColor = '#1BC1C4';
            document.getElementById("label2").style.color = '#ffffff';
            document.getElementById("kodiNotificationButton").style.backgroundColor = '#1BC1C4';
            document.getElementById("kodiNotificationButton").style.color = '#ffffff';
            document.getElementById("kodiNotificationButton").focus();
            document.getElementById("container1").style.backgroundColor = '#ffffff';
            document.getElementById("label1").style.color = '#323232';
            document.getElementById("kodiPortInput").blur();
            document.getElementById("container0").style.backgroundColor = '#ffffff';
            document.getElementById("label0").style.color = '#323232';
            document.getElementById("kodiIPInput").blur();
            document.getElementById("softkey-center").innerHTML = "TOGGLE";
        } else if (selectedElement > 2) {
            selectedElement = 0;
            document.getElementById("container2").style.backgroundColor = '#ffffff';
            document.getElementById("label2").style.color = '#323232';
            document.getElementById("kodiNotificationButton").style.backgroundColor = '#ffffff';
            document.getElementById("kodiNotificationButton").style.color = '#323232';
            document.getElementById("kodiNotificationButton").blur();
            document.getElementById("container1").style.backgroundColor = '#ffffff';
            document.getElementById("label1").style.color = '#323232';
            document.getElementById("kodiPortInput").blur();
            document.getElementById("container0").style.backgroundColor = '#1BC1C4';
            document.getElementById("label0").style.color = '#ffffff';
            document.getElementById("kodiIPInput").focus();
            document.getElementById("softkey-center").innerHTML = "";
        } else if (selectedElement < 0) {
            selectedElement = 2;
            document.getElementById("container0").style.backgroundColor = '#ffffff';
            document.getElementById("label0").style.color = '#323232';
            document.getElementById("kodiIPInput").blur();
            document.getElementById("container1").style.backgroundColor = '#ffffff';
            document.getElementById("label1").style.color = '#323232';
            document.getElementById("kodiPortInput").blur();
            document.getElementById("container2").style.backgroundColor = '#1BC1C4';
            document.getElementById("label2").style.color = '#ffffff';
            document.getElementById("kodiNotificationButton").style.backgroundColor = '#1BC1C4';
            document.getElementById("kodiNotificationButton").style.color = '#ffffff';
            document.getElementById("kodiNotificationButton").focus();
            document.getElementById("softkey-center").innerHTML = "TOGGLE";
        }
    }
    function saveSettings() {
        localStorage.setItem("settingsKey_kodiIP", document.getElementById("kodiIPInput").value);
        localStorage.setItem("settingsKey_kodiPort", document.getElementById("kodiPortInput").value);
        localStorage.setItem("settingsKey_kodiNotificationsEnabled", document.getElementById("kodiNotificationButton").value);
    }
    if (localStorage.getItem("settingsKey_kodiIP") == null || localStorage.getItem("settingsKey_kodiPort") == null || localStorage.getItem("settingsKey_kodiNotificationsEnabled") == null) {
        localStorage.setItem("settingsKey_kodiIP", "192.168.0.8");
        localStorage.setItem("settingsKey_kodiPort", "12345");
        localStorage.setItem("settingsKey_kodiNotificationsEnabled", "Turned on");
    }
    var currentSettings = {"kodiIP": localStorage.getItem("settingsKey_kodiIP"),
                           "kodiPort": localStorage.getItem("settingsKey_kodiPort"),
                           "kodiNotificationsEnabled": localStorage.getItem("settingsKey_kodiNotificationsEnabled")};
    document.getElementById("kodiIPInput").value = currentSettings.kodiIP;
    document.getElementById("kodiPortInput").value = currentSettings.kodiPort;
    document.getElementById("kodiNotificationButton").value = currentSettings.kodiNotificationsEnabled;
    handleUpDownKeys();
    document.getElementById("kodiNotificationButton").onclick = function(e) {
        if (document.getElementById("kodiNotificationButton").value == "Turned on") {
            document.getElementById("kodiNotificationButton").value= "Turned off";
        } else if (document.getElementById("kodiNotificationButton").value = "Turned off") {
            document.getElementById("kodiNotificationButton").value = "Turned on";
        } else {}
    }
    window.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowUp':
                selectedElement -= 1;
                handleUpDownKeys();
                break;
            case 'ArrowDown':
                selectedElement += 1;
                handleUpDownKeys();
                break;
            case 'SoftLeft':
                if (window.confirm("Revert your changes?")) {
                    localStorage.setItem("settingsKey_kodiIP", currentSettings.kodiIP);
                    localStorage.setItem("settingsKey_kodiPort", currentSettings.kodiPort);
                    localStorage.setItem("settingsKey_kodiNotificationsEnabled", currentSettings.kodiNotificationsEnabled);
                    activityHandler.postResult({});
                } else {
                    //Do nothing
                }
                break;
            case 'SoftRight':
                saveSettings();
                activityHandler.postResult({});
                break;
            case 'Enter':
                e.preventDefault();
                if (document.getElementById("softkey-center").innerHTML = "TOGGLE") {
                    document.getElementById("kodiNotificationButton").click();
                } else {}
                break;
            case 'Backspace':
                e.preventDefault();
                if (document.getElementById("kodiIPInput").value != currentSettings.kodiIP || document.getElementById("kodiPortInput").value != currentSettings.kodiPort || document.getElementById("kodiNotificationButton").value != currentSettings.kodiNotificationsEnabled) {
                    if (window.confirm("Save your changes?")) {
                        saveSettings()
                    } else {
                        //Do nothing
                    }
                } else {
                    //Do nothing
                }
                activityHandler.postResult({});
                break;
    }});
}, false);