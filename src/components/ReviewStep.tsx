import { Arrow } from "./Arrow";
import { config } from "../config";
import type { Project } from "../types";
import { Receipt } from "./Receipt";
export function ReviewStep({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  const missing = project.items.filter(
    (i) => !i.width || !i.depth || !i.height,
  );
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">03 / A space in the making</span>
          <h1>
            Your room.
            <br />
            <em>Your next chapter.</em>
          </h1>
        </div>
        <p>
          Review the details before a room is created.
          <br />
          Nothing is generated without your say.
        </p>
      </div>
      <div className="review-grid">
        <div className="room-summary">
          <span className="eyebrow">{project.room.name}</span>
          <h2>
            {project.room.length} <span>×</span> {project.room.width}
            <small>meters</small>
          </h2>
          <p>
            {project.room.height
              ? `${project.room.height} m ceiling height`
              : "Ceiling height not supplied"}
          </p>
          {project.room.constraints && (
            <p className="constraints">{project.room.constraints}</p>
          )}
          <button onClick={onBack}>
            Edit room details <Arrow />
          </button>
        </div>
        <div className="approval-panel">
          <span className="eyebrow">The 3D room comes next</span>
          <h2>{config.renderingStyle}</h2>
          <p>{config.renderingMaterials}</p>
          <p>{config.modelFidelity}</p>
          <p>
            Before creating a room, we’ll ask you to confirm its information,
            rendering style, and permission to generate. Simple stand-ins are
            not automatically approved.
          </p>
          <p className="status">
            {missing.length
              ? `${missing.length} item${missing.length > 1 ? "s need" : " needs"} measurements before fit can be checked.`
              : "Item measurements supplied. Placement and collision checks are not implemented yet."}
          </p>
          <p className="note">
            This interface does not generate 3D rooms or call paid services.
            Inspiration photos remain optional.
          </p>
        </div>
      </div>
      <div className="collection-heading">
        <h2>Your item list</h2>
        <span>{project.items.length} items · All items awaiting placement</span>
      </div>
      <div className="rows">
        {project.items.map((i) => (
          <div className="item-row" key={i.id}>
            {i.image && <img src={i.image} alt="" />}
            <div className="item-info">
              <strong>{i.name}</strong>
              <span>
                {i.ownership === "owned" ? "Already owned" : "Wishlist"} ·{" "}
                {i.quantity} × {i.placement}
              </span>
              {i.url && (
                <a href={i.url} target="_blank" rel="noreferrer">
                  Your product link <Arrow />
                </a>
              )}
            </div>
            <div className="price">
              {i.ownership === "owned"
                ? "Already owned"
                : i.price
                  ? `${i.currency} ${(Number(i.price) * i.quantity).toFixed(2)}`
                  : "Price unknown"}
              {i.price && <small>User supplied · not verified</small>}
            </div>
          </div>
        ))}
      </div>
      <Receipt key={JSON.stringify(project)} project={project} />
    </>
  );
}
