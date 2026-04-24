"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import {
  CheckCircle2,
  FileUp,
  Loader2,
  Pencil,
  Type,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { fetchExtractPdf } from "@/lib/api";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
};

type Source = "text" | "pdf" | null;
type PdfMeta = { filename: string; bytes: number };

export function DocumentInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  error,
}: Props) {
  const [source, setSource] = React.useState<Source>(null);
  const [pdfMeta, setPdfMeta] = React.useState<PdfMeta | null>(null);
  const [expanded, setExpanded] = React.useState(false);
  const pendingMeta = React.useRef<PdfMeta | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const extractMutation = useMutation({
    mutationFn: fetchExtractPdf,
    onSuccess: (res) => {
      const meta = pendingMeta.current;
      pendingMeta.current = null;
      if (!meta) return;
      onChange(res.text);
      setPdfMeta(meta);
      setSource("pdf");
      setExpanded(false);
      toast.success(`${label} ready — ${meta.filename} loaded.`);
    },
    onError: (err: Error) => {
      pendingMeta.current = null;
      toast.error(err.message || "Could not extract text from the PDF.");
    },
  });

  // Parent-driven clear — resync provenance.
  React.useEffect(() => {
    if (value === "" && source !== null) {
      setSource(null);
      setPdfMeta(null);
      setExpanded(false);
    }
  }, [value, source]);

  function openPicker() {
    fileRef.current?.click();
  }

  function handleFilePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("PDF only, please.");
      return;
    }
    pendingMeta.current = { filename: file.name, bytes: file.size };
    extractMutation.mutate(file);
  }

  function handleClear() {
    onChange("");
    setSource(null);
    setPdfMeta(null);
    setExpanded(false);
  }

  const busy = disabled || extractMutation.isPending;
  const hasContent = value.length > 0 || source !== null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase"
        >
          {label}
        </label>
        {hasContent && (
          <button
            type="button"
            onClick={handleClear}
            disabled={busy}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px] transition-colors disabled:opacity-50"
          >
            <X className="size-3" />
            Clear
          </button>
        )}
      </div>

      {/* Empty — two choice cards mirroring the ModeSelector pattern */}
      {source === null && !extractMutation.isPending && (
        <div className="grid grid-cols-2 gap-2">
          <ChoiceCard
            icon={Type}
            title="Paste text"
            description={`Copy the ${label.toLowerCase()} from anywhere.`}
            disabled={busy}
            onClick={() => {
              setSource("text");
              requestAnimationFrame(() =>
                document.getElementById(id)?.focus(),
              );
            }}
          />
          <ChoiceCard
            icon={FileUp}
            title="Upload PDF"
            description="We extract the text automatically."
            disabled={busy}
            onClick={openPicker}
          />
        </div>
      )}

      {/* Extracting */}
      {extractMutation.isPending && (
        <div className="border-border bg-muted/30 text-muted-foreground flex items-center justify-center gap-2 rounded-md border border-dashed px-3 py-4 text-xs">
          <Loader2 className="size-3.5 animate-spin" />
          Extracting{" "}
          <span className="text-foreground font-medium">
            {pendingMeta.current?.filename}
          </span>
          ...
        </div>
      )}

      {/* PDF loaded */}
      {source === "pdf" && pdfMeta && !extractMutation.isPending && (
        <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {pdfMeta.filename}
              </div>
              <div className="text-muted-foreground text-xs">
                {formatBytes(pdfMeta.bytes)} ·{" "}
                {value.length.toLocaleString()} chars
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setExpanded((v) => !v)}
              disabled={busy}
            >
              <Pencil className="size-3.5" />
              {expanded ? "Hide" : "Edit"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={openPicker}
              disabled={busy}
            >
              <FileUp className="size-3.5" />
              Replace
            </Button>
          </div>
          {expanded && (
            <Textarea
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={8}
              disabled={busy}
              className="resize-none"
            />
          )}
        </div>
      )}

      {/* Text paste */}
      {source === "text" && (
        <div className="relative">
          <Textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={9}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            disabled={busy}
            className="resize-none leading-relaxed"
          />
          {value.length > 0 && (
            <span className="text-muted-foreground pointer-events-none absolute right-2 bottom-2 text-[10px]">
              {value.length.toLocaleString()} chars
            </span>
          )}
        </div>
      )}

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

function ChoiceCard({
  icon: Icon,
  title,
  description,
  disabled,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "focus-visible:ring-ring/50 focus-visible:border-ring group relative flex flex-col items-start gap-1.5 rounded-lg border px-3.5 py-3 text-left transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60",
        "border-border bg-card hover:bg-accent hover:border-accent-foreground/20",
      )}
    >
      <Icon className="text-muted-foreground size-4" />
      <span className="text-foreground/80 text-sm font-medium">{title}</span>
      <span className="text-muted-foreground text-[11px] leading-snug">
        {description}
      </span>
    </button>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
