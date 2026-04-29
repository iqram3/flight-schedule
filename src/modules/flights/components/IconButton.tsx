import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tone?: "neutral" | "danger" | "success";
  children: ReactNode;
}

const tones = {
  neutral: "border-slate-200 bg-white text-slate-700 hover:border-lagoon hover:bg-cyan-50 hover:text-cyan-800",
  danger: "border-red-100 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100",
  success: "border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100",
};

export function IconButton({ label, tone = "neutral", children, className = "", ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
