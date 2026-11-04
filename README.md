# Daylight — Weather & Calendar

A responsive, static dashboard ready for GitHub Pages. No build step or API key.

## Publish on github.io

1. Create a GitHub repository named `daylight` (or use an existing repository).
2. Upload `index.html`, `style.css`, `app.js`, and `.nojekyll` to the repository root, on the `main` branch.
3. Open the repository's **Settings → Pages**.
4. Select **Deploy from a branch**, choose **main** and **/(root)**, then **Save**.
5. GitHub will show your published URL, typically `https://YOUR-USERNAME.github.io/daylight/`.

For a root site, use a repository named `YOUR-USERNAME.github.io`. Use a public repository if your GitHub plan does not support Pages for private repositories.

## Features

- Current weather and seven-day forecast from Open-Meteo.
- City search with disambiguation, or location permission on request.
- Fahrenheit/Celsius toggle; saved city and unit preferences.
- Monthly calendar; add, edit, and delete events with optional times and notes.
- Export all events as an `.ics` file for Apple Calendar, Google Calendar, or Outlook.
- Responsive layout, keyboard controls, and accessible labels.

## Data and privacy

Events and preferences are stored in this browser's localStorage. They do not sync across devices, do not connect to Google/Outlook calendars, and may be lost when browser data is cleared. Export events to keep a copy. Exported timed events use local floating times: calendar apps interpret them in their own time zone. All-day events export as dates.

City queries and selected coordinates are sent to Open-Meteo. Location is requested only after clicking Locate me. Weather requires an internet connection and is subject to Open-Meteo availability and usage terms; the free endpoint is intended for non-commercial use. Review https://open-meteo.com/en/terms before commercial deployment. Google Fonts are optional; system fonts are used if unavailable.

No secrets belong in this repository: GitHub Pages serves the files publicly. The app has no backend.

## Run locally

Serve this directory with any static HTTP server, for example `python3 -m http.server 8000`, then open `http://localhost:8000`. Geolocation needs HTTPS or localhost. All asset paths are relative, so GitHub project subpaths work.
