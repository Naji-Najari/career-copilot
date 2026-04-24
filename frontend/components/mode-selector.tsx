"use client";

import { Briefcase, UserSearch } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Mode } from "@/lib/schemas";

const OPTIONS: Array<{
  value: Mode;
  label: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: "recruiter",
    label: "Recruiter",
    description: "Score fit, draft outreach.",
    Icon: UserSearch,
  },
  {
    value: "candidate",
    label: "Candidate",
    description: "Research + interview prep.",
    Icon: Briefcase,
  },
];

type Props = {
  value: Mode;
  onChange: (next: Mode) => void;
  disabled?: boolean;
};

export function ModeSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={cn(
              "focus-visible:ring-ring/50 focus-visible:border-ring group relative flex flex-col items-start gap-1.5 rounded-lg border px-3.5 py-3 text-left transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60",
              active
                ? "border-foreground bg-foreground/5"
                : "border-border bg-card hover:bg-accent hover:border-accent-foreground/20",
            )}
          >
            <div className="flex w-full items-center justify-between">
              <opt.Icon
                className={cn(
                  "size-4",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              />
              {active && (
                <span className="bg-foreground size-1.5 rounded-full" />
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                active ? "text-foreground" : "text-foreground/80",
              )}
            >
              {opt.label}
            </span>
            <span className="text-muted-foreground text-[11px] leading-snug">
              {opt.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
