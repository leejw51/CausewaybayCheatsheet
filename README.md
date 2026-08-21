# Causeway Books — Knihkupectví u Mostu

A Prague-antiquarian-bookshop shelf for the interactive books in `html/`. A TypeScript
generator scans that folder at build time and turns every `.html` file into a
leather-bound volume on a wooden shelf — hover a spine to pull the book out and see
its gold-stamped cover.

## Commands

```sh
make         # build the static site into dist/
make start   # build + serve at http://localhost:8788 (background)
make stop    # stop the local server
make deploy  # publish dist/ to Cloudflare Pages via wrangler
```

## Adding a book

Drop any `.html` file into `html/` and run `make`. The generator reads its `<title>`
(a `Title — Subtitle` em-dash split is understood), estimates reading time, and gives
it a deterministic leather binding. To place it on a named shelf or write its shop
tag, add an entry in `books.config.json`:

```json
"my-new-book": {
  "shelf": "Cryptography",
  "blurb": "One line for the paper tag that appears on hover.",
  "author": "Optional author line"
}
```

Books without an entry appear on the **New Arrivals** shelf.

## Cloudflare Pages

Connect the repo in the Cloudflare dashboard with:

- **Build command:** `npm run build`
- **Build output directory:** `dist`

or deploy directly from your machine with `make deploy` (after `npx wrangler login`).

## Layout

- `html/` — the books themselves (source of truth; never modified)
- `src/build.ts` — scans `html/`, writes `dist/` (index + copied books + assets)
- `src/template.ts` — index page markup
- `src/serve.ts` — tiny static server for local preview
- `public/` — stylesheet and hero art (generated with Grok Image 2.0), copied into `dist/`
- `books.config.json` — shop name, shelf order, per-book metadata
