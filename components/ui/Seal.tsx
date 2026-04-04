type SealSize = "sm" | "md" | "lg";

interface SealProps {
  size?: SealSize;
  char?: string;
  className?: string;
}

const sizes: Record<SealSize, string> = {
  sm: "w-5 h-5 text-[10px]",
  md: "w-8 h-8 text-base",
  lg: "w-16 h-16 text-[28px]",
};

export default function Seal({ size = "md", char = "命", className = "" }: SealProps) {
  return (
    <div
      className={`${sizes[size]} inline-flex items-center justify-center
        border-2 font-black rounded-[3px] -rotate-[3deg] select-none
        ${className}`}
      style={{ borderColor: "var(--seal)", color: "var(--seal)", fontFamily: "var(--font-display)" }}
    >
      {char}
    </div>
  );
}
