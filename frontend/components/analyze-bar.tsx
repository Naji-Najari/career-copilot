"use client";

import { ArrowLeft, Loader2, RefreshCw, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Mode } from "@/lib/schemas";

type Props = {
  mode: Mode;
  cvChars: number;
  jdChars: number;
  pending: boolean;
  onEdit: () => void;
  onRunAgain: () => void;
};

export function AnalyzeBar({
  mode,
  cvChars,
  jdChars,
  pending,
  onEdit,
  onRunAgain,
}: Props) {
  return (
    <div className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5 md:px-6">
        <div className="flex items-center gap-2">
          <div className="bg-foreground text-background flex size-6 items-center justify-center rounded">
            <Sparkles className="size-3" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            career-copilot
          </span>
        </div>

        <div className="bg-border mx-1 h-5 w-px" />

        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          <Badge variant="secondary" className="capitalize">
            {mode}
          </Badge>
          <span className="text-muted-foreground hidden truncate text-xs md:inline">
            {cvChars.toLocaleString()} chars CV · {jdChars.toLocaleString()} chars JD
          </span>
          {pending && (
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
              <Loader2 className="size-3 animate-spin" />
              Analyzing...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
            disabled={pending}
          >
            <ArrowLeft className="size-3.5" />
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRunAgain}
            disabled={pending}
          >
            <RefreshCw className={pending ? "size-3.5 animate-spin" : "size-3.5"} />
            Run again
          </Button>
        </div>
      </div>
    </div>
  );
}
