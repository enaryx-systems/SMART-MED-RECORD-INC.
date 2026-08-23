import type { InputHTMLAttributes } from "react";

export function TextInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-lg border-2 border-pine/25 bg-cream px-3 text-sm text-ink outline-none transition-colors duration-fast focus:border-emerald focus:shadow-[0_0_0_3px_rgba(0,133,111,0.09)] ${className}`}
    />
  );
}
