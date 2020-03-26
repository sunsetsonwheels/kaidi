"use strict"


class LoggerFactory {
  constructor(moduleName) {
    this.logPrefix = "["+moduleName+"]";
    console.log("[WorkerLoggerFactory] LoggerFactory '"+moduleName+"' created.")
  }
  _getLogString(log) {
    return this.logPrefix+" "+String(log);
  }
  log(message) {
    console.log(this._getLogString(message));
  }
  error(error) {
    console.error(this._getLogString(error));
  }
}

class NotificationFactory {
  constructor(notificationID) {
    this.notificationLogger = new LoggerFactory("WorkerNotificationFactory:"+notificationID);
  }
  _notify(title, body, notifId) {
    if (Notification.permission == "granted") {
      var n = new Notification(title, {body: body,
                                        icon: "/app/icons/kaidi_56.png",
                                        id: notifId});
      n.onclick = () => {
        n.close.bind(n);
        window.open('app://'+KAIDI_ORIGIN+'.jkelol111.me');
      }
    } else {
      this.notificationLogger.error(new Error("Cannot send notification with content: "+
                                              JSON.stringify({title: title, body: body, id: notifId})));
      this.notificationLogger.error(new Error("Notification permission denied. Notification not sent."));
    }
  }
  spawnNotification(title, body, notifId) {
    this._notify(title, body, notifId)
  }
}