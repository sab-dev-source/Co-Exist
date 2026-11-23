import type {
  AuctionLotItem,
  KarachiProductItem,
  MenuNavItem,
  NavLinkItem,
  RebornStoryItem,
  TopSneakerItem,
} from "./types";

const SHARED_BASE = "/sites/www-enigmascult-com-ddb923ee/shared";
const PAGE_BASE = "/sites/www-enigmascult-com-ddb923ee/root-8a5edab2";
const COEXIST_BASE = `${PAGE_BASE}/coexist`;

export const SITE_ASSETS = {
  icons: {
    limitlessLogo: `${SHARED_BASE}/icons/limitless-logo.png`,
  },
  models: {
    logo: `${SHARED_BASE}/models/coexist-logo.glb`,
    heroClouds: `${SHARED_BASE}/models/hero-clouds.glb`,
    clueMark: `${SHARED_BASE}/models/clue-mark.glb`,
    menuClouds: `${SHARED_BASE}/models/menu-clouds.glb`,
  },
  sharedImg: {
    veilClouds: `${SHARED_BASE}/img/veil-clouds.webp`,
    menuCloudsAtlas: `${SHARED_BASE}/img/menu-clouds-atlas.webp`,
    footerCloudsBack: `${SHARED_BASE}/img/footer-clouds-back.webp`,
    footerCloudsFront: `${SHARED_BASE}/img/footer-clouds-front.webp`,
  },
  pageImg: {
    contactLines: `${PAGE_BASE}/img/contact-lines.svg`,
    heroArc: `${PAGE_BASE}/img/hero-arc.svg`,
    heroClouds: `${PAGE_BASE}/img/hero-clouds.webp`,
    manifestoLeft: `${COEXIST_BASE}/heritage-boulders-wide.jpg`,
    manifestoTopRight: `${COEXIST_BASE}/unapologetically-elevator.jpg`,
    manifestoPortrait: `${COEXIST_BASE}/steel-kettles-wide.jpg`,
    manifestoAngel: `${PAGE_BASE}/img/manifesto-angel.webp`,
    manifestoArt2: `${COEXIST_BASE}/wat-tawa-021.jpg`,
    manifestoArt5: `${COEXIST_BASE}/heritage-rack-campaign.jpg`,
    manifestoPill: `${COEXIST_BASE}/midnight-dhaba-seal.jpg`,
    manifestoYellow: `${COEXIST_BASE}/coexist-coordinates.jpg`,
    manifestoGreenDunk: `${COEXIST_BASE}/unapologetically-spec.jpg`,
    manifestoBacchus: `${COEXIST_BASE}/unapologetically-angel.jpg`,
    mysteryChest: `${PAGE_BASE}/img/mystery-chest.webp`,
    mysteryCurtainTop: `${PAGE_BASE}/img/mystery-curtain-top.svg`,
    mysteryCurtainBottom: `${PAGE_BASE}/img/mystery-curtain-bottom.svg`,
    mysteryTexture: `${PAGE_BASE}/img/mystery-texture.jpg`,
    mysteryHand: `${PAGE_BASE}/img/mystery-hand.webp`,
    mysteryZip: `${PAGE_BASE}/img/mystery-zip.svg`,
    findPriceCupid: `${PAGE_BASE}/img/find-price-cupid.webp`,
    findArrow: `${PAGE_BASE}/img/find-arrow.svg`,
    tsneakShelf: `${PAGE_BASE}/img/tsneak-shelf.svg`,
    trendGlow: `${PAGE_BASE}/img/trend-glow.svg`,
  },
};

export const UTILITY_LINKS: NavLinkItem[] = [
  { label: "My Account", href: "/my-account/" },
  { label: "Wishlist", href: "/my-account/wishlist/" },
];

export const MENU_ITEMS: MenuNavItem[] = [
  {
    label: "Home",
    href: "/",
    iconSrc: `${SHARED_BASE}/icons/icon-eye.png`,
    sfxName: "whoosh",
    sfxLevel: 0.4,
    sfxFade: 0.6,
  },
  {
    label: "Mystery Box",
    href: "/#mystery-box",
    iconSrc: `${SHARED_BASE}/icons/icon-chest.png`,
    sfxName: "chest",
    sfxLevel: 0.5,
    sfxFade: 0.8,
  },
  {
    label: "Karachi Chapter",
    href: "/#karachi-chapter",
    iconSrc: `${SHARED_BASE}/icons/icon-shirt.png`,
    sfxName: "steps",
    sfxLevel: 0.3,
    sfxFade: 0.8,
  },
  {
    label: "Inner Circle",
    href: "/#inner-circle",
    iconSrc: `${SHARED_BASE}/icons/icon-gavel.png`,
    sfxName: "gavel",
    sfxLevel: 0.6,
    sfxFade: 1.0,
  },
];

