# Mellow — Design Rules

A room decoration site that should feel like the room itself: warm, tactile, a little imperfect. Not a SaaS landing page.

## Decisions

| Area | Choice |
|---|---|
| Name | **Mellow** |
| Overall reference | **Ekomia** (Awwwards): minimalist furniture e-commerce, strong UX, visual storytelling, rich detail, intuitive 3D configurator |
| Backgrounds | **React Bits: Grainient + Silk** (every variant of both) |
| Item interaction | **Skiper UI: "Things drag and scroll"** |
| Selected items | **Skiper UI** selected-items animation (nearest free match: Dynamic Island-style pill/tray; confirm the exact component on skiper-ui.com) |

## Core idea

Show items **inside the room**, never only in a grid. Choosing an item should feel like placing it in a real space.

## Visual rules

- **Palette:** warm only. Starting point: cream `#F5EFE6`, oat `#E8DCC8`, clay `#C98B6B`, walnut `#6B4A3A`, sage `#9CAF88`. No purple, no electric blue, no neon.
- **Type:** serif display for headings, friendly humanist sans for UI. No default Inter-everywhere look.
- **Texture:** subtle film grain over the page. Grainient and Silk carry this, so keep them muted and low-contrast.
- **Layout:** asymmetric, editorial, generous whitespace. Avoid centered-hero-plus-three-card-grid.
- **Imagery:** real photography or hand-drawn-feeling illustration. No stock sparkle icons or emoji as UI.

## Background rules (Grainient + Silk)

- Use them as slow, atmospheric backgrounds, not as the main attraction.
- Tint both toward the warm palette above. Silk reads like fabric, so use it for hero and transitions; Grainient for section backgrounds.
- One animated background visible at a time.
- Respect `prefers-reduced-motion` by freezing to a static frame.
- Pause or downscale on mobile to protect performance.

## Motion rules

- Soft, slow easing, roughly **300–600 ms**. Springs are fine, but no bounce on everything.
- **One signature interaction** per screen; everything else stays quiet.
- Entrances are gentle (fade, slight rise, soft unblur), never flashy.
- Cursor effects: at most one, and only where it adds meaning.

## Key interactions

1. **Drag and scroll item browsing** (Skiper "Things drag and scroll"): items can be dragged and scrolled through like objects on a table.
2. **Drop into room:** choosing an item makes it settle into the scene with a soft spring and shadow.
3. **Selected items tray:** chosen items collect in a floating pill/tray (Skiper selected-items animation) that expands to show the list and running total.
4. **Live swap:** changing color or material updates the item in place (Ekomia-style configurator feel).
5. **Day/night lighting toggle** (optional): a lamp that switches on is a strong cozy moment.

## Micro-interaction ideas (optional, from React Bits)

Pulse Heart (favorites), Spring Check, Squish Switch, Swipe Row (remove item), Elastic Slider (budget), Counter (price total).

## Copy voice

Human and calm. No "Unlock the power of AI," no "Supercharge your space." Write the way a friend with good taste would talk.

## Avoid (AI-slop checklist)

- Gradient text and glow backgrounds
- Glassmorphism cards everywhere
- Three-column feature card grids
- Sparkle emoji and generic gradient buttons
- Neon or dark "tech" backgrounds (Galaxy, Plasma, Lightning, etc.)
- Stacking many cursor effects
- Copying MotionSites-style prompt output without changing it

## Sources

- Ekomia: https://www.awwwards.com/sites/ekomia
- React Bits: https://reactbits.dev (Grainient, Silk under Backgrounds)
- Skiper UI: https://skiper-ui.com
