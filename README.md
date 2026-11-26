# Plates: source

The app on this repository's `main` branch is built from the files here.

## Layout

- `src/`: the app.
  - `data.js`: exercise library and the built-in program.
  - `logic.js`: loads, rounding, set codes, volume counting.
  - `app.js`: state, storage, history lookups.
  - `views.js`: the screens.
  - `actions.js`: taps and inputs.
  - `quick.js`: two-tap logging and set types.
  - `standalone.js`: the installed app (backups, restore, Android Back, install, update, rescue screen).
  - `main.js`: rest timer, event wiring, start-up.
  - `styles.css`, two page templates, and the service worker template.
- `icons-src/`: the icon set, drawn by `scripts/make_icons.mjs` (that script needs the `sharp` package).
- `fonts-src/`: Barlow and Big Shoulders Display, with their licences.
- `build.mjs`: builds both versions.

## Build

`node build.mjs` (Node 18 or newer, no packages needed) writes:

- `pwa/`: the installable app as one flat folder. This is what `main` holds.
- `dist/index.html`: the same app as a single page for a host that supplies `window.claude` storage. There the log is saved by the host instead of on the device.

## Publish

Copy everything in `pwa/` over the files on `main`, commit and push. GitHub Pages serves it at `https://<user>.github.io/plates/`.

The build stamps a version id, derived from the content of every file, into `index.html` and `sw.js`. Phones pick up a new version on their next launch and show "Update ready". Never hand-edit files on `main`: a change without a new id leaves phones on their cached copy.

## Rules

- The address must not change once someone has a log there. Browser storage belongs to the address, so renaming the account or the repository leaves the log behind. A backup restores it at a new address.
- Nothing personal goes in this repository: no logs, no backups, and no test data taken from a real log.
