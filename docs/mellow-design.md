# Mellow design revision

The user's `mellow-design-rules.md` is saved under `docs/references/`. It supersedes the earlier white-background design direction. The user explicitly asked to preserve the existing receipt feature and animations.

## Applied direction

- Mellow wordmark and calm room-focused copy, cream/oat/clay/walnut/sage palette, self-hosted Lora serif display and Nunito Sans UI, film-grain texture, editorial asymmetric layout.
- Actual React Bits Silk and Grainient source components, with only one mounted at once. Silk is the initial upload atmosphere; Grainient is used for room/review steps. Room mood controls expose Silk, Grainient linear and Grainient radial, each in oat/clay/sage tones. Full source options remain editable in the vendor components; language/styling-source variants are not different visual backgrounds.
- Motion pauses on mobile, under reduced-motion preferences, or through the pause button. Both source components also stop when out of view/document hidden. No cursor-following or click-ripple effects enabled.
- Drag/scroll object table with uploaded images, keyboard scroll controls, native drag of ready models and a Place in room alternative. No invented product photography or speculative room reconstruction is shown before the approval gate.
- Floating selected-items tray with expandable list, ownership, removal and separate known wishlist subtotals per currency. It hides while the receipt section is in view so it cannot block signing. Selection affects room planning and the receipt without deleting collection data.
- Ready floor models can be dropped into the actual approved room; valid placement gets a brief settling motion. Missing models, missing dimensions and unsupported attachment surfaces remain explicit blockers. Drop positions avoid overlaps/room boundaries. Existing manual editing remains available.
- Live original/clay/sage/oat finish washes on imported 3D models, preserving the underlying texture and restoring original colors on reset. This is not claimed to identify a retailer's real available material variants.
- Receipt printing animation and freehand drawing preserved. Signing activates once paper has printed (immediately under reduced motion). The receipt reflects selected items; existing projects default to all items selected.

The optional day/night lamp, favorites and other micro-interaction ideas were not added. No paid component, paid conversion or new backend was introduced. Local storage keys and IndexedDB names remain unchanged to preserve existing projects.

## Sources and licensing

- Ekomia reference supplied by the user: https://www.awwwards.com/sites/ekomia. Used as direction for tactile configurator/room-first interactions, not copied source or photography.
- React Bits sources retrieved 2026-11-08 from https://github.com/DavidHDev/react-bits under `src/ts-default/Backgrounds/Silk/` and `src/ts-default/Backgrounds/Grainient/`. Saved under `src/vendor/react-bits/`, formatted for the project, Next.js `use client` directive omitted for Vite. Context release is guarded during React Strict Mode effect replays. License: MIT plus Commons Clause; full notice in `public/licenses/react-bits.txt`, linked in the footer. These components are used as part of Mellow, not redistributed as a component product.
- Skiper UI could not be reached from this environment (proxy CONNECT 403). No Skiper source or paid component was copied. The drag/table and expanding tray implementations are original equivalents from the user's described behavior. The exact selected-items component remains unverified; its reference can be applied later if supplied.
- Fontsource Lora and Nunito Sans are bundled locally. Their license notices are retained in `public/licenses/lora.txt` and `public/licenses/nunito-sans.txt`.

## Edit locations

- `src/theme.css`: palette, font families, motion timing and shared tokens.
- `src/components/Atmosphere.tsx`: background modes and warm color variants.
- `src/components/ItemRail.tsx`: table browsing and drag data.
- `src/components/SelectedTray.tsx`: chosen items and totals.
- `src/selection.ts`: backwards-compatible selection and price calculation.
- `src/scene/RoomCanvas.tsx`: settling animation and live finish washes.
- `src/components/Receipt.tsx`: existing print/signature behavior.

The user's new rules take precedence over Taste Skill's marketing hero, carousel prohibition, plain-background defaults, and fixed-screen section recipes. This is a guided room editor, not a SaaS landing page. Existing prototype labels and unknown-price disclosures remain required.
