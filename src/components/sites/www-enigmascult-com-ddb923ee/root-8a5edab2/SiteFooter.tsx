"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import * as THREE from "three";
import { ErrorTriangleIcon } from "@/components/sites/www-enigmascult-com-ddb923ee/shared/icons";
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
import { FOOTER_LEGAL_LINKS, SITE_ASSETS, SOCIAL_LINKS } from "./data";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CLOUD_VERTEX_SHADER = `
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uReveal;
  uniform float uParallax;
  uniform float uMotion;
  varying vec2  vUv;

  float hash( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
  float noise( vec2 p ) {
    vec2 i = floor( p ), f = fract( p );
    vec2 u = f * f * ( 3.0 - 2.0 * f );
    return mix( mix( hash( i ), hash( i + vec2( 1.0, 0.0 ) ), u.x ),
                mix( hash( i + vec2( 0.0, 1.0 ) ), hash( i + vec2( 1.0, 1.0 ) ), u.x ), u.y );
  }

  void main() {
    vUv = uv;
    vec3 p = position;
    float m = uMotion;

    // Reveal — rise + swell into place as uReveal 0 -> 1.
    float rev = clamp( uReveal, 0.0, 1.0 );
    p.y -= ( 1.0 - rev ) * 0.30;

    // Idle drift.
    float drift = noise( p.xy * 0.7 + uTime * 0.10 ) - 0.5;
    p.z += drift * 0.10 * m * rev;
    p.x += sin( p.y * 1.4 + uTime * 0.22 ) * 0.025 * m * rev;

    // Mouse — parallax lean + gentle reshape (front layer leans more).
    vec2 mo = uMouse * uParallax * m * rev;
    p.xy += mo;
    p.xy += vec2( sin( p.y * 2.5 + uTime * 0.4 ), cos( p.x * 2.5 + uTime * 0.4 ) ) * length( uMouse ) * 0.04 * m * rev;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );
  }
`;

const CLOUD_FRAGMENT_SHADER = `
  uniform sampler2D uTex;
  uniform float uReveal;
  uniform vec2  uTexel;
  varying vec2 vUv;
  void main() {
    // Texture is premultiplied on upload so bilinear filtering avoids dark fringes.
    vec4 c = texture2D( uTex, vUv );

    // Rotated 4-tap kernel (1.5 texels) softens upscaled alpha edges while preserving interior detail.
    vec2 o = uTexel * 1.5;
    vec4 b = texture2D( uTex, vUv + vec2(  o.x,  o.y * 0.5 ) )
           + texture2D( uTex, vUv + vec2( -o.x * 0.5,  o.y ) )
           + texture2D( uTex, vUv + vec2( -o.x, -o.y * 0.5 ) )
           + texture2D( uTex, vUv + vec2(  o.x * 0.5, -o.y ) );
    c = mix( c, b * 0.25, 0.45 );

    // Feather plane borders to prevent hard cuts.
    float fx = smoothstep( 0.0, 0.05, vUv.x ) * smoothstep( 0.0, 0.05, 1.0 - vUv.x );
    float fy = smoothstep( 0.0, 0.05, vUv.y ) * smoothstep( 0.0, 0.05, 1.0 - vUv.y );
    // Premultiplied: scale every channel, not just alpha.
    c *= fx * fy * clamp( uReveal, 0.0, 1.0 );
    if ( c.a < 0.004 ) discard;
    gl_FragColor = c;
  }
`;

interface CloudLayerUniforms {
  [uniform: string]: THREE.IUniform;
  uTex: THREE.IUniform<THREE.Texture>;
  uTime: THREE.IUniform<number>;
  uMouse: THREE.IUniform<THREE.Vector2>;
  uReveal: THREE.IUniform<number>;
  uParallax: THREE.IUniform<number>;
  uMotion: THREE.IUniform<number>;
  uTexel: THREE.IUniform<THREE.Vector2>;
}

interface CloudLayerEntry {
  mesh: THREE.Mesh;
  scale: number;
  drop: number;
  uniforms: CloudLayerUniforms;
}

type TextureDimensions = { width?: number; height?: number };

