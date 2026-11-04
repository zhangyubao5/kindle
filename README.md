# Kindle Clock & Japanese

A monochrome clock and N5 vocabulary dashboard for e-ink screens. The main page makes no weather requests and requires no API key.

- Large 24-hour clock, updated once per minute, with date and time-zone label.
- Five distinct random N5 words at a time, with kana, romaji and a compact English meaning. The full gloss is retained in the word list and each meaning's title attribute.
- **Next 5 words** changes the whole set immediately. The set also changes every 30 minutes. Adjacent sets do not overlap when the vocabulary pool is large enough.
- Clock settings support device time, fixed UTC offsets, rotation, and night mode. Fixed offsets do not automatically adjust for daylight saving time.

Open the site root or index.html. Choose **Clock settings**, then bookmark the resulting dashboard URL. All assets are local and project-relative. GitHub Pages publishes main from /(root); no build step is required.

## Predefined word list

674 N5 study entries are stored in data/n5-words.json and bundled as data/n5-words.js. There are no runtime dictionary or AI requests. See [data/README.md](data/README.md) for attribution, licensing and editing instructions. N5 classifications are community study approximations.

## Previous work

The earlier weather-and-calendar app remains under calendar/. The original Kindle weather source and attribution remain in repository history and supporting files; the current main page does not load weather code or call a weather service. See [SOURCE.md](SOURCE.md) and [README.upstream.md](README.upstream.md) for provenance.
