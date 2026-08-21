import type { Book, ShopConfig } from "./build.js";
import { LOCALES, pickText, type LocaleDef } from "./i18n.js";

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function localeUrl(locale: LocaleDef): string {
  return locale.path ? `/${locale.path}/` : "/";
}

function renderBook(book: Book, locale: LocaleDef): string {
  const { spine } = book;
  const style = `--h:${spine.height}px;--w:${spine.width}px;--leather:${spine.color};--foil:${spine.foil};--lean:${spine.lean}deg`;
  const blurb = pickText(book.blurb, locale.key) ?? "";
  const author = pickText(book.author, locale.key) ?? locale.s.houseEdition;
  const sub = book.subtitle ? `<span class="cover-sub">${esc(book.subtitle)}</span>` : "";
  return `
        <a class="book" href="/${esc(book.href)}" style="${style}" aria-label="${esc(book.title)} — ${esc(blurb)}">
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
              <span class="cover-author">${esc(author)}</span>
            </span>
          </span>
          <span class="tag" aria-hidden="true">
            <span class="tag-title">${esc(book.title)}</span>
            <span class="tag-blurb">${esc(blurb)}</span>
            <span class="tag-meta">${locale.s.tagMeta(book.minutes)}</span>
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

function renderShelf(name: string, books: Book[], index: number, locale: LocaleDef): string {
  const label = locale.s.shelves[name] ?? name;
  return `
      <section class="shelf" style="--shelf-i:${index}">
        <h2 class="plaque"><span>${esc(label)}</span></h2>
        <div class="row">${books.map((b) => renderBook(b, locale)).join("")}
          ${renderPile(name)}
        </div>
        <div class="plank" aria-hidden="true"></div>
      </section>`;
}

function renderLangNav(current: LocaleDef): string {
  const links = LOCALES.map((l) =>
    l.key === current.key
      ? `<span class="lang-now" aria-current="page">${esc(l.nativeName)}</span>`
      : `<a href="${localeUrl(l)}" lang="${l.htmlLang}" hreflang="${l.htmlLang}">${esc(l.nativeName)}</a>`,
  ).join('<span class="lang-dot" aria-hidden="true">&middot;</span>');
  return `<nav class="lang-nav" aria-label="${esc(current.s.langLabel)}">${links}</nav>`;
}

export function renderIndex(
  config: ShopConfig,
  shelves: Array<{ name: string; books: Book[] }>,
  locale: LocaleDef,
): string {
  const total = shelves.reduce((n, s) => n + s.books.length, 0);
  const alternates = LOCALES.map(
    (l) => `<link rel="alternate" hreflang="${l.htmlLang}" href="${localeUrl(l)}">`,
  ).join("\n");
  const cjkFont = locale.fontHref
    ? `<link href="${locale.fontHref}" rel="stylesheet">
<style>:root{--body:"Spectral","${locale.bodyFont}",Georgia,serif}</style>`
    : "";
  return `<!doctype html>
<html lang="${locale.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(config.shopName)} — ${esc(config.shopNameCzech)}</title>
<meta name="description" content="${esc(locale.s.tagline)}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>&#128213;</text></svg>">
${alternates}
<link rel="alternate" hreflang="x-default" href="/">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
${cjkFont}
</head>
<body>
<header class="hero">
  <div class="hero-scrim" aria-hidden="true"></div>
  ${renderLangNav(locale)}
  <div class="hero-inner">
    <p class="eyebrow">${esc(locale.s.eyebrow)}</p>
    <h1 class="shop-name">${esc(config.shopName)}</h1>
    <p class="hero-sub"><em>${esc(config.shopNameCzech)}</em> &mdash; ${esc(locale.s.tagline)}</p>
    <p class="hero-rule" aria-hidden="true">&#10087;</p>
  </div>
</header>
<main>
  <div class="case">
    <p class="case-note">${esc(locale.s.caseNote)}</p>${shelves
      .map((s, i) => renderShelf(s.name, s.books, i, locale))
      .join("")}
  </div>
</main>
<footer class="colophon">
  <p>${esc(config.shopNameCzech)} &middot; ${locale.s.volumesLine(total)}</p>
  <p class="colophon-fine">${locale.s.fineLine}</p>
</footer>
</body>
</html>
`;
}
