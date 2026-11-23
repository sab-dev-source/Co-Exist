import type { SfxName } from "../shared/sfx";

export interface NavLinkItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface MenuNavItem {
  label: string;
  href: string;
  iconSrc: string;
  sfxName?: SfxName;
  sfxLevel?: number;
  sfxFade?: number;
}

export interface TopSneakerItem {
  id: string;
  name: string;
  roman: string;
  numeral: string;
  href: string;
  imgSrc: string;
}

export type KarachiProductCategory = "All" | "Heavyweight Tees" | "Hoodies" | "Long Sleeves";

export interface KarachiProductItem {
  id: string;
  numeral: string;
  roman: string;
  name: string;
  subtitle: string;
  dropCode: string;
  category: Exclude<KarachiProductCategory, "All">;
  fabric: string;
  fit: string;
  edition: string;
  description: string;
  imgSrc: string;
  altImgSrc?: string;
  gallery: Array<{ src: string; label: string; objectPosition?: string }>;
  objectPosition?: string;
  altObjectPosition?: string;
}

export interface AuctionLotItem {
  id: string;
  title: string;
  href: string;
  imgSrc: string;
  currentBidFormatted: string;
  minBid: number;
  increment: number;
  endsAtUnix: number;
}

export interface RebornStoryItem {
  title: string;
  authorMeta: string;
  dateText: string;
  href: string;
  imgSrc: string;
}
