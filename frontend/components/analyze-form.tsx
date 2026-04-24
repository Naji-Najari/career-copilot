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
              career-copilot
            </span>
          </header>
        ) : (
          <header className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              career-copilot
            </h1>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed md:text-base">
              Recruiters: score a candidate&apos;s fit and draft outreach.
              <br />
              Candidates: research the company and build interview prep.
            </p>
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

        {!isCompact && (
          <footer className="text-muted-foreground mt-auto pt-8 text-center text-[11px] leading-relaxed">
            Google ADK v2 · OpenAI gpt-5.4-mini · Tavily MCP
          </footer>
        )}
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
