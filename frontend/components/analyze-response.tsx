"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  ExternalLink,
  Lightbulb,
  MailCheck,
  MessageSquare,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

function IdleState() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-muted-foreground size-5" />
          Agent response
        </CardTitle>
        <CardDescription>
          Fill the form on the left and click Analyze. The agent output will
          appear here.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-muted-foreground size-5 animate-pulse" />
            Running the agent...
          </CardTitle>
          <CardDescription>
            This can take up to ~15 seconds in candidate mode (Tavily research).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col gap-3 py-6">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </CardContent>
      </Card>
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
          Check that the backend is running at the URL in{" "}
          <code>NEXT_PUBLIC_API_URL</code>.
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

// ---------- Recruiter: fit / borderline ----------

function RecruiterFitView({ data }: { data: RecruiterFitResponse }) {
  return (
    <div className="flex flex-col gap-4">
      <VerdictCard verdict={data.verdict} />
      <OutreachCard outreach={data.outreach} />
    </div>
  );
}

// ---------- Recruiter: no_fit ----------

function RecruiterNoFitView({ data }: { data: RecruiterNoFitResponse }) {
  return (
    <div className="flex flex-col gap-4">
      <VerdictCard verdict={data.verdict} />
      <GapCard gap={data.gap} />
    </div>
  );
}

// ---------- Candidate ----------

function CandidateView({ data }: { data: CandidateResponse }) {
  return (
    <div className="flex flex-col gap-4">
      <CompanyCard company={data.prep.company} />
      <InterviewPrepCard prep={data.prep.interview_prep} />
    </div>
  );
}

// ---------- Sub-cards ----------

function verdictBadgeVariant(v: FitVerdict["verdict"]) {
  switch (v) {
    case "fit":
      return "default" as const;
    case "borderline":
      return "secondary" as const;
    case "no_fit":
      return "destructive" as const;
  }
}

function VerdictCard({ verdict }: { verdict: FitVerdict }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="flex items-center gap-2">
            <BadgeCheck className="text-muted-foreground size-5" />
            Fit verdict
          </CardTitle>
          <Badge variant={verdictBadgeVariant(verdict.verdict)}>
            {verdict.verdict.replace("_", " ")}
          </Badge>
          <span className="text-muted-foreground text-xs">
            confidence {verdict.confidence}/10
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed">{verdict.notes}</p>
        {verdict.matched_evidence.length > 0 && (
          <BulletList title="Matched evidence" items={verdict.matched_evidence} />
        )}
        {verdict.gaps.length > 0 && (
          <BulletList title="Gaps" items={verdict.gaps} />
        )}
      </CardContent>
    </Card>
  );
}

function OutreachCard({ outreach }: { outreach: OutreachDraft }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MailCheck className="text-muted-foreground size-5" />
          {outreach.subject_line}
        </CardTitle>
        <CardDescription>Outreach draft — ready to send.</CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
          {outreach.body}
        </pre>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <p className="text-muted-foreground text-xs">
          <span className="font-medium">Cited achievement:</span>{" "}
          {outreach.referenced_achievement}
        </p>
      </CardFooter>
    </Card>
  );
}

function GapCard({ gap }: { gap: GapReport }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="text-muted-foreground size-5" />
          Gap report
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <BulletList title="Gaps" items={gap.gaps} />
        <div>
          <h4 className="mb-1 text-sm font-medium">Why this isn't a fit</h4>
          <p className="text-sm leading-relaxed">{gap.explanation}</p>
        </div>
        {gap.adjacent_roles.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium">Adjacent roles to consider</h4>
            <div className="flex flex-wrap gap-2">
              {gap.adjacent_roles.map((role) => (
                <Badge key={role} variant="outline">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="text-muted-foreground size-5" />
          {company.company_name}
        </CardTitle>
        {company.funding_stage && (
          <CardDescription>{company.funding_stage}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {company.is_likely_agency_posting && (
          <Alert variant="destructive">
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
                <p>The real employer could not be identified from the research.</p>
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
          <BulletList title="Recent news" items={company.recent_news} />
        )}
        {company.culture_signals.length > 0 && (
          <BulletList title="Culture signals" items={company.culture_signals} />
        )}
        {company.interview_process_hints.length > 0 && (
          <BulletList
            title="Interview process hints"
            items={company.interview_process_hints}
          />
        )}
        {company.sources.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium">Sources</h4>
            <div className="flex flex-wrap gap-2">
              {company.sources.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-visible:ring-ring/50 focus-visible:border-ring inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px]"
                >
                  <ExternalLink className="size-3" />
                  {hostFor(url)}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InterviewPrepCard({ prep }: { prep: InterviewPrepBundle }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-muted-foreground size-5" />
          Interview prep
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {prep.probable_questions.length > 0 && (
          <BulletList
            title="Probable questions"
            items={prep.probable_questions}
            icon={<MessageSquare className="mt-0.5 size-3.5 shrink-0" />}
          />
        )}
        {prep.talking_points.length > 0 && (
          <BulletList title="Talking points" items={prep.talking_points} />
        )}
        {prep.reverse_questions.length > 0 && (
          <BulletList
            title="Smart reverse questions"
            items={prep.reverse_questions}
          />
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Shared ----------

function BulletList({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-medium">{title}</h4>
      <ul className="flex flex-col gap-1.5 text-sm leading-relaxed">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            {icon ?? <span className="text-muted-foreground mt-2 size-1 rounded-full bg-current" />}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function hostFor(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
