import { migrateProject } from "./migration";
import { Atmosphere } from "./components/Atmosphere";
import { SelectedTray } from "./components/SelectedTray";
import { selectedItems } from "./selection";
import { Arrow } from "./components/Arrow";
import { useEffect, useState } from "react";
import { config } from "./config";
import { emptyProject } from "./types";
import type { Project } from "./types";
import { RoomStep } from "./components/RoomStep";
import { ItemsStep } from "./components/ItemsStep";
import { ReviewStep } from "./components/ReviewStep";
function load(): Project {
  try {
    const data = JSON.parse(localStorage.getItem(config.storageKey) || "null");
    if (
      data &&
      data.room &&
      typeof data.room.name === "string" &&
      Array.isArray(data.items)
    )
      return migrateProject(data);
  } catch {}
  return structuredClone(emptyProject);
}
export default function App() {
  const [project, setProject] = useState<Project>(load);
  const [step, setStep] = useState(0);
  const [saveState, setSaveState] = useState("Saved on this device");
  useEffect(() => {
    try {
      localStorage.setItem(config.storageKey, JSON.stringify(project));
      setSaveState("Saved on this device");
    } catch {
      setSaveState("Storage full — download your project to keep changes");
    }
  }, [project]);
  function toggleItem(id: string) {
    setProject((p) => {
      const ids = selectedItems(p).map((i) => i.id);
      return {
        ...p,
        selectedItemIds: ids.includes(id)
          ? ids.filter((v) => v !== id)
          : [...ids, id],
      };
    });
  }
  function go(next: number) {
    setStep(next);
    window.scrollTo({ top: 0 });
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(project, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "mellow-room.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <Atmosphere step={step} />
      <header className="nav">
        <div className="wrap nav-inner">
          <a className="wordmark" href="./" aria-label="Mellow home">
            {config.name}
            <span className="brand-dot" />
          </a>
          <span className="nav-description">A little more at home.</span>
          <button onClick={download}>
            Download project <Arrow />
          </button>
        </div>
      </header>
      <main className="wrap">
        <a href="#workspace" className="skip">
          Skip to room planner
        </a>
        <nav className="steps" aria-label="Project steps">
          {config.steps.map((label, index) => (
            <button
              key={label}
              disabled={index > step}
              aria-current={step === index ? "step" : undefined}
              onClick={() => go(index)}
            >
              <span className="step-number">
                {index < step ? "•" : `0${index + 1}`}
              </span>
              {label}
              <span className="step-line" />
            </button>
          ))}
        </nav>
        <div id="workspace" className="workspace">
          {step === 0 ? (
            <ItemsStep
              items={project.items}
              selectedIds={selectedItems(project).map((i) => i.id)}
              onToggle={toggleItem}
              onChange={(items) => setProject((p) => ({ ...p, items }))}
              onImport={(items) =>
                setProject((p) => ({ ...p, items: [...p.items, ...items] }))
              }
              onNext={() => go(1)}
            />
          ) : step === 1 ? (
            <RoomStep
              room={project.room}
              onChange={(room) => setProject((p) => ({ ...p, room }))}
              onBack={() => go(0)}
              onNext={() => go(2)}
            />
          ) : (
            <ReviewStep
              project={project}
              onChange={setProject}
              onBack={() => go(1)}
            />
          )}
        </div>
      </main>
      <SelectedTray project={project} onToggle={toggleItem} view={step} />
      <footer className="wrap footer">
        <span>{config.name}</span>
        <span role="status">{saveState}</span>
        <span>
          Atmospheres by{" "}
          <a href="https://reactbits.dev" target="_blank" rel="noreferrer">
            React Bits
          </a>{" "}
          · <a href="./licenses/react-bits.txt">License</a>
        </span>
      </footer>
    </>
  );
}
