<p align="center">
  <img align="center" src="https://jkelol111.github.com/kaidi/docs/icons/kaidi_112.png">
  <br>
  <h1 align="center">Kaidi Remote (Beta)</h1>
  <h3 align="center">The Kodi remote app for KaiOS</h3>
</p>

<p align="center">
  <i align="center">Control your Kodi from a "dumb phone", because why not?</i>
  <br>
  <span align="center">Supports KaiOS 2.5 and above</span>
  <br>
  <span align="center">Tested with Kodi Krypton and above</span>
  <br>
  <a href="https://www.google.com/url?q=https%3A%2F%2Fsites.google.com%2Fview%2Fbananahackers%2Fhome&sa=D&sntz=1&usg=AFQjCNEtvVwlme7uKDuqfJaXLKBnLWNHTg">BananaHackers page</a> |
  <a href="https://github.com/jkelol111/kaidi/issues">Issue tracker</a> |
  <a href="https://github.com/jkelol111/kaidi/releases">Download now</a><br>
  <b>PROJECT STATE: Beta (version 0.4.8)</b>
</p>

## Key features:

<p align="center">
  <img align="center" src="https://jkelol111.github.com/kaidi/docs/screenshots/kaidi-home-screen.png">
  <img align="center" src="https://jkelol111.github.com/kaidi/docs/screenshots/kaidi-player-screen.png">
  <img align="center" src="https://jkelol111.github.com/kaidi/docs/screenshots/kaidi-settings-screen.png">
</p>

- Basic Kodi interface navigation (Up/Down/Left/Right/Context Menu/Home control).

- Kodi volume controls (increment, decrement, mute).

- A Kodi player control (Play/Pause/Set shuffle/Set repeat/Next/Previous/Wind forward/Wind backward).

- Notifications of now playing track (available if app is in background/screen off).

- Written in vanilla HTML/CSS/JS, no framework used, so we are quick ⏩.

## Building the app:

**To run:**

The app can be run directly from `src` for testing and debugging purposes, just point WebIDE/gDeploy/make-kaios-install to it and install.

**To build:**

- Run `npm install` to install dependencies.

- Run `gulp` (or `npm run_script build`) to generate a deployable minified app from the source to `./dist/deploy` (contains bare `application.zip` for KaiStore submission too). This will also generate an OmniSD-compatible package @ `.dist/omnisd/kaidi-*version number*-omnisd.zip`.

**You found a bug?**

Please submit the bug to the [issues tracker](https://github.com/jkelol111/kaidi/issues).

**Want to help out?**

Feel free to fork this repo and add your improvements, then create a pull request.

We now enforce [Standard JS](https://standardjs.com/) since 27/3/2020. Some files might not have been modified to reflect this change yet, but please do practice Standard JS (use ESLint, installable if you run `npm install` to install our dev-dependencies) if you ever submit your pull requests/modifications for review. This doesn't mean we will reject your pull request, but for large changes, bad Standard JS compliance will lead to rejected pull requests.