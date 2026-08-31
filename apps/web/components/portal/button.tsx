import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "border border-pine bg-emerald text-white hover:bg-pine disabled:opacity-60",
  secondary: "border-2 border-pine/25 bg-white text-pine hover:bg-mint/60 disabled:opacity-60",
  ghost: "text-ink/70 hover:bg-mint/60 disabled:opacity-60",
  danger: "border border-red-600 bg-red-600 text-white hover:bg-red-700 disabled:opacity-60",
};

const SIZE_CLASS: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

export function Button({
  variant = "primary",
  size = "sm",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors duration-fast disabled:cursor-not-allowed ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]} ${className}`}
    />
  );
}
