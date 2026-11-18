"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAudioContext,
  initSoundPreference,
  isSoundEnabled,
  playOneShotSfx,
  setSoundEnabled,
  SFX_CONFIG,
  startHoldableSfx,
  subscribeSoundState,
  type SfxName,
} from "@/components/sites/www-enigmascult-com-ddb923ee/shared/sfx";

const COOKIE_STORAGE_KEY = "enigma-cookie-consent";
const DESCENT_TAIL_STORAGE_KEY = "enigma-descent-tail";
const SOUND_HINT_DURATION_MS = 6000;
const SOUND_HINT_TEXT = "Listen close \u2014 sounds hide all over. Find them.";

interface CookieConsentPreferences {
  functional: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

const VALID_SFX_EVENTS = new Set<SfxName>([
  "whoosh",
  "shimmer",
  "wind",
  "descent",
]);

function readSavedCookieConsent(): {
  saved: boolean;
  analytics: boolean;
  marketing: boolean;
} {
  if (typeof window === "undefined") {
    return { saved: true, analytics: false, marketing: false };
  }
  try {
    const raw = window.localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!raw) {
      return { saved: false, analytics: false, marketing: false };
    }
    try {
      const parsed = JSON.parse(raw) as Partial<CookieConsentPreferences>;
      return {
        saved: true,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
      };
    } catch {
      return { saved: true, analytics: false, marketing: false };
    }
  } catch {
    return { saved: false, analytics: false, marketing: false };
  }
}

