# Design decisions

Kind: software — guided room-planning application, not a marketing landing page.

## Approval source

User authorized free exploration of Taste Skill and interface implementation, with the condition that the interface remain easily editable.

- Website: white background, neat premium feel, guided sequence.
- Item list: compact rows with prices on the right on desktop.
- Motion: button-triggered receipt printing at the end of the item list, followed by freehand signature.
- 3D: painterly finish based on the provided cone reference. This is style direction only; no room-generation permission has been supplied.

## Implementation choices within interface authorization

Three editable React steps; white ground, near-black text, muted green action, serif headings and plain sans-serif controls. Central theme tokens and separate step components. No external fonts or stock images, no shaders or continuous background motion. Content-driven form heights preserve usability when collections grow; the skill's fixed marketing-section heights and generic hero recipes are not appropriate to this guided application.

Receipt and signature behaviors were independently implemented from the user's descriptions. Reference URLs returned HTTP 403; their source code and licenses were not verified or copied. Motionsite tools are not available in this session. The attached Taste Skill was read and used as design guidance. Product requirements for honest capability/price disclosure take precedence over skill rules discouraging prototype labels.

## Pending gate

Room/item information and explicit permission to generate a room are required before Gate B is complete. No generated room, asset, placeholder geometry, paid API, retailer lookup or public deployment is authorized by this interface implementation.

## Gate B discussion and upload-first revision

User clarified that uploads belong to the website's first page, rather than requiring personal room/item photos in chat. The approved sequence is now images/items → room details → review. Support both drag-and-drop and file selection, including multiple photos and screenshots. Imported filenames are editable labels, not AI classifications.

Rendering direction: painterly finish with original item colors and soft daylight. Aim for the closest feasible resemblance to uploaded items. Do not treat the user's fidelity request as permission for generic placeholder models. Disclose asset/model limitations before generation; per-project information and generation approval remain required. The existing 3.5 × 2.3 m example is not a default for every visitor; no ceiling height or door/window geometry was invented.
