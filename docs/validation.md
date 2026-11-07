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
