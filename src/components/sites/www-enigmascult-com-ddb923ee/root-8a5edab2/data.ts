import type {
  AuctionLotItem,
  MenuNavItem,
  NavLinkItem,
  RebornStoryItem,
  TopSneakerItem,
} from "./types";

const SHARED_BASE = "/sites/www-enigmascult-com-ddb923ee/shared";
const PAGE_BASE = "/sites/www-enigmascult-com-ddb923ee/root-8a5edab2";

export const SITE_ASSETS = {
  models: {
    logo: `${SHARED_BASE}/models/enigma-logo.glb`,
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
    manifestoLeft: `${PAGE_BASE}/img/manifesto-left.webp`,
    manifestoTopRight: `${PAGE_BASE}/img/manifesto-topright.webp`,
    manifestoPortrait: `${PAGE_BASE}/img/manifesto-portrait.webp`,
    manifestoAngel: `${PAGE_BASE}/img/manifesto-angel.webp`,
    manifestoArt2: `${PAGE_BASE}/img/manifesto-art3.webp`,
    manifestoArt5: `${PAGE_BASE}/img/manifesto-art5.png`,
    manifestoPill: `${PAGE_BASE}/img/manifesto-pill.webp`,
    manifestoYellow: `${PAGE_BASE}/img/manifesto-yellow.png`,
    manifestoGreenDunk: `${PAGE_BASE}/img/manifesto-greendunk.webp`,
    manifestoBacchus: `${PAGE_BASE}/img/manifesto-bacchus.png`,
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
  { label: "Cart", href: "/cart/" },
  { label: "Wishlist", href: "/my-account/wishlist/" },
];

export const MENU_ITEMS: MenuNavItem[] = [
  {
    label: "Mystery Boxes",
    href: "/mystery-boxes/",
    iconSrc: `${SHARED_BASE}/icons/icon-chest.png`,
    sfxName: "chest",
    sfxLevel: 0.5,
    sfxFade: 0.8,
  },
  {
    label: "Sneakers",
    href: "/shop/",
    iconSrc: `${SHARED_BASE}/icons/icon-shoes.png`,
    sfxName: "steps",
    sfxLevel: 0.3,
    sfxFade: 0.8,
  },
  {
    label: "Auctions",
    href: "/auctions/",
    iconSrc: `${SHARED_BASE}/icons/icon-gavel.png`,
    sfxName: "gavel",
    sfxLevel: 0.75,
    sfxFade: 1.2,
  },
  {
    label: "Find It For Me",
    href: "/find-it-at-my-price/",
    iconSrc: `${SHARED_BASE}/icons/icon-eye.png`,
  },
  {
    label: "Reborn",
    href: "/reborn/",
    iconSrc: `${SHARED_BASE}/icons/icon-hand.png`,
  },
  {
    label: "Blog",
    href: "/blog/",
    iconSrc: `${SHARED_BASE}/icons/icon-butterfly.png`,
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
  "Jordan 5 Retro",
  "SB Dunk Low",
  "AF1 Mother of Pearl",
  "Yeezy 700 Wave",
];

export const TOP_SNEAKERS: TopSneakerItem[] = [
  {
    name: "Nike Air Foamposite Pro Oregon Mummy Duck",
    roman: "I",
    numeral: "01",
    href: "/product/nike-air-foamposite-pro-oregon-mummy-duck/",
    imgSrc: `${PAGE_BASE}/products/tsneak-01-foamposite.png`,
  },
  {
    name: "Air Jordan 5 Halloween Black and Picante Red",
    roman: "II",
    numeral: "02",
    href: "/product/air-jordan-5-halloween-black-and-picante-red/",
    imgSrc: `${PAGE_BASE}/products/tsneak-02-aj5-halloween.png`,
  },
  {
    name: "Amiri Bones Blue Varsity Jacket",
    roman: "III",
    numeral: "03",
    href: "/product/amiri-bones-blue-varsity-jacket/",
    imgSrc: `${PAGE_BASE}/products/tsneak-03-amiri-jacket.png`,
  },
  {
    name: "Bearbrick × Transformers Optimus Prime BAPE Camo Shark",
    roman: "IV",
    numeral: "04",
    href: "/product/bearbrick-x-transformers-optimus-prime-bape-camo-shark/",
    imgSrc: `${PAGE_BASE}/products/tsneak-04-bearbrick.png`,
  },
  {
    name: "Jordan 4 Retro J Balvin Lemonade",
    roman: "V",
    numeral: "05",
    href: "/product/jordan-4-retro-j-balvin-lemonade/",
    imgSrc: `${PAGE_BASE}/products/tsneak-05-jbalvin.png`,
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
    "Six letters, you already know the name.",
  ],
  blessed: ["The gilded ring marks you.", "You already belong to the circle."],
};

export const RITUAL_LINES = [
  "You looked closer. ",
  "The cult marks you. ",
  "Wear the gilded ring.",
];
