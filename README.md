![kaidi-beta-logo](/docs/icons/kaidi_112.png)

# Kaidi Remote

### The Kodi remote app for KaiOS (for now...)

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/jkelol111/kaidi/graphs/commit-activity)
[![Latest release](https://img.shields.io/github/v/tag/jkelol111/kaidi?color=orange&label=latest%20release)](https://github.com/jkelol111/kaidi/releases)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-yellow.svg)](https://standardjs.com)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

|           Current app versions          | Supported KaiOS versions |              Supported Kodi versions             |
|:---------------------------------------:|:------------------------:|:------------------------------------------------:|
| - 1.0.6 (Stable)<br><br>- 0.4.7.3 (Alpha) |       >= KaiOS 2.5       | >= Kodi Krypton (17.x)<br><br>>= JSON-RPC API v8 |

## Key features

![kaidi-home-screen](/docs/screenshots/kaidi-home-screen.png)
![kaidi-player-screen](/docs/screenshots/kaidi-playing-screen.png)
![kaidi-settings-screen](/docs/screenshots/kaidi-settings-screen.png)

- Basic Kodi interface navigation (Up/Down/Left/Right/Context Menu/Home control).

- Kodi volume controls (increment, decrement, mute).

- A Kodi player control (Play/Pause/Set shuffle/Set repeat/Next/Previous/Wind forward/Wind backward).

- Notifications of now playing track (available if app is in background/screen off).

- Written in vanilla HTML/CSS/JS, no framework used, so we are quick ⏩.

## Building the app

**To run:**

The app can be run directly from `src` for testing and debugging purposes, just point WebIDE/gDeploy/make-kaios-install to it and install.

**To build:**

- Run `npm install` to install dependencies.

- Run `gulp` (or `npm run_script build`) to generate a deployable minified app from the source to `./dist/deploy` (contains bare `application.zip` for KaiStore submission too). This will also generate an OmniSD-compatible package @ `.dist/omnisd/kaidi-*version number*-omnisd.zip`.

## You found a bug?

Please submit the bug to the [issues tracker](https://github.com/jkelol111/kaidi/issues).

## Want to help out?

Feel free to fork this repo and add your improvements, then create a pull request.

We are especially looking for improvements to the player, as well as added localizations.

We now enforce [![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard) since 27/3/2020. Some files might not have been modified to reflect this change yet, but please do practice Standard JS (use ESLint, installable if you run `npm install` to install our dev-dependencies) if you ever submit your pull requests/modifications for review. This doesn't mean we will reject your pull request, but for large changes, bad Standard JS compliance will lead to rejected pull requests.

## License

[![GPLv3 logo](https://www.gnu.org/graphics/gplv3-127x51.png)](https://www.gnu.org/licenses/gpl-3.0.html)

This project is licensed under the GPLv3 license. A copy is included in `/LICENSE.txt` of this Git repository.

## Thank you!

... to all the people over at the BananaHackers and [r/KaiOS](https://reddit.com/r/kaios) community, as well as Stack Overflow and my friends for translating my apps.

A full list of credits are available in `/CREDITS.md` of this Git repository.

Again, thank you all so much!

> jkelol111 2018-present