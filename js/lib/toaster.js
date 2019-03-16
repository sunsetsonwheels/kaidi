var showToast = function(message) {
  navigator.mozApps.getSelf().onsuccess = function (evt) {
    var app = evt.target.result;
    app.connect('systoaster').then(function onConnAccepted(ports) {
      ports.forEach(function (port) {
        port.postMessage({"message": message});
      });
    }, function onConnRejected(reason) {
      console.log('system-toaster is rejected:' + reason);
    });
  }
}
