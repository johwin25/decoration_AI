import { useEffect, useState } from "react";
import type { Project } from "../types";
import { selectedItems, knownTotals } from "../selection";
export function SelectedTray({
  project,
  onToggle,
  view,
}: {
  project: Project;
  onToggle: (id: string) => void;
  view: number;
}) {
  const [open, setOpen] = useState(false);
  const [atReceipt, setAtReceipt] = useState(false);
  useEffect(() => {
    const receipt = document.querySelector(".receipt-section");
    if (!receipt) {
      setAtReceipt(false);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => setAtReceipt(entries[0].isIntersecting),
      { threshold: 0 },
    );
    observer.observe(receipt);
    return () => observer.disconnect();
  }, [view]);
  const items = selectedItems(project);
  const totals = knownTotals(items);
  if (!project.items.length) return null;
  return (
    <aside
      className={`selected-tray${open ? " is-open" : ""}`}
      aria-label="Your selected items"
      hidden={atReceipt}
    >
      <button
        className="tray-toggle"
        aria-expanded={open}
        aria-controls="tray-contents"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="tray-photos" aria-hidden="true">
          {items
            .filter((i) => i.image)
            .slice(0, 3)
            .map((i) => (
              <img src={i.image} alt="" key={i.id} />
            ))}
        </span>
        <span>
          {items.length} {items.length === 1 ? "thing" : "things"} for your room
        </span>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div className="tray-expansion" aria-hidden={!open} inert={!open}>
        <div className="tray-clip">
          <div id="tray-contents" className="tray-contents">
            <h2>Your chosen things</h2>
            {items.length ? (
              items.map((i) => (
                <div className="tray-row" key={i.id}>
                  <div>
                    <strong>{i.name}</strong>
                    <small>
                      {i.ownership === "owned"
                        ? "Already owned"
                        : i.price
                          ? `${i.currency} ${(Number(i.price) * i.quantity).toFixed(2)}`
                          : "Price unknown"}
                    </small>
                  </div>
                  <button
                    aria-label={`Unselect ${i.name}`}
                    onClick={() => onToggle(i.id)}
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p>Choose an item from your collection to start.</p>
            )}
            <div className="tray-totals">
              <span>Known wishlist subtotal</span>
              {Object.entries(totals).length ? (
                Object.entries(totals).map(([currency, total]) => (
                  <strong key={currency}>
                    {currency} {total.toFixed(2)}
                  </strong>
                ))
              ) : (
                <strong>Prices unknown</strong>
              )}
              <small>User-supplied prices. Unknown prices excluded.</small>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
