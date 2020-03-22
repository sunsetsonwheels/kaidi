"use strict"

class NotificationPermissionDeniedError extends Error {
  constructor() {
    this.name = "NotificationPermissionDeniedError";
    this.message = "Notification permission not granted! Notification will not be displayed";
    super(this.message);
  }
}

class NotificationFactory {
  constructor(notificationID) {
    this.notificationID = notificationID;
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
      throw new NotificationPermissionDeniedError();
    }
  }
  spawnNotification(titleLocalizationKey, bodyLocalizationKey, titleTextNoLocalization, bodyTextNoLocalization, notifId) {
    navigator.mozl10n.formatValue(titleLocalizationKey).then((titleText) => {
      navigator.mozl10n.formatValue(bodyLocalizationKey).then((bodyText) => {
        this._notify(titleText, bodyText, notifId);
      }).catch((err) => {
        this._notify(titleText, bodyTextNoLocalization, notifId);
      });
    }).catch((err) => {
      this._notify(titleTextNoLocalization, bodyTextNoLocalization, notifId);
    })
  }
}