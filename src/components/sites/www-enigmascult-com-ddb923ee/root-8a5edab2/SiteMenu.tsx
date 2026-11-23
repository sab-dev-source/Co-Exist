"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import * as THREE from "three";
import { MenuBarsIcon } from "@/components/sites/www-enigmascult-com-ddb923ee/shared/icons";
import {
  createLoopingSfx,
  getAudioContext,
  isSoundEnabled,
  startHoldableSfx,
  subscribeSoundState,
  type StoppableSfxHandle,
} from "@/components/sites/www-enigmascult-com-ddb923ee/shared/sfx";
import {
  disposeThreeScene,
  getGLTFLoader,
  hasWebGL,
  watchContextLoss,
} from "@/components/sites/www-enigmascult-com-ddb923ee/shared/threeLoader";
import { MENU_ITEMS, SITE_ASSETS, SOCIAL_LINKS } from "./data";
import type { MenuNavItem } from "./types";

interface LenisLike {
  stop?: () => void;
  start?: () => void;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) =>
      !el.closest("[inert]") &&
      !el.hasAttribute("inert") &&
      Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
  );
}

function getLenis(): LenisLike | undefined {
  return (window as Window & { __lenis?: LenisLike }).__lenis;
}

const RING_BASE_SPEED = (2 * Math.PI) / 140;

const MENU_CLOUDS_VERTEX_SHADER = `
uniform float uTime;
uniform vec2  uMouseN;
uniform vec2  uMouseW;
uniform float uPointer;
uniform float uRing;
attribute vec4 aCard;
varying vec2 vUv;
varying float vBreathe;

void main() {
  vUv = uv;
  float ph = aCard.x * 6.28318;
  float depth = aCard.y;
  vec3 p = position;

  float tempo = 0.70 + 0.60 * fract( aCard.x * 13.37 );
  float t = uTime * tempo;

  float speed = mix( -0.35, 1.45, depth ) * ( 0.80 + 0.40 * fract( aCard.x * 7.13 ) );
  float ang = uRing * speed + sin( uTime * 0.013 * tempo + ph ) * 0.06;
  float ca = cos( ang ), sa = sin( ang );
  p.xy = mat2( ca, sa, -sa, ca ) * p.xy;
  p.xy *= 1.0 + 0.035 * sin( uTime * 0.027 * tempo + ph * 3.0 );

  float reach = mix( 0.75, 1.25, depth );
  p.x += ( sin( t * 0.10 + ph ) * 0.030
         + sin( t * 0.043 + ph * 2.3 ) * 0.022
         + sin( t * 0.017 + ph * 5.1 ) * 0.012 ) * reach;
  p.y += ( cos( t * 0.071 + ph * 1.7 ) * 0.024
         + sin( t * 0.029 + ph * 3.9 ) * 0.016 ) * reach;

  float wind = sin( uTime * 0.021 ) * 0.6 + sin( uTime * 0.0083 + 1.3 ) * 0.4;
  p.x += wind * 0.035 * depth;

  vBreathe = 0.90 + 0.06 * sin( t * 0.06 + ph * 4.0 )
                  + 0.04 * sin( t * 0.023 + ph * 7.0 );

  vec4 mv = modelViewMatrix * vec4( p, 1.0 );

  mv.xy += uMouseN * mix( 0.03, 0.14, depth ) * uPointer;

  vec2 away = mv.xy - uMouseW;
  float gust = smoothstep( 0.85, 0.0, length( away ) ) * uPointer;
  mv.xy += normalize( away + vec2( 1e-4, 0.0 ) ) * gust * 0.16;
  vBreathe += gust * 0.12;

  gl_Position = projectionMatrix * mv;
}
`;

const MENU_CLOUDS_FRAGMENT_SHADER = `
uniform sampler2D uTex;
uniform float uFade;
varying vec2 vUv;
varying float vBreathe;

void main() {
  vec4 c = texture2D( uTex, vUv );
  float a = c.a * vBreathe * uFade;
  if ( a < 0.004 ) {
    discard;
  }
  gl_FragColor = vec4( c.rgb, a );
}
`;

