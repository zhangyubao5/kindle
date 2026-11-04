# Kindle Weather Dashboard

The main page now uses [matopeto's Kindle Weather Dashboard](https://github.com/matopeto/kindle-weather-dashboard), with its monochrome display, weather icons, forecast, moon phase, rotation, and night-mode settings.

## Setup

Open `config.html` on your GitHub Pages site. Enter a city (or latitude and longitude), your own OpenWeatherMap API key, units, and display options. Choose **Show Dashboard**, then bookmark the resulting URL on your Kindle. Start with the hourly forecast; available forecast endpoints depend on your OpenWeatherMap access.

No shared/default API key is included. The key is used in the browser and appears in the generated URL. Do not commit it to this public repository or share your configured URL. Weather cannot be verified until a working key is supplied.

GitHub Pages should publish `main` from `/(root)`. All assets are bundled and use project-relative paths. No build step is needed.

## Calendar

The previous weather and calendar application is still available under `calendar/`. Its events stay in browser storage on the same GitHub Pages origin; the path change does not move them to a server or sync them across devices.

## Original project

See [SOURCE.md](SOURCE.md) for provenance and local changes, and [README.upstream.md](README.upstream.md) for the original documentation, Kindle instructions, and screenshots.

## Clock and Japanese vocabulary

The main page shows a 24-hour clock that updates once per minute, plus a random N5 word with its kana reading, romaji and English meaning. Choose **Next word** to change immediately; the word also changes every 30 minutes. Immediate repeats are avoided. The clock and words work without weather configuration.

Clock time follows the configured UTC offset, then the weather location when available, otherwise the device's time zone. The word list contains 674 N5 study entries and is predefined in `data/n5-words.json` and the generated `data/n5-words.js`; no runtime vocabulary service is used. See [data/README.md](data/README.md) for source, license and editing instructions. This community N5 list is not an official exhaustive JLPT list.
