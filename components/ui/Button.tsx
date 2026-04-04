import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export default function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  const base =
    "w-full rounded-md py-4 text-[15px] font-bold tracking-wider transition-all cursor-pointer";

  const variants = {
    primary:
      "hover:opacity-85 active:opacity-70",
    secondary:
      "border-[1.5px] hover:opacity-80 active:opacity-60",
  };

  const inlineStyle =
    variant === "primary"
      ? { background: "var(--seal)", color: "#fff", fontFamily: "var(--font-display)", boxShadow: "0 4px 16px var(--shadow-btn)" }
      : { background: "transparent", color: "var(--ink)", borderColor: "var(--border-strong)", fontFamily: "var(--font-display)" };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      style={inlineStyle}
      {...props}
    >
      {children}
    </button>
  );
}
