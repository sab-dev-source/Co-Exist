"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  createLoopingSfx,
  getAudioContext,
  isSoundEnabled,
  subscribeSoundState,
} from "@/components/sites/www-enigmascult-com-ddb923ee/shared/sfx";
import {
  disposeThreeScene,
  getGLTFLoader,
  hasWebGL,
  watchContextLoss,
} from "@/components/sites/www-enigmascult-com-ddb923ee/shared/threeLoader";
import { SITE_ASSETS } from "./data";

const HERO_CAMERA_MARGIN = 1.25;
const WIND_DURATION_MS = 4500;

const HERO_CLOUDS_VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform vec2  uMouse;
uniform float uMouseAmt;
uniform float uScroll;
uniform float uClick;
uniform float uMotion;
varying vec2  vUv;

float hash( vec2 p ) {
  return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 );
}

float noise( vec2 p ) {
  vec2 i = floor( p ), f = fract( p );
  vec2 u = f * f * ( 3.0 - 2.0 * f );
  return mix(
    mix( hash( i ), hash( i + vec2( 1.0, 0.0 ) ), u.x ),
    mix( hash( i + vec2( 0.0, 1.0 ) ), hash( i + vec2( 1.0, 1.0 ) ), u.x ),
    u.y
  );
}

void main() {
  vUv = uv;
  vec3 p = position;
  float m = uMotion;

  float t = uTime;
  float drift = noise( p.xy * 0.7 + t * 0.10 ) - 0.5;
  p.z += drift * 0.11 * m;
  p.x += sin( p.y * 1.5 + t * 0.25 ) * 0.030 * m;
  p.y += cos( p.x * 1.5 + t * 0.20 ) * 0.025 * m;

  float hv = uMouseAmt * m;
  p.z  -= hv * 0.28;
  p.xy += vec2( sin( p.y * 2.5 + uTime * 0.4 ), cos( p.x * 2.5 + uTime * 0.4 ) ) * hv * 0.06;
  p.xy += uMouse * hv * 0.04;

  float s = uScroll * m;
  p.z  -= s * 0.55;
  p.xy += vec2( sin( p.y * 3.0 + uTime * 0.3 ), cos( p.x * 3.0 + uTime * 0.3 ) ) * s * 0.09;

  float cl  = uClick * m;
  float ang = cl * 0.9 * ( 0.5 + 0.5 * sin( length( p.xy ) * 3.0 ) );
  float ca  = cos( ang ), sa = sin( ang );
  p.xy = mat2( ca, -sa, sa, ca ) * p.xy;
  p.z += cl * 0.35 * sin( length( p.xy ) * 4.0 - uTime * 2.0 );

  gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );
}
`;

const HERO_CLOUDS_FRAGMENT_SHADER = /* glsl */ `
uniform sampler2D uTex;
varying vec2 vUv;

