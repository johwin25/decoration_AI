import { selectedItems, knownTotals } from "../selection";
import { config } from "../config";
import { Arrow } from "./Arrow";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { Project } from "../types";
export function Receipt({ project }: { project: Project }) {
  const [printed, setPrinted] = useState(false);
  const [signed, setSigned] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      if (media.matches) setReady(true);
    };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const items = selectedItems(project);
  const totals = knownTotals(items);
  function point(e: PointerEvent<HTMLCanvasElement>) {
    const c = e.currentTarget;
    const rect = c.getBoundingClientRect();
    return [
      ((e.clientX - rect.left) * c.width) / rect.width,
      ((e.clientY - rect.top) * c.height) / rect.height,
    ];
  }
  function start(e: PointerEvent<HTMLCanvasElement>) {
    if (!ready) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = e.currentTarget.getContext("2d")!;
    ctx.beginPath();
    const [x, y] = point(e);
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.strokeStyle = getComputedStyle(e.currentTarget)
      .getPropertyValue("--ink")
      .trim();
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    drawing.current = true;
    setSigned(true);
  }
  function move(e: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext("2d")!;
    const [x, y] = point(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  return (
    <div className="receipt-section">
      <div>
        <span className="eyebrow">A little something to keep</span>
        <h2>
          Your room,
          <br />
          <em>on paper.</em>
        </h2>
        <p>
          Print your collection. Add your signature.
          <br />A record of the things you’ve chosen.
        </p>
        <button
          className="primary"
          disabled={printed}
          onClick={() => {
            setPrinted(true);
            setReady(
              window.matchMedia("(prefers-reduced-motion: reduce)").matches,
            );
          }}
        >
          {printed ? "Receipt printed" : "Print item receipt"} <Arrow />
        </button>
      </div>
      <div className="printer-area">
        <div className="printer">
          <div className="printer-label">
            {config.name} <span className="light" />
          </div>
          <div className="printer-slot" />
        </div>
        {printed && (
          <article
            className={`receipt${ready ? " is-ready" : ""}`}
            aria-label="Item receipt"
            onAnimationEnd={(e) => {
              if (e.target === e.currentTarget && e.animationName === "print")
                setReady(true);
            }}
          >
            <h3>{config.name}</h3>
            <p>{project.room.name}</p>
            <div className="receipt-rule" />
            {items.map((i) => (
              <div className="receipt-row" key={i.id}>
                <span>
                  {i.quantity} × {i.name}
                </span>
                <span>
                  {i.ownership === "owned"
                    ? "Owned"
                    : i.price
                      ? `${i.currency} ${(Number(i.price) * i.quantity).toFixed(2)}`
                      : "Unknown"}
                </span>
              </div>
            ))}
            <div className="receipt-rule" />
            <p>Wishlist known subtotal</p>
            {Object.entries(totals).length ? (
              Object.entries(totals).map(([currency, total]) => (
                <div className="receipt-row" key={currency}>
                  <strong>{currency}</strong>
                  <strong>{total.toFixed(2)}</strong>
                </div>
              ))
            ) : (
              <p>Prices unavailable</p>
            )}
            <small>
              Prices supplied by you, not retailer verified.
              <br />
              Unknown prices excluded. Not a purchase.
            </small>
            <div className="signature">
              <canvas
                width="600"
                height="180"
                aria-label="Draw your signature here"
                aria-disabled={!ready}
                ref={canvas}
                onPointerDown={start}
                onPointerMove={move}
                onPointerUp={() => {
                  drawing.current = false;
                }}
                onPointerCancel={() => {
                  drawing.current = false;
                }}
              />
              <span>
                {ready ? "Draw your signature above" : "Printing your receipt…"}
              </span>
            </div>
            <button
              onClick={() => {
                canvas.current?.getContext("2d")?.clearRect(0, 0, 600, 180);
                setSigned(false);
              }}
            >
              Clear signature
            </button>
            <p aria-live="polite">
              {signed ? "Signed by you." : "Make it yours."}
            </p>
          </article>
        )}
      </div>
    </div>
  );
}