export function SoundAndCookies() {
  const [soundOn, setSoundOn] = useState(false);
  const [hintShown, setHintShown] = useState(false);

  const [consentSaved, setConsentSaved] = useState(true);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const hintTimerRef = useRef<number | null>(null);

  // Initialize sound preference, unlock Web Audio on gesture if previously enabled,
  // and listen for global enigma:sfx custom events.
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const unsubscribe = subscribeSoundState((on) => {
      setSoundOn(on);
    });

    const initiallyEnabled = initSoundPreference();
    queueMicrotask(() => {
      if (!cancelled) {
        setSoundOn(initiallyEnabled);
      }
    });

    const activeTimers = new Set<number>();
    const scheduleTimer = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        activeTimers.delete(id);
        fn();
      }, ms);
      activeTimers.add(id);
      return id;
    };

    const unlockEvents = [
      "pointerdown",
      "keydown",
      "touchend",
      "touchstart",
      "wheel",
    ] as const;
    let unlockInterval: number | null = null;
    let unlockActive = false;

    const cleanupUnlock = () => {
      if (!unlockActive) return;
      unlockActive = false;
      if (unlockInterval !== null) {
        window.clearInterval(unlockInterval);
        unlockInterval = null;
      }
      unlockEvents.forEach((evName) => {
        window.removeEventListener(evName, tryUnlock);
      });
    };

    const tryUnlock = () => {
      const ctx = getAudioContext();
      if (!ctx) {
        cleanupUnlock();
        return;
      }
      ctx
        .resume()
        .then(() => {
          if (ctx.state === "running") {
            cleanupUnlock();
            if (isSoundEnabled()) {
              setSoundEnabled(true);
            }
          }
        })
        .catch(() => {});
    };

    if (initiallyEnabled) {
      unlockActive = true;
      tryUnlock();
      unlockInterval = window.setInterval(() => {
        const ctx = getAudioContext();
        if (ctx && ctx.state === "running") {
          cleanupUnlock();
        } else {
          tryUnlock();
        }
      }, 1500);
      unlockEvents.forEach((evName) => {
        window.addEventListener(evName, tryUnlock, { passive: true });
      });

      try {
        if (window.sessionStorage.getItem(DESCENT_TAIL_STORAGE_KEY) === "1") {
          window.sessionStorage.removeItem(DESCENT_TAIL_STORAGE_KEY);
          const playDescentTail = (attempt: number) => {
            const ctx = getAudioContext();
            if (ctx && ctx.state === "running") {
              const handle = startHoldableSfx("descent", 0.42, 0, 600);
              if (handle) {
                scheduleTimer(() => handle.stop(1.6), 250);
              }
              return;
            }
            if (attempt < 6) {
              scheduleTimer(() => playDescentTail(attempt + 1), 200);
            }
          };
          playDescentTail(0);
        }
      } catch {
        // ignore storage errors
      }
    }

    const handledEvents = new WeakSet<Event>();
    const handleSfxEvent = (ev: Event) => {
      if (handledEvents.has(ev)) return;
      const customEv = ev as CustomEvent<SfxName>;
      const detail = customEv.detail;
      if (!detail || !VALID_SFX_EVENTS.has(detail) || !isSoundEnabled()) {
        return;
      }
      const cfg = SFX_CONFIG[detail];
      if (!cfg) return;

      const ctx = getAudioContext();
      if (!ctx || ctx.state !== "running") {
        return;
      }

      handledEvents.add(ev);
      if (customEv.cancelable) {
        customEv.preventDefault();
      }

      if (cfg.hold) {
        const handle = startHoldableSfx(
          detail,
          cfg.level,
          cfg.fade,
          cfg.lowpass
        );
        if (handle) {
          scheduleTimer(() => handle.stop(cfg.fade ?? 2), cfg.hold * 1000);
        }
      } else {
        playOneShotSfx(detail, cfg.level, cfg.fade);
      }
    };

    document.addEventListener("enigma:sfx", handleSfxEvent);
    window.addEventListener("enigma:sfx", handleSfxEvent);

    return () => {
      cancelled = true;
      unsubscribe();
      cleanupUnlock();
      document.removeEventListener("enigma:sfx", handleSfxEvent);
      window.removeEventListener("enigma:sfx", handleSfxEvent);
      activeTimers.forEach((id) => window.clearTimeout(id));
      activeTimers.clear();
      if (hintTimerRef.current !== null) {
        window.clearTimeout(hintTimerRef.current);
        hintTimerRef.current = null;
      }
    };
  }, []);

  // Initialize cookie consent state and listen for open-cookie-settings events
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const initial = readSavedCookieConsent();
    queueMicrotask(() => {
      if (cancelled) return;
      setConsentSaved(initial.saved);
      setBannerVisible(!initial.saved);
      setAnalytics(initial.analytics);
      setMarketing(initial.marketing);
    });

    const openModal = () => {
      const latest = readSavedCookieConsent();
      if (latest.saved) {
        setAnalytics(latest.analytics);
        setMarketing(latest.marketing);
      }
      setModalOpen(true);
    };

    window.addEventListener("enigma:open-cookie-settings", openModal);
    document.addEventListener("enigma:open-cookie-settings", openModal);

    return () => {
      cancelled = true;
      window.removeEventListener("enigma:open-cookie-settings", openModal);
      document.removeEventListener("enigma:open-cookie-settings", openModal);
    };
  }, []);

  // Close preferences modal on Escape
  useEffect(() => {
    if (!modalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen]);

  const handleToggleSound = useCallback(() => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);

    if (hintTimerRef.current !== null) {
      window.clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }

    if (next) {
      setHintShown(true);
      hintTimerRef.current = window.setTimeout(() => {
        setHintShown(false);
        hintTimerRef.current = null;
      }, SOUND_HINT_DURATION_MS);
    } else {
      setHintShown(false);
    }
  }, [soundOn]);

  const saveCookiePreferences = useCallback(
    (nextAnalytics: boolean, nextMarketing: boolean) => {
      const payload: CookieConsentPreferences = {
        functional: true,
        analytics: nextAnalytics,
        marketing: nextMarketing,
        updatedAt: new Date().toISOString(),
      };
      try {
        window.localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // ignore storage errors
      }
      setAnalytics(nextAnalytics);
      setMarketing(nextMarketing);
      setConsentSaved(true);
      setBannerVisible(false);
      setModalOpen(false);
    },
    []
  );

  const handleAcceptAll = useCallback(() => {
    saveCookiePreferences(true, true);
  }, [saveCookiePreferences]);

  const handleRejectAll = useCallback(() => {
    saveCookiePreferences(false, false);
  }, [saveCookiePreferences]);

  const handleSaveChoices = useCallback(() => {
    saveCookiePreferences(analytics, marketing);
  }, [analytics, marketing, saveCookiePreferences]);

  const handleCustomize = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleDismissBanner = useCallback(() => {
    setBannerVisible(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <>
      <button
        type="button"
        className={`sound-toggle${soundOn ? " is-on" : ""}`}
        data-sound-toggle=""
        aria-pressed={soundOn}
        onMouseDown={(e) => {
          if (e.detail > 1) e.preventDefault();
        }}
        onClick={handleToggleSound}
      >
        <span className="sound-toggle__wave" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={soundOn ? "sound-toggle__on" : "sound-toggle__off"}>
          {soundOn ? "Sound on" : "Sound off"}
        </span>
      </button>

      <span
        className={`sound-hint${hintShown ? " is-shown" : ""}`}
        aria-live="polite"
      >
        {hintShown ? SOUND_HINT_TEXT : ""}
      </span>

      {!consentSaved && bannerVisible && !modalOpen && (
        <div
          className="rfc-consent rfc-pos-modal"
          role="region"
          aria-label="Cookie consent"
        >
          <button
            type="button"
            className="rfc-close"
            aria-label="Close"
            onClick={handleDismissBanner}
          >
            ✕
          </button>
          <div className="rfc-inner">
            <div className="rfc-copy">
              <strong>We use cookies</strong>
              We use cookies to improve your experience. You can accept all,
              reject all, or customize your choices.{" "}
              <a href="/privacy-policy/">Privacy policy</a>
            </div>
            <div className="rfc-actions">
              <button
                type="button"
                className="rfc-btn rfc-accept-all"
                onClick={handleAcceptAll}
              >
                Accept all
              </button>
              <button
                type="button"
                className="rfc-btn rfc-customize"
                onClick={handleCustomize}
              >
                Customize
              </button>
              <button
                type="button"
                className="rfc-btn rfc-reject-all"
                onClick={handleRejectAll}
              >
                Reject all
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="rfc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rfc-modal-title"
        hidden={!modalOpen}
      >
        <div className="rfc-modal-backdrop" onClick={handleCloseModal} />
        <div className="rfc-modal-card">
          <button
            type="button"
            className="rfc-close"
            aria-label="Close"
            onClick={handleCloseModal}
          >
            ✕
          </button>
          <h2 id="rfc-modal-title">Cookie preferences</h2>
          <p className="rfc-preferences-desc">
            Enable or disable optional categories below. Functional cookies are
            always on.
          </p>
          <div className="rfc-form">
            <div className="rfc-row">
              <div className="rfc-col">
                <strong>Functional</strong>
                <div className="rfc-desc">
                  These cookies are essential for the website to work properly.
                  They enable basic features such as page navigation, access to
                  secure areas, and saving your preferences.
                </div>
              </div>
              <div className="rfc-col-toggle">
                <input
                  type="checkbox"
                  checked
                  disabled
                  aria-label="Functional cookies (required)"
                />
                <span className="rfc-required">Required</span>
              </div>
            </div>

            <div className="rfc-row">
              <div className="rfc-col">
                <strong>Analytics</strong>
                <div className="rfc-desc">
                  These cookies help us understand how visitors interact with
                  our website by collecting and reporting information
                  anonymously. The insights allow us to improve performance and
                  user experience.
                </div>
              </div>
              <div className="rfc-col-toggle">
                <label className="rfc-switch">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    aria-label="Analytics cookies"
                  />
                  <span className="rfc-slider" />
                </label>
              </div>
            </div>

            <div className="rfc-row">
              <div className="rfc-col">
                <strong>Marketing</strong>
                <div className="rfc-desc">
                  These cookies are used to track visitors across websites. The
                  intention is to display ads and content that are more
                  relevant and engaging to each user.
                </div>
              </div>
              <div className="rfc-col-toggle">
                <label className="rfc-switch">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    aria-label="Marketing cookies"
                  />
                  <span className="rfc-slider" />
                </label>
              </div>
            </div>
          </div>

          <div className="rfc-actions rfc-actions-end">
            <button
              type="button"
              className="rfc-btn rfc-accept-all"
              onClick={handleAcceptAll}
            >
              Accept all
            </button>
            <button
              type="button"
              className="rfc-btn"
              onClick={handleSaveChoices}
            >
              Save choices
            </button>
            <button
              type="button"
              className="rfc-btn rfc-reject-all"
              onClick={handleRejectAll}
            >
              Reject all
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SoundAndCookies;
