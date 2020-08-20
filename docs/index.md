---
layout: default
---

# Kaidi
The Ko**di** remote controller for **Kai**OS (hence **Kai**-**di**)

## Goals and project background
I have created this project in 2018 in a mission to create the first Kodi remote controller app for KaiOS. But why? Well, there are a few insprirations:

- Most KaiOS devices are WiFi-enabled: the majority of KaiOS devices ship with Wifi and LTE/3G connectivity. This is very convenient for use as a Kodi remote, which brings me to the next reason...

- Keypads are much better input devices, change my mind: as of now, all KaiOS devices ship with a form of keypad, be it in a T9 or QWERTY layout. This makes is a perfect replacement for a physical remote, as people would not need to look down at the display in order to figure out where to press like on a touchscreen, instead it could be part of muscle memory, much like a real remote control. 

- Lack of useful utilities for KaiOS at the time: KaiOS then was a realatively young platform that lacked a lot of apps we have come to expect from modern smart-phones, as such, I wanted to create one that would be useful and integrate well with the system theming, which plenty of KaiOS then-and-now did not.

And with all of that in mind, I set out to create the app, with these goals:

- The UI/UX must match well with the system and relavent KaiOS Design Guidelines: as I mentioned earlier, many apps made for KaiOS do not adhere well with the system theme and design guidelines published by KaiOS Technologies. I wanted to make something that's truly worthy of 'Made for KaiOS'.

- The UI should be simple and easy to memorize: most navigation occur with one button presses and not a multitude of key combinations just for the sake of packing many controls into the same keypad as possible.

- Support for as many Kodi JSON-RPC API versions as possible: not everyone may run the latest version of Kodi, especially people with set top boxes that never get updated past their initial release. As such, the functionalities of the app should be compatible with some 'recent' API versions, and not more.

The app was written in two stages, one Alpha and the other Beta. The 'Beta' version is a complete rewrite of the original Alpha code with largely the same functionality.

The Alpha version work dated back to 2018, as I had time right after my exams for Year 10. The original code lacked a lot of functionality, was an absolute pain to maintain as I have not applied any true coding styles to it, as I never expected any serious use from it. But as time went by, I got opinions and suggestions from users of the app, and I decided I would attempt a rewrite sometime in the future.

Fast forward to the closing months of 2019, I once again had time to start a rewrite of the app. This time, I tried using SASS and Gulp in order to make the rewrite of the old `kaidi.css` (the Alpha had all of the app styles in one huge file) easier. Sadly, that particular rewrite did not last long as I quickly had to come back to school and face the harsh reality of having literally NO FREE TIME AT ALL. This was known informally as 'Kaidi2'.

Later on, while the COVID-19 ravaged around the globe, I suddenly found myself having plenty of free time. And so I began the official second rewrite titled 'Beta'. The whole rewrite made the app much more modular, the code extremely readable, and the UI infinitely consistent. Moreover, a Gulp build process was created to create app builds that are minified, making for smaller package sizes. In the 'Implementation' section below, this version of the app ('Beta') would be detailed.

'Beta' as of the time of writing is still the latest release of the app. I plan to introduce further features given available time and more test devices.

## Implementation
### App source code structure
The app source code resides in the `src` folder within the kaidi GitHub repository (https://github.com/jkelol111/kaidi).

The app is structured like almost every vanilla HTML/CSS/JS KaiOS app would, with a `manifest.webapp` located in the root of the source code folder that contains the details of the app, relevant permissions and more pertaining to the app.

The HTML files which are the 'pages' of the app are also stored at the root of the source code. These define how the app looks in their individual pages and loads the relevant JS and CSS files for operation.

Speaking of CSS, JS and various other files, they are stored in their respective folders `css`, `js`, `locales` and `icons`, all located alongside the `manifest.webapp` and HTML files.

### Page layout
Behind every 'page' in the app, a 'headerbar' of sorts is always present, in the app's theme color. This is for visual recognition that the user is indeed using the Kaidi Remote app. A shade of cyan was chosen as it is relatively light/dark theme agnostic.

Below the headerbar, a secondary headerbar can be added in some pages to display additional contextual information, such as the name of the page. An example of this would be the settings page, where a secondary headerbar is used to tell the user they're in the right page. These are only used sparingly in the app as KaiOS devices have limited display real estate.

Once the headerbars have been defined, there is a content section. This can be used for the display of any page content. 

At the bottom of the page, a softkey bar is displayed for defining which button on the keypad corresponds to which action.

### Code behind each page
Besides the settings page, most pages of the app run on JS that contains a class that extends the KodiRPC or KodiMethods class, the former of which handles various communication with the Kodi JSON-RPC APIs, including listening for specific Kodi events and handling the worker's lifecycle, as well as a providing convenient functions for sending XmlHttpRequests to Kodi and formating them properly, and the latter extends KodiRPC with shared or commonly used functionality, such as displaying the Volume Control HUD in the app. The extended class from KodiRPC or KodiMethods then is used adds the page's specific functionality in, leveraging the functions and variables provided as part of inheriting the above 2 classes.

All JS embedded in the app are either minified libraries that are untouched from the original publisher, the rest are written following the Standard JS style, which maintains cleanliness of code and consistency.

The stylesheets are separated into individual files, one of which named `window.css` is imported by all of the pages in app as it provides the elements which all pages will use. For other page specific elements, the HTML can declare addtional CSS files to be loaded, hence reducing memory usage for things that aren't needed, a flaw of the 'Alpha' approach with all of the app's styles in one stylesheet.

Localization in particular is provided by using the `l10n.js` library from Mozilla, which while designed for Firefox OS, still works fine on KaiOS. Files stored in `locales` of the source define key-value pairs for the library to load depending on the selected language. At the time of writing, there is only English and Vietnamese as supported languages.

### App building and usage
The app can be downloaded via the KaiStore (pending approval), our community BananaHackers store, or directly from GitHub releases.

If you're feeling adventurous or want to try all the latest stuff, you could clone the `master` branch from the repository and use `gulp` to build the project. More details are in the project's actual README.md.

Releases that are pushed to KaiStore or BananaHackers/GitHub can be considered 'stable'.

### Project license
This project used to be licensed under the MIT license; however, as of the 'Beta' version, the license has been switched to GPLv3.










