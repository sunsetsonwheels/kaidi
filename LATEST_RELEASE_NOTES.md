**Changelog:**

*New features:*

- Downgraded KaiAds SDK.

*Bugs:*

- Player view:
  - Time update bug: Time label and meter might sometimes fail to update due to Kodi requests not being completed in timeout (if any Kodi devs are reading this, please let us subscribe to a time update event instead of polling it manually).
  - Info update bug: Sometimes, Kodi does not fire the events such as `OnPlay` or `OnStop` (I still don't know why, it could be a thing with my local copy of Kodi), which leads to the app not updating the UI with the latest information.

**Install steps:**

*Using OmniSD:*

1. Download the file `kaidi-1.0.2-beta-omnisd.zip` to your SD card.

2. Open OmniSD and install.

*Using WebIDE:*

** You will need to have `node` installed to build the app.**

1. Download the source code zip above and extract it somewhere.

2. Change directory (`cd`) to the folder where you extracted the source code.

3. Run `npm install` to install all the build dependencies.

4. Run `npm run-script build` to build the app.

5. Open WebIDE with your device connected and select 'Open packaged app' on the sidebar.

6. Pick the path to the `./dist/deploy` folder.

7. Hit the 'Play' button to install.