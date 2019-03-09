window.addEventListener('DOMContentLoaded', function() {
    var activityHandler = null;
    var selectedElement = 0;
    navigator.mozSetMessageHandler('activity', function(activityRequest) {
        let option = activityRequest.source
        if(option.name == "me.jkelol111.kaidi.settings") {
            activityHandler = activityRequest;
        }
    });
    function handleUpDownKeys() {
        if (selectedElement == 0) {
            document.getElementById("container1").style.backgroundColor = '#ffffff';
            document.getElementById("label1").style.color = '#323232';
            document.getElementById("kodiPortInput").blur();
            document.getElementById("container0").style.backgroundColor = '#1BC1C4';
            document.getElementById("label0").style.color = '#ffffff';
            document.getElementById("kodiIPInput").focus();
        } else if (selectedElement == 1) {
            document.getElementById("container0").style.backgroundColor = '#ffffff';
            document.getElementById("label0").style.color = '#323232';
            document.getElementById("kodiIPInput").blur();
            document.getElementById("container1").style.backgroundColor = '#1BC1C4';
            document.getElementById("label1").style.color = '#ffffff';
            document.getElementById("kodiPortInput").focus();
        } else if (selectedElement > 1) {
            selectedElement = 0;
            document.getElementById("container1").style.backgroundColor = '#ffffff';
            document.getElementById("label1").style.color = '#323232';
            document.getElementById("kodiPortInput").blur();
            document.getElementById("container0").style.backgroundColor = '#1BC1C4';
            document.getElementById("label0").style.color = '#ffffff';
            document.getElementById("kodiIPInput").focus();
        } else if (selectedElement < 0) {
            selectedElement = 1;
            document.getElementById("container0").style.backgroundColor = '#ffffff';
            document.getElementById("label0").style.color = '#323232';
            document.getElementById("kodiIPInput").blur();
            document.getElementById("container1").style.backgroundColor = '#1BC1C4';
            document.getElementById("label1").style.color = '#ffffff';
            document.getElementById("kodiPortInput").focus();
        }
    }
    function saveSettings() {
        localStorage.setItem("settingsKey_kodiIP", document.getElementById("kodiIPInput").value);
        localStorage.setItem("settingsKey_kodiPort", document.getElementById("kodiPortInput").value);
    }
    if (localStorage.getItem("settingsKey_kodiIP") == null || localStorage.getItem("settingsKey_kodiPort") == null) {
        localStorage.setItem("settingsKey_kodiIP", "192.168.0.8");
        localStorage.setItem("settingsKey_kodiPort", "12345")
    }
    var currentSettings = {"kodiIP": localStorage.getItem("settingsKey_kodiIP"),
                           "kodiPort": localStorage.getItem("settingsKey_kodiPort")};
    document.getElementById("kodiIPInput").value = currentSettings.kodiIP;
    document.getElementById("kodiPortInput").value = currentSettings.kodiPort;
    handleUpDownKeys();
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
                    activityHandler.postResult({});
                } else {
                    //Do nothing
                }
                break;
            case 'SoftRight':
                saveSettings();
                activityHandler.postResult({});
                break;
            case 'Backspace':
                e.preventDefault();
                if (document.getElementById("kodiIPInput").value != currentSettings.kodiIP || document.getElementById("kodiPortInput").value != currentSettings.kodiPort) {
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