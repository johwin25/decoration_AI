import { Arrow } from "./Arrow";
import type { Room } from "../types";
export function RoomStep({
  room,
  onChange,
  onNext,
}: {
  room: Room;
  onChange: (r: Room) => void;
  onNext: () => void;
}) {
  const set = (key: keyof Room, value: string | boolean) =>
    onChange({
      ...room,
      [key]: value,
      confirmed: key === "confirmed" ? Boolean(value) : false,
    });
  return (
    <div className="step-layout">
      <div className="intro">
        <span className="eyebrow">01 / The starting point</span>
        <h1>
          A room to
          <br />
          <em>make your own.</em>
        </h1>
        <p>
          A few measurements help us understand your space. No room is too small
          to start with.
        </p>
        <div className="margin-note">
          <p>
            Keep a tape measure nearby.
            <br />
            The real dimensions make a difference.
          </p>
        </div>
      </div>
      <form
        className="form-panel"
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        <div className="panel-head">
          <span>Room details</span>
          <span className="muted">All measurements in meters</span>
        </div>
        <label>
          Room name
          <input
            value={room.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. My bedroom"
            required
            maxLength={80}
          />
        </label>
        <div className="field-grid">
          {(["length", "width", "height"] as const).map((key) => (
            <label key={key}>
              {key === "height"
                ? "Ceiling height (optional)"
                : key[0].toUpperCase() + key.slice(1)}
              <div className="unit-input">
                <input
                  aria-label={key}
                  type="number"
                  min="0.1"
                  max="1000"
                  step="0.01"
                  required={key !== "height"}
                  value={room[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder="0.00"
                />
                <span>m</span>
              </div>
            </label>
          ))}
        </div>
        <label>
          Doors, windows & things that stay
          <textarea
            value={room.constraints}
            onChange={(e) => set("constraints", e.target.value)}
            placeholder="Where is the door? Anything you can’t move?"
            rows={3}
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={room.confirmed}
            onChange={(e) => set("confirmed", e.target.checked)}
            required
          />
          I’ve checked these measurements.
        </label>
        <div className="form-bottom">
          <span>Next up: the things you own & want</span>
          <button className="primary" type="submit">
            Add your items <Arrow />
          </button>
        </div>
      </form>
    </div>
  );
}
