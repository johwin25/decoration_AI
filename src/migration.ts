import { config } from "./config";
import { fingerprint } from "./scene/planner";
import type { Project } from "./types";
// Rebranding/selection must not erase a saved arrangement from the previous release.
export function migrateProject(project: Project): Project {
  if (!project.layout || project.selectedItemIds !== undefined) return project;
  const legacy = JSON.stringify({
    room: project.room,
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
  if (project.layout.fingerprint !== legacy) return project;
  return {
    ...project,
    layout: { ...project.layout, fingerprint: fingerprint(project) },
  };
}
