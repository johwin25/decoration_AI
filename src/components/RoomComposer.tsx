import { ItemRail } from "./ItemRail";
import { selectedItems } from "../selection";
import { lazy, Suspense, useState } from "react";
import type { Project, Placement } from "../types";
import { config } from "../config";
import {
  fingerprint,
  makeLayout,
  placementIssues,
  floorPlacement,
} from "../scene/planner";
const RoomCanvas = lazy(() => import("../scene/RoomCanvas"));
export function RoomComposer({
  project,
  onChange,
}: {
  project: Project;
  onChange: (project: Project) => void;
}) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [approved, setApproved] = useState(false);
  const [selected, setSelected] = useState("");
  const validRoom =
    project.room.confirmed &&
    [project.room.width, project.room.length, project.room.height].every(
      (v) => Number.isFinite(Number(v)) && Number(v) > 0,
    );
  const layout =
    project.layout?.fingerprint === fingerprint(project)
      ? project.layout
      : undefined;
  const chosen = layout?.placements.find((p) => p.id === selected);
  const chosenItem = project.items.find((i) => i.id === chosen?.itemId);
  async function attach(itemId: string, file?: File) {
    if (!file) return;
    setBusy(itemId);
    setError("");
    try {
      const { storeModel } = await import("../services/modelAssets");
      const id = await storeModel(file);
      onChange({
        ...project,
        layout: undefined,
        items: project.items.map((i) =>
          i.id === itemId
            ? { ...i, modelAssetId: id, modelFileName: file.name }
            : i,
        ),
      });
      setApproved(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not import this model.");
    } finally {
      setBusy("");
    }
  }
  function edit(key: "x" | "y" | "z" | "rotation", value: number) {
    if (!layout || !chosen || !Number.isFinite(value)) return;
    onChange({
      ...project,
      layout: {
        ...layout,
        placements: layout.placements.map((p) =>
          p.id === chosen.id ? { ...p, [key]: value } : p,
        ),
      },
    });
  }
  function placeItem(id: string, point?: { x: number; z: number }) {
    if (!layout) return;
    const item = project.items.find((i) => i.id === id);
    if (!item) return;
    if (!item.modelAssetId) {
      setError("This item needs a matching GLB model before it can be placed.");
      return;
    }
    const same = layout.placements.filter((p) => p.itemId === id);
    if (!point && same.length >= item.quantity) {
      setSelected(same[0].id);
      setError("");
      return;
    }
    const moving = same.length >= item.quantity ? same[0] : undefined;
    const existing = moving
      ? layout.placements.filter((p) => p.id !== moving.id)
      : layout.placements;
    const nextProject = {
      ...project,
      selectedItemIds: [
        ...new Set([...selectedItems(project).map((i) => i.id), id]),
      ],
    };
    const placement = floorPlacement(nextProject, item, existing, point);
    if (!placement) {
      setError(
        "No clear floor position is available here. Check the measurements and choose another spot.",
      );
      return;
    }
    if (moving) placement.id = moving.id;
    onChange({
      ...nextProject,
      layout: {
        ...layout,
        fingerprint: fingerprint(nextProject),
        placements: [...existing, placement],
      },
    });
    setSelected(placement.id);
    setError("");
  }
  const issues = layout ? placementIssues(project, layout.placements) : [];
  return (
    <section className="composer" aria-labelledby="composer-title">
      <h2 id="composer-title">Your 3D room</h2>
      <p>
        Use your own matching GLB models to arrange items at measured scale.
        Photo-to-mesh reconstruction is not connected; this version uses no
        external AI service.
      </p>
      <div className="model-imports">
        {project.items.map((item) => (
          <div className="model-row" key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>
                {item.modelFileName || "Photo only — 3D model needed"}
              </span>
            </div>
            <label className="model-picker">
              {busy === item.id ? "Checking model…" : "Attach GLB"}
              <input
                aria-label={`3D model for ${item.name}`}
                disabled={!!busy}
                type="file"
                accept=".glb"
                onChange={(e) => {
                  void attach(item.id, e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        ))}
      </div>
      <p className="note">
        Use self-contained GLB 2.0 files under 25 MB. Models remain on this
        device. Measurements determine scale; uploaded model textures are
        preserved. Room surfaces use a painterly finish.
      </p>
      {error && <p role="alert">{error}</p>}
      {!layout && (
        <div className="generation-gate">
          <h3>Before creating this room</h3>
          <p>{config.renderingMaterials}</p>
          <p>
            Floor items with models and complete measurements can be placed.
            Items without models or mounting/support information stay unplaced.
            Doors and windows are not modeled; review access before using an
            arrangement.
          </p>
          {!validRoom && (
            <p role="status">
              Add and confirm room length, width and ceiling height before
              creating the 3D room.
            </p>
          )}
          <label className="check">
            <input
              type="checkbox"
              checked={approved}
              onChange={(e) => setApproved(e.target.checked)}
            />
            I approve this rendering style and authorize creating this room from
            the confirmed information.
          </label>
          <button
            className="primary"
            disabled={!approved || !validRoom || !!busy}
            onClick={() => {
              onChange({ ...project, layout: makeLayout(project) });
              setSelected("");
            }}
          >
            Create 3D room
          </button>
        </div>
      )}
      {layout && (
        <>
          <ItemRail
            items={project.items}
            selectedIds={selectedItems(project).map((i) => i.id)}
            onPlace={placeItem}
          />
          <Suspense fallback={<p role="status">Loading room editor…</p>}>
            <RoomCanvas
              key={layout.fingerprint}
              project={project}
              placements={layout.placements}
              selected={selected}
              onSelect={setSelected}
              onDropItem={placeItem}
            />
          </Suspense>
          <div className="scene-inspector">
            <label>
              Selected item
              <select
                aria-label="Selected 3D item"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="">Choose an item</option>
                {layout.placements.map((p, index) => (
                  <option value={p.id} key={p.id}>
                    {project.items.find((i) => i.id === p.itemId)?.name} ·{" "}
                    {index + 1}
                  </option>
                ))}
              </select>
            </label>
            {chosen && (
              <>
                <p>
                  {chosenItem?.name} · Positions in meters from room center;
                  height above floor.
                </p>
                <fieldset className="finish-options">
                  <legend>Finish wash</legend>
                  <p>Try a color over the original texture.</p>
                  {(["original", "clay", "sage", "oat"] as const).map(
                    (finish) => (
                      <button
                        type="button"
                        key={finish}
                        aria-label={`Finish ${finish}`}
                        aria-pressed={
                          (chosenItem?.finish || "original") === finish
                        }
                        data-finish={finish}
                        onClick={() =>
                          onChange({
                            ...project,
                            items: project.items.map((i) =>
                              i.id === chosen.itemId ? { ...i, finish } : i,
                            ),
                          })
                        }
                      >
                        {finish[0].toUpperCase() + finish.slice(1)}
                      </button>
                    ),
                  )}
                </fieldset>
                <div className="field-grid">
                  {(["x", "y", "z", "rotation"] as const).map((key) => (
                    <label key={key}>
                      {key === "rotation"
                        ? "Rotation (degrees)"
                        : `${key} position (m)`}
                      <input
                        aria-label={`Object ${key}`}
                        type="number"
                        step={key === "rotation" ? 15 : 0.05}
                        value={chosen[key]}
                        onChange={(e) =>
                          edit(key, e.currentTarget.valueAsNumber)
                        }
                      />
                    </label>
                  ))}
                </div>
              </>
            )}
            <p className="note">
              Edits save on this device. Collision warnings use conservative
              bounding footprints; they do not verify doors, clearances or
              support surfaces.
            </p>
          </div>
          <div className="layout-notes" aria-live="polite">
            {layout.notes.map((note, index) => (
              <p key={index}>{note}</p>
            ))}
            {issues.map((issue, index) => (
              <p key={`issue-${index}`}>{issue}</p>
            ))}
          </div>
          <p>
            {layout.placements.length} item instances placed ·{" "}
            {
              project.items.filter(
                (i) => !layout.placements.some((p) => p.itemId === i.id),
              ).length
            }{" "}
            item types unplaced.
          </p>
        </>
      )}
    </section>
  );
}