void main() {
  vec4 c = texture2D( uTex, vUv );
  float fx = smoothstep( 0.020, 0.070, vUv.x ) * smoothstep( 0.0, 0.060, 1.0 - vUv.x );
  float fy = smoothstep( 0.0, 0.060, vUv.y ) * smoothstep( 0.0, 0.060, 1.0 - vUv.y );
  c.a *= fx * fy;
  if ( c.a < 0.003 ) discard;
  gl_FragColor = c;
}
`;

function dispatchHeroReady() {
  document.dispatchEvent(new CustomEvent("enigma:hero-ready"));
}

export function BlockHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const decorRef = useRef<HTMLDivElement | null>(null);
  const fallbackImgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const fallbackImg = fallbackImgRef.current;
    const canvas = canvasRef.current;
    const decor = decorRef.current ?? fallbackImg?.parentElement ?? null;

    if (!section || !fallbackImg || !canvas || !decor) return;

    let cancelled = false;
    let rafId = 0;
    let windTimeout = 0;
    let clickImpulse = 0;

    const windSfx = createLoopingSfx("wind", 0.42, 800, {
      in: 2.4,
      out: 3.2,
      random: true,
    });

    const unsubscribeSound = subscribeSoundState((on) => {
      if (!on) {
        window.clearTimeout(windTimeout);
        windSfx.stop();
      }
    });

    const handleHeroClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target?.closest("a, button")) return;
      clickImpulse = 1;

      if (isSoundEnabled()) {
        const ctx = getAudioContext();
        if (ctx && ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }
        windSfx.start();
        window.clearTimeout(windTimeout);
        windTimeout = window.setTimeout(() => {
          windSfx.stop();
        }, WIND_DURATION_MS);
      }
    };

    section.addEventListener("click", handleHeroClick, { passive: true });

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let texture: THREE.Texture | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let observer: IntersectionObserver | null = null;
    let contextWatcher: { lost: boolean; cleanup: () => void } | null = null;
    let pointerListenersAttached = false;
    let scrollListenersAttached = false;

    const targetMouse = new THREE.Vector2(0, 0);
    let targetMouseAmt = 0;
    let targetScroll = 0;
    let meshW = 2.68;
    let meshH = 2;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouse.set(nx * (meshW / 2), ny * (meshH / 2));
      targetMouseAmt = 1;
    };

    const handlePointerLeave = () => {
      targetMouseAmt = 0;
    };

    const updateScroll = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      targetScroll = Math.min(1, Math.max(0, -rect.top / vh));
    };

    const initHeroClouds = async () => {
      if (!hasWebGL()) {
        dispatchHeroReady();
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 100);
      camera.position.set(0, 0, 6);

      const [loadedTexture, gltfLoader] = await Promise.all([
        new THREE.TextureLoader().loadAsync(SITE_ASSETS.pageImg.heroClouds),
        getGLTFLoader(),
      ]);

      if (cancelled) {
        loadedTexture.dispose();
        disposeThreeScene(renderer, scene);
        renderer = null;
        scene = null;
        return;
      }

      texture = loadedTexture;
      texture.colorSpace = THREE.NoColorSpace;
      texture.flipY = false;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const uniforms = {
        uTex: { value: texture },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseAmt: { value: 0 },
        uScroll: { value: 0 },
        uClick: { value: 0 },
        uMotion: { value: prefersReducedMotion ? 0 : 1 },
      };

      material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: HERO_CLOUDS_VERTEX_SHADER,
        fragmentShader: HERO_CLOUDS_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
      });

      let cloudMesh: THREE.Mesh | null = null;
      await new Promise<void>((resolve) => {
        gltfLoader.load(
          SITE_ASSETS.models.heroClouds,
          (gltf) => {
            gltf.scene.traverse((obj) => {
              if ((obj as THREE.Mesh).isMesh) {
                const mesh = obj as THREE.Mesh;
                mesh.material = material!;
                cloudMesh = mesh;
                mesh.geometry.computeBoundingBox();
                const box = mesh.geometry.boundingBox;
                if (box) {
                  meshW = box.max.x - box.min.x || 2.68;
                  meshH = box.max.y - box.min.y || 2;
                }
              }
            });
            scene?.add(gltf.scene);
            resolve();
          },
          undefined,
          () => resolve()
        );
      });

      if (cancelled) {
        if (!cloudMesh) {
          material.dispose();
          texture.dispose();
        }
        disposeThreeScene(renderer, scene);
        renderer = null;
        scene = null;
        return;
      }

      if (!cloudMesh) {
        material.dispose();
        texture.dispose();
        disposeThreeScene(renderer, scene);
        renderer = null;
        scene = null;
        dispatchHeroReady();
        return;
      }

      const activeMesh: THREE.Mesh = cloudMesh;
      const activeRenderer = renderer;
      const activeScene = scene;

      let prevW = 0;
      let prevH = 0;

      const syncLayout = () => {
        const imgRect = fallbackImg.getBoundingClientRect();
        const decorRect = decor.getBoundingClientRect();
        const w = Math.round(imgRect.width) || Math.round(decorRect.width);
        const h = Math.round(imgRect.height) || Math.round(decorRect.height);

        canvas.style.left = `${imgRect.left - decorRect.left}px`;
        canvas.style.top = `${imgRect.top - decorRect.top}px`;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        if (w > 0 && h > 0 && (w !== prevW || h !== prevH)) {
          prevW = w;
          prevH = h;
          activeRenderer.setSize(w, h, false);
          camera.aspect = w / h;
          const meshAspect = meshW / meshH;
          const vFovRad = (camera.fov * Math.PI) / 180;
          let camZ = meshH / 2 / Math.tan(vFovRad / 2);
          if (camera.aspect < meshAspect) {
            const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * camera.aspect);
            camZ = meshW / 2 / Math.tan(hFovRad / 2);
          }
          camera.position.z = camZ * HERO_CAMERA_MARGIN;
          camera.updateProjectionMatrix();
        }
      };

      const revealCanvas = () => {
        canvas.style.opacity = "";
        fallbackImg.style.opacity = "0";
      };

      contextWatcher = watchContextLoss(
        canvas,
        () => {
          canvas.style.opacity = "0";
          fallbackImg.style.opacity = "";
        },
        () => {
          prevW = 0;
          prevH = 0;
          syncLayout();
          revealCanvas();
        }
      );

      section.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      section.addEventListener("pointerleave", handlePointerLeave, {
        passive: true,
      });
      pointerListenersAttached = true;

      window.addEventListener("scroll", updateScroll, { passive: true });
      window.addEventListener("resize", updateScroll, { passive: true });
      scrollListenersAttached = true;
      updateScroll();

      let isVisible = true;
      if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver(
          (entries) => {
            isVisible = entries[0]?.isIntersecting ?? true;
          },
          { threshold: 0 }
        );
        observer.observe(canvas);
      }

      const clock = new THREE.Clock();
      let readyDispatched = false;

      const tick = () => {
        if (cancelled) return;
        rafId = requestAnimationFrame(tick);

        if (
          contextWatcher?.lost ||
          (readyDispatched && (!isVisible || document.hidden))
        ) {
          return;
        }

        syncLayout();

        uniforms.uTime.value = clock.getElapsedTime();
        uniforms.uMouse.value.lerp(targetMouse, 0.1);
        uniforms.uMouseAmt.value +=
          0.08 * (targetMouseAmt - uniforms.uMouseAmt.value);
        uniforms.uScroll.value += 0.08 * (targetScroll - uniforms.uScroll.value);
        uniforms.uClick.value += 0.15 * (clickImpulse - uniforms.uClick.value);
        clickImpulse *= 0.96;

        if (!prefersReducedMotion) {
          activeMesh.rotation.z = 0.045 * uniforms.uTime.value;
        }

        const absCos = Math.abs(Math.cos(activeMesh.rotation.z));
        const absSin = Math.abs(Math.sin(activeMesh.rotation.z));
        const halfW = meshW / 2;
        const halfH = meshH / 2;
        const s = (halfW * HERO_CAMERA_MARGIN) / (halfW * absCos + halfH * absSin);
        const o = (halfH * HERO_CAMERA_MARGIN) / (halfW * absSin + halfH * absCos);
        activeMesh.scale.setScalar(Math.min(1, s, o));

        activeRenderer.render(activeScene, camera);

        if (!readyDispatched) {
          readyDispatched = true;
          revealCanvas();
          dispatchHeroReady();
        }
      };

      syncLayout();
      rafId = requestAnimationFrame(tick);
    };

    initHeroClouds().catch(() => {
      if (!cancelled) {
        material?.dispose();
        texture?.dispose();
        disposeThreeScene(renderer, scene);
        renderer = null;
        scene = null;
        dispatchHeroReady();
      }
    });

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      observer?.disconnect();
      contextWatcher?.cleanup();
      if (pointerListenersAttached) {
        section.removeEventListener("pointermove", handlePointerMove);
        section.removeEventListener("pointerleave", handlePointerLeave);
      }
      if (scrollListenersAttached) {
        window.removeEventListener("scroll", updateScroll);
        window.removeEventListener("resize", updateScroll);
      }
      section.removeEventListener("click", handleHeroClick);
      window.clearTimeout(windTimeout);
      unsubscribeSound();
      windSfx.stop();
      disposeThreeScene(renderer, scene);
      canvas.style.opacity = "0";
      fallbackImg.style.opacity = "";
    };
  }, []);

  return (
    <section ref={sectionRef} className="block-hero alignfull">
      <div ref={decorRef} className="block-hero__decor" aria-hidden="true">
        <div className="block-hero__grad" />
        <img
          decoding="async"
          className="block-hero__lines"
          src={SITE_ASSETS.pageImg.contactLines}
          alt=""
        />
        <img
          decoding="async"
          className="block-hero__arc"
          src={SITE_ASSETS.pageImg.heroArc}
          alt=""
        />
        <img
          ref={fallbackImgRef}
          decoding="async"
          className="block-hero__art"
          src={SITE_ASSETS.pageImg.heroClouds}
          alt=""
        />
        <canvas
          ref={canvasRef}
          className="block-hero__art3d"
          aria-hidden="true"
          style={{
            position: "absolute",
            pointerEvents: "none",
            opacity: 0,
            transition: "opacity .6s ease",
          }}
        />
      </div>
      <h1 className="block-hero__title" data-title={"Decode\nYour Style"}>
        {"Decode\nYour Style"}
      </h1>
      <p className="block-hero__tagline">Created from stunners, for stunners.</p>
      <a
        className="block-hero__cta"
        href="/mystery-boxes/"
        aria-label="Forge Yours — Mystery Boxes"
      >
        Forge Yours
      </a>
    </section>
  );
}

export default BlockHero;
