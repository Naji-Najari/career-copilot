"use client";

import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DocumentInput } from "@/components/document-input";
import { ModeSelector } from "@/components/mode-selector";
import { cn } from "@/lib/utils";
import type { Mode } from "@/lib/schemas";

type Props = {
  mode: Mode;
  onModeChange: (next: Mode) => void;
  cvText: string;
  onCvChange: (next: string) => void;
  jdText: string;
  onJdChange: (next: string) => void;
  errors: Record<string, string>;
  onSubmit: () => void;
  pending: boolean;
  variant?: "hero" | "compact";
};

export function AnalyzeForm({
  mode,
  onModeChange,
  cvText,
  onCvChange,
  jdText,
  onJdChange,
  errors,
  onSubmit,
  pending,
  variant = "hero",
}: Props) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "flex flex-col",
        isCompact ? "h-full" : "min-h-dvh",
      )}
    >
      <div
        className={cn(
          "flex w-full flex-1 flex-col",
          isCompact
            ? "gap-6 px-6 py-6"
            : "mx-auto max-w-2xl gap-10 px-6 py-10 md:py-14",
        )}
      >
        {isCompact ? (
          <header className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold tracking-tight">
              Career Copilot
            </span>
          </header>
        ) : (
          <header className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Career Copilot
            </h1>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed md:text-base">
              Recruiters: score a candidate&apos;s fit and draft outreach.
              <br />
              Candidates: research the company and build interview prep.
            </p>
            <StackBadges />
          </header>
        )}

        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <Section label="Mode">
            <ModeSelector
              value={mode}
              onChange={onModeChange}
              disabled={pending}
            />
          </Section>

          <DocumentInput
            id="cv_text"
            label="CV"
            value={cvText}
            onChange={onCvChange}
            placeholder="Paste the candidate's CV, or drop a PDF resume."
            disabled={pending}
            error={errors.cv_text}
          />

          <DocumentInput
            id="jd_text"
            label="Job Description"
            value={jdText}
            onChange={onJdChange}
            placeholder="Paste the job description, or drop a PDF."
            disabled={pending}
            error={errors.jd_text}
          />

          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="mt-2 w-full"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                {isCompact ? "Run again" : "Analyze"}
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

// Shields.io-style two-tone badges — same visual as the GitHub README.
const STACK: Array<{ label: string; value: string; color: string }> = [
  { label: "Python", value: "3.12", color: "#3776AB" },
  { label: "Google ADK", value: "v2", color: "#4285F4" },
  { label: "Cloud", value: "GCP", color: "#1A73E8" },
  { label: "Tavily", value: "MCP", color: "#0B7285" },
  { label: "uv", value: "managed", color: "#DE5FE9" },
  { label: "Next.js", value: "15", color: "#000000" },
];

function StackBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
      {STACK.map((item) => (
        <Shield key={item.label} {...item} />
      ))}
    </div>
  );
}

function Shield({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <span className="inline-flex overflow-hidden rounded-[3px] text-[10px] leading-none font-semibold shadow-sm">
      <span className="bg-[#555] px-1.5 py-1 text-white">{label}</span>
      <span className="px-1.5 py-1 text-white" style={{ backgroundColor: color }}>
        {value}
      </span>
    </span>
  );
}
