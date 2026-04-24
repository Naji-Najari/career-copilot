"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { AnalyzeBar } from "@/components/analyze-bar";
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

  function handleEdit() {
    mutation.reset();
  }

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

  return (
    <div className="bg-background min-h-dvh">
      <AnalyzeBar
        mode={mode}
        cvChars={cvText.length}
        jdChars={jdText.length}
        pending={mutation.isPending}
        onEdit={handleEdit}
        onRunAgain={handleSubmit}
      />
      <main>
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
          <AnalyzeResponseView mutation={mutation} />
        </div>
      </main>
    </div>
  );
}