export const SOCIAL_LINKS: NavLinkItem[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/en1gma_vault?igsh=MWZ5eDlvcnIyeTB5",
    external: true,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@en1gmascult?lang=en",
    external: true,
  },
  {
    label: "Discord",
    href: "https://discord.gg/SFUCx3Ge4",
    external: true,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/13068050799",
    external: true,
  },
  {
    label: "Contact",
    href: "/contact/",
  },
];

export const FOOTER_LEGAL_LINKS: NavLinkItem[] = [
  { label: "FAQ", href: "/faq/" },
  { label: "T&C", href: "/terms/" },
  { label: "Shipping & Returns", href: "/shipping-returns/" },
  { label: "Privacy Policy", href: "/privacy-policy/" },
  { label: "Cookie Policy", href: "/cookie-policy/" },
];

export const FIND_PRICE_QUERIES: string[] = [
  "Unapologetically 021 Tee",
  "Steel Kettles Hoodie",
  "Burns Road Smoke Tee",
  "Frere Hall Heritage Tee",
  "After Hours Sector 021",
];

export const KARACHI_PRODUCTS: KarachiProductItem[] = [
  {
    id: "unapologetically-021-tee",
    numeral: "01",
    roman: "I",
    name: "Unapologetically 021 Heavyweight Tee",
    subtitle: "Chiaroscuro Angel Back Print",
    dropCode: "DROP 03 // 021",
    category: "Heavyweight Tees",
    fabric: "260 GSM Combed Heavyweight Cotton",
    fit: "Oversized Boxy Drop-Shoulder",
    edition: "Karachi Chapter · Limited Run",
    description:
      "Classical chiaroscuro marble meets K-Town concrete. Built on a 260 GSM pre-shrunk heavyweight jersey with minimal chest insignia, woven neck label, and high-density discharge back print.",
    imgSrc: `${COEXIST_BASE}/unapologetically-spec.jpg`,
    altImgSrc: `${COEXIST_BASE}/unapologetically-elevator.jpg`,
    objectPosition: "center center",
    altObjectPosition: "center 40%",
    gallery: [
      { src: `${COEXIST_BASE}/unapologetically-spec.jpg`, label: "Silhouette & Details", objectPosition: "center center" },
      { src: `${COEXIST_BASE}/unapologetically-elevator.jpg`, label: "Editorial", objectPosition: "center 40%" },
      { src: `${COEXIST_BASE}/unapologetically-angel.jpg`, label: "Back Artwork", objectPosition: "center 40%" },
      { src: `${COEXIST_BASE}/unapologetically-pack.jpg`, label: "Drop Packaging", objectPosition: "center 48%" },
    ],
  },
  {
    id: "burns-road-smoke-tee",
    numeral: "02",
    roman: "II",
    name: "Burns Road Smoke Oversized Tee",
    subtitle: "From Burns Road Smoke to Zamzama Static",
    dropCode: "DESIGN NO. 03",
    category: "Heavyweight Tees",
    fabric: "260 GSM Heavyweight Jersey",
    fit: "Oversized Boxy Fit",
    edition: "Est. Local // Drop 03",
    description:
      "A visual bridge across Karachi's two pulses — charcoal smoke rising over Burns Road fused with late-night Zamzama espresso static. Heavyweight washed black cotton engineered to age with wear.",
    imgSrc: `${COEXIST_BASE}/burns-road-tee.jpg`,
    altImgSrc: `${COEXIST_BASE}/heritage-rack-campaign.jpg`,
    objectPosition: "center 24%",
    altObjectPosition: "center 45%",
    gallery: [
      { src: `${COEXIST_BASE}/burns-road-tee.jpg`, label: "Back View", objectPosition: "center 24%" },
      { src: `${COEXIST_BASE}/heritage-rack-campaign.jpg`, label: "Drop 03 Rack", objectPosition: "center 45%" },
      { src: `${COEXIST_BASE}/unapologetically-pack.jpg`, label: "Drop Packaging", objectPosition: "center 48%" },
    ],
  },
  {
    id: "frere-hall-heritage-tee",
    numeral: "03",
    roman: "III",
    name: "Frere Hall Heritage Threads Tee",
    subtitle: "Frere Hall & Iron Horse Engraving",
    dropCode: "DROP 03 // HERITAGE",
    category: "Heavyweight Tees",
    fabric: "260 GSM Garment-Dyed Charcoal",
    fit: "Boxy Streetwear Silhouette",
    edition: "Built For The Same Streets 02",
    description:
      "Hand-inked halftone engraving honoring Karachi's iconic Frere Hall skyline paired with midnight cruiser chrome. Finished with subtle front chest stamp and full-back heritage print.",
    imgSrc: `${COEXIST_BASE}/heritage-boulders-tee.jpg`,
    altImgSrc: `${COEXIST_BASE}/frere-hall-graphic.jpg`,
    objectPosition: "center 32%",
    altObjectPosition: "center 42%",
    gallery: [
      { src: `${COEXIST_BASE}/heritage-boulders-tee.jpg`, label: "Lookbook", objectPosition: "center 35%" },
      { src: `${COEXIST_BASE}/frere-hall-graphic.jpg`, label: "Engraving Artwork", objectPosition: "center 45%" },
      { src: `${COEXIST_BASE}/heritage-boulders-wide.jpg`, label: "Campaign Frame", objectPosition: "center center" },
    ],
  },
  {
    id: "steel-kettles-hoodie",
    numeral: "04",
    roman: "IV",
    name: "Steel Kettles & Chrome Hoodie",
    subtitle: "Built For The Same Streets",
    dropCode: "DESIGN NO. 02",
    category: "Hoodies",
    fabric: "420 GSM Heavy French Terry",
    fit: "Relaxed Drop-Shoulder",
    edition: "K-Town Series // 2026",
    description:
      "Roadside dhabas and espresso bars — two rituals powering the same relentless city. Cut from 420 GSM brushed obsidian fleece with structured double-lined hood and high-contrast back crest.",
    imgSrc: `${COEXIST_BASE}/steel-kettles-hoodie.jpg`,
    altImgSrc: `${COEXIST_BASE}/steel-kettles-wide.jpg`,
    objectPosition: "center 24%",
    altObjectPosition: "right center",
    gallery: [
      { src: `${COEXIST_BASE}/steel-kettles-hoodie.jpg`, label: "Studio Back", objectPosition: "center 24%" },
      { src: `${COEXIST_BASE}/steel-kettles-wide.jpg`, label: "Campaign Frame", objectPosition: "right center" },
      { src: `${COEXIST_BASE}/wat-tawa-021.jpg`, label: "021 Inspiration", objectPosition: "center 35%" },
    ],
  },
  {
    id: "heritage-cream-longsleeve",
    numeral: "05",
    roman: "V",
    name: "Heritage Threads Cream Long-Sleeve",
    subtitle: "Bone Heavyweight Sleeve-Print LS",
    dropCode: "DROP 02 // SILHOUETTE",
    category: "Long Sleeves",
    fabric: "280 GSM Heavy Bone Jersey",
    fit: "Elongated Oversized Cut",
    edition: "Karachi • K-Town Clothing Co.",
    description:
      "Clean bone-white architectural jersey anchored by bold CO-EXIST chest typography and vertical forearm sleeve hit. Designed for layering under heavyweight hoodies or wearing solo.",
    imgSrc: `${COEXIST_BASE}/heritage-cream-ls.jpg`,
    altImgSrc: `${COEXIST_BASE}/coexist-coordinates.jpg`,
    objectPosition: "center 28%",
    altObjectPosition: "center 35%",
    gallery: [
      { src: `${COEXIST_BASE}/heritage-cream-ls.jpg`, label: "Rack Editorial", objectPosition: "center 28%" },
      { src: `${COEXIST_BASE}/coexist-coordinates.jpg`, label: "021 Coordinates", objectPosition: "center 35%" },
    ],
  },
  {
    id: "sector-021-obsidian-hoodie",
    numeral: "06",
    roman: "VI",
    name: "After Hours Sector 021 Hoodie — Obsidian",
    subtitle: "Midnight Static Technical Compass",
    dropCode: "021-RAW // CE-021",
    category: "Hoodies",
    fabric: "420 GSM Washed Obsidian Fleece",
    fit: "Oversized Boxy Silhouette",
    edition: "24.8607° N · 67.0011° E",
    description:
      "Washed obsidian fleece featuring Urdu sleeve calligraphy ('Sadaqat aur Shanakht' — Authenticity & Identity) and our technical Sector 021 compass plate across the back.",
    imgSrc: `${COEXIST_BASE}/sector021-black-hoodie.jpg`,
    altImgSrc: `${COEXIST_BASE}/sector021-radar.jpg`,
    objectPosition: "center 18%",
    altObjectPosition: "center 38%",
    gallery: [
      { src: `${COEXIST_BASE}/sector021-black-hoodie.jpg`, label: "Hoodie Back", objectPosition: "center 18%" },
      { src: `${COEXIST_BASE}/sector021-radar.jpg`, label: "Technical Spec Graphic", objectPosition: "center 35%" },
    ],
  },
  {
    id: "sector-021-concrete-hoodie",
    numeral: "07",
    roman: "VII",
    name: "After Hours Sector 021 Hoodie — Concrete",
    subtitle: "Habibia Brutalism Ash Edition",
    dropCode: "021-RAW // BATCH 01",
    category: "Hoodies",
    fabric: "420 GSM Washed Concrete Terry",
    fit: "Oversized Boxy Silhouette",
    edition: "Habibia Brutalism // Karachi",
    description:
      "Monochrome washed concrete colorway of the Sector 021 heavyweight hoodie. Anchored by sharp charcoal compass linework and Southside coordinate markings.",
    imgSrc: `${COEXIST_BASE}/sector021-ash-hoodie.jpg`,
    altImgSrc: `${COEXIST_BASE}/sector021-radar.jpg`,
    objectPosition: "center 28%",
    altObjectPosition: "center 38%",
    gallery: [
      { src: `${COEXIST_BASE}/sector021-ash-hoodie.jpg`, label: "Concrete Back", objectPosition: "center 28%" },
      { src: `${COEXIST_BASE}/sector021-radar.jpg`, label: "Technical Spec Graphic", objectPosition: "center 35%" },
    ],
  },
  {
    id: "stand-the-test-tee",
    numeral: "08",
    roman: "VIII",
    name: "Stand The Test Oversized Tee",
    subtitle: "Co-Exist In Stone — Crimson Edition",
    dropCode: "021-RAW // STONE",
    category: "Heavyweight Tees",
    fabric: "260 GSM Heavyweight Washed Black",
    fit: "Oversized Boxy Fit",
    edition: "24.8607° N · 67.0011° E",
    description:
      "Karachi's brutalist stone facades and tangled sky-lines rendered in high-contrast architectural ink over a torn crimson base bar. Built to stand the test.",
    imgSrc: `${COEXIST_BASE}/stand-the-test-tee.jpg`,
    altImgSrc: `${COEXIST_BASE}/coexist-coordinates.jpg`,
    objectPosition: "center 22%",
    altObjectPosition: "center 35%",
    gallery: [
      { src: `${COEXIST_BASE}/stand-the-test-tee.jpg`, label: "On-Model Back", objectPosition: "center 22%" },
      { src: `${COEXIST_BASE}/coexist-coordinates.jpg`, label: "021 Campaign", objectPosition: "center 35%" },
    ],
  },
];

