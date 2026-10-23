# Castle Fine Art — test website (local only)

Double-click **Open Site.command** (or run `python3 -m http.server 8765` here and open http://localhost:8765).

Pages: `index` (home), `shop` (filters/sort/search), `product`, `artists` (A–Z), `artist`, `galleries`, `gallery`, `about`, `contact`.

- Everything reads from `assets/js/data.js` — ~2,000 in-stock pieces (newest 40 per artist) from the public castlefineart.com
  product feed, 34 galleries, artist bios + portraits. Rebuild with `tools/build-data.py`.
- Product photos load from Shopify's CDN, so you need to be online.
- Basket, newsletter and enquiry forms are front-end only — nothing is sent or charged.
- Fonts are free Google Fonts stand-ins (Barlow for DIN, DM Serif Display Italic for Acta Display); the licensed brand fonts are not included.
