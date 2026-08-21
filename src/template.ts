import type { Book, ShopConfig } from "./build.js";

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBook(book: Book): string {
  const { spine } = book;
  const style = `--h:${spine.height}px;--w:${spine.width}px;--leather:${spine.color};--foil:${spine.foil};--lean:${spine.lean}deg`;
  const sub = book.subtitle ? `<span class="cover-sub">${esc(book.subtitle)}</span>` : "";
  return `
        <a class="book" href="${esc(book.href)}" style="${style}" aria-label="${esc(book.title)} — ${esc(book.blurb)}">
          <span class="volume" aria-hidden="true">
            <span class="spine">
              <span class="band band-top"></span>
              <span class="spine-title">${esc(book.title)}</span>
              <span class="spine-orn">&#10087;</span>
              <span class="band band-bottom"></span>
            </span>
            <span class="cover">
              <span class="cover-press">Causeway Books</span>
              <span class="cover-title">${esc(book.title)}</span>
              ${sub}
              <span class="cover-orn">&#10087;</span>
              <span class="cover-author">${esc(book.author)}</span>
            </span>
          </span>
          <span class="tag" aria-hidden="true">
            <span class="tag-title">${esc(book.title)}</span>
            <span class="tag-blurb">${esc(book.blurb)}</span>
            <span class="tag-meta">&#8776;&nbsp;${book.minutes} min &middot; interactive edition</span>
          </span>
        </a>`;
}

/** Decorative pile of lying books at the far end of a shelf, stable per shelf name. */
function renderPile(name: string): string {
  const PILE_LEATHERS = ["#6B2A24", "#2F4A3B", "#2C3B58", "#533A1E", "#592532", "#1E4740"];
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  const bars = [0, 1, 2]
    .map((i) => {
      const color = PILE_LEATHERS[(h + i * 3) % PILE_LEATHERS.length];
      const width = 96 + ((h >> (i * 4)) % 38);
      return `<i style="--pl:${color};--pw:${width}px"></i>`;
    })
    .join("");
  return `<span class="pile" aria-hidden="true">${bars}</span>`;
}

function renderShelf(name: string, books: Book[], index: number): string {
  return `
      <section class="shelf" style="--shelf-i:${index}">
        <h2 class="plaque"><span>${esc(name)}</span></h2>
        <div class="row">${books.map(renderBook).join("")}
          ${renderPile(name)}
        </div>
        <div class="plank" aria-hidden="true"></div>
      </section>`;
}

export function renderIndex(
  config: ShopConfig,
  shelves: Array<{ name: string; books: Book[] }>,
): string {
  const total = shelves.reduce((n, s) => n + s.books.length, 0);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(config.shopName)} — ${esc(config.shopNameCzech)}</title>
<meta name="description" content="${esc(config.tagline)} ${total} interactive volumes on the shelf.">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>&#128213;</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="hero">
  <div class="hero-scrim" aria-hidden="true"></div>
  <div class="hero-inner">
    <p class="eyebrow">Antikvari&aacute;t &amp; Knihkupectv&iacute;</p>
    <h1 class="shop-name">${esc(config.shopName)}</h1>
    <p class="hero-sub"><em>${esc(config.shopNameCzech)}</em> &mdash; ${esc(config.tagline)}</p>
    <p class="hero-rule" aria-hidden="true">&#10087;</p>
  </div>
</header>
<main>
  <div class="case">
    <p class="case-note">Every volume opens where you left it. Pull one from the shelf.</p>${shelves
      .map((s, i) => renderShelf(s.name, s.books, i))
      .join("")}
  </div>
</main>
<footer class="colophon">
  <p>${esc(config.shopNameCzech)} &middot; ${total} volume${total === 1 ? "" : "s"} in the case</p>
  <p class="colophon-fine">Set in IM Fell English &amp; Spectral &middot; new stock: drop an <code>.html</code> into <code>html/</code> and rebuild</p>
</footer>
</body>
</html>
`;
}
