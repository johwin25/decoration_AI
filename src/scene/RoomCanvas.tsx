import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { readModel } from "../services/modelAssets";
import type { Project, Placement } from "../types";
function paint(base: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);
  let seed = 57;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 480; i++) {
    ctx.globalAlpha = 0.025 + random() * 0.04;
    ctx.fillStyle = random() > 0.5 ? "#fff" : "#403b31";
    ctx.fillRect(
      random() * 256,
      random() * 256,
      4 + random() * 32,
      2 + random() * 8,
    );
  }
  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}
export default function RoomCanvas({
  project,
  placements,
  selected,
  onSelect,
}: {
  project: Project;
  placements: Placement[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const groups = useRef(new Map<string, THREE.Group>());
  const current = useRef({ placements, selected, onSelect });
  current.current = { placements, selected, onSelect };
  const engine = useRef<
    | {
        camera: THREE.PerspectiveCamera;
        controls: OrbitControls;
        render: () => void;
        reset: () => void;
      }
    | undefined
  >(undefined);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(0);
  const sceneKey = JSON.stringify([
    project.room.width,
    project.room.length,
    project.room.height,
    project.items.map((i) => [
      i.id,
      i.modelAssetId,
      i.width,
      i.depth,
      i.height,
    ]),
  ]);
  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setError(
        "3D rendering is unavailable in this browser. Try a browser with WebGL enabled.",
      );
      return;
    }
    setError("");
    setLoaded(0);
    let cancelled = false;
    groups.current.clear();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f8f8f5");
    const width = Number(project.room.width),
      length = Number(project.room.length),
      height = Number(project.room.height),
      scale = Math.max(width, length, height);
    const camera = new THREE.PerspectiveCamera(40, 1, 0.01, scale * 30);
    const reset = () => {
      camera.position.set(scale * 1.1, scale * 0.95, scale * 1.25);
      controls.target.set(0, height * 0.25, 0);
      controls.update();
      render();
    };
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-label", "Interactive 3D room");
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.minDistance = 0.2;
    controls.maxDistance = scale * 5;
    const render = () => renderer.render(scene, camera);
    controls.addEventListener("change", render);
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: paint("#c7bba6"),
      roughness: 1,
    });
    const wallMaterial = new THREE.MeshStandardMaterial({
      map: paint("#ebe6db"),
      roughness: 1,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(width, length),
      floorMaterial,
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      wallMaterial,
    );
    back.position.set(0, height / 2, -length / 2);
    back.receiveShadow = true;
    scene.add(back);
    const side = new THREE.Mesh(
      new THREE.PlaneGeometry(length, height),
      wallMaterial,
    );
    side.rotation.y = Math.PI / 2;
    side.position.set(-width / 2, height / 2, 0);
    side.receiveShadow = true;
    scene.add(side);
    scene.add(new THREE.HemisphereLight("#fffaf0", "#a3a797", 2));
    const light = new THREE.DirectionalLight("#fff5df", 3);
    light.position.set(scale, height * 2, scale);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    light.shadow.camera.left = -scale;
    light.shadow.camera.right = scale;
    light.shadow.camera.top = scale;
    light.shadow.camera.bottom = -scale;
    light.shadow.camera.far = scale * 10;
    light.shadow.normalBias = 0.02;
    scene.add(light);
    const resize = () => {
      const w = host.clientWidth,
        h = host.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      render();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    reset();
    resize();
    engine.current = { camera, controls, render, reset };
    function dispose(root: THREE.Object3D) {
      root.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          for (const material of materials) {
            for (const value of Object.values(material))
              if (value instanceof THREE.Texture) value.dispose();
            material.dispose();
          }
        }
      });
    }
    async function load() {
      for (const placement of current.current.placements) {
        const item = project.items.find((i) => i.id === placement.itemId);
        if (!item?.modelAssetId) continue;
        try {
          const data = await readModel(item.modelAssetId);
          if (cancelled) return;
          const gltf = await new GLTFLoader().parseAsync(data, "");
          if (cancelled) {
            dispose(gltf.scene);
            return;
          }
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const size = box.getSize(new THREE.Vector3());
          if (Math.min(size.x, size.y, size.z) < 0.000001) {
            dispose(gltf.scene);
            throw new Error(`${item.name}: model has an empty dimension.`);
          }
          const center = box.getCenter(new THREE.Vector3());
          gltf.scene.position.sub(
            new THREE.Vector3(center.x, box.min.y, center.z),
          );
          const normalized = new THREE.Group();
          normalized.add(gltf.scene);
          normalized.scale.set(
            Number(item.width) / size.x,
            Number(item.height) / size.y,
            Number(item.depth) / size.z,
          );
          const positioned = new THREE.Group();
          positioned.add(normalized);
          positioned.userData.placementId = placement.id;
          positioned.traverse((o) => {
            if (o instanceof THREE.Mesh) {
              o.castShadow = true;
              o.receiveShadow = true;
            }
          });
          const latest = current.current.placements.find(
            (p) => p.id === placement.id,
          );
          if (latest) {
            positioned.position.set(latest.x, latest.y, latest.z);
            positioned.rotation.y = (latest.rotation * Math.PI) / 180;
          }
          groups.current.set(placement.id, positioned);
          scene.add(positioned);
          setLoaded((n) => n + 1);
          render();
        } catch (e) {
          if (!cancelled)
            setError(
              e instanceof Error ? e.message : "Could not load a model.",
            );
        }
      }
    }
    void load();
    const raycaster = new THREE.Raycaster();
    let down = { x: 0, y: 0 };
    const pointerDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY };
    };
    const pointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          (-(e.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera,
      );
      const hit = raycaster.intersectObjects(
        [...groups.current.values()],
        true,
      )[0];
      let object: THREE.Object3D | null = hit?.object ?? null;
      while (object && !object.userData.placementId) object = object.parent;
      if (object) current.current.onSelect(object.userData.placementId);
    };
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    return () => {
      cancelled = true;
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      dispose(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      groups.current.clear();
      engine.current = undefined;
    };
  }, [sceneKey]);
  useEffect(() => {
    if (engine.current) {
      engine.current.controls.enabled = active;
      if (engine.current.controls.domElement)
        engine.current.controls.domElement.style.touchAction = active
          ? "none"
          : "pan-y";
    }
  }, [active, sceneKey]);
  useEffect(() => {
    for (const p of placements) {
      const group = groups.current.get(p.id);
      if (group) {
        group.position.set(p.x, p.y, p.z);
        group.rotation.y = (p.rotation * Math.PI) / 180;
      }
    }
    engine.current?.render();
  }, [placements]);
  function zoom(factor: number) {
    const e = engine.current;
    if (e) {
      e.camera.position
        .sub(e.controls.target)
        .multiplyScalar(factor)
        .add(e.controls.target);
      e.controls.update();
      e.render();
    }
  }
  function orbit() {
    const e = engine.current;
    if (e) {
      e.camera.position
        .sub(e.controls.target)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 8)
        .add(e.controls.target);
      e.controls.update();
      e.render();
    }
  }
  return (
    <div>
      <div className="scene-toolbar">
        <button onClick={() => setActive((v) => !v)} aria-pressed={active}>
          {active ? "Exit room interaction" : "Interact with room"}
        </button>
        <button onClick={() => zoom(0.85)} aria-label="Zoom in">
          +
        </button>
        <button onClick={() => zoom(1.15)} aria-label="Zoom out">
          −
        </button>
        <button onClick={orbit}>Rotate view</button>
        <button onClick={() => engine.current?.reset()}>Reset view</button>
      </div>
      <div className="room-canvas" ref={mount} />
      <p className="note" role="status">
        {error ||
          `${loaded} of ${placements.length} model instances loaded. ${active ? "Drag to orbit; wheel or pinch to zoom. Exit interaction to scroll on touch." : "Page scrolling is enabled. Activate interaction to orbit or zoom."}`}
      </p>
    </div>
  );
}
