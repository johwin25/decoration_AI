import { migrateProject } from "../src/migration";
import { config } from "../src/config";
import { test, expect } from "@playwright/test";
import { selectedItems } from "../src/selection";
import { makeLayout } from "../src/scene/planner";
import type { Project } from "../src/types";
const project: Project = {
  room: {
    name: "Cozy room",
    length: "4",
    width: "3",
    height: "2.5",
    constraints: "",
    confirmed: true,
  },
  items: [
    {
      id: "lamp",
      name: "Reading lamp",
      ownership: "wishlist",
      width: "0.4",
      height: "1.4",
      depth: "0.4",
      quantity: 1,
      placement: "floor",
      price: "45",
      currency: "USD",
      url: "",
      modelAssetId: "test",
    },
    {
      id: "rug",
      name: "Wool rug",
      ownership: "owned",
      width: "1",
      height: "0.02",
      depth: "2",
      quantity: 1,
      placement: "floor",
      price: "",
      currency: "USD",
      url: "",
    },
  ],
};
test("selection preserves existing projects and controls planned objects", () => {
  expect(selectedItems(project)).toHaveLength(2);
  expect(makeLayout(project).placements).toHaveLength(1);
  const excluded = { ...project, selectedItemIds: ["rug"] };
  expect(makeLayout(excluded).placements).toHaveLength(0);
  expect(selectedItems(excluded).map((i) => i.id)).toEqual(["rug"]);
});
test("Mellow mood controls mount one background and the tray tracks selections and totals", async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Mellow home" })).toBeVisible();
  await page.evaluate(
    (data) =>
      localStorage.setItem("decoration-ai-project-v1", JSON.stringify(data)),
    project,
  );
  await page.reload();
  await expect(page.locator(".atmosphere canvas")).toHaveCount(1);
  await expect
    .poll(() =>
      page
        .locator(".atmosphere canvas")
        .evaluate((canvas: HTMLCanvasElement) => {
          const gl = canvas.getContext("webgl2");
          return Boolean(
            gl && !gl.isContextLost() && gl.getParameter(gl.CURRENT_PROGRAM),
          );
        }),
    )
    .toBeTruthy();
  await page.getByText("Room mood", { exact: true }).click();
  await page.getByLabel("Background texture").selectOption("grainient-radial");
  await expect(page.locator(".atmosphere")).toHaveAttribute(
    "data-background",
    "grainient-radial",
  );
  await expect(page.locator(".atmosphere canvas")).toHaveCount(1);
  await expect
    .poll(() =>
      page
        .locator(".atmosphere canvas")
        .evaluate((canvas: HTMLCanvasElement) => {
          const gl = canvas.getContext("webgl2");
          return Boolean(
            gl && !gl.isContextLost() && gl.getParameter(gl.CURRENT_PROGRAM),
          );
        }),
    )
    .toBeTruthy();
  await page.getByLabel("Background tone").selectOption("clay");
  if (!isMobile) {
    await page
      .getByRole("button", { name: "Pause atmosphere", exact: true })
      .click();
    await expect(page.locator(".atmosphere")).toHaveAttribute(
      "data-still",
      "true",
    );
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".atmosphere")).toHaveAttribute(
    "data-still",
    "true",
  );
  await page.getByText("Room mood", { exact: true }).click();
  await page.getByRole("button", { name: "2 things for your room" }).click();
  await expect(page.locator(".tray-totals")).toContainText("USD 45.00");
  await page.getByRole("button", { name: "Unselect Reading lamp" }).click();
  await expect(page.locator(".tray-totals")).toContainText("Prices unknown");
  await expect(
    page.getByRole("button", { name: "Include Reading lamp" }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "1 thing for your room" }).click();
  await page.getByRole("button", { name: "Include Reading lamp" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Include Reading lamp" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});

test("legacy saved layouts keep custom positions during the Mellow upgrade", () => {
  const data = structuredClone(project);
  data.layout = {
    fingerprint: JSON.stringify({
      room: data.room,
      rendering: config.renderingMaterials,
      items: data.items.map(
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
    }),
    placements: [
      { id: "lamp:0", itemId: "lamp", x: 0.22, y: 0, z: 0.33, rotation: 45 },
    ],
    notes: [],
  };
  const upgraded = migrateProject(data);
  expect(upgraded.layout?.placements).toEqual(data.layout.placements);
  expect(upgraded.layout?.fingerprint).toEqual(
    makeLayout(upgraded).fingerprint,
  );
  const stale = {
    ...data,
    layout: { ...data.layout, fingerprint: "unapproved-old-geometry" },
  };
  expect(migrateProject(stale).layout?.fingerprint).toBe(
    "unapproved-old-geometry",
  );
});