export function SiteMenu() {
  const [open, setOpen] = useState(false);

  const openRef = useRef(open);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const previousFocusRef = useRef<HTMLElement | null>(null);
  const inertedRef = useRef<Element[]>([]);
  const wasOpenRef = useRef(false);
  const unmountedRef = useRef(false);

  const threeInitRef = useRef(false);
  const threeLoopControlRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const threeCleanupRef = useRef<(() => void) | null>(null);

  const hoverTimerRef = useRef(0);
  const lastHoverPlayAtRef = useRef(0);
  const activeHoverHrefRef = useRef<string | null>(null);
  const activeHoverHandleRef = useRef<StoppableSfxHandle | null>(null);

  const windLoopRef = useRef<ReturnType<typeof createLoopingSfx> | null>(null);
  const windActiveRef = useRef(false);
  const lastPointerXRef = useRef(-1);

  const stopHoverSfx = useCallback(() => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = 0;
    }
    activeHoverHrefRef.current = null;
    if (activeHoverHandleRef.current) {
      activeHoverHandleRef.current.stop(0.2);
      activeHoverHandleRef.current = null;
    }
  }, []);

  const updateEdgeWind = useCallback((clientX: number) => {
    const loop = windLoopRef.current;
    if (!loop) return;
    const inEdge =
      openRef.current &&
      isSoundEnabled() &&
      (clientX < 0.32 * window.innerWidth || clientX > 0.68 * window.innerWidth);
    if (inEdge !== windActiveRef.current) {
      windActiveRef.current = inEdge;
      if (inEdge) {
        getAudioContext();
        loop.start();
      } else {
        loop.stop();
      }
    }
  }, []);

  const stopEdgeWind = useCallback(() => {
    windActiveRef.current = false;
    windLoopRef.current?.stop();
  }, []);

  const handleItemEnter = useCallback(
    (item: MenuNavItem) => {
      if (!openRef.current || !isSoundEnabled()) return;
      if (!item.sfxName) {
        stopHoverSfx();
        return;
      }
      if (activeHoverHrefRef.current === item.href) return;
      stopHoverSfx();
      activeHoverHrefRef.current = item.href;

      const sfxName = item.sfxName;
      const sfxLevel = item.sfxLevel ?? 0.5;
      const sfxFade = item.sfxFade ?? 0.8;

      hoverTimerRef.current = window.setTimeout(() => {
        hoverTimerRef.current = 0;
        if (!openRef.current || !isSoundEnabled()) return;
        const now = performance.now();
        if (now - lastHoverPlayAtRef.current < 700) return;
        const ctx = getAudioContext();
        if (!ctx || ctx.state !== "running") return;
        lastHoverPlayAtRef.current = now;
        activeHoverHandleRef.current = startHoldableSfx(sfxName, sfxLevel, sfxFade);
      }, 320);
    },
    [stopHoverSfx]
  );

  const ensureThreeInitialized = useCallback(() => {
    if (threeInitRef.current || !hasWebGL()) return;
    const canvas = canvasRef.current;
    const bg = bgRef.current;
    const menu = menuRef.current;
    if (!canvas || !bg || !menu) return;

    threeInitRef.current = true;

    (async () => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const loader = await getGLTFLoader();
      if (unmountedRef.current) return;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 100);

      let texture: THREE.Texture | null = null;
      let material: THREE.ShaderMaterial | null = null;
      let rafId = 0;
      let running = false;
      const cleanups: Array<() => void> = [];

      const disposeAll = () => {
        running = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
        cleanups.forEach((fn) => fn());
        disposeThreeScene(renderer, scene);
        texture?.dispose();
        material?.dispose();
      };

      try {
        texture = await new THREE.TextureLoader().loadAsync(
          SITE_ASSETS.sharedImg.menuCloudsAtlas
        );
        if (unmountedRef.current) {
          disposeAll();
          return;
        }
        texture.colorSpace = THREE.NoColorSpace;
        texture.flipY = false;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

        const uniforms = {
          uTex: { value: texture },
          uFade: { value: 1 },
          uTime: { value: 0 },
          uMouseN: { value: new THREE.Vector2(0, 0) },
          uMouseW: { value: new THREE.Vector2(0, 99) },
          uPointer: { value: 0 },
          uRing: { value: 0 },
        };

        material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: MENU_CLOUDS_VERTEX_SHADER,
          fragmentShader: MENU_CLOUDS_FRAGMENT_SHADER,
          transparent: true,
          depthWrite: false,
          depthTest: false,
        });

        const group = new THREE.Group();
        let cloudMesh: THREE.Mesh | null = null;
        let radius = 2.8;

        const gltf = await loader.loadAsync(SITE_ASSETS.models.menuClouds);
        if (unmountedRef.current) {
          disposeAll();
          return;
        }

        gltf.scene.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            mesh.material = material!;
            mesh.frustumCulled = false;
            cloudMesh = mesh;

            const colorAttr = mesh.geometry.getAttribute("color");
            if (colorAttr) {
              mesh.geometry.setAttribute("aCard", colorAttr);
              mesh.geometry.deleteAttribute("color");
            }

            const posAttr = mesh.geometry.getAttribute("position");
            if (posAttr) {
              let maxR = 0;
              for (let i = 0; i < posAttr.count; i++) {
                maxR = Math.max(maxR, Math.hypot(posAttr.getX(i), posAttr.getY(i)));
              }
              radius = maxR || radius;
            }
          }
        });

        if (!cloudMesh) {
          disposeAll();
          return;
        }

        group.add(gltf.scene);
        scene.add(group);

        let prevW = 0;
        let prevH = 0;
        const halfWorld = { x: 1, y: 1 };

        const resize = () => {
          const rect = bg.getBoundingClientRect();
          const width = Math.round(rect.width);
          const height = Math.round(rect.height);
          if (!width || !height || (width === prevW && height === prevH)) return;
          prevW = width;
          prevH = height;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          const fovRad = (camera.fov * Math.PI) / 180;
          const diag = Math.hypot(camera.aspect, 1);
          camera.position.z = (0.7 * radius) / (diag * Math.tan(fovRad / 2));
          camera.updateProjectionMatrix();
          halfWorld.y = camera.position.z * Math.tan(fovRad / 2);
          halfWorld.x = halfWorld.y * camera.aspect;
        };

        resize();
        renderer.render(scene, camera);
        bg.classList.add("site-menu__bg--3d");

        let prevNow = 0;
        const pointer = { nx: 0, ny: 0, engaged: 0 };
        let ctxState: { lost: boolean; cleanup: () => void } = {
          lost: false,
          cleanup: () => {},
        };

        const step = (now: number) => {
          if (!running || ctxState.lost) return;
          const dt = prevNow ? Math.min((now - prevNow) / 1000, 0.1) : 0;
          prevNow = now;
          uniforms.uTime.value += dt;
          const t = uniforms.uTime.value;
          uniforms.uRing.value +=
            RING_BASE_SPEED * dt * (1 + 0.35 * Math.sin(0.045 * t) * Math.cos(0.017 * t));

          const mn = uniforms.uMouseN.value;
          mn.x += 0.07 * (pointer.nx - mn.x);
          mn.y += 0.07 * (pointer.ny - mn.y);
          uniforms.uMouseW.value.set(mn.x * halfWorld.x, mn.y * halfWorld.y);
          uniforms.uPointer.value += 0.05 * (pointer.engaged - uniforms.uPointer.value);

          renderer.render(scene, camera);
          rafId = requestAnimationFrame(step);
        };

        const startLoop = () => {
          if (ctxState.lost) return;
          resize();
          if (reducedMotion) {
            renderer.render(scene, camera);
            return;
          }
          if (running) return;
          running = true;
          prevNow = 0;
          rafId = requestAnimationFrame(step);
        };

        const stopLoop = () => {
          running = false;
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
          }
        };

        ctxState = watchContextLoss(
          canvas,
          () => {
            stopLoop();
            bg.classList.remove("site-menu__bg--3d");
          },
          () => {
            prevW = 0;
            prevH = 0;
            resize();
            renderer.render(scene, camera);
            bg.classList.add("site-menu__bg--3d");
            if (openRef.current) startLoop();
          }
        );
        cleanups.push(ctxState.cleanup);

        if (!reducedMotion) {
          const onPointerMove = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            pointer.nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
            pointer.engaged = 1;
          };
          const onPointerLeave = () => {
            pointer.engaged = 0;
          };
          menu.addEventListener("pointermove", onPointerMove, { passive: true });
          menu.addEventListener("pointerleave", onPointerLeave, { passive: true });
          cleanups.push(() => {
            menu.removeEventListener("pointermove", onPointerMove);
            menu.removeEventListener("pointerleave", onPointerLeave);
          });
        }

        const onResize = () => {
          if (ctxState.lost) return;
          resize();
          if (!running && openRef.current) {
            renderer.render(scene, camera);
          }
        };
        const onVisibilityChange = () => {
          if (document.hidden) {
            stopLoop();
          } else if (openRef.current) {
            startLoop();
          }
        };

        window.addEventListener("resize", onResize, { passive: true });
        document.addEventListener("visibilitychange", onVisibilityChange);
        cleanups.push(() => {
          window.removeEventListener("resize", onResize);
          document.removeEventListener("visibilitychange", onVisibilityChange);
        });

        threeLoopControlRef.current = { start: startLoop, stop: stopLoop };
        threeCleanupRef.current = disposeAll;

        if (openRef.current && !document.hidden) {
          startLoop();
        }
      } catch {
        disposeAll();
      }
    })();
  }, []);

  // Wind edge SFX & sound subscription lifecycle
  useEffect(() => {
    unmountedRef.current = false;
    windLoopRef.current = createLoopingSfx("wind", 0.5, 900, {
      in: 2,
      out: 2.6,
      random: true,
    });

    const onPointerMove = (e: PointerEvent) => {
      lastPointerXRef.current = e.clientX;
      if (openRef.current) {
        updateEdgeWind(e.clientX);
      }
    };

    const unsubscribeSound = subscribeSoundState((on) => {
      if (!on) {
        stopEdgeWind();
        stopHoverSfx();
      } else if (openRef.current && lastPointerXRef.current >= 0) {
        updateEdgeWind(lastPointerXRef.current);
      }
    });

    document.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      unmountedRef.current = true;
      document.removeEventListener("pointermove", onPointerMove);
      unsubscribeSound();
      stopHoverSfx();
      stopEdgeWind();
      windLoopRef.current = null;
      threeCleanupRef.current?.();
      threeCleanupRef.current = null;
      threeLoopControlRef.current = null;
      threeInitRef.current = false;

      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        document.documentElement.classList.remove("menu-open");
        inertedRef.current.forEach((el) => el.removeAttribute("inert"));
        inertedRef.current = [];
        getLenis()?.start?.();
      }
    };
  }, [stopEdgeWind, stopHoverSfx, updateEdgeWind]);

  // Menu open/close DOM class, Lenis scroll lock, inert background, initial focus
  useEffect(() => {
    openRef.current = open;
    const menuEl = menuRef.current;
    const toggleEl = toggleRef.current;
    const headerEl = document.querySelector<HTMLElement>(".site-header");
    const soundEl = document.querySelector<HTMLElement>(".sound-toggle");

    if (open) {
      wasOpenRef.current = true;
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      document.documentElement.classList.add("menu-open");
      getLenis()?.stop?.();
      ensureThreeInitialized();
      threeLoopControlRef.current?.start();

      if (lastPointerXRef.current >= 0) {
        updateEdgeWind(lastPointerXRef.current);
      }

      if (menuEl) {
        const newlyInerted: Element[] = [];
        let cur: HTMLElement | null = menuEl;
        while (cur && cur.parentElement) {
          const parent: HTMLElement = cur.parentElement;
          Array.from(parent.children).forEach((child) => {
            if (
              child === cur ||
              child === toggleEl ||
              (toggleEl && child.contains(toggleEl)) ||
              child.contains(menuEl) ||
              (soundEl && (child === soundEl || child.contains(soundEl))) ||
              (headerEl && (child === headerEl || child.contains(headerEl))) ||
              child.hasAttribute("inert")
            ) {
              return;
            }
            child.setAttribute("inert", "");
            newlyInerted.push(child);
          });
          if (parent === document.body) break;
          cur = parent;
        }
        inertedRef.current = newlyInerted;

        const firstFocusable = getFocusable(menuEl)[0];
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          menuEl.setAttribute("tabindex", "-1");
          menuEl.focus();
        }
      }
      return;
    }

    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      document.documentElement.classList.remove("menu-open");
      getLenis()?.start?.();
      threeLoopControlRef.current?.stop();
      stopHoverSfx();
      stopEdgeWind();

      inertedRef.current.forEach((el) => el.removeAttribute("inert"));
      inertedRef.current = [];
      menuEl?.removeAttribute("tabindex");

      const prev = previousFocusRef.current;
      previousFocusRef.current = null;
      if (prev && document.contains(prev)) {
        prev.focus();
      } else {
        toggleEl?.focus();
      }
    }
  }, [open, ensureThreeInitialized, stopEdgeWind, stopHoverSfx, updateEdgeWind]);

  // Escape & Tab focus trap while open
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;

      const toggleEl = toggleRef.current;
      const menuEl = menuRef.current;
      const headerEl = document.querySelector<HTMLElement>(".site-header");
      if (!toggleEl || !menuEl) return;

      const focusables: HTMLElement[] = [
        toggleEl,
        ...(headerEl ? getFocusable(headerEl) : []),
        ...getFocusable(menuEl),
      ];
      if (!focusables.length) return;

      const idx = focusables.indexOf(document.activeElement as HTMLElement);
      const nextIdx = e.shiftKey ? idx - 1 : idx + 1;
      if (idx === -1) {
        e.preventDefault();
        focusables[e.shiftKey ? focusables.length - 1 : 0].focus();
        return;
      }
      if (nextIdx < 0 || nextIdx >= focusables.length) {
        e.preventDefault();
        focusables[nextIdx < 0 ? focusables.length - 1 : 0].focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleToggleClick = () => {
    if (isSoundEnabled()) {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
    }
    setOpen((prev) => !prev);
  };

  return (
    <>
      <button
        ref={toggleRef}
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label="Menu"
        onClick={handleToggleClick}
        onPointerEnter={ensureThreeInitialized}
        onFocus={ensureThreeInitialized}
      >
        <span className="menu-toggle__icon">
          <MenuBarsIcon />
        </span>
        <span className="menu-toggle__x">
          <i />
          <i />
        </span>
      </button>

      <div
        ref={menuRef}
        id="site-menu"
        className="site-menu"
        aria-hidden={!open}
      >
        <div
          ref={bgRef}
          className="site-menu__bg site-menu__bg--3d"
          aria-hidden="true"
        >
          <canvas ref={canvasRef} className="site-menu__mesh" aria-hidden="true" />
        </div>

        <nav className="site-menu__nav" aria-label="Main">
          <ul>
            {MENU_ITEMS.map((item) => (
              <li
                key={item.href}
                style={{ "--menu-icon": `url(${item.iconSrc})` } as CSSProperties}
              >
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  onPointerEnter={() => handleItemEnter(item)}
                  onPointerLeave={stopHoverSfx}
                >
                  {item.label}
                </a>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="site-menu__icon"
                  src={item.iconSrc}
                  alt=""
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
        </nav>

        <ul className="site-menu__socials">
          {SOCIAL_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default SiteMenu;
