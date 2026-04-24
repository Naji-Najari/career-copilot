"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { FileUp, Loader2, Type } from "lucide-react";
import { toast } from "sonner";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { fetchExtractPdf } from "@/lib/api";

type InputMode = "text" | "pdf";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  error?: string;
};

export function DocumentInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 10,
  disabled,
  error,
}: Props) {
  const [inputMode, setInputMode] = React.useState<InputMode>("text");
  const fileRef = React.useRef<HTMLInputElement>(null);

  const extractMutation = useMutation({
    mutationFn: fetchExtractPdf,
    onSuccess: (res) => {
      onChange(res.text);
      setInputMode("text");
      toast.success(`${label} extracted — review before analyzing.`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not extract text from the PDF.");
      setInputMode("text");
    },
  });

  function setMode(next: InputMode) {
    if (next === inputMode) return;
    setInputMode(next);
    if (next === "pdf") fileRef.current?.click();
  }

  function handleFilePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      setInputMode("text");
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      setInputMode("text");
      return;
    }
    extractMutation.mutate(file);
  }

  const busy = disabled || extractMutation.isPending;
  const charCount = value.length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase"
        >
          {label}
        </label>
        <div className="bg-muted text-muted-foreground inline-flex rounded-md p-0.5 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setMode("text")}
            className={cn(
              "focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-sm px-2 py-0.5 transition-colors outline-none focus-visible:ring-[3px]",
              inputMode === "text"
                ? "bg-background text-foreground shadow-xs"
                : "hover:text-foreground",
            )}
          >
            <Type className="size-3" />
            Text
          </button>
          <button
            type="button"
            onClick={() => setMode("pdf")}
            className={cn(
              "focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-sm px-2 py-0.5 transition-colors outline-none focus-visible:ring-[3px]",
              inputMode === "pdf"
                ? "bg-background text-foreground shadow-xs"
                : "hover:text-foreground",
            )}
          >
            {extractMutation.isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <FileUp className="size-3" />
            )}
            PDF
          </button>
        </div>
      </div>
      <div className="relative">
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          disabled={busy}
          className={cn(
            "resize-none leading-relaxed",
            extractMutation.isPending && "opacity-50",
          )}
        />
        {extractMutation.isPending && (
          <div className="bg-background/60 pointer-events-none absolute inset-0 flex items-center justify-center rounded-md">
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <Loader2 className="size-3.5 animate-spin" />
              Extracting PDF text...
            </div>
          </div>
        )}
        {charCount > 0 && !extractMutation.isPending && (
          <span className="text-muted-foreground pointer-events-none absolute right-2 bottom-2 text-[10px]">
            {charCount.toLocaleString()} chars
          </span>
        )}
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFilePick}
      />
    </div>
  );
}
