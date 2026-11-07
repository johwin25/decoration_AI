export function Arrow({
  direction = "up",
}: {
  direction?: "up" | "down" | "back";
}) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      style={{
        verticalAlign: "middle",
        transform:
          direction === "down"
            ? "rotate(180deg)"
            : direction === "back"
              ? "rotate(225deg)"
              : undefined,
      }}
    >
      <path d="M6 18 18 6M6 6h12v12" />
    </svg>
  );
}
