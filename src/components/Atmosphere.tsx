import { lazy, Suspense, useEffect, useState } from "react";
const Silk = lazy(() => import("../vendor/react-bits/Silk"));
const Grainient = lazy(() => import("../vendor/react-bits/Grainient"));
const palettes = {
  oat: ["#F5EFE6", "#E8DCC8", "#D8C7AF"],
  clay: ["#F5EFE6", "#E8DCC8", "#D6AD96"],
  sage: ["#F5EFE6", "#E8DCC8", "#BBC7AA"],
} as const;
export function Atmosphere({ step }: { step: number }) {
  const [mode, setMode] = useState("auto");
  const [palette, setPalette] = useState<keyof typeof palettes>("oat");
  const [paused, setPaused] = useState(false);
  const [quiet, setQuiet] = useState(
    () =>
      window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 700px)")
        .matches,
  );
  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce), (max-width: 700px)",
    );
    const change = () => setQuiet(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  const current =
    mode === "auto" ? (step === 0 ? "silk" : "grainient-linear") : mode;
  const still = paused || quiet;
  return (
    <>
      <div
        className="atmosphere"
        aria-hidden="true"
        data-background={current}
        data-still={still}
      >
        <img
          className="atmosphere-fallback"
          src={`${import.meta.env.BASE_URL}art/cloth-still.svg`}
          width="1440"
          height="1050"
          alt=""
        />
        <Suspense fallback={null}>
          {current === "silk" ? (
            <Silk
              color={palettes[palette][1]}
              sheenColor={palettes[palette][0]}
              speed={0.22}
              depth={0.18}
              sheen={0.25}
              glow={0}
              noiseIntensity={0.8}
              mouseInteraction={false}
              clickRipple={false}
              intro={false}
              paused={still}
              dpr={1}
              lightMode
            />
          ) : (
            <Grainient
              key={current}
              colors={[...palettes[palette]]}
              type={current === "grainient-radial" ? "radial" : "linear"}
              speed={still ? 0 : 0.12}
              flow={0.25}
              grainAmount={0.045}
              grainAnimated={false}
              contrast={0.35}
              saturation={0.7}
              interactive={false}
              clickSwirl={false}
              intro={false}
              dpr={1}
              lightMode
            />
          )}
        </Suspense>
      </div>
      <details className="atmosphere-settings">
        <summary>Room mood</summary>
        <div>
          <label>
            Texture
            <select
              aria-label="Background texture"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="auto">Follow the room</option>
              <option value="silk">Silk</option>
              <option value="grainient-linear">Grainient · linear</option>
              <option value="grainient-radial">Grainient · radial</option>
            </select>
          </label>
          <label>
            Tone
            <select
              aria-label="Background tone"
              value={palette}
              onChange={(e) =>
                setPalette(e.target.value as keyof typeof palettes)
              }
            >
              <option value="oat">Oat</option>
              <option value="clay">Clay</option>
              <option value="sage">Sage</option>
            </select>
          </label>
          <button onClick={() => setPaused((v) => !v)} disabled={quiet}>
            {quiet
              ? "Still on this device"
              : paused
                ? "Resume atmosphere"
                : "Pause atmosphere"}
          </button>
        </div>
      </details>
    </>
  );
}
