"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { AnalyzeForm } from "@/components/analyze-form";
import { AnalyzeResponseView } from "@/components/analyze-response";
import { fetchAnalyze } from "@/lib/api";
import { analyzeInputSchema, type Mode } from "@/lib/schemas";

export default function Home() {
  const [mode, setMode] = React.useState<Mode>("recruiter");
  const [cvText, setCvText] = React.useState("");
  const [jdText, setJdText] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: fetchAnalyze,
    onError: (err: Error) => {
      toast.error(err.message || "Agent run failed.");
    },
  });

  function handleSubmit() {
    const input = { cv_text: cvText, jd_text: jdText, mode };
    const parsed = analyzeInputSchema.safeParse(input);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data);
  }

  // Initial render: full-page hero form.
  if (mutation.isIdle) {
    return (
      <AnalyzeForm
        mode={mode}
        onModeChange={setMode}
        cvText={cvText}
        onCvChange={setCvText}
        jdText={jdText}
        onJdChange={setJdText}
        errors={errors}
        onSubmit={handleSubmit}
        pending={false}
      />
    );
  }

  // Post-submit: form compact on the left, response on the right.
  return (
    <div className="bg-background md:flex md:min-h-dvh">
      <aside className="bg-card border-b md:sticky md:top-0 md:h-dvh md:w-[420px] md:shrink-0 md:overflow-y-auto md:border-r md:border-b-0">
        <AnalyzeForm
          variant="compact"
          mode={mode}
          onModeChange={setMode}
          cvText={cvText}
          onCvChange={setCvText}
          jdText={jdText}
          onJdChange={setJdText}
          errors={errors}
          onSubmit={handleSubmit}
          pending={mutation.isPending}
        />
      </aside>
      <main className="flex-1 md:overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
          <AnalyzeResponseView mutation={mutation} />
        </div>
      </main>
    </div>
  );
}
