"use client";

import * as React from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  Building2,
  ExternalLink,
  FileText,
  Lightbulb,
  MailCheck,
  MinusCircle,
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
      <ThinkingFlow />
      <VerdictBannerSkeleton />
      <SpreadSectionSkeleton />
      <SpreadSectionSkeleton />
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="text-foreground/40 size-4 shrink-0" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[94%]" />
          <Skeleton className="h-3 w-[88%]" />
          <Skeleton className="h-3 w-[72%]" />
          <Skeleton className="h-3 w-[80%]" />
          <Skeleton className="h-3 w-[64%]" />
        </div>
      </Card>
    </ResponseGrid>
  );
}

// "Agent is thinking" affordance. CV and JD nodes feed a center Copilot node
// via two CSS-animated beams (a small pulse sweeps along each line). Below,
// a status caption shimmers and rotates through the pipeline steps so the
// user sees the agent narrating itself rather than staring at a blank skeleton.
function ThinkingFlow() {
  const messages = React.useMemo(
    () => [
      "Parsing the CV…",
      "Reading the job description…",
      "Routing to the right branch…",
      "Analyzing the fit…",
      "Drafting the response…",
    ],
    [],
  );
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(
      () => setIdx((i) => (i + 1) % messages.length),
      1800,
    );
    return () => clearInterval(t);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="flex w-full max-w-md items-center gap-3">
        <FlowNode icon={FileText} label="CV" />
        <FlowBeam />
        <FlowNode icon={Sparkles} label="Copilot" highlight />
        <FlowBeam reverse />
        <FlowNode icon={Briefcase} label="JD" />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Career Copilot is</span>
        <span
          key={idx}
          className="animate-in fade-in bg-[linear-gradient(90deg,var(--muted-foreground)_0%,var(--foreground)_50%,var(--muted-foreground)_100%)] bg-[length:200%_100%] bg-clip-text font-medium text-transparent duration-500 [animation:career-shimmer_2.5s_linear_infinite]"
        >
          {messages[idx]}
        </span>
      </div>
    </div>
  );
}

function FlowNode({
  icon: Icon,
  label,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">
      <div
        className={cn(
          "bg-card flex size-12 items-center justify-center rounded-full border",
          highlight &&
            "border-emerald-500/40 ring-2 ring-emerald-500/20 ring-offset-2 ring-offset-background",
        )}
      >
        <Icon
          className={cn(
            "size-5",
            highlight
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-foreground/70",
          )}
        />
      </div>
      <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
        {label}
      </span>
    </div>
  );
}

function FlowBeam({ reverse }: { reverse?: boolean }) {
  return (
    <div className="bg-foreground/10 relative h-px flex-1 overflow-hidden">
      <div
        className={cn(
          "absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-emerald-500 to-transparent",
          reverse
            ? "[animation:career-beam-reverse_2.2s_linear_infinite]"
            : "[animation:career-beam-forward_2.2s_linear_infinite]",
        )}
      />
    </div>
  );
}

function VerdictBannerSkeleton() {
  return (
    <div className="bg-card flex flex-col gap-5 rounded-xl border p-6 md:flex-row md:items-start">
      <div className="flex shrink-0 flex-col items-start gap-2 md:w-48">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-28 rounded-md" />
      </div>
      <div className="border-border flex-1 md:border-l md:pl-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[92%]" />
          <Skeleton className="h-3 w-[64%]" />
        </div>
      </div>
    </div>
  );
}

function SpreadSectionSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <Skeleton className="size-4 rounded-full" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
      <div className="bg-card rounded-xl border p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:hidden">
          <SpreadCardSkeleton />
          <SpreadCardSkeleton />
        </div>
        <div className="mx-auto hidden w-fit items-end justify-center sm:flex">
          {[0, 1, 2].map((i) => {
            const offset = i - 1;
            const angle = offset * 5;
            const yShift = Math.abs(offset) * 6;
            const zBase = 10 - Math.abs(offset);
            return (
              <div
                key={i}
                style={{
                  transform: `translateY(${yShift}px) rotate(${angle}deg)`,
                  marginLeft: i === 0 ? 0 : "-2.25rem",
                  zIndex: zBase,
                }}
                className="origin-bottom"
              >
                <SpreadCardSkeleton />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SpreadCardSkeleton() {
  return (
    <div className="bg-card flex h-44 w-52 flex-col rounded-xl border p-4 shadow-md">
      <Skeleton className="mb-3 h-4 w-20 rounded-md" />
      <Skeleton className="mb-1.5 h-3 w-[88%]" />
      <Skeleton className="mb-3 h-3 w-[60%]" />
      <Skeleton className="mb-1.5 h-2.5 w-full" />
      <Skeleton className="mb-1.5 h-2.5 w-[92%]" />
      <Skeleton className="h-2.5 w-[70%]" />
    </div>
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
      <FitTriptych verdict={data.verdict} />
      <OutreachCard outreach={data.outreach} />
    </ResponseGrid>
  );
}

function RecruiterNoFitView({ data }: { data: RecruiterNoFitResponse }) {
  return (
    <ResponseGrid>
      <FitTriptych verdict={data.verdict} />
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

// Verdict banner + two Animata-style "card spread" sections. Each spread
// sits as a stack at rest, fans out on hover, and lays into a row on click.
// (See https://animata.design/docs/card/card-spread for the underlying
// pattern — adapted here for strengths/gaps mini-cards.)

type Tone = "emerald" | "amber" | "rose";

const TONE_TEXT: Record<Tone, string> = {
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  rose: "text-rose-600 dark:text-rose-400",
};

const TONE_BG: Record<Tone, string> = {
  emerald: "bg-emerald-500/10",
  amber: "bg-amber-500/10",
  rose: "bg-rose-500/10",
};

const TONE_BORDER: Record<Tone, string> = {
  emerald: "border-emerald-500/40",
  amber: "border-amber-500/40",
  rose: "border-rose-500/40",
};

function FitTriptych({ verdict }: { verdict: FitVerdict }) {
  const verdictTone: Tone =
    verdict.verdict === "fit"
      ? "emerald"
      : verdict.verdict === "borderline"
        ? "amber"
        : "rose";

  return (
    <div className="flex flex-col gap-4">
      <VerdictBanner verdict={verdict} tone={verdictTone} />
      <SpreadSection
        icon={BadgeCheck}
        label="Strengths"
        tone="emerald"
        singularLabel="Strength"
        emptyText="No strengths surfaced."
        items={verdict.strengths.map((s) => ({
          headline: s.claim,
          body: s.rationale,
        }))}
      />
      <SpreadSection
        icon={MinusCircle}
        label="Gaps"
        tone="rose"
        singularLabel="Gap"
        emptyText="No gaps identified."
        items={verdict.gaps.map((g) => ({
          headline: g.missing,
          body: g.impact,
        }))}
      />
    </div>
  );
}

function VerdictBanner({
  verdict,
  tone,
}: {
  verdict: FitVerdict;
  tone: Tone;
}) {
  return (
    <div
      className={cn(
        "bg-card flex flex-col gap-5 rounded-xl border p-6 transition-colors hover:border-foreground/20 md:flex-row md:items-start",
        TONE_BORDER[tone],
      )}
    >
      <div className="flex shrink-0 flex-col items-start gap-2 md:w-48">
        <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
          Fit verdict
        </span>
        <span
          className={cn(
            "text-3xl font-bold tracking-tight capitalize md:text-4xl",
            TONE_TEXT[tone],
          )}
        >
          {verdict.verdict.replace("_", " ")}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
            TONE_BG[tone],
            TONE_TEXT[tone],
          )}
        >
          confidence {verdict.confidence}/10
        </span>
      </div>
      <div className="border-border flex-1 md:border-l md:pl-5">
        <p className="text-foreground/90 text-sm leading-relaxed">
          {verdict.summary}
        </p>
      </div>
    </div>
  );
}

type SpreadItem = { headline: string; body: string };

// Cards splay out symmetrically from the center: small alternating tilt,
// further-from-center cards sit slightly lower and overlap their neighbours.
// Pattern adapted from animata.design/docs/hero/product-features (without
// motion/react — pure CSS transforms + tw-animate-css for the entrance).
function SpreadSection({
  icon: Icon,
  label,
  tone,
  singularLabel,
  emptyText,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: Tone;
  singularLabel: string;
  emptyText: string;
  items: SpreadItem[];
}) {
  const count = items.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <Icon className={cn("size-4", TONE_TEXT[tone])} />
        <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
          {label}
        </span>
        {count > 0 && (
          <span
            className={cn(
              "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wider",
              TONE_BG[tone],
              TONE_TEXT[tone],
            )}
          >
            {count} {count === 1 ? "point" : "points"}
          </span>
        )}
      </div>
      {count === 0 ? (
        <div className="bg-card rounded-xl border p-5">
          <p className="text-muted-foreground text-sm">{emptyText}</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-6 transition-colors hover:border-foreground/20 sm:p-8">
          {/* Mobile: simple stack */}
          <div className="flex flex-col gap-3 sm:hidden">
            {items.map((item, i) => (
              <SpreadCard
                key={i}
                headline={item.headline}
                body={item.body}
                tone={tone}
                label={`${singularLabel} ${i + 1}`}
              />
            ))}
          </div>
          {/* Desktop: fanned overlap */}
          <div className="mx-auto hidden w-fit items-end justify-center sm:flex">
            {items.map((item, i) => {
              const offset = i - (count - 1) / 2;
              const angle = offset * 5;
              const yShift = Math.abs(offset) * 6;
              const zBase = 10 - Math.round(Math.abs(offset));
              return (
                <div
                  key={i}
                  style={
                    {
                      "--rest-rot": `${angle}deg`,
                      "--rest-y": `${yShift}px`,
                      "--rest-z": zBase,
                      "--rest-ml": i === 0 ? "0px" : "-2.25rem",
                      animationDelay: `${i * 80}ms`,
                    } as React.CSSProperties
                  }
                  className={cn(
                    "animate-in fade-in slide-in-from-bottom-4 origin-bottom transition-all duration-300 ease-out",
                    "z-[var(--rest-z)] [margin-left:var(--rest-ml)]",
                    "[transform:translateY(var(--rest-y))_rotate(var(--rest-rot))]",
                    "hover:z-20 hover:[transform:translateY(-10px)_rotate(0deg)_scale(1.08)]",
                  )}
                >
                  <SpreadCard
                    headline={item.headline}
                    body={item.body}
                    tone={tone}
                    label={`${singularLabel} ${i + 1}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SpreadCard({
  headline,
  body,
  tone,
  label,
}: {
  headline: string;
  body: string;
  tone: Tone;
  label: string;
}) {
  return (
    <div
      className={cn(
        "bg-card flex h-44 w-52 flex-col rounded-xl border p-4 shadow-md",
        TONE_BORDER[tone],
      )}
    >
      <div
        className={cn(
          "mb-2 inline-flex w-max items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase",
          TONE_BG[tone],
          TONE_TEXT[tone],
        )}
      >
        {label}
      </div>
      <p className="text-foreground mb-1.5 line-clamp-3 text-xs leading-snug font-semibold">
        {headline}
      </p>
      <p className="text-muted-foreground min-h-0 flex-1 overflow-y-auto text-[11px] leading-relaxed">
        {body}
      </p>
    </div>
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
  return <div className="flex flex-col gap-4">{children}</div>;
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

function hostFor(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
