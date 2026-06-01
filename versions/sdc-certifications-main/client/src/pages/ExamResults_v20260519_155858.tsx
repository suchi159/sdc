import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SDCLayout from "@/components/SDCLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, XCircle, Trophy, TrendingUp, Clock, RotateCcw,
  Award, BarChart3, ArrowLeft, Share2, BookOpen, LogIn, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const trpcAny = trpc as any;

export default function ExamResults() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const id = parseInt(attemptId || "0", 10);
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !!user;

  const { data, isLoading, error } = trpcAny.exams.attempts.getResult.useQuery(
    { attemptId: id },
    { enabled: !!id && isAuthed }
  );

  if (authLoading) {
    return (
      <SDCLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SDCLayout>
    );
  }

  if (!isAuthed) {
    return (
      <SDCLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <div className="max-w-sm w-full text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Sign In Required</h2>
            <p className="text-muted-foreground">
              You must be signed in to view exam results.
            </p>
            <Button
              className="w-full"
              onClick={() => window.location.href = getLoginUrl(`/candidate/results/${id}`)}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In to Continue
            </Button>
          </div>
        </div>
      </SDCLayout>
    );
  }

  if (isLoading) {
    return (
      <SDCLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
        </div>
      </SDCLayout>
    );
  }

  if (error || !data) {
    return (
      <SDCLayout>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Result Not Found</h2>
          <p className="text-slate-400 mb-6">This exam result does not exist or you do not have permission to view it.</p>
          <Link href="/candidate">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </SDCLayout>
    );
  }

  const { attempt, exam, percentile, attemptsUsed, allowedAttempts, canRetake, categoryScores } = data as {
    attempt: Record<string, unknown>;
    exam: Record<string, unknown> | null;
    percentile: number;
    attemptsUsed: number;
    allowedAttempts: number;
    canRetake: boolean;
    categoryScores: Record<string, { correct: number; total: number; pct: number }>;
  };

  const score = parseFloat((attempt.score as string | null)?.toString() || "0");
  const passingScore = parseFloat((exam?.passingScore as string | null)?.toString() || "70");
  const passed = (attempt.passed as boolean | null) ?? score >= passingScore;
  const completedAt = attempt.completedAt as string | Date | null;
  const startedAt = attempt.startedAt as string | Date | null;
  const timeTaken = startedAt && completedAt
    ? Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000)
    : null;

  const hasCategoryScores = Object.keys(categoryScores).length > 0;

  const displayCategories = hasCategoryScores
    ? Object.entries(categoryScores).map(([name, s]) => ({ name, pct: s.pct, correct: s.correct, total: s.total }))
    : [
        { name: "Core Concepts", pct: Math.min(100, Math.round(score * 1.05)), correct: 0, total: 0 },
        { name: "Applied Knowledge", pct: Math.min(100, Math.round(score * 0.95)), correct: 0, total: 0 },
        { name: "Problem Solving", pct: Math.min(100, Math.round(score * 1.02)), correct: 0, total: 0 },
        { name: "Best Practices", pct: Math.min(100, Math.round(score * 0.98)), correct: 0, total: 0 },
      ];

  return (
    <SDCLayout>
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        {/* Back link */}
        <Link href="/candidate">
          <button className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </Link>

        {/* Hero result card */}
        <Card className={`border-0 shadow-xl overflow-hidden ${
          passed
            ? "bg-gradient-to-br from-emerald-900/60 to-slate-900 border border-emerald-700/30"
            : "bg-gradient-to-br from-red-900/40 to-slate-900 border border-red-700/30"
        }`}>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Status icon */}
              <div className={`w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0 ${
                passed ? "bg-emerald-500/20 border-2 border-emerald-500" : "bg-red-500/20 border-2 border-red-500"
              }`}>
                {passed
                  ? <Trophy className="w-12 h-12 text-emerald-400" />
                  : <XCircle className="w-12 h-12 text-red-400" />
                }
              </div>

              {/* Result info */}
              <div className="flex-1 text-center md:text-left">
                <Badge className={`mb-2 text-sm px-3 py-1 ${passed ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
                  {passed ? "PASSED" : "DID NOT PASS"}
                </Badge>
                <h1 className="text-2xl font-bold text-white mb-1">{(exam?.title as string) ?? "Exam"}</h1>
                <p className="text-slate-400 text-sm">
                  Completed {completedAt
                    ? new Date(completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                    : "—"}
                </p>
              </div>

              {/* Score circle */}
              <div className="text-center">
                <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 ${
                  passed ? "border-emerald-500 bg-emerald-900/30" : "border-red-500 bg-red-900/30"
                }`}>
                  <span className={`text-4xl font-bold ${passed ? "text-emerald-300" : "text-red-300"}`}>
                    {score.toFixed(0)}%
                  </span>
                  <span className="text-xs text-slate-400">Score</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Pass mark: {passingScore.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{percentile}th</p>
              <p className="text-xs text-slate-400">Percentile</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{timeTaken ?? "—"}</p>
              <p className="text-xs text-slate-400">Minutes taken</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <RotateCcw className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{attemptsUsed}/{allowedAttempts}</p>
              <p className="text-xs text-slate-400">Attempts used</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">
                {score >= passingScore ? "+" : ""}{(score - passingScore).toFixed(0)}%
              </p>
              <p className="text-xs text-slate-400">vs. pass mark</p>
            </CardContent>
          </Card>
        </div>

        {/* Category breakdown */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              Performance by Category
              {!hasCategoryScores && (
                <Badge variant="outline" className="text-xs text-slate-400 border-slate-600 ml-2">Estimated</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayCategories.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{cat.name}</span>
                  <span className={`font-semibold ${cat.pct >= passingScore ? "text-emerald-400" : "text-red-400"}`}>
                    {cat.pct}%
                    {hasCategoryScores && <span className="text-slate-500 font-normal ml-1">({cat.correct}/{cat.total})</span>}
                  </span>
                </div>
                <Progress value={cat.pct} className="h-2 bg-slate-700" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {passed && (attempt.credentialId as number | null) && (
            <Link href="/candidate/wallet">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                <Award className="w-4 h-4" />
                View Certificate
              </Button>
            </Link>
          )}
          {!passed && canRetake && (
            <Link href="/candidate/schedule">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <RotateCcw className="w-4 h-4" />
                Schedule Retake
              </Button>
            </Link>
          )}
          {!passed && (
            <Link href="/books">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white gap-2">
                <BookOpen className="w-4 h-4" />
                Study Materials
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:text-white gap-2"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Result link copied to clipboard");
            }}
          >
            <Share2 className="w-4 h-4" />
            Share Result
          </Button>
        </div>

        {/* Retake eligibility notice */}
        {!passed && !canRetake && (
          <Card className="bg-orange-900/20 border-orange-700/30">
            <CardContent className="p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-orange-300 font-medium text-sm">Maximum attempts reached</p>
                <p className="text-slate-400 text-sm mt-0.5">
                  You have used all {allowedAttempts} allowed attempt{allowedAttempts !== 1 ? "s" : ""} for this exam.
                  Please contact your organisation administrator to request an additional attempt.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All attempts history */}
        <AllAttemptsHistory examId={attempt.examId as number} currentAttemptId={attempt.id as number} />
      </div>
    </SDCLayout>
  );
}

function AllAttemptsHistory({ examId, currentAttemptId }: { examId: number; currentAttemptId: number }) {
  const { data: allAttempts } = trpcAny.exams.attempts.myAttempts.useQuery();
  const examAttempts = ((allAttempts as unknown[]) || []).filter((r: unknown) => (r as Record<string, Record<string, unknown>>).attempt.examId === examId);

  if (examAttempts.length <= 1) return null;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-slate-400" />
          All Attempts for This Exam
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {examAttempts.map((row: unknown) => {
            const { attempt } = row as { attempt: Record<string, unknown> };
            const s = parseFloat((attempt.score as string | null)?.toString() || "0");
            const isCurrent = attempt.id === currentAttemptId;
            const completedAt = attempt.completedAt as string | Date | null;
            return (
              <div key={attempt.id as number} className={`flex items-center justify-between p-3 rounded-lg ${
                isCurrent ? "bg-amber-900/20 border border-amber-700/30" : "bg-slate-700/30"
              }`}>
                <div className="flex items-center gap-3">
                  {attempt.passed
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    : <XCircle className="w-4 h-4 text-red-400" />
                  }
                  <div>
                    <p className="text-sm text-white">
                      {completedAt ? new Date(completedAt).toLocaleDateString() : "In Progress"}
                      {isCurrent && <Badge className="ml-2 text-xs bg-amber-600 text-white">Current</Badge>}
                    </p>
                    <p className="text-xs text-slate-400">{attempt.status as string}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${attempt.passed ? "text-emerald-400" : "text-red-400"}`}>
                    {s.toFixed(0)}%
                  </span>
                  {!isCurrent && attempt.status === "completed" && (
                    <Link href={`/candidate/results/${attempt.id as number}`}>
                      <Button size="sm" variant="outline" className="text-xs border-slate-600 text-slate-400">
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
