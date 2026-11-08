import { selectedItems } from "../selection";
import { config } from "../config";
import type { Project, RoomLayout, Placement, Item } from "../types";
export function fingerprint(project: Project): string {
  return JSON.stringify({
    room: project.room,
    selected: selectedItems(project)
      .map((i) => i.id)
      .sort(),
    rendering: config.renderingMaterials,
    items: project.items.map(
      ({ id, width, depth, height, quantity, placement, modelAssetId }) => ({
        id,
        width,
        depth,
        height,
        quantity,
        placement,
        modelAssetId,
      }),
    ),
  });
}
export function hasMeasurements(item: Item) {
  return [item.width, item.depth, item.height].every(
    (v) => Number.isFinite(Number(v)) && Number(v) > 0,
  );
}
export function makeLayout(project: Project): RoomLayout {
  const placements: Placement[] = [];
  const notes: string[] = [];
  const roomWidth = Number(project.room.width),
    roomLength = Number(project.room.length),
    roomHeight = Number(project.room.height);
  let x = 0.1,
    z = 0.1,
    rowDepth = 0;
  for (const item of selectedItems(project)) {
    if (!item.modelAssetId) {
      notes.push(
        `${item.name}: needs a matching GLB model; photo conversion is not connected.`,
      );
      continue;
    }
    if (!hasMeasurements(item)) {
      notes.push(`${item.name}: needs width, depth and height.`);
      continue;
    }
    if (item.placement !== "floor") {
      notes.push(
        `${item.name}: needs a confirmed mounting or support surface; not automatically placed.`,
      );
      continue;
    }
    const width = Number(item.width),
      depth = Number(item.depth),
      height = Number(item.height);
    for (let index = 0; index < item.quantity; index++) {
      if (
        width + 0.2 > roomWidth ||
        depth + 0.2 > roomLength ||
        height > roomHeight
      ) {
        notes.push(
          `${item.name} (${index + 1}): does not fit within the room.`,
        );
        continue;
      }
      if (x + width > roomWidth - 0.1) {
        x = 0.1;
        z += rowDepth + 0.15;
        rowDepth = 0;
      }
      if (z + depth > roomLength - 0.1) {
        notes.push(`${item.name} (${index + 1}): no available floor space.`);
        continue;
      }
      placements.push({
        id: `${item.id}:${index}`,
        itemId: item.id,
        x: x + width / 2 - roomWidth / 2,
        y: 0,
        z: z + depth / 2 - roomLength / 2,
        rotation: 0,
      });
      x += width + 0.15;
      rowDepth = Math.max(rowDepth, depth);
    }
  }
  return { fingerprint: fingerprint(project), placements, notes };
}
export function placementIssues(
  project: Project,
  placements: Placement[],
): string[] {
  const issues: string[] = [];
  const boxes = placements.flatMap((p) => {
    const item = project.items.find((i) => i.id === p.itemId);
    if (!item) return [];
    const angle = (p.rotation * Math.PI) / 180,
      c = Math.abs(Math.cos(angle)),
      s = Math.abs(Math.sin(angle)),
      w = Number(item.width),
      d = Number(item.depth);
    return [
      { p, item, w: w * c + d * s, d: w * s + d * c, h: Number(item.height) },
    ];
  });
  for (let i = 0; i < boxes.length; i++) {
    const a = boxes[i];
    if (
      Math.abs(a.p.x) + a.w / 2 > Number(project.room.width) / 2 + 0.001 ||
      Math.abs(a.p.z) + a.d / 2 > Number(project.room.length) / 2 + 0.001 ||
      a.p.y < 0 ||
      a.p.y + a.h > Number(project.room.height) + 0.001
    )
      issues.push(`${a.item.name}: outside the room bounds.`);
    for (let j = i + 1; j < boxes.length; j++) {
      const b = boxes[j];
      if (
        Math.abs(a.p.x - b.p.x) < (a.w + b.w) / 2 - 0.001 &&
        Math.abs(a.p.z - b.p.z) < (a.d + b.d) / 2 - 0.001 &&
        a.p.y < b.p.y + b.h - 0.001 &&
        b.p.y < a.p.y + a.h - 0.001
      )
        issues.push(
          `${a.item.name} and ${b.item.name}: footprints may overlap.`,
        );
    }
  }
  return issues;
}

// Find a real, non-overlapping floor position. Never substitutes a generic mesh.
export function floorPlacement(
  project: Project,
  item: Item,
  existing: Placement[],
  point?: { x: number; z: number },
): Placement | undefined {
  if (
    !item.modelAssetId ||
    !hasMeasurements(item) ||
    item.placement !== "floor"
  )
    return;
  const halfW = Number(project.room.width) / 2,
    halfD = Number(project.room.length) / 2,
    w = Number(item.width),
    d = Number(item.depth);
  if (
    w > halfW * 2 ||
    d > halfD * 2 ||
    Number(item.height) > Number(project.room.height)
  )
    return;
  const candidate = (x: number, z: number): Placement => ({
    id: `${item.id}:${existing.filter((p) => p.itemId === item.id).length}`,
    itemId: item.id,
    x,
    y: 0,
    z,
    rotation: 0,
  });
  const fits = (p: Placement) =>
    !placementIssues(project, [...existing, p]).length;
  if (point) {
    const p = candidate(
      Math.max(
        -halfW + w / 2,
        Math.min(halfW - w / 2, Math.round(point.x * 100) / 100),
      ),
      Math.max(
        -halfD + d / 2,
        Math.min(halfD - d / 2, Math.round(point.z * 100) / 100),
      ),
    );
    return fits(p) ? p : undefined;
  }
  let candidates = 0;
  for (
    let z = -halfD + d / 2 + 0.05;
    z <= halfD - d / 2;
    z += Math.max(0.15, d / 2)
  )
    for (
      let x = -halfW + w / 2 + 0.05;
      x <= halfW - w / 2;
      x += Math.max(0.15, w / 2)
    ) {
      if (++candidates > 4096) return;
      const p = candidate(x, z);
      if (fits(p)) return p;
    }
}
