export interface NavLinkItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface MenuNavItem {
  label: string;
  href: string;
  iconSrc: string;
  sfxName?: "chest" | "steps" | "gavel";
  sfxLevel?: number;
  sfxFade?: number;
}

export interface TopSneakerItem {
  name: string;
  roman: string;
  numeral: string;
  href: string;
  imgSrc: string;
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