export const TOP_SNEAKERS: TopSneakerItem[] = [
  {
    id: "unapologetically-021-tee",
    name: "Unapologetically 021 Heavyweight Tee",
    roman: "I",
    numeral: "01",
    href: "#karachi-chapter-grid",
    imgSrc: `${COEXIST_BASE}/unapologetically-elevator.jpg`,
  },
  {
    id: "steel-kettles-hoodie",
    name: "Steel Kettles & Chrome Hoodie",
    roman: "II",
    numeral: "02",
    href: "#karachi-chapter-grid",
    imgSrc: `${COEXIST_BASE}/steel-kettles-wide.jpg`,
  },
  {
    id: "frere-hall-heritage-tee",
    name: "Frere Hall Heritage Threads Tee",
    roman: "III",
    numeral: "03",
    href: "#karachi-chapter-grid",
    imgSrc: `${COEXIST_BASE}/heritage-boulders-wide.jpg`,
  },
  {
    id: "burns-road-smoke-tee",
    name: "Burns Road Smoke Oversized Tee",
    roman: "IV",
    numeral: "04",
    href: "#karachi-chapter-grid",
    imgSrc: `${COEXIST_BASE}/burns-road-tee.jpg`,
  },
  {
    id: "sector-021-obsidian-hoodie",
    name: "After Hours Sector 021 Hoodie",
    roman: "V",
    numeral: "05",
    href: "#karachi-chapter-grid",
    imgSrc: `${COEXIST_BASE}/sector021-black-hoodie.jpg`,
  },
];

