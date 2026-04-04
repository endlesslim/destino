export default function Divider() {
  return (
    <div
      className="h-px opacity-15 my-8"
      style={{
        background:
          "repeating-linear-gradient(90deg, #1C1917 0, #1C1917 4px, transparent 4px, transparent 8px)",
      }}
    />
  );
}
