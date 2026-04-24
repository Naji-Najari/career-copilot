"use client";

import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DocumentInput } from "@/components/document-input";
import { ModeSelector } from "@/components/mode-selector";
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
}: Props) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-10 md:py-14">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            career-copilot
          </h1>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed md:text-base">
            Recruiters: score a candidate's fit and draft outreach.
            <br />
            Candidates: research the company and build interview prep.
          </p>
        </header>

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
            placeholder="Paste the candidate's CV, or switch to PDF to upload..."
            rows={11}
            disabled={pending}
            error={errors.cv_text}
          />

          <DocumentInput
            id="jd_text"
            label="Job Description"
            value={jdText}
            onChange={onJdChange}
            placeholder="Paste the job description, or switch to PDF..."
            rows={9}
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
                Analyze
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        <footer className="text-muted-foreground mt-auto pt-8 text-center text-[11px] leading-relaxed">
          Google ADK v2 · OpenAI gpt-5.4-mini · Tavily MCP
        </footer>
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
