"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE_ASSETS } from "./data";

export function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    gsap.registerPlugin(ScrollTrigger);

    let active = true;
    let rafId = 0;

    const ctx = gsap.context(() => {
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);

      gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    const scheduleRefresh = () => {
      if (!active) return;
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        if (active) {
          ScrollTrigger.refresh();
        }
      });
    };

    window.addEventListener("resize", scheduleRefresh);
    window.addEventListener("load", scheduleRefresh);
    window.visualViewport?.addEventListener("resize", scheduleRefresh);

    if (document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          scheduleRefresh();
        })
        .catch(() => {});
    }

    return () => {
      active = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", scheduleRefresh);
      window.removeEventListener("load", scheduleRefresh);
      window.visualViewport?.removeEventListener("resize", scheduleRefresh);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="manifesto alignfull">
      <div ref={trackRef} className="manifesto__track">
        <div className="manifesto__panel manifesto__panel--a">
          <img
            decoding="async"
            className="manifesto__arc"
            src={SITE_ASSETS.pageImg.heroArc}
            alt=""
            aria-hidden="true"
          />
          <img
            className="manifesto__img manifesto__img--left"
            src={SITE_ASSETS.pageImg.manifestoLeft}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <img
            className="manifesto__img manifesto__img--topright"
            src={SITE_ASSETS.pageImg.manifestoTopRight}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <img
            className="manifesto__img manifesto__img--portrait"
            src={SITE_ASSETS.pageImg.manifestoPortrait}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <img
            className="manifesto__angel"
            src={SITE_ASSETS.pageImg.manifestoAngel}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden="true"
          />
          <p className="manifesto__text manifesto__text--intro">
            {"This isn’t fashion — it’s initiation.\n“we don’t revive fashion. we resurrect icons.”"}
          </p>
          <h2 className="manifesto__title">Mini Manifesto</h2>
          <p className="manifesto__text manifesto__text--side">
            Enigma is a fashion cult that guards the flame of true hype.
          </p>
          <a className="manifesto__cta" href="/mission/">
            Meet the Cult
          </a>
        </div>

        <div className="manifesto__panel manifesto__panel--b">
          <img
            className="manifesto__img manifesto__img--art2"
            src={SITE_ASSETS.pageImg.manifestoArt2}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <img
            className="manifesto__img manifesto__img--art5"
            src={SITE_ASSETS.pageImg.manifestoArt5}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <img
            className="manifesto__img manifesto__img--pill"
            src={SITE_ASSETS.pageImg.manifestoPill}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <p className="manifesto__text manifesto__text--b1">
            Plugged in with resellers worldwide who don’t believe in gatekeeping, and collectors whose closets tell stories worth a fortune.
          </p>
          <h2 className="manifesto__title">Honor the Grind</h2>
          <a className="manifesto__cta" href="/mystery-boxes">
            Join the Circle
          </a>
          <p className="manifesto__text manifesto__text--b2">
            This is for the ones who understand the grind — the “from nothing to something” energy.
          </p>
          <p className="manifesto__text manifesto__text--b3">
            {"For those who built their name from concrete dreams and late-night flips.\nHere, rarity isn’t flex — it’s philosophy."}
          </p>
        </div>

        <div className="manifesto__panel manifesto__panel--c">
          <img
            decoding="async"
            className="manifesto__arc"
            src={SITE_ASSETS.pageImg.heroArc}
            alt=""
            aria-hidden="true"
          />
          <img
            className="manifesto__img manifesto__img--yellow"
            src={SITE_ASSETS.pageImg.manifestoYellow}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <img
            className="manifesto__img manifesto__img--dunk"
            src={SITE_ASSETS.pageImg.manifestoGreenDunk}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <img
            className="manifesto__img manifesto__img--bacchus"
            src={SITE_ASSETS.pageImg.manifestoBacchus}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <p className="manifesto__text manifesto__text--c-intro">
            Limited drops of curated designer mystery boxes, live auctions and artists&apos; customs — all in one place.
          </p>
          <h2 className="manifesto__title">Rarity Is Philosophy</h2>
          <a className="manifesto__cta" href="/shop">
            See the Drops
          </a>
        </div>
      </div>
    </section>
  );
}

export default ManifestoSection;
