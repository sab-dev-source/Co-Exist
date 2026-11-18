"use client";

import type * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

let cachedWebGLSupport: boolean | null = null;
let cachedLoaderPromise: Promise<GLTFLoader> | null = null;

export function hasWebGL(): boolean {
  if (cachedWebGLSupport !== null) return cachedWebGLSupport;
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    cachedWebGLSupport = Boolean(gl);
    if (gl && "getExtension" in gl) {
      const ext = gl.getExtension("WEBGL_lose_context");
      ext?.loseContext();
    }
  } catch {
    cachedWebGLSupport = false;
  }
  return cachedWebGLSupport;
}

export function getGLTFLoader(): Promise<GLTFLoader> {
  if (!cachedLoaderPromise) {
    cachedLoaderPromise = (async () => {
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      return loader;
    })();
  }
  return cachedLoaderPromise;
}

export function watchContextLoss(
  canvas: HTMLCanvasElement,
  onLost?: () => void,
  onRestored?: () => void
): { lost: boolean; cleanup: () => void } {
  const state = { lost: false, cleanup: () => {} };
  const handleLost = (e: Event) => {
    e.preventDefault();
    state.lost = true;
    onLost?.();
  };
  const handleRestored = () => {
    state.lost = false;
    onRestored?.();
  };
  canvas.addEventListener("webglcontextlost", handleLost, false);
  canvas.addEventListener("webglcontextrestored", handleRestored, false);
  state.cleanup = () => {
    canvas.removeEventListener("webglcontextlost", handleLost, false);
    canvas.removeEventListener("webglcontextrestored", handleRestored, false);
  };
  return state;
}

export function disposeThreeScene(
  renderer: THREE.WebGLRenderer | null,
  scene: THREE.Scene | null
): void {
  if (scene) {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((mat) => {
          const shaderMat = mat as THREE.ShaderMaterial;
          if (shaderMat.uniforms) {
            Object.keys(shaderMat.uniforms).forEach((k) => {
              const val = shaderMat.uniforms[k]?.value;
              if (val && typeof val === "object" && "isTexture" in val && val.isTexture) {
                (val as THREE.Texture).dispose();
              }
            });
          }
          const stdMat = mat as THREE.MeshStandardMaterial;
          stdMat.map?.dispose();
          mat.dispose();
        });
      }
    });
  }
  if (renderer) {
    try {
      renderer.dispose();
    } catch {
      // ignore
    }
  }
}
