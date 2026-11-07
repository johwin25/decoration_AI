import { Arrow } from "./Arrow";
import { useState } from "react";
import type { Item } from "../types";
const draft = (): Item => ({
  id: crypto.randomUUID(),
  name: "",
  ownership: "owned",
  width: "",
  depth: "",
  height: "",
  quantity: 1,
  placement: "floor",
  price: "",
  currency: "USD",
  url: "",
});
export function ItemsStep({
  items,
  onChange,
  onNext,
  onImport,
}: {
  items: Item[];
  onChange: (items: Item[]) => void;
  onNext: () => void;
  onImport: (items: Item[]) => void;
}) {
  const [item, setItem] = useState<Item>(draft);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [importStatus, setImportStatus] = useState("");
  async function importImages(files: FileList | File[]) {
    if (importing) return;
    setImporting(true);
    const accepted: Item[] = [];
    let rejected = 0;
    for (const file of Array.from(files)) {
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 2 * 1024 * 1024
      ) {
        rejected++;
        continue;
      }
      try {
        const image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
        accepted.push({
          ...draft(),
          name: file.name.replace(/\.[^.]+$/, "").slice(0, 100),
          image,
          ownership: item.ownership,
        });
      } catch {
        rejected++;
      }
    }
    if (accepted.length) onImport(accepted);
    setImportStatus(
      `${accepted.length} image${accepted.length === 1 ? "" : "s"} added.${rejected ? ` ${rejected} could not be added. Use JPG, PNG or WebP under 2 MB each.` : " Review names, ownership, placement and measurements below."}`,
    );
    setImporting(false);
  }
  const set = (key: keyof Item, value: string | number) =>
    setItem((v) => ({ ...v, [key]: value }));
  async function upload(file?: File) {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setError("Choose a JPG, PNG or WebP image under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      set("image", String(reader.result));
      setError("");
    };
    reader.readAsDataURL(file);
  }
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">01 / Your images</span>
          <h1>
            The things that
            <br />
            <em>make it yours.</em>
          </h1>
        </div>
        <p>
          What you have. What you’re hoping for.
          <br />
          Keep them together, but clearly distinguished.
        </p>
      </div>
      <label
        className={`upload upload-first${dragging ? " is-dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null))
            setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void importImages(e.dataTransfer.files);
        }}
      >
        <strong>
          {importing
            ? "Adding your images…"
            : "Drop your images here, or choose files"}
        </strong>
        <span>Screenshots & photos · JPG, PNG, WebP · Up to 2 MB each</span>
        <span>
          New images use the ownership choice below. You can edit each item
          afterward.
        </span>
        <input
          aria-label="Upload item images"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          disabled={importing}
          onChange={(e) => {
            if (e.target.files) void importImages(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {importStatus && (
        <p className="import-status" role="status">
          {importStatus}
        </p>
      )}
      <div className="items-layout">
        <form
          className="form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            onChange(
              editing
                ? items.map((v) => (v.id === item.id ? item : v))
                : [...items, item],
            );
            setItem(draft());
            setEditing(false);
          }}
        >
          <div className="panel-head">
            {editing ? "Edit item" : "Add an item"}
            <span className="muted">Images stay in this browser</span>
          </div>
          <div className="segmented">
            {(["owned", "wishlist"] as const).map((status) => (
              <button
                key={status}
                type="button"
                aria-pressed={item.ownership === status}
                onClick={() => set("ownership", status)}
              >
                {status === "owned" ? "Already owned" : "On my wishlist"}
              </button>
            ))}
          </div>
          <label className="upload">
            {item.image ? (
              <img src={item.image} alt="Selected item" />
            ) : (
              <>
                <span className="upload-symbol">＋</span>
                <strong>Add an item photo</strong>
                <span>JPG, PNG, WebP · Up to 2 MB</span>
              </>
            )}
            <input
              aria-label="Item photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                void upload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <label>
            Item name
            <input
              required
              value={item.name}
              maxLength={100}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Oak writing desk"
            />
          </label>
          <div className="field-grid">
            {(["width", "depth", "height"] as const).map((key) => (
              <label key={key}>
                {key} (m)
                <input
                  aria-label={`Item ${key}`}
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={item[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder="Unknown"
                />
              </label>
            ))}
          </div>
          <div className="field-grid two">
            <label>
              Placement
              <select
                value={item.placement}
                onChange={(e) => set("placement", e.target.value)}
              >
                {["floor", "wall", "shelf", "desktop", "ceiling", "other"].map(
                  (v) => (
                    <option key={v}>{v}</option>
                  ),
                )}
              </select>
            </label>
            <label>
              Quantity
              <input
                type="number"
                required
                min="1"
                max="100"
                value={item.quantity}
                onChange={(e) => set("quantity", Number(e.target.value))}
              />
            </label>
          </div>
          <div className="field-grid two">
            <label>
              Known unit price (optional)
              <input
                aria-label="Known unit price"
                type="number"
                min="0"
                step="0.01"
                value={item.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </label>
            <label>
              Currency
              <select
                value={item.currency}
                onChange={(e) => set("currency", e.target.value)}
              >
                {["USD", "KRW", "EUR", "GBP", "JPY"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Product link (optional)
            <input
              type="url"
              pattern="https?://.*"
              value={item.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://"
            />
          </label>
          <button className="primary" type="submit">
            {editing ? "Save item" : "Add to collection"} <span>＋</span>
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setItem(draft());
                setEditing(false);
              }}
            >
              Cancel edit
            </button>
          )}
        </form>
        <div>
          <div className="panel-head">
            Your collection <span className="muted">{items.length} items</span>
          </div>
          {items.length === 0 ? (
            <div className="empty">
              <Arrow direction="down" />
              <h2>Start with one thing.</h2>
              <p>
                Add a photo and a name.
                <br />
                You can fill in the details as you go.
              </p>
            </div>
          ) : (
            <div className="rows">
              {items.map((v) => (
                <div className="item-row" key={v.id}>
                  {v.image && <img src={v.image} alt="" />}
                  <div className="item-info">
                    <strong>{v.name}</strong>
                    <span>
                      {v.ownership === "owned" ? "Already owned" : "Wishlist"} ·{" "}
                      {v.quantity} × {v.placement}
                    </span>
                    <span>
                      {v.width && v.depth && v.height
                        ? `${v.width} × ${v.depth} × ${v.height} m`
                        : "Measurements needed"}
                    </span>
                  </div>
                  <div className="row-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setItem(v);
                        setEditing(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${v.name}`}
                      onClick={() =>
                        onChange(items.filter((i) => i.id !== v.id))
                      }
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="note">
            Photo classification and product matching aren’t connected yet. You
            control every detail.
          </p>
        </div>
      </div>
      <div className="page-actions">
        <button
          className="primary"
          disabled={!items.length || editing || importing}
          onClick={onNext}
        >
          Add room details <Arrow />
        </button>
      </div>
    </>
  );
}
