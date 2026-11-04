# Kindle Clock & Japanese

A monochrome clock and N5 vocabulary dashboard for e-ink screens. The main page makes no weather requests and requires no API key.

- Large 24-hour clock, updated once per minute, with date and time-zone label.
- Five distinct random N5 words at a time, with kana, romaji and a compact English meaning. The full gloss is retained in the word list and each meaning's title attribute.
- **Next 5 words** changes the whole set immediately. The set also changes every 30 minutes. Adjacent sets do not overlap when the vocabulary pool is large enough.
- Pacific time is the default, with automatic PST/PDT daylight saving changes. Clock settings also support device time, fixed UTC offsets, rotation, and night mode. Fixed offsets do not automatically adjust for daylight saving time.

Open the site root or index.html. Choose **Clock settings**, then bookmark the resulting dashboard URL. All assets are local and project-relative. GitHub Pages publishes main from /(root); no build step is required.

## Predefined word list

674 N5 study entries are stored in data/n5-words.json and bundled as data/n5-words.js. There are no runtime dictionary or AI requests. See [data/README.md](data/README.md) for attribution, licensing and editing instructions. N5 classifications are community study approximations.

## Previous work

The earlier weather-and-calendar app remains under calendar/. The original Kindle weather source and attribution remain in repository history and supporting files; the current main page does not load weather code or call a weather service. See [SOURCE.md](SOURCE.md) and [README.upstream.md](README.upstream.md) for provenance.

## Kindle browser support

The page uses ES5 JavaScript, simple block/table layouts, pixel-sized text fallbacks, 44-pixel tap targets, high-contrast black and white, and locally bundled dependencies. It needs no Intl API, CSS Grid, Flexbox, web fonts, account, or API key. The clock changes only once a minute; word sets change every 30 minutes or on demand. Timer scheduling resumes on focus/page visibility where the browser supports those events.

Pacific time uses Moment Timezone 0.6.6 and the bundled IANA 2026f America/Los_Angeles zone. See vendor/moment/TIMEZONE-SOURCE.md and vendor/moment/LICENSE-timezone. Update this data if time-zone rules change.

The device must have a correct date/time and support JavaScript. A browser page cannot prevent the Kindle's system screen saver or wake a sleeping device. Tested with browser previews and automated clock checks; physical Kindle hardware was not available.
