"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { BlockHero } from "./BlockHero";
import { ClueAndRitual } from "./ClueAndRitual";
import { CursorRing } from "./CursorRing";
import { FindPriceSection } from "./FindPriceSection";
import { HomePreloader } from "./HomePreloader";
import { ManifestoSection } from "./ManifestoSection";
import { MysteryBoxSection } from "./MysteryBoxSection";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { SoundAndCookies } from "./SoundAndCookies";
import { TopSneakersSection } from "./TopSneakersSection";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function EnigmaHomeClient() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis();
    window.__lenis = lenis;

    const handleScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", handleScroll);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    let disposed = false;
    const rafRefresh = window.requestAnimationFrame(() => {
      if (!disposed) {
        ScrollTrigger.refresh();
      }
    });

    if (document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          if (!disposed) {
            ScrollTrigger.refresh();
          }
        })
        .catch(() => {});
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafRefresh);
      lenis.off("scroll", handleScroll);
      gsap.ticker.remove(onTick);
      if (window.__lenis === lenis) {
        delete window.__lenis;
      }
      lenis.destroy();
    };
  }, []);

  return (
    <div className="wp-site-blocks">
      <SiteHeader />

      <main className="wp-block-group is-layout-flow wp-block-group-is-layout-flow">
        <div className="entry-content wp-block-post-content has-global-padding is-layout-constrained wp-block-post-content-is-layout-constrained">
          <BlockHero />
          <ManifestoSection />
          <MysteryBoxSection />
          <FindPriceSection />
          <TopSneakersSection />
        </div>
      </main>

      <SiteFooter />

      <ClueAndRitual />
      <SoundAndCookies />
      <HomePreloader />
      <CursorRing />
      <div className="page-veil" aria-hidden="true" />
    </div>
  );
}

export default EnigmaHomeClient;
