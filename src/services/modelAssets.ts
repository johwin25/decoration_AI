// Binary model files stay local in IndexedDB. Future conversion results use this same boundary.
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("decoration-ai-assets", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("models");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function readModel(id: string): Promise<ArrayBuffer> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction("models").objectStore("models").get(id);
      request.onsuccess = () =>
        request.result
          ? resolve(request.result)
          : reject(
              new Error(
                "Model file is missing on this device. Attach its GLB again.",
              ),
            );
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}
export async function storeModel(file: File): Promise<string> {
  if (!file.name.toLowerCase().endsWith(".glb") || file.size > 25 * 1024 * 1024)
    throw new Error("Choose an embedded GLB file under 25 MB.");
  const data = await file.arrayBuffer();
  const view = new DataView(data);
  if (
    data.byteLength < 20 ||
    view.getUint32(0, true) !== 0x46546c67 ||
    view.getUint32(4, true) !== 2 ||
    view.getUint32(8, true) !== data.byteLength ||
    view.getUint32(16, true) !== 0x4e4f534a
  )
    throw new Error("This file is not a valid GLB 2.0 model.");
  const jsonLength = view.getUint32(12, true);
  if (20 + jsonLength > data.byteLength)
    throw new Error("The GLB file is incomplete.");
  const metadata = JSON.parse(
    new TextDecoder().decode(data.slice(20, 20 + jsonLength)),
  );
  for (const entry of [...(metadata.buffers || []), ...(metadata.images || [])])
    if (entry.uri && !entry.uri.startsWith("data:"))
      throw new Error(
        "Use a self-contained GLB with embedded textures, without external URLs.",
      );
  const gltf = await new GLTFLoader().parseAsync(data, "");
  let vertices = 0;
  gltf.scene.traverse((object) => {
    if ("geometry" in object) {
      const mesh = object as import("three").Mesh;
      vertices += mesh.geometry?.attributes.position?.count || 0;
      mesh.geometry?.dispose();
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      materials.forEach((m) => m?.dispose());
    }
  });
  if (!vertices) throw new Error("The model contains no visible mesh.");
  if (vertices > 500000)
    throw new Error(
      "Use a web-optimized GLB with fewer than 500,000 vertices.",
    );
  const id = crypto.randomUUID();
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("models", "readwrite");
      transaction.objectStore("models").put(data, id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
  return id;
}
