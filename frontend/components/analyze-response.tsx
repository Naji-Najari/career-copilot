"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  ExternalLink,
  Lightbulb,
  MailCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  isCandidate,
  isRecruiterFit,
  isRecruiterNoFit,
  type AnalyzeResponse,
  type CandidateResponse,
  type FitVerdict,
  type GapReport,
  type InterviewPrepBundle,
  type OutreachDraft,
  type RecruiterFitResponse,
  type RecruiterNoFitResponse,
} from "@/lib/api";
import type { AnalyzeInput } from "@/lib/schemas";

type MutationState = UseMutationResult<
  AnalyzeResponse,
  Error,
  AnalyzeInput,
  unknown
>;

export function AnalyzeResponseView({ mutation }: { mutation: MutationState }) {
  if (mutation.isPending) return <LoadingState />;
  if (mutation.isError) return <ErrorState message={mutation.error.message} />;
  if (mutation.isSuccess) return <SuccessState data={mutation.data} />;
  return <IdleState />;
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

function IdleState() {
  return (
    <Card>
      <CardHeader icon={Sparkles} title="Agent response" />
      <p className="text-muted-foreground text-sm leading-relaxed">
        Fill the form on the left and click Analyze. The agent output will
        appear here.
      </p>
    </Card>
  );
}

function LoadingState() {
  return (
    <ResponseGrid>
      <Card>
        <CardHeader icon={Sparkles} title="Running the agent" />
        <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
          This can take up to ~15 seconds in candidate mode (Tavily research).
        </p>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </Card>
      <Card>
        <CardHeader icon={Sparkles} title="Preparing output" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      </Card>
    </ResponseGrid>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <TriangleAlert />
      <AlertTitle>The agent run failed</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Check that the backend is running and reachable from the Next.js
          server (see <code>BACKEND_URL</code>).
        </p>
      </AlertDescription>
    </Alert>
  );
}

function SuccessState({ data }: { data: AnalyzeResponse }) {
  if (isRecruiterFit(data)) return <RecruiterFitView data={data} />;
  if (isRecruiterNoFit(data)) return <RecruiterNoFitView data={data} />;
  if (isCandidate(data)) return <CandidateView data={data} />;
  return null;
}

// ---------------------------------------------------------------------------
// Mode views — side-by-side cards
// ---------------------------------------------------------------------------

function RecruiterFitView({ data }: { data: RecruiterFitResponse }) {
  return (
    <ResponseGrid>
      <VerdictCard verdict={data.verdict} />
      <OutreachCard outreach={data.outreach} />
    </ResponseGrid>
  );
}

function RecruiterNoFitView({ data }: { data: RecruiterNoFitResponse }) {
  return (
    <ResponseGrid>
      <VerdictCard verdict={data.verdict} />
      <GapCard gap={data.gap} />
    </ResponseGrid>
  );
}

function CandidateView({ data }: { data: CandidateResponse }) {
  return (
    <ResponseGrid>
      <CompanyCard company={data.prep.company} />
      <InterviewPrepCard prep={data.prep.interview_prep} />
    </ResponseGrid>
  );
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

function VerdictCard({ verdict }: { verdict: FitVerdict }) {
  const tone =
    verdict.verdict === "fit"
      ? "emerald"
      : verdict.verdict === "borderline"
        ? "amber"
        : "rose";

  return (
    <Card>
      <CardHeader
        icon={BadgeCheck}
        title="Fit verdict"
        meta={
          <VerdictPill verdict={verdict.verdict} confidence={verdict.confidence} />
        }
      />
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
        {verdict.notes}
      </p>
      {verdict.matched_evidence.length > 0 && (
        <SubSection title="Matched evidence" className="mb-4">
          <BulletList items={verdict.matched_evidence} tone={tone} />
        </SubSection>
      )}
      {verdict.gaps.length > 0 && (
        <SubSection title="Gaps">
          <BulletList items={verdict.gaps} />
        </SubSection>
      )}
    </Card>
  );
}

function OutreachCard({ outreach }: { outreach: OutreachDraft }) {
  return (
    <Card>
      <CardHeader icon={MailCheck} title={outreach.subject_line} />
      <pre className="text-foreground/90 mb-4 text-sm leading-relaxed whitespace-pre-wrap font-sans">
        {outreach.body}
      </pre>
      <div className="border-border border-t pt-3">
        <p className="text-muted-foreground text-xs leading-relaxed">
          <span className="text-foreground/80 font-semibold">
            Cited achievement:
          </span>{" "}
          {outreach.referenced_achievement}
        </p>
      </div>
    </Card>
  );
}

function GapCard({ gap }: { gap: GapReport }) {
  return (
    <Card>
      <CardHeader icon={AlertTriangle} title="Gap report" />
      <SubSection title="Gaps" className="mb-4">
        <BulletList items={gap.gaps} />
      </SubSection>
      <SubSection title="Why this isn't a fit" className="mb-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {gap.explanation}
        </p>
      </SubSection>
      {gap.adjacent_roles.length > 0 && (
        <SubSection title="Adjacent roles to consider">
          <div className="flex flex-wrap gap-2">
            {gap.adjacent_roles.map((role) => (
              <Pill key={role}>{role}</Pill>
            ))}
          </div>
        </SubSection>
      )}
    </Card>
  );
}

function CompanyCard({
  company,
}: {
  company: CandidateResponse["prep"]["company"];
}) {
  return (
    <Card>
      <CardHeader
        icon={Building2}
        title={company.company_name}
        meta={
          company.funding_stage ? (
            <span className="text-muted-foreground text-xs">
              {company.funding_stage}
            </span>
          ) : null
        }
      />

      {company.is_likely_agency_posting && (
        <Alert variant="destructive" className="mb-4">
          <TriangleAlert />
          <AlertTitle>Agency posting detected</AlertTitle>
          <AlertDescription>
            {company.probable_real_employer ? (
              <p>
                Probable real employer:{" "}
                <span className="font-medium">
                  {company.probable_real_employer}
                </span>
              </p>
            ) : (
              <p>
                The real employer could not be identified from the research.
              </p>
            )}
            {company.agency_evidence.length > 0 && (
              <ul className="mt-1 list-disc pl-4 text-xs">
                {company.agency_evidence.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {company.recent_news.length > 0 && (
        <SubSection title="Recent news" className="mb-4">
          <BulletList items={company.recent_news} />
        </SubSection>
      )}
      {company.culture_signals.length > 0 && (
        <SubSection title="Culture signals" className="mb-4">
          <BulletList items={company.culture_signals} />
        </SubSection>
      )}
      {company.interview_process_hints.length > 0 && (
        <SubSection title="Interview process hints" className="mb-4">
          <BulletList items={company.interview_process_hints} />
        </SubSection>
      )}
      {company.sources.length > 0 && (
        <SubSection title="Sources">
          <div className="flex flex-wrap gap-2">
            {company.sources.map((url) => (
              <SourceLink key={url} url={url} />
            ))}
          </div>
        </SubSection>
      )}
    </Card>
  );
}

function InterviewPrepCard({ prep }: { prep: InterviewPrepBundle }) {
  return (
    <Card>
      <CardHeader icon={Lightbulb} title="Interview prep" />
      {prep.probable_questions.length > 0 && (
        <SubSection title="Probable questions" className="mb-4">
          <BulletList items={prep.probable_questions} />
        </SubSection>
      )}
      {prep.talking_points.length > 0 && (
        <SubSection title="Talking points" className="mb-4">
          <BulletList items={prep.talking_points} />
        </SubSection>
      )}
      {prep.reverse_questions.length > 0 && (
        <SubSection title="Smart reverse questions">
          <BulletList items={prep.reverse_questions} />
        </SubSection>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

function ResponseGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-4 md:grid-cols-2">{children}</div>
  );
}

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group bg-card rounded-xl border p-6 transition-colors",
        "hover:border-foreground/20",
        className,
      )}
    >
      {children}
    </div>
  );
}

function CardHeader({
  icon: Icon,
  title,
  meta,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  meta?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {Icon && <Icon className="text-foreground/70 size-4 shrink-0" />}
        <h3 className="text-foreground truncate text-base font-bold">
          {title}
        </h3>
      </div>
      {meta && <div className="shrink-0">{meta}</div>}
    </div>
  );
}

function SubSection({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <h4 className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
        {title}
      </h4>
      {children}
    </div>
  );
}

type BulletTone = "default" | "emerald" | "amber" | "rose";

function BulletList({
  items,
  tone = "default",
}: {
  items: string[];
  tone?: BulletTone;
}) {
  const bulletColor =
    tone === "emerald"
      ? "before:text-emerald-600 dark:before:text-emerald-400"
      : tone === "amber"
        ? "before:text-amber-600 dark:before:text-amber-400"
        : tone === "rose"
          ? "before:text-rose-600 dark:before:text-rose-400"
          : "before:text-foreground";

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li
          key={i}
          className={cn(
            "text-muted-foreground relative ps-4 text-sm leading-relaxed",
            "before:absolute before:start-0 before:font-bold before:content-['·']",
            bulletColor,
          )}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function Pill({
  children,
  highlight,
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs",
        highlight
          ? "bg-foreground/5 text-foreground border-transparent font-semibold"
          : "text-muted-foreground border-border",
      )}
    >
      {children}
    </span>
  );
}

function SourceLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-muted-foreground hover:text-foreground hover:border-foreground/30 focus-visible:ring-ring/50 focus-visible:border-ring group/link inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors outline-none focus-visible:ring-[3px]"
    >
      <ExternalLink className="size-3" />
      <span className="truncate max-w-[200px]">{hostFor(url)}</span>
      <ArrowUpRight className="size-3 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
    </a>
  );
}

function VerdictPill({
  verdict,
  confidence,
}: {
  verdict: FitVerdict["verdict"];
  confidence: number;
}) {
  const styles =
    verdict === "fit"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : verdict === "borderline"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
        : "bg-rose-500/10 text-rose-700 dark:text-rose-400";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold capitalize",
        styles,
      )}
    >
      {verdict.replace("_", " ")}
      <span className="text-foreground/50 ms-1 font-normal">
        · {confidence}/10
      </span>
    </span>
  );
}

function hostFor(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
