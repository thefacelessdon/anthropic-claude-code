import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, id, className = "", ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm text-muted mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full bg-surface border border-border rounded px-3 py-2 text-text text-sm placeholder:text-dim focus:outline-none focus:border-accent transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
