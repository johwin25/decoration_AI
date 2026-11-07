# Decoration AI

An editable React + TypeScript interface for the approved guided room-planning workflow.

## Run

Node.js 22.12+ is required (validated with Node 24).

```sh
npm ci
npm run dev
```

Production build: `npm run build`. Preview that build: `npm run preview`.

## Edit the interface

| File                            | What to change                                                     |
| ------------------------------- | ------------------------------------------------------------------ |
| `src/theme.css`                 | Background, colors, fonts, spacing, corner radius, motion duration |
| `src/config.ts`                 | Product name, step labels, approved rendering-style label          |
| `src/styles.css`                | Responsive layouts and component appearance                        |
| `src/components/RoomStep.tsx`   | Room intake fields and copy                                        |
| `src/components/ItemsStep.tsx`  | Uploads, collection editing, ownership, dimensions, prices         |
| `src/components/ReviewStep.tsx` | Review screen and 3D approval notice                               |
| `src/components/Receipt.tsx`    | Print animation, receipt contents and freehand signature           |
| `src/types.ts`                  | Project data model                                                 |

No backend or API credentials are needed. Changes appear through Vite hot reload. Data and uploaded images are stored in localStorage on this browser, within its size limits. Download project exports the current data as JSON; importing a backup is not implemented. Avoid sensitive photos on shared devices. Signatures are temporary and reset when the review is left, reloaded, or changed.

## Implemented

- Required room measurements and explicit measurement confirmation.
- Owned/wishlist collection with image uploads, quantities, placement, optional measurements, user-supplied prices and links.
- Edit/remove items, review missing dimensions, browser-local persistence and JSON export.
- Button-triggered receipt animation and mouse/touch freehand signature with a clear action.
- Responsive interface, visible focus states, reduced motion.

## Pending

3D generation/editing, AI extraction, collision checking, layout versioning, optional inspiration uploads and retailer lookup are not implemented. Painterly rendering direction is recorded, but no room or placeholder geometry has been generated. Before generation, collect and confirm room/items, authorized assets, and explicit Gate B permission. No paid integrations or public deployment are included.

Receipt contents currently include all submitted items (none are placed yet), with owned labels and known wishlist subtotals separately by currency. Prices are user supplied, unverified; unknown prices are excluded. The signature does not create an order or purchase. Receipt download is not implemented.

## Validation

`npm run build` checks TypeScript and builds production assets. `npm test` runs the real-browser workflow against the dev server on port 5173. Chromium is discovered through `CHROME_PATH` or `/usr/bin/chromium`. Install Chromium or set that variable on other machines.

See `docs/design-decisions.md` for approvals and scope, and `docs/validation.md` for validation evidence and design-check limitations.