function getTextureSize(tex: THREE.Texture): { width: number; height: number } {
  const img = tex.image as TextureDimensions | undefined;
  return {
    width: img?.width || 1200,
    height: img?.height || 553,
  };
}

function loadPremultipliedTexture(
  loader: THREE.TextureLoader,
  url: string,
  maxAnisotropy: number
): Promise<THREE.Texture> {
  return loader.loadAsync(url).then((tex) => {
    tex.colorSpace = THREE.NoColorSpace;
    tex.flipY = false;
    tex.premultiplyAlpha = true;
    tex.anisotropy = maxAnisotropy;
    return tex;
  });
}

function createCloudLayer(
  geometry: THREE.BufferGeometry,
  texture: THREE.Texture,
  z: number,
  parallax: number,
  scale: number,
  drop: number,
  reducedMotion: boolean
): CloudLayerEntry {
  const { width, height } = getTextureSize(texture);
  const uniforms: CloudLayerUniforms = {
    uTex: { value: texture },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uReveal: { value: reducedMotion ? 1 : 0 },
    uParallax: { value: parallax },
    uMotion: { value: reducedMotion ? 0 : 1 },
    uTexel: { value: new THREE.Vector2(1 / width, 1 / height) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: CLOUD_VERTEX_SHADER,
    fragmentShader: CLOUD_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    premultipliedAlpha: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = z;
  mesh.scale.set(scale, scale, 1);

  return { mesh, scale, drop, uniforms };
}

export function SiteFooter() {
  const cloudsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const cloudsEl = cloudsRef.current;
    if (!cloudsEl || !hasWebGL()) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = { visible: false, reveal: 0, started: false };

    let disposed = false;
    let rafId = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let contextWatcher: { lost: boolean; cleanup: () => void } | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let removeListeners: (() => void) | null = null;

    const initClouds = async () => {
      const gltfLoader = await getGLTFLoader();
      if (disposed) return;

      canvas = document.createElement("canvas");
      canvas.className = "site-footer__clouds3d";
      canvas.setAttribute("aria-hidden", "true");
      Object.assign(canvas.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: "0",
        transition: "opacity .8s ease",
      });
      cloudsEl.appendChild(canvas);

      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      scene = new THREE.Scene();
      let geomWidth = 2.675;
      let geomHeight = 2;
      const camera = new THREE.OrthographicCamera(
        -geomWidth / 2,
        geomWidth / 2,
        geomHeight / 2,
        -geomHeight / 2,
        -10,
        10
      );
      camera.position.z = 4;

      const geometry = await new Promise<THREE.BufferGeometry | null>((resolve) => {
        gltfLoader.load(
          SITE_ASSETS.models.heroClouds,
          (gltf) => {
            let found: THREE.BufferGeometry | null = null;
            gltf.scene.traverse((obj) => {
              if ((obj as THREE.Mesh).isMesh && !found) {
                found = (obj as THREE.Mesh).geometry;
              }
            });
            resolve(found);
          },
          undefined,
          () => resolve(null)
        );
      });

      if (disposed || !geometry) {
        geometry?.dispose();
        disposeThreeScene(renderer, scene);
        canvas.remove();
        renderer = null;
        scene = null;
        canvas = null;
        return;
      }

      geometry.computeBoundingBox();
      if (geometry.boundingBox) {
        geomWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        geomHeight = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
        camera.left = -geomWidth / 2;
        camera.right = geomWidth / 2;
        camera.top = geomHeight / 2;
        camera.bottom = -geomHeight / 2;
        camera.updateProjectionMatrix();
      }

      const textureLoader = new THREE.TextureLoader();
      const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
      const [texBack, texFront] = await Promise.all([
        loadPremultipliedTexture(
          textureLoader,
          SITE_ASSETS.sharedImg.footerCloudsBack,
          maxAnisotropy
        ),
        loadPremultipliedTexture(
          textureLoader,
          SITE_ASSETS.sharedImg.footerCloudsFront,
          maxAnisotropy
        ),
      ]);

      if (disposed) {
        texBack.dispose();
        texFront.dispose();
        geometry.dispose();
        disposeThreeScene(renderer, scene);
        canvas.remove();
        renderer = null;
        scene = null;
        canvas = null;
        return;
      }

      const frontSize = getTextureSize(texFront);
      const backSize = getTextureSize(texBack);
      const refSize = frontSize.width && frontSize.height ? frontSize : backSize;
      const texAspect =
        refSize.width && refSize.height ? refSize.width / refSize.height : geomWidth / geomHeight;

      const layers: CloudLayerEntry[] = [
        createCloudLayer(
          geometry,
          texBack,
          -0.4,
          0.05,
          1.06,
          0,
          reducedMotion
        ),
        createCloudLayer(
          geometry,
          texFront,
          0,
          0.1,
          1.0,
          0.07,
          reducedMotion
        ),
      ];
      layers.forEach((layer) => scene?.add(layer.mesh));

      let lastW = 0;
      let lastH = 0;

      const resize = () => {
        if (!renderer) return;
        const rect = cloudsEl.getBoundingClientRect();
        const w = rect.width || 1;
        const h = rect.height || 1;
        if (w === lastW && h === lastH) return;
        lastW = w;
        lastH = h;
        renderer.setSize(w, h, false);
        const aspect = w / h;
        camera.left = -aspect;
        camera.right = aspect;
        camera.top = 1;
        camera.bottom = -1;
        camera.updateProjectionMatrix();

        const targetW = 2 * aspect * (w < 782 ? 1.6 : 1);
        const targetH = targetW / texAspect;
        for (const layer of layers) {
          const sx = (targetW / geomWidth) * layer.scale;
          const sy = (targetH / geomHeight) * layer.scale;
          layer.mesh.scale.set(sx, sy, 1);
          layer.mesh.position.y = (targetH * layer.scale) / 2 - 1 - targetH * layer.drop;
        }

        if (reducedMotion && scene && !contextWatcher?.lost) {
          renderer.render(scene, camera);
        }
      };

      const showCanvas = () => {
        if (!disposed && canvas) {
          canvas.style.opacity = "1";
        }
      };

      resize();
      window.requestAnimationFrame(showCanvas);

      contextWatcher = watchContextLoss(
        canvas,
        () => {
          if (canvas) canvas.style.opacity = "0";
        },
        () => {
          lastW = 0;
          lastH = 0;
          resize();
          showCanvas();
        }
      );

      const targetMouse = new THREE.Vector2(0, 0);
      const footerEl = cloudsEl.closest(".site-footer");

      const handlePointerMove = (e: Event) => {
        if (!canvas || reducedMotion) return;
        const pe = e as PointerEvent;
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const nx = ((pe.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((pe.clientY - rect.top) / rect.height) * 2 - 1);
        targetMouse.set(nx, ny);
      };

      const handlePointerLeave = () => {
        targetMouse.set(0, 0);
      };

      window.addEventListener("resize", resize, { passive: true });
      footerEl?.addEventListener("pointermove", handlePointerMove, { passive: true });
      footerEl?.addEventListener("pointerleave", handlePointerLeave, { passive: true });

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(cloudsEl);
      }

      removeListeners = () => {
        window.removeEventListener("resize", resize);
        footerEl?.removeEventListener("pointermove", handlePointerMove);
        footerEl?.removeEventListener("pointerleave", handlePointerLeave);
      };

      if (reducedMotion) {
        renderer.render(scene, camera);
        return;
      }

      const startMs = performance.now();
      const tick = () => {
        rafId = window.requestAnimationFrame(tick);
        if (
          disposed ||
          !renderer ||
          !scene ||
          contextWatcher?.lost ||
          !state.visible ||
          document.hidden
        ) {
          return;
        }
        const elapsed = (performance.now() - startMs) / 1000;
        for (const layer of layers) {
          layer.uniforms.uTime.value = elapsed;
          layer.uniforms.uMouse.value.lerp(targetMouse, 0.06);
          layer.uniforms.uReveal.value +=
            0.04 * (state.reveal - layer.uniforms.uReveal.value);
        }
        renderer.render(scene, camera);
      };
      rafId = window.requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          state.visible = entry.isIntersecting;
          if (entry.isIntersecting) {
            state.reveal = 1;
            if (!state.started) {
              state.started = true;
              initClouds().catch(() => {});
            }
          }
        });
      },
      {
        threshold: 0,
        rootMargin: "100% 0px",
      }
    );
    observer.observe(cloudsEl);

    return () => {
      disposed = true;
      observer.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
      removeListeners?.();
      resizeObserver?.disconnect();
      contextWatcher?.cleanup();
      disposeThreeScene(renderer, scene);
      canvas?.remove();
    };
  }, []);

  useEffect(() => {
    const cloudsEl = cloudsRef.current;
    if (!cloudsEl) return;

    const windSfx = createLoopingSfx("wind", 0.28, 700, {
      in: 2.4,
      out: 3.2,
      random: true,
    });
    let hovering = false;

    const stopWind = () => {
      hovering = false;
      windSfx.stop();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isSoundEnabled()) {
        if (windSfx.isOn()) stopWind();
        return;
      }
      const rect = cloudsEl.getBoundingClientRect();
      const inside =
        rect.height > 0 &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right;
      if (inside !== hovering) {
        hovering = inside;
        if (inside) {
          getAudioContext();
          windSfx.start();
        } else {
          windSfx.stop();
        }
      }
    };

    const unsubscribeSound = subscribeSoundState((on) => {
      if (!on) {
        stopWind();
      }
    });

    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", stopWind, {
      passive: true,
    });

    return () => {
      unsubscribeSound();
      document.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", stopWind);
      windSfx.stop();
    };
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMsg("This field is required.");
      inputRef.current?.focus();
      return;
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      setErrorMsg("Please enter a valid email address.");
      inputRef.current?.focus();
      return;
    }
    setErrorMsg("");
    setSubmitted(true);
  };

  return (
    <footer className="wp-block-template-part">
      <div className="site-footer">
        <div ref={cloudsRef} className="site-footer__clouds" aria-hidden="true" />
        <div className="site-footer__newsletter">
          <h2 className="site-footer__heading" data-graffiti="Updates for the OG’s">
            Updates for the OG’s
          </h2>
          <div className="site-footer__form site-footer__form--wpforms">
            <div className="wpforms-container wpforms-container-full" id="wpforms-215">
              {submitted ? (
                <div className="wpforms-confirmation-container-full">
                  <p>Thanks for joining the OG list.</p>
                </div>
              ) : (
                <form
                  className="wpforms-validate wpforms-form"
                  noValidate
                  onSubmit={handleSubmit}
                >
                  <div className="wpforms-field-container">
                    <div
                      className={`wpforms-field wpforms-field-email${
                        errorMsg ? " wpforms-has-error" : ""
                      }`}
                    >
                      <label className="screen-reader-text" htmlFor="wpforms-215-field_0">
                        Email
                      </label>
                      <input
                        ref={inputRef}
                        type="email"
                        id="wpforms-215-field_0"
                        name="wpforms[fields][0]"
                        className={`wpforms-field-large wpforms-field-required${
                          errorMsg ? " wpforms-error" : ""
                        }`}
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMsg) setErrorMsg("");
                        }}
                        aria-invalid={Boolean(errorMsg)}
                        aria-describedby={errorMsg ? "wpforms-215-field_0-error" : undefined}
                        autoComplete="email"
                      />
                      {errorMsg && (
                        <em
                          id="wpforms-215-field_0-error"
                          className="wpforms-error"
                          role="alert"
                        >
                          <ErrorTriangleIcon />
                          {errorMsg}
                        </em>
                      )}
                    </div>
                  </div>
                  <div className="wpforms-submit-container">
                    <button
                      type="submit"
                      id="wpforms-submit-215"
                      className="wpforms-submit"
                    >
                      Sign up to the OG list
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <ul className="site-footer__links">
            {FOOTER_LEGAL_LINKS.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
          <p className="site-footer__copyright">©Enigma 2026 All Rights Reserved</p>
          <ul className="site-footer__socials">
            {SOCIAL_LINKS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="site-footer__recaptcha">
            This site is protected by reCAPTCHA and the Google{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google Privacy Policy"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google Terms of Service"
            >
              Terms of Service
            </a>{" "}
            apply.
          </p>
          <button
            className="site-footer__cookies"
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("enigma:open-cookie-settings"))
            }
          >
            Cookie Settings
          </button>
          <p className="site-footer__credit">
            Created by{" "}
            <a
              href="https://www.ruler.agency"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ruler
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
