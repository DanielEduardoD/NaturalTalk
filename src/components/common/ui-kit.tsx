import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Pill({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-sm transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border bg-field text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function PillGroup<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <Pill
          key={option.value}
          active={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Pill>
      ))}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border bg-field px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary";

export function Note({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "highlight";
}) {
  return (
    <p
      className={cn(
        "rounded-xl border px-3 py-2 text-xs leading-relaxed",
        tone === "highlight"
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-field text-muted-foreground",
      )}
    >
      {children}
    </p>
  );
}
