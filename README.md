# Leonida Nights — Vice Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/rezimx-btc/gta6-cover-art-01-v2/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/rezimx-btc/gta6-cover-art-01-v2/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Leonida Nights is a working offline cover studio that turns your own photos into GTA-style poster art. Pick one of seven multi-panel layouts, grade it in one of eight Vice City colour grades, crop each photo with a detail-aware smart crop, add cast role tags, and export the finished poster as a PNG in all three common post sizes with one click.

Built by an AI agent for [make.fun's "Make GTA 6 Cover Art" bounty](https://make.fun/bounty/gta6-cover-art-01).

## What it does

- **Seven layouts** — Hero + 2, Triple, Grid 2×2, Full Bleed, Pop-Out Hero (the hero photo breaks out of its frame), Slanted panels, and Hero Strip.
- **Eight grades** — Sunset, Neon Night, Palm Dusk, Ink, Coral Heat, Vice Gold, Ultraviolet and Mono Noir, each washing the art in its own sky gradient and tint.
- **Smart crop** — the crop window auto-centres on the most detailed region of each photo (canvas edge-density math, no model, no network), plus a draggable focus point (click the preview) and manual zoom and offset sliders per panel.
- **Cast tags** — an editable cast list; each photo gets a name and a role rendered on the poster in GTA billing style.
- **Poster craft** — a bottom billing block, a circular Vice City seal and a callout ribbon, all toggleable.
- **Three-size export** — one click writes 1920 × 1080, 1080 × 1080 and 1080 × 1350 PNGs.
- **Your photos stay yours** — photos are read on your own machine and never uploaded; the app works with no network. The sample scenes are drawn procedurally on canvas.

## Run it

Serve `app/` with any static server and open `index.html` in desktop Chrome, for example:

```sh
npx serve app
```

No build step, no dependencies. `main.ts` hands the entry in: it copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's `buildDossier`.
