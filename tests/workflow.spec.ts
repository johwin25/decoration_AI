import { test, expect } from "@playwright/test";
test("room intake, editable collection, receipt signature, persistence and reduced motion", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByLabel("Item name").fill("Oak desk");
  await page.getByRole("button", { name: "Add to collection" }).click();
  await page.getByRole("button", { name: "On my wishlist" }).click();
  await page.getByLabel("Item name").fill("Reading lamp");
  await page.getByLabel("Known unit price", { exact: true }).fill("45");
  await page.getByRole("button", { name: "Add to collection" }).click();
  await page.getByRole("button", { name: "Edit", exact: true }).first().click();
  await page.getByLabel("Item name").fill("My oak desk");
  await page.getByRole("button", { name: /Save item/ }).click();
  await page.getByRole("button", { name: "Add room details" }).click();
  await page.getByRole("button", { name: "Review your room" }).click();
  await expect(page.getByLabel("Room name")).toBeVisible();
  await page.getByLabel("Room name").fill("Reading room");
  await page.getByRole("spinbutton", { name: "length", exact: true }).fill("4");
  await page.getByRole("spinbutton", { name: "width", exact: true }).fill("3");
  await page.getByLabel("I’ve checked these measurements.").check();
  await page.getByRole("button", { name: "Review your room" }).click();
  await expect(page.getByText("2 items need measurements")).toBeVisible();
  await expect(
    page.locator(".price").filter({ hasText: "USD 45.00" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Print item receipt" }).click();
  await expect(
    page.getByRole("article", { name: "Item receipt" }),
  ).toBeVisible();
  const canvas = page.getByLabel("Draw your signature here");
  await canvas.scrollIntoViewIfNeeded();
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 30);
  await page.mouse.down();
  await page.mouse.move(box.x + 70, box.y + 50, { steps: 8 });
  await page.mouse.up();
  expect(
    await canvas.evaluate((c: HTMLCanvasElement) =>
      c
        .getContext("2d")!
        .getImageData(0, 0, c.width, c.height)
        .data.some((v, i) => i % 4 === 3 && v > 0),
    ),
  ).toBeTruthy();
  await expect(page.getByText("Signed by you.")).toBeVisible();
  await page.getByRole("button", { name: "Clear signature" }).click();
  await expect(page.getByText("Make it yours.")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".receipt")).toHaveCSS("animation-name", "none");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.reload();
  await expect(page.getByText("My oak desk", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add room details" }).click();
  await expect(page.getByLabel("Room name")).toHaveValue("Reading room");
  expect(errors).toEqual([]);
});

test("upload-first flow accepts file selection and drops, rejects invalid files", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByLabel("Upload item images")).toBeAttached();
  await expect(
    page.getByRole("button", { name: "Add room details" }),
  ).toBeDisabled();
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l1sAAAAASUVORK5CYII=",
    "base64",
  );
  await page.getByRole("button", { name: "On my wishlist" }).click();
  await page.getByLabel("Upload item images").setInputFiles([
    { name: "Desk.png", mimeType: "image/png", buffer: png },
    { name: "Lamp.png", mimeType: "image/png", buffer: png },
  ]);
  await expect(page.getByText("Desk", { exact: true })).toBeVisible();
  await expect(page.getByText("Lamp", { exact: true })).toBeVisible();
  await expect(page.locator(".rows .item-row")).toHaveCount(2);
  await expect(page.locator(".rows .item-row").first()).toContainText(
    "Wishlist",
  );
  const drop = await page.evaluateHandle((bytes) => {
    const d = new DataTransfer();
    d.items.add(
      new File([new Uint8Array(bytes)], "Shelf.png", { type: "image/png" }),
    );
    d.items.add(new File(["bad"], "Bad.txt", { type: "text/plain" }));
    return d;
  }, Array.from(png));
  await page
    .locator(".upload-first")
    .dispatchEvent("drop", { dataTransfer: drop });
  await expect(page.getByText("Shelf", { exact: true })).toBeVisible();
  await expect(page.getByText(/1 could not be added/)).toBeVisible();
  await expect(page.locator(".rows .item-row")).toHaveCount(3);
  await expect(
    page.getByRole("button", { name: "Add room details" }),
  ).toBeEnabled();
  await page.reload();
  await expect(page.locator(".rows .item-row")).toHaveCount(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
