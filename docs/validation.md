# Validation

## Functional readiness

- Production build and TypeScript check: passed.
- Playwright Chromium workflow: 2 passed, desktop 1440×900 and mobile 390×844.
- Exercises required room inputs, measurement confirmation, owned/wishlist creation, item editing, price provenance, missing-dimension notices, receipt printing, actual canvas ink and clearing, browser persistence, reduced motion and horizontal overflow.
- No browser runtime errors in those tests.
- No AI, model conversion, real retailer requests, 3D manipulation or generated room behavior is claimed or tested.

## Taste Skill checks

The initial full consistency check at 1440, 1024, 820, 768 and 390 returned **93 FAIL / 4 WARN**. This was not a passing design check. Categories were: marketing hero/section geometry, container/split alignment, text-only/no-visual sections, local forms not sending network requests, secondary text contrast, and the main action below the fold on smaller screens.

Real issues addressed: increased secondary-text contrast, aligned measurement input baselines, removed narrow number spinners, replaced unsupported arrow glyphs with SVGs, and stacked tablet forms so fields have enough width.

Intentional exceptions to the skill's marketing-page assumptions:

- The guided application has no full-screen marketing hero or decorative illustrations. User-uploaded photos appear in the collection.
- Content-driven form and collection heights support validation and growing item lists. Input forms may require scrolling on smaller screens.
- In-browser forms update and persist application data rather than send a sales enquiry to a network endpoint.
- The progress rail, intro and actual form share one application screen; they are not separate marketing sections. The checker classifies them as sections and reports screen-height/grid violations.

The first layout check found only a small tip's intentional icon indentation at four desktop/tablet widths (no findings at 390). That decorative indentation was removed. Final responsive layout results are recorded below after rerun.

The performance check at 1440 and 390 passed every row on the production build before the final minor responsive CSS adjustment: about 77 KiB transferred with compression, no broken requests, no WebGL contexts, zero measured layout shift. These are local CPU/browser measurements, not production field metrics.

No stock photography, external fonts, invented products, prices or testimonials were used. No palette or hero recipe is claimed as a full skill-compliant marketing-page deal; white is the user's explicit choice. Receipt animation is original implementation from the user's described interaction, not copied from the inaccessible references.

## Final responsive layout rerun

The unmodified Taste Skill layout checker completed with **no findings** at 1440×900, 1024×768, 820×1180, 768×1024 and 390×844 after the fixes. Screenshots at all five sizes were visually inspected. This does not mean the separate marketing consistency checker passes; its exceptions remain above.

Final consistency rerun at 1440: **21 FAIL / 1 WARN**, with **text contrast PASS**. Remaining findings concern the React root/application structure, marketing hero/screen rules, the application's two-column split, local-only form submission, and a text-only footer. This is an explicit exception report, not a claim that the full consistency check passed. All five sizes were covered by the initial consistency run and the final layout rerun.

A fresh `npm ci` also completed successfully against the saved lockfile. Reusable `install_script` and `start_skill` were saved in the environment draft; they are not published automatically.

## Upload-first milestone

Updated the journey to images/items → room details → review. The production build passes. The updated browser suite passes **4 tests** (two on desktop, two on mobile), including multiple file uploads, drag-and-drop, invalid-file rejection, ownership preservation, editable items, room validation, receipt/signature behavior and reload persistence. The upload page was visually inspected at 1440 and 390. The mobile layout checker reported no findings; the desktop check identified an intro paragraph off the shared column line, corrected before the final desktop rerun.

The painterly/original-colors/soft-daylight direction and close-reference fidelity requirement are recorded in editable config and the review screen. No models were generated and no conversion service was called.

Final desktop layout rerun still flags that intro paragraph at x=732, which is the intended shared split line (left edge 80, 12-column grid with 24px gaps). This is retained as a documented application-grid detection exception; the layout checker did not fully pass at desktop. Mobile had no findings.

## Local model/editor milestone

Added actual GLB import, IndexedDB storage, lazy-loaded Three.js rendering, a per-project approval gate, measured room surfaces, initial floor placement and transform editing. Tests use a tiny generated mesh fixture only in isolated test browser data; no test assets are included as user belongings.

Placement tests check spacing, model absence, oversized items and overlapping footprints. Browser tests check invalid GLB rejection, gate enforcement, actual model loading/rendering, out-of-room warnings, camera interaction controls, and model/layout restoration across reloads on desktop/mobile. The initial browser run found the old manually-started server had exited; Playwright now manages its own dev server for reproducible tests.

Final results for the local editor: **8 tests passed**, including desktop/mobile real WebGL rendering using SwiftShader. Standard and GitHub Pages production builds passed. The 3D renderer/loader are dynamically loaded rather than requested on the upload page. Vite reports a large-chunk advisory for the Three.js/GLTF loader bundle (about 159 KiB compressed); no chunk warning was suppressed. The desktop editor screenshot was inspected. Real-world furniture reconstruction, external conversion, door geometry and photo-fidelity claims remain untested and unimplemented.

## Mellow design revision (2026-11-08)

- Full current suite: **14 passed**, split between desktop and mobile. Includes real Silk/Grainient WebGL program checks through Strict Mode, only one background canvas at once, paused/reduced-motion state, tray selection/totals, saved-layout migration, real room drops, live finish pixel changes, receipt print animation, signature pixels, clearing and local persistence.
- Standard and GitHub Pages production builds passed. A production browser smoke check at `/decoration_AI/` verified local fonts, the static background fallback, the license URL, home navigation and no failed requests/page errors.
- Layout script covered 1440, 1024, 820, 768 and 390. It reported no findings at 820/768/390; at 1440/1024 it flagged the deliberate asymmetric editorial split and the inset empty-collection content. These are documented design exceptions; no full layout-check pass is claimed. All five sizes were visually reviewed, with final 1440/390 captures after lowering the background contrast.
- Final 1440 consistency script: **33 FAIL / 5 WARN**. Text contrast and failed-shader fallback now pass. The remaining findings are not reported as a clean check: the tool treats the invisible file-input hit areas as overlapping label text, treats a decorative background SVG as a panel containing the form (two spill reports), and applies marketing headline/hero/fixed-screen/form-network/grid rules to the guided editor. The user's new brief explicitly asks for an asymmetric room-focused application, not a SaaS landing page. Prototype disclosures, scrollable forms and non-network local forms are retained. No checker was edited or assertion disabled.
- Original photo and project storage keys are retained. Matching old-layout fingerprints are migrated without changing their placement coordinates; stale/unapproved fingerprints remain invalid.
- The exact Skiper component remains unverified because its site was blocked; original equivalents are used. React Bits and font licenses are distributed with the site.

Final performance run at 1440/390: **0 FAIL / 2 WARN**, with about 163 KiB compressed initial transfer, no broken requests and zero measured layout shift. Both warnings classify the vector `cloth-still.svg` fallback as an upscaled raster image based on its reported intrinsic size; it is resolution-independent SVG and remains sharp in the reviewed captures. The earlier pre-fallback run had 0 FAIL / 0 WARN. Shader-failure fallback, shader lint and secondary-text contrast pass in the final consistency report.
