import { test, expect } from "@playwright/test";
import { makeLayout, placementIssues } from "../src/scene/planner";
import type { Project } from "../src/types";
const project: Project = {
  room: {
    name: "Editor test room",
    width: "3",
    length: "4",
    height: "2.5",
    confirmed: true,
    constraints: "",
  },
  items: [
    {
      id: "test-item",
      name: "Test object",
      width: "1",
      depth: "1",
      height: "1",
      quantity: 2,
      placement: "floor",
      ownership: "owned",
      price: "",
      currency: "USD",
      url: "",
    },
  ],
};
function meshFixture(): Buffer {
  const vertices = new Float32Array([
    0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0,
    0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0,
  ]);
  const bin = Buffer.from(vertices.buffer);
  const json = Buffer.from(
    JSON.stringify({
      asset: { version: "2.0" },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0 }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }],
      materials: [
        {
          doubleSided: true,
          pbrMetallicRoughness: {
            baseColorFactor: [0.3, 0.5, 0.3, 1],
            metallicFactor: 0,
            roughnessFactor: 1,
          },
        },
      ],
      buffers: [{ byteLength: bin.length }],
      bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: bin.length }],
      accessors: [
        {
          bufferView: 0,
          componentType: 5126,
          count: 12,
          type: "VEC3",
          min: [0, 0, 0],
          max: [1, 1, 1],
        },
      ],
    }),
  );
  const padded = Buffer.concat([
    json,
    Buffer.alloc((4 - (json.length % 4)) % 4, 32),
  ]);
  const header = Buffer.alloc(20);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(20 + padded.length + 8 + bin.length, 8);
  header.writeUInt32LE(padded.length, 12);
  header.writeUInt32LE(0x4e4f534a, 16);
  const binaryHeader = Buffer.alloc(8);
  binaryHeader.writeUInt32LE(bin.length, 0);
  binaryHeader.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([header, padded, binaryHeader, bin]);
}
test("placement uses real models, rejects oversized items and warns on overlap", () => {
  const data = structuredClone(project);
  data.items[0].modelAssetId = "fixture";
  const layout = makeLayout(data);
  expect(layout.placements).toHaveLength(2);
  expect(placementIssues(data, layout.placements)).toEqual([]);
  layout.placements[1] = {
    ...layout.placements[1],
    x: layout.placements[0].x,
    z: layout.placements[0].z,
  };
  expect(placementIssues(data, layout.placements).join(" ")).toContain(
    "overlap",
  );
  data.items[0].width = "8";
  expect(makeLayout(data).placements).toHaveLength(0);
  expect(makeLayout(data).notes.join(" ")).toContain("does not fit");
  data.items[0].modelAssetId = undefined;
  expect(makeLayout(data).notes.join(" ")).toContain("not connected");
});
test("real GLB loads only after approval, edits persist, and missing models are not faked", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.evaluate(
    (data) =>
      localStorage.setItem("decoration-ai-project-v1", JSON.stringify(data)),
    project,
  );
  await page.reload();
  await page.getByRole("button", { name: "Add room details" }).click();
  await page.getByRole("button", { name: "Review your room" }).click();
  await expect(page.locator(".room-canvas canvas")).toHaveCount(0);
  const input = page.getByLabel("3D model for Test object");
  await input.setInputFiles({
    name: "broken.glb",
    mimeType: "model/gltf-binary",
    buffer: Buffer.from("broken"),
  });
  await expect(page.getByRole("alert")).toContainText("not a valid GLB");
  await input.setInputFiles({
    name: "test-object.glb",
    mimeType: "model/gltf-binary",
    buffer: meshFixture(),
  });
  await expect(
    page.getByText("test-object.glb", { exact: true }),
  ).toBeVisible();
  const create = page.getByRole("button", { name: "Create 3D room" });
  await expect(create).toBeDisabled();
  await page.getByLabel("I approve this rendering style and authorize").check();
  await create.click();
  await expect(page.getByText(/2 of 2 model instances loaded/)).toBeVisible({
    timeout: 15000,
  });
  await expect(page.locator(".room-canvas canvas")).toBeVisible();
  await page.getByLabel("Selected 3D item").selectOption("test-item:0");
  await page.getByLabel("Object x", { exact: true }).fill("30");
  await expect(
    page.getByText("Test object: outside the room bounds."),
  ).toBeVisible();
  await page.getByLabel("Object x", { exact: true }).fill("0");
  await page
    .getByRole("button", { name: "Interact with room", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Exit room interaction" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Exit room interaction" }).click();
  await page.screenshot({
    path: `test-results/room-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.reload();
  await page.getByRole("button", { name: "Add room details" }).click();
  await page.getByRole("button", { name: "Review your room" }).click();
  await expect(page.getByText(/2 of 2 model instances loaded/)).toBeVisible();
  await page.getByLabel("Selected 3D item").selectOption("test-item:0");
  await expect(page.getByLabel("Object x", { exact: true })).toHaveValue("0");
  expect(errors).toEqual([]);
});
