import { Arrow } from "./Arrow";
import { useRef } from "react";
import type { Item } from "../types";
export function ItemRail({
  items,
  selectedIds,
  onToggle,
  onPlace,
}: {
  items: Item[];
  selectedIds: string[];
  onToggle?: (id: string) => void;
  onPlace?: (id: string) => void;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; scroll: number } | null>(null);
  if (!items.length) return null;
  return (
    <section className="item-table" aria-label="Browse your objects">
      <div className="table-heading">
        <div>
          <span className="eyebrow">On the table</span>
          <h2>A few things you love.</h2>
        </div>
        <div className="rail-controls">
          <button
            aria-label="Previous items"
            onClick={() =>
              rail.current?.scrollBy({
                left: -300,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "instant"
                  : "smooth",
              })
            }
          >
            <Arrow direction="back" />
          </button>
          <button
            aria-label="Next items"
            onClick={() =>
              rail.current?.scrollBy({
                left: 300,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "instant"
                  : "smooth",
              })
            }
          >
            <span className="forward-arrow">
              <Arrow direction="back" />
            </span>
          </button>
        </div>
      </div>
      <div
        ref={rail}
        className="object-rail"
        tabIndex={0}
        aria-label="Scrollable item table"
        onPointerDown={(e) => {
          if (
            e.pointerType !== "mouse" ||
            (e.target as HTMLElement).closest('button,[draggable="true"]')
          )
            return;
          drag.current = { x: e.clientX, scroll: e.currentTarget.scrollLeft };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current)
            e.currentTarget.scrollLeft =
              drag.current.scroll - e.clientX + drag.current.x;
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            e.currentTarget.scrollBy({
              left: e.key === "ArrowRight" ? 220 : -220,
            });
          }
        }}
      >
        {items.map((item) => (
          <article
            className="object-card"
            key={item.id}
            draggable={!!onPlace && !!item.modelAssetId}
            onDragStart={(e) => {
              e.dataTransfer.setData("application/x-mellow-item", item.id);
              e.dataTransfer.effectAllowed = "copy";
            }}
          >
            {item.image ? (
              <img src={item.image} alt={item.name} draggable={false} />
            ) : (
              <div className="object-no-photo">{item.name}</div>
            )}
            <div className="object-label">
              <strong>{item.name}</strong>
              <span>
                {item.ownership === "owned"
                  ? "Already yours"
                  : "On your wishlist"}
              </span>
            </div>
            {onToggle && (
              <button
                className="object-choice"
                aria-label={`Include ${item.name}`}
                aria-pressed={selectedIds.includes(item.id)}
                onClick={() => onToggle(item.id)}
              >
                {selectedIds.includes(item.id)
                  ? "In your collection"
                  : "Add to your room"}
              </button>
            )}
            {onPlace && (
              <button
                disabled={!item.modelAssetId}
                onClick={() => onPlace(item.id)}
              >
                {item.modelAssetId ? "Place in room" : "Matching model needed"}
              </button>
            )}
          </article>
        ))}
      </div>
      <p className="table-hint">
        Scroll through your objects
        {onPlace
          ? ". Drag a ready model into the room, or use Place in room."
          : ", or drag the space between them. Choose what belongs in your room."}
      </p>
    </section>
  );
}
