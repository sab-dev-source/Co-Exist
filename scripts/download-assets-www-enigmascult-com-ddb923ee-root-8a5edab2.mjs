import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SHARED_DIR = path.join(ROOT, "public/sites/www-enigmascult-com-ddb923ee/shared");
const PAGE_DIR = path.join(ROOT, "public/sites/www-enigmascult-com-ddb923ee/root-8a5edab2");
const REF_DIR = path.join(ROOT, "docs/research/www-enigmascult-com-ddb923ee/root-8a5edab2/reference");

const ASSETS = [
  // Fonts (shared)
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/fonts/helvena-variable.woff2", dest: path.join(SHARED_DIR, "fonts/helvena-variable.woff2") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/fonts/editorial-today-thin.woff2", dest: path.join(SHARED_DIR, "fonts/editorial-today-thin.woff2") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/fonts/editorial-today-thin-italic.woff2", dest: path.join(SHARED_DIR, "fonts/editorial-today-thin-italic.woff2") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/fonts/editorial-today-regular.woff2", dest: path.join(SHARED_DIR, "fonts/editorial-today-regular.woff2") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/fonts/editorial-today-italic.woff2", dest: path.join(SHARED_DIR, "fonts/editorial-today-italic.woff2") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/fonts/editorial-today-semibold.woff2", dest: path.join(SHARED_DIR, "fonts/editorial-today-semibold.woff2") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/fonts/editorial-today-bold.woff2", dest: path.join(SHARED_DIR, "fonts/editorial-today-bold.woff2") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/fonts/mostwanted.woff2", dest: path.join(SHARED_DIR, "fonts/mostwanted.woff2") },

  // Favicons & Menu Icons (shared)
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/07/cropped-gradient-32x32.png", dest: path.join(SHARED_DIR, "icons/cropped-gradient-32x32.png") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/07/cropped-gradient-192x192.png", dest: path.join(SHARED_DIR, "icons/cropped-gradient-192x192.png") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/07/cropped-gradient-180x180.png", dest: path.join(SHARED_DIR, "icons/cropped-gradient-180x180.png") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/07/icon-chest.png", dest: path.join(SHARED_DIR, "icons/icon-chest.png") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/07/icon-shoes.png", dest: path.join(SHARED_DIR, "icons/icon-shoes.png") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/07/icon-gavel.png", dest: path.join(SHARED_DIR, "icons/icon-gavel.png") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/07/icon-eye.png", dest: path.join(SHARED_DIR, "icons/icon-eye.png") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/07/icon-hand.png", dest: path.join(SHARED_DIR, "icons/icon-hand.png") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/07/icon-butterfly.png", dest: path.join(SHARED_DIR, "icons/icon-butterfly.png") },

  // 3D Models (shared)
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/models/enigma-logo.glb", dest: path.join(SHARED_DIR, "models/enigma-logo.glb") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/models/hero-clouds.glb", dest: path.join(SHARED_DIR, "models/hero-clouds.glb") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/models/clue-mark.glb", dest: path.join(SHARED_DIR, "models/clue-mark.glb") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/models/menu-clouds.glb", dest: path.join(SHARED_DIR, "models/menu-clouds.glb") },

  // Shared Site Images (menu, veil, footer)
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/img/veil-clouds.webp", dest: path.join(SHARED_DIR, "img/veil-clouds.webp") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/img/menu-clouds-atlas.webp", dest: path.join(SHARED_DIR, "img/menu-clouds-atlas.webp") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/img/footer-clouds-back.webp", dest: path.join(SHARED_DIR, "img/footer-clouds-back.webp") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/img/footer-clouds-front.webp", dest: path.join(SHARED_DIR, "img/footer-clouds-front.webp") },

  // Sound Effects (shared)
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/sfx/wind.mp3", dest: path.join(SHARED_DIR, "sfx/wind.mp3") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/sfx/whoosh.mp3", dest: path.join(SHARED_DIR, "sfx/whoosh.mp3") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/sfx/descent.mp3", dest: path.join(SHARED_DIR, "sfx/descent.mp3") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/sfx/shimmer.mp3", dest: path.join(SHARED_DIR, "sfx/shimmer.mp3") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/sfx/eating.mp3", dest: path.join(SHARED_DIR, "sfx/eating.mp3") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/sfx/clock.mp3", dest: path.join(SHARED_DIR, "sfx/clock.mp3") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/sfx/chest.mp3", dest: path.join(SHARED_DIR, "sfx/chest.mp3") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/sfx/steps.mp3", dest: path.join(SHARED_DIR, "sfx/steps.mp3") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/sfx/gavel.mp3", dest: path.join(SHARED_DIR, "sfx/gavel.mp3") },

  // Root Page Decorative & Section Images
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/img/contact-lines.svg", dest: path.join(PAGE_DIR, "img/contact-lines.svg") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/img/hero-arc.svg", dest: path.join(PAGE_DIR, "img/hero-arc.svg") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/07/hero-clouds.webp", dest: path.join(PAGE_DIR, "img/hero-clouds.webp") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/img/mystery-curtain-top.svg", dest: path.join(PAGE_DIR, "img/mystery-curtain-top.svg") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/img/mystery-curtain-bottom.svg", dest: path.join(PAGE_DIR, "img/mystery-curtain-bottom.svg") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/img/mystery-texture.jpg", dest: path.join(PAGE_DIR, "img/mystery-texture.jpg") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/img/mystery-hand.webp", dest: path.join(PAGE_DIR, "img/mystery-hand.webp") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/img/mystery-chest.webp", dest: path.join(PAGE_DIR, "img/mystery-chest.webp") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/img/mystery-zip.svg", dest: path.join(PAGE_DIR, "img/mystery-zip.svg") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/img/find-price-cupid.webp", dest: path.join(PAGE_DIR, "img/find-price-cupid.webp") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/img/find-arrow.svg", dest: path.join(PAGE_DIR, "img/find-arrow.svg") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/img/tsneak-shelf.svg", dest: path.join(PAGE_DIR, "img/tsneak-shelf.svg") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/assets/img/trend-glow.svg", dest: path.join(PAGE_DIR, "img/trend-glow.svg") },

  // Manifesto Collage Images
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/09/manifesto-left.webp", dest: path.join(PAGE_DIR, "img/manifesto-left.webp") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/09/manifesto-topright.webp", dest: path.join(PAGE_DIR, "img/manifesto-topright.webp") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/09/manifesto-portrait.webp", dest: path.join(PAGE_DIR, "img/manifesto-portrait.webp") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/09/manifesto-angel.webp", dest: path.join(PAGE_DIR, "img/manifesto-angel.webp") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/09/manifesto-art3.webp", dest: path.join(PAGE_DIR, "img/manifesto-art3.webp") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/09/ChatGPT-Image-6-%CE%A3%CE%B5%CF%80-2026-12_55_19-%CE%BC.%CE%BC.png", dest: path.join(PAGE_DIR, "img/manifesto-art5.png") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/09/manifesto-pill.webp", dest: path.join(PAGE_DIR, "img/manifesto-pill.webp") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/09/ChatGPT-Image-1-%CE%A3%CE%B5%CF%80-2026-03_25_33-%CE%BC.%CE%BC.png", dest: path.join(PAGE_DIR, "img/manifesto-yellow.png") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/09/manifesto-greendunk.webp", dest: path.join(PAGE_DIR, "img/manifesto-greendunk.webp") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/09/ChatGPT-Image-1-%CE%A3%CE%B5%CF%80-2026-02_57_36-%CE%BC.%CE%BC.png", dest: path.join(PAGE_DIR, "img/manifesto-bacchus.png") },

  // Top Sneakers Products
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/11/%CE%91%CE%BD%CF%8E%CE%BD%CF%85%CE%BC%CE%BF-%CF%83%CF%87%CE%AD%CE%B4%CE%B9%CE%BF-48-819x1024.png", dest: path.join(PAGE_DIR, "products/tsneak-01-foamposite.png") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/11/%CE%91%CE%BD%CF%8E%CE%BD%CF%85%CE%BC%CE%BF-%CF%83%CF%87%CE%AD%CE%B4%CE%B9%CE%BF-47-819x1024.png", dest: path.join(PAGE_DIR, "products/tsneak-02-aj5-halloween.png") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/11/%CE%91%CE%BD%CF%8E%CE%BD%CF%85%CE%BC%CE%BF-%CF%83%CF%87%CE%AD%CE%B4%CE%B9%CE%BF-46-819x1024.png", dest: path.join(PAGE_DIR, "products/tsneak-03-amiri-jacket.png") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/11/%CE%91%CE%BD%CF%8E%CE%BD%CF%85%CE%BC%CE%BF-%CF%83%CF%87%CE%AD%CE%B4%CE%B9%CE%BF-44-819x1024.png", dest: path.join(PAGE_DIR, "products/tsneak-04-bearbrick.png") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/09/%CE%91%CE%BD%CF%8E%CE%BD%CF%85%CE%BC%CE%BF-%CF%83%CF%87%CE%AD%CE%B4%CE%B9%CE%BF-21-819x1024.png", dest: path.join(PAGE_DIR, "products/tsneak-05-jbalvin.png") },

  // Trending Auctions Products
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/11/%CE%91%CE%BD%CF%8E%CE%BD%CF%85%CE%BC%CE%BF-%CF%83%CF%87%CE%AD%CE%B4%CE%B9%CE%BF-52-819x1024.png", dest: path.join(PAGE_DIR, "products/auction-13292-spicebomb.png") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/11/%CE%91%CE%BD%CF%8E%CE%BD%CF%85%CE%BC%CE%BF-%CF%83%CF%87%CE%AD%CE%B4%CE%B9%CE%BF-51-819x1024.png", dest: path.join(PAGE_DIR, "products/auction-13290-supreme-playboy.png") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/11/%CE%91%CE%BD%CF%8E%CE%BD%CF%85%CE%BC%CE%BF-%CF%83%CF%87%CE%AD%CE%B4%CE%B9%CE%BF-50-819x1024.png", dest: path.join(PAGE_DIR, "products/auction-13288-onepiece-airmax.png") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/11/%CE%91%CE%BD%CF%8E%CE%BD%CF%85%CE%BC%CE%BF-%CF%83%CF%87%CE%AD%CE%B4%CE%B9%CE%BF-49-819x1024.png", dest: path.join(PAGE_DIR, "products/auction-13283-supreme-lv.png") },

  // Latest from Reborn Stories
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/08/enigma-reborn-dads-rolex-1024x572.jpg", dest: path.join(PAGE_DIR, "reborn/dads-rolex.jpg") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/08/reborn-the-pair-i-never-thought-id-own-1024x572.webp", dest: path.join(PAGE_DIR, "reborn/the-pair-i-never-thought-id-own.webp") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/08/reborn-the-last-hoodie-1024x572.webp", dest: path.join(PAGE_DIR, "reborn/the-last-hoodie.webp") },
  { url: "https://www.enigmascult.com/wp-content/uploads/2026/08/reborn-the-first-pair-1024x572.webp", dest: path.join(PAGE_DIR, "reborn/the-first-pair.webp") },

  // Theme CSS & JS bundles for exact inspection of desktop rules, Three.js scenes, GSAP timelines, and audio/clue interactions
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/build/style-index.css?ver=1792825668", dest: path.join(REF_DIR, "style-index.css") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/build/index.css?ver=1792825668", dest: path.join(REF_DIR, "index.css") },
  { url: "https://www.enigmascult.com/wp-content/plugins/ruler-fortune-cookies/assets/css/rfc.css?ver=1.0.5", dest: path.join(REF_DIR, "rfc.css") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/build/922.js?ver=81bb2cbabae5751fbe76", dest: path.join(REF_DIR, "922.js") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/build/437.js?ver=e4642861d9cc53a129d3", dest: path.join(REF_DIR, "437.js") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/build/567.js?ver=65a307ef79c3bffced41", dest: path.join(REF_DIR, "567.js") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/build/51.js?ver=7398263c9c36eceda896", dest: path.join(REF_DIR, "51.js") },
  { url: "https://www.enigmascult.com/wp-content/themes/enigma-cult/build/950.js?ver=523b98231cb2fa01413e", dest: path.join(REF_DIR, "950.js") },
];

async function downloadOne(item) {
  await fs.mkdir(path.dirname(item.dest), { recursive: true });
  const res = await fetch(item.url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Referer: "https://www.enigmascult.com/",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${item.url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(item.dest, buf);
  return { url: item.url, dest: path.relative(ROOT, item.dest), bytes: buf.length };
}

async function main() {
  const BATCH_SIZE = 4;
  const results = [];
  const errors = [];

  for (let i = 0; i < ASSETS.length; i += BATCH_SIZE) {
    const batch = ASSETS.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(batch.map(downloadOne));
    for (const s of settled) {
      if (s.status === "fulfilled") {
        results.push(s.value);
        console.log(`[OK] ${s.value.dest} (${s.value.bytes} B)`);
      } else {
        errors.push(s.reason?.message || String(s.reason));
        console.error(`[ERR] ${s.reason?.message || s.reason}`);
      }
    }
  }

  console.log(`\nDone: ${results.length} downloaded, ${errors.length} failed.`);
  if (errors.length > 0) process.exitCode = 1;
}

main();
