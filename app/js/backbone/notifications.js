"use strict"

class NotificationFactory {
  constructor(notificationID) {
    this.notificationLogger = new LoggerFactory("NotificationFactory:"+notificationID);
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
  spawnNotification(titleLocalizationKey, bodyLocalizationKey, notifId) {
    navigator.mozl10n.formatValue(titleLocalizationKey).then((titleText) => {
      navigator.mozl10n.formatValue(bodyLocalizationKey).then((bodyText) => {
        this._notify(titleText, bodyText, notifId);
      }).catch((err) => {
        this.notificationLogger.error(new Error("Failed to retrieve localization for bodyKey '"+titleLocalizationKey+"'."));
        this.notificationLogger.error(err);
      });
    }).catch((err) => {
      this.notificationLogger.error(new Error("Failed to retrieve localization for titleKey '"+titleLocalizationKey+"'."));
      this.notificationLogger.error(err);
    })
  }
}