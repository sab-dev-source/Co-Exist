"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE_ASSETS } from "./data";

export function MysteryBoxSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const coverTopRef = useRef<HTMLDivElement>(null);
  const coverBottomRef = useRef<HTMLDivElement>(null);
  const zipBtnRef = useRef<HTMLButtonElement>(null);
  const zipChainRef = useRef<HTMLImageElement>(null);
  const zipSliderRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const coverTop = coverTopRef.current;
    const coverBottom = coverBottomRef.current;
    const zipBtn = zipBtnRef.current;
    const zipChain = zipChainRef.current;
    const zipSlider = zipSliderRef.current;
    if (!section || !coverTop || !coverBottom || !zipBtn || !zipChain || !zipSlider) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      let canPlayWhoosh = true;
      let lastWhooshAt = 0;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const inWhooshWindow = self.progress > 0.4 && self.progress < 0.75;
            if (canPlayWhoosh && self.direction > 0 && inWhooshWindow) {
              const now = performance.now();
              if (now - lastWhooshAt > 1500) {
                lastWhooshAt = now;
                const evt = new CustomEvent("enigma:sfx", {
                  detail: "whoosh",
                  cancelable: true,
                });
                document.dispatchEvent(evt);
                if (evt.defaultPrevented) {
                  canPlayWhoosh = false;
                }
              }
            } else if (!canPlayWhoosh && self.progress < 0.35) {
              canPlayWhoosh = true;
            }
          },
        },
      });

      tl.fromTo(
        zipChain,
        { clipPath: "inset(0% 0% 0% 0%)" },
        { clipPath: "inset(0% 101% 0% 0%)", ease: "none", duration: 0.4 },
        0
      );
      tl.to(zipSlider, { xPercent: -101, ease: "none", duration: 0.4 }, 0);
      tl.to(coverTop, { yPercent: -89, ease: "power1.in", duration: 0.4 }, 0.4);
      tl.to(coverBottom, { yPercent: 89, ease: "power1.in", duration: 0.4 }, 0.4);
      tl.to(zipBtn, { autoAlpha: 0, duration: 0.06 }, 0.4);
      tl.to({}, { duration: 0.2 }, 0.8);
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="mystery-box" className="mystery-box alignfull">
      <img
        className="mystery-box__chest"
        src={SITE_ASSETS.pageImg.mysteryChest}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <a className="mystery-box__cta" href="#inner-circle">
        Join the inner circle
      </a>
      <div ref={coverTopRef} className="mystery-box__cover mystery-box__cover--top">
        <img
          decoding="async"
          className="mystery-box__curtain mystery-box__curtain--top"
          src={SITE_ASSETS.pageImg.mysteryCurtainTop}
          alt=""
          aria-hidden="true"
        />
        <img
          className="mystery-box__texture"
          src={SITE_ASSETS.pageImg.mysteryTexture}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
        <h2 className="mystery-box__title" data-graffiti="Mystery Box">
          Mystery B<span className="mystery-box__o">o<img
            className="mystery-box__hand"
            src={SITE_ASSETS.pageImg.mysteryHand}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
          /></span>x
        </h2>
      </div>
      <div ref={coverBottomRef} className="mystery-box__cover mystery-box__cover--bottom">
        <img
          decoding="async"
          className="mystery-box__curtain mystery-box__curtain--bottom"
          src={SITE_ASSETS.pageImg.mysteryCurtainBottom}
          alt=""
          aria-hidden="true"
        />
        <img
          className="mystery-box__texture"
          src={SITE_ASSETS.pageImg.mysteryTexture}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
        <div className="mystery-box__copy">
          <p>
            Every box is a coded drop from the inner circle, tailored by our style experts team for those who don’t chase hype, they create it.
          </p>
          <p>
            {"Each piece hits different — curated, elevated, algorithm-approved — built to make the world stare twice.\nWelcome to the cult of style where the bold get blessed and the ordinary stay locked out."}
          </p>
        </div>
      </div>
      <button
        ref={zipBtnRef}
        className="mystery-box__zip"
        type="button"
        aria-expanded="false"
        aria-label="Unzip the mystery box"
        tabIndex={-1}
        style={{ pointerEvents: "none" }}
      >
        <img
          ref={zipChainRef}
          decoding="async"
          className="mystery-box__zip-chain"
          src={SITE_ASSETS.pageImg.mysteryZip}
          alt=""
        />
        <img
          ref={zipSliderRef}
          decoding="async"
          className="mystery-box__zip-slider"
          src={SITE_ASSETS.pageImg.mysteryZip}
          alt=""
          aria-hidden="true"
        />
      </button>
    </section>
  );
}

export default MysteryBoxSection;
