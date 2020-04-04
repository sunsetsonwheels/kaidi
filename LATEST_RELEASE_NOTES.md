**Changelog:**

*New features:*

- **The app has been rewritten from the ground up (well most of it). Now looks so much better, and is more efficient in some areas too!**
  - CSS has been split into mutiple files for more modularity.
  - JS files are now commented properly, and follow Standard JS style.
  - We use now use `l10n.js` for localization, so app can have many languages now.
  - App also contains KaiAds now, which can be disabled in the settings of the app, sans constant nagging (we nag you once, and if you donate, good, otherwise the app functions perfectly without ads).

- Player view:
  - Shows hours along with minutes and seconds in elapsed/total time: Now we show the hour along with the minute and time too.
  - New thumbnail view: Added a new thumbnail view.

- Home view:
  - More controls: Moved some previous options to the new 'More controls' menu.

- Settings view:
  - Better styling: Looks so much better.
  - New theme option: Choose between light and dark so you don't sear your eyes in a dark room in front of your Kodi device.

*Bugs:*

- Player view:
  - Time update bug: Time label and meter might sometimes fail to update due to Kodi requests not being completed in timeout (if any Kodi devs are reading this, please let us subscribe to a time update event instead of polling it manually).
  - Info update bug: Sometimes, Kodi does not fire the events such as `OnPlay` or `OnStop` (I still don't know why, it could be a thing with my local copy of Kodi), which leads to the app not updating the UI with the latest information.

- The whole app:
  - Is heavier compared to Alpha: Although all the code has been refactored, it has become heavier. Some lag here and there to be expected. Will be refined in the upcoming releases.

**Install steps:**

*Using OmniSD:*

1. Download the file `kaidi-0.4.8-beta-omnisd.zip` to your SD card.

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