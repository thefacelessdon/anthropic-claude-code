import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
}

const variants = {
  primary:
    "bg-accent text-surface hover:bg-accent-dim font-medium",
  secondary:
    "bg-card border border-border text-text hover:border-dim",
  ghost: "text-muted hover:text-text",
};

const sizes = {
  sm: "text-xs px-2.5 py-1.5 rounded",
  md: "text-sm px-4 py-2 rounded-md",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center transition-colors disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
