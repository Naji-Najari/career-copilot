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
  const resultRef = React.useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: fetchAnalyze,
    onError: (err: Error) => {
      toast.error(err.message || "Agent run failed.");
    },
  });

  // Once a run starts or finishes, scroll the result section into view.
  React.useEffect(() => {
    if (mutation.isIdle) return;
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [mutation.isIdle, mutation.isPending, mutation.isSuccess, mutation.isError]);

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

  return (
    <>
      <AnalyzeForm
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
      {!mutation.isIdle && (
        <section
          ref={resultRef}
          className="border-border/60 mx-auto w-full max-w-5xl border-t px-4 py-12 md:px-8 md:py-16"
        >
          <AnalyzeResponseView mutation={mutation} />
        </section>
      )}
    </>
  );
}
