"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  disposeThreeScene,
  getGLTFLoader,
  hasWebGL,
  watchContextLoss,
} from "@/components/sites/www-enigmascult-com-ddb923ee/shared/threeLoader";
import { SITE_ASSETS, UTILITY_LINKS } from "./data";

export function SiteHeader() {
  const logoLinkRef = useRef<HTMLAnchorElement>(null);
  const fallbackRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const logoLink = logoLinkRef.current;
    const fallback = fallbackRef.current;
    const canvas = canvasRef.current;
    if (!logoLink || !fallback || !canvas || !hasWebGL()) return;

    let disposed = false;
    let rafId = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    const cleanups: Array<() => void> = [];

    const init = async () => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const loader = await getGLTFLoader();
      if (disposed) return;

      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(18, 1, 0.1, 100);

      scene.add(new THREE.AmbientLight(0xffffff, 1.5));
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(2, 3, 4);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xffffff, 1.1);
      fillLight.position.set(-3, -1, 2);
      scene.add(fillLight);

      const material = new THREE.MeshStandardMaterial({
        color: 0xf9f9f9,
        roughness: 0.35,
        metalness: 0.15,
      });

      const group = new THREE.Group();
      scene.add(group);

      let meshW = 2;
      let meshH = 0.42;

      const gltf = await loader.loadAsync(SITE_ASSETS.models.logo);
      if (disposed) return;

      let logoMesh: THREE.Mesh | null = null;
      gltf.scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.material = material;
          logoMesh = mesh;
        }
      });

      if (!logoMesh) {
        disposeThreeScene(renderer, scene);
        renderer = null;
        scene = null;
        return;
      }

      const mesh: THREE.Mesh = logoMesh;
      group.add(mesh);
      group.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      meshW = size.x || 2;
      meshH = size.y || 0.42;
      mesh.position.sub(center);

      const fit = 0.535;
      let prevW = 0;
      let prevH = 0;
      let needsRender = true;

      const resize = () => {
        const rect = logoLink.getBoundingClientRect();
        const width = Math.round(rect.width);
        const height = Math.round(rect.height);
        if (!width || !height || (width === prevW && height === prevH)) return;
        prevW = width;
        prevH = height;
        renderer!.setSize(width, height, false);
        camera.aspect = width / height;
        const fovRad = (camera.fov * Math.PI) / 180;
        const fovX = 2 * Math.atan(Math.tan(fovRad / 2) * camera.aspect);
        const distX = meshW / fit / 2 / Math.tan(fovX / 2);
        const distY = meshH / fit / 2 / Math.tan(fovRad / 2);
        camera.position.set(0, 0, Math.max(distY, distX));
        camera.updateProjectionMatrix();
        needsRender = true;
      };

      const reveal = () => {
        canvas.style.opacity = "1";
        fallback.style.opacity = "0";
      };

      resize();
      window.addEventListener("resize", resize, { passive: true });
      cleanups.push(() => window.removeEventListener("resize", resize));

      const revealRaf = requestAnimationFrame(reveal);
      cleanups.push(() => cancelAnimationFrame(revealRaf));

      const ctxState = watchContextLoss(
        canvas,
        () => {
          canvas.style.opacity = "0";
          fallback.style.opacity = "";
        },
        () => {
          prevW = 0;
          prevH = 0;
          needsRender = true;
          resize();
          renderer!.render(scene!, camera);
          reveal();
        }
      );
      cleanups.push(ctxState.cleanup);

      let dragging = false;
      let lastX = 0;
      let dragVel = 0;
      let dragDist = 0;

      const onPointerDown = (e: PointerEvent) => {
        dragging = true;
        dragDist = 0;
        lastX = e.clientX;
        dragVel = 0;
      };
      const onPointerMove = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        dragDist += Math.abs(dx);
        group.rotation.y += 0.012 * dx;
        dragVel = 0.012 * dx * 60;
      };
      const onPointerUp = () => {
        if (!dragging) return;
        dragging = false;
        if (reducedMotion) dragVel = 0;
      };
      const onDragStart = (e: DragEvent) => e.preventDefault();
      const onClick = (e: MouseEvent) => {
        if (dragDist > 6) {
          e.preventDefault();
          dragDist = 0;
        }
      };

      logoLink.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerup", onPointerUp, { passive: true });
      window.addEventListener("pointercancel", onPointerUp, { passive: true });
      logoLink.addEventListener("dragstart", onDragStart);
      logoLink.addEventListener("click", onClick);

      cleanups.push(() => {
        logoLink.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        logoLink.removeEventListener("dragstart", onDragStart);
        logoLink.removeEventListener("click", onClick);
      });

      let visible = true;
      const observer = new IntersectionObserver(
        (entries) => {
          visible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0 }
      );
      observer.observe(logoLink);
      cleanups.push(() => observer.disconnect());

      const clock = new THREE.Clock();
      const tick = () => {
        rafId = requestAnimationFrame(tick);
        if (ctxState.lost || !visible || document.hidden) return;
        const dt = Math.min(clock.getDelta(), 0.1);
        resize();
        if (!dragging) {
          dragVel *= 0.94;
          const isLoading = document.documentElement.classList.contains("home-loading");
          group.rotation.y += ((reducedMotion || isLoading ? 0 : 0.35) + dragVel) * dt;
        }
        if (reducedMotion && !dragging && !needsRender && Math.abs(dragVel) < 0.001) {
          return;
        }
        needsRender = false;
        renderer!.render(scene!, camera);
      };
      rafId = requestAnimationFrame(tick);
    };

    init().catch(() => {
      if (!disposed) {
        canvas.style.opacity = "0";
        fallback.style.opacity = "";
      }
    });

    return () => {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      cleanups.forEach((fn) => fn());
      disposeThreeScene(renderer, scene);
      renderer = null;
      scene = null;
      canvas.style.opacity = "0";
      fallback.style.opacity = "";
    };
  }, []);

  return (
    <header className="wp-block-template-part">
      <div className="site-header">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          ref={logoLinkRef}
          className="site-header__logo"
          href="/"
          aria-label="Enigma"
        >
          <span ref={fallbackRef} className="site-header__logo-wordmark">
            ENIGMA
          </span>
          <canvas
            ref={canvasRef}
            className="site-header__logo3d"
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              opacity: 0,
              transition: "opacity .5s ease",
            }}
          />
        </a>
        <nav className="site-header__nav" aria-label="Utility">
          <ul>
            {UTILITY_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>
                  {link.label}
                  {link.href === "/cart/" ? (
                    <span className="site-header__cart-count" />
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader;
