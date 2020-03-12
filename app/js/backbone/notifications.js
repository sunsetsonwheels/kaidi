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
    }
  }
  spawnNotification(titleLocalizationKey, bodyLocalizationKey, notifId) {
    // TODO: Complete localization for notification
  }
  spawnNotificationNoLocalization(title, body, notifId) {
    this._notify(title, body, notifId);
  }
}