// Target deadline matches live site countdown (~7D 21H 51M from 2026-11-18T00:14Z -> 1795644000)
export const TRENDING_AUCTIONS: AuctionLotItem[] = [
  {
    id: "13292",
    title: "Viktor & Rolf Spicebomb Dark Leather",
    href: "/product/viktor-rolf-spicebomb-dark-leather/",
    imgSrc: `${PAGE_BASE}/products/auction-13292-spicebomb.png`,
    currentBidFormatted: "70.00 €",
    minBid: 80,
    increment: 10,
    endsAtUnix: 1795644000,
  },
  {
    id: "13290",
    title: "Supreme x Playboy Long-Sleeve Top Pink",
    href: "/product/supreme-x-playboy-long-sleeve-top-pink/",
    imgSrc: `${PAGE_BASE}/products/auction-13290-supreme-playboy.png`,
    currentBidFormatted: "350.00 €",
    minBid: 370,
    increment: 20,
    endsAtUnix: 1795644000,
  },
  {
    id: "13288",
    title: "One Piece x Nike Air Max Plus 'Mera Mera'",
    href: "/product/one-piece-x-nike-air-max-plus-mera-mera/",
    imgSrc: `${PAGE_BASE}/products/auction-13288-onepiece-airmax.png`,
    currentBidFormatted: "550.00 €",
    minBid: 600,
    increment: 50,
    endsAtUnix: 1795644000,
  },
  {
    id: "13283",
    title: "Supreme x Louis Vuitton City Mask Red SP Sunglasses",
    href: "/product/supreme-x-louis-vuitton-city-mask-red-sp-sunglasses/",
    imgSrc: `${PAGE_BASE}/products/auction-13283-supreme-lv.png`,
    currentBidFormatted: "1000.00 €",
    minBid: 1100,
    increment: 100,
    endsAtUnix: 1795644000,
  },
];

