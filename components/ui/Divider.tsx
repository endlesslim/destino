export default function Divider() {
  return (
    <div
      className="h-px opacity-15 my-8"
      style={{
        background:
          "repeating-linear-gradient(90deg, var(--ink) 0, var(--ink) 4px, transparent 4px, transparent 8px)",
      }}
    />
  );
}