export const LATEST_REBORN_STORIES: RebornStoryItem[] = [
  {
    title: "Dad’s Rolex",
    authorMeta: "by Noah Richardson",
    dateText: "04  08  2026",
    href: "/reborn-story/dads-rolex/",
    imgSrc: `${PAGE_BASE}/reborn/dads-rolex.jpg`,
  },
  {
    title: "The Pair I Never Thought I’d Own",
    authorMeta: "by Ethan Brooks",
    dateText: "04  08  2026",
    href: "/reborn-story/the-pair-i-never-thought-id-own/",
    imgSrc: `${PAGE_BASE}/reborn/the-pair-i-never-thought-id-own.webp`,
  },
  {
    title: "The Last Hoodie",
    authorMeta: "by Sophia Martinez",
    dateText: "04  08  2026",
    href: "/reborn-story/the-last-hoodie/",
    imgSrc: `${PAGE_BASE}/reborn/the-last-hoodie.webp`,
  },
  {
    title: "The First Pair",
    authorMeta: "by Michael Thomson",
    dateText: "04  08  2026",
    href: "/reborn-story/the-first-pair/",
    imgSrc: `${PAGE_BASE}/reborn/the-first-pair.webp`,
  },
];

export const CLUE_TEXTS = {
  hint: [
    "Speak to the website with your keyboard.",
    "Seven letters, you already know the name.",
  ],
  blessed: ["The gilded ring marks you.", "You already belong to the circle."],
};

export const RITUAL_LINES = [
  "You looked closer. ",
  "The cult marks you. ",
  "Wear the gilded ring.",
];
