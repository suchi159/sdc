/**
 * Psychometric Report Page
 * Displays item statistics, Cronbach's Alpha, IRT parameters, and AES score
 * distribution for a selected exam. Allows downloading a Word-style PDF report.
 */
import SDCLayout from "@/components/SDCLayout";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Loader2, Download, BarChart3, BookOpen, TrendingUp, AlertTriangle,
  CheckCircle2, FileText, Info, ChevronDown, ChevronUp
} from "lucide-react";

const ALPHA_LABEL = (a: number) => {
  if (a >= 0.9) return { label: "Excellent", color: "text-green-600 bg-green-50 dark:bg-green-900/20" };
  if (a >= 0.8) return { label: "Good", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" };
  if (a >= 0.7) return { label: "Acceptable", color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20" };
  return { label: "Needs Improvement", color: "text-red-600 bg-red-50 dark:bg-red-900/20" };
};

const FLAG_COLORS: Record<string, string> = {
  low_discrimination: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
  too_easy: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
  too_hard: "text-red-600 bg-red-50 dark:bg-red-900/20",
};

const FLAG_LABELS: Record<string, string> = {
  low_discrimination: "Low Discrimination",
  too_easy: "Too Easy",
  too_hard: "Too Hard",
};

export default function PsychometricReport() {
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [showAllItems, setShowAllItems] = useState(false);

  const { data: exams = [], isLoading: examsLoading } = trpc.psychometricReport.listExams.useQuery();

  const { data: summary, isLoading: summaryLoading } = trpc.psychometricReport.examSummary.useQuery(
    { examId: selectedExamId! },
    { enabled: !!selectedExamId }
  );

  const generateMutation = trpc.psychometricReport.generateReport.useMutation({
    onSuccess: (data) => {
      toast.success("Report generated! Opening download...");
      window.open(data.url, "_blank");
    },
    onError: (e) => toast.error(`Failed to generate report: ${e.message}`),
  });

  const displayedItems = showAllItems
    ? (summary?.itemStats ?? [])
    : (summary?.itemStats ?? []).slice(0, 15);

  const alphaInfo = summary ? ALPHA_LABEL(summary.cronbachAlpha) : null;

  return (
    <SDCLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Psychometric Report
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Item statistics, Cronbach's Alpha, IRT parameters, and AES score distribution
          </p>
        </div>
        {selectedExamId && (
          <Button
            onClick={() => generateMutation.mutate({ examId: selectedExamId })}
            disabled={generateMutation.isPending || !summary}
            className="gap-2"
          >
            {generateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {generateMutation.isPending ? "Generating PDF..." : "Download PDF Report"}
          </Button>
        )}
      </div>

      {/* Exam Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Select Exam:</label>
            <Select
              value={selectedExamId ? String(selectedExamId) : ""}
              onValueChange={v => setSelectedExamId(Number(v))}
            >
              <SelectTrigger className="w-72">
                <SelectValue placeholder={examsLoading ? "Loading exams..." : "Choose an exam to analyze"} />
              </SelectTrigger>
              <SelectContent>
                {exams.map(e => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.title}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({e.totalQuestions ?? "?"} items · {e.status})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {exams.length === 0 && !examsLoading && (
              <p className="text-sm text-muted-foreground">No exams found. Create an exam first.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {summaryLoading && (
        <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading psychometric data...</span>
        </div>
      )}

      {/* Summary Stats */}
      {summary && !summaryLoading && (
        <>
          {/* Test-Level Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{summary.totalItems}</p>
                    <p className="text-xs text-muted-foreground">Total Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{summary.totalAttempts}</p>
                    <p className="text-xs text-muted-foreground">Total Attempts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{summary.flaggedItems}</p>
                    <p className="text-xs text-muted-foreground">Flagged Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{summary.publishedItems}</p>
                    <p className="text-xs text-muted-foreground">Published Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cronbach's Alpha */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Test Reliability — Cronbach's Alpha (α)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary">{summary.cronbachAlpha.toFixed(3)}</div>
                  {alphaInfo && (
                    <Badge className={`mt-2 ${alphaInfo.color}`}>{alphaInfo.label}</Badge>
                  )}
                </div>
                <div className="flex-1 min-w-[200px]">
                  {/* Alpha scale bar */}
                  <div className="relative h-4 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 w-3 bg-white border-2 border-gray-800 rounded-full shadow-md transition-all"
                      style={{ left: `calc(${Math.min(summary.cronbachAlpha, 1) * 100}% - 6px)` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0.0</span>
                    <span>0.7 Acceptable</span>
                    <span>0.9 Excellent</span>
                    <span>1.0</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Cronbach's Alpha measures internal consistency. A value ≥ 0.80 is considered good for high-stakes certification exams.
                  </p>
                  {summary.avgScore !== null && (
                    <p className="text-sm mt-1">
                      Average candidate score: <strong>{summary.avgScore.toFixed(1)}%</strong>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Item Statistics Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Item Statistics
                <span className="text-xs text-muted-foreground font-normal ml-2">
                  ({summary.itemStats.length} items)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-3 font-medium">#</th>
                      <th className="pb-2 pr-3 font-medium">Item Stem</th>
                      <th className="pb-2 pr-3 font-medium">Type</th>
                      <th className="pb-2 pr-3 font-medium">Diff.</th>
                      <th className="pb-2 pr-3 font-medium">p-value</th>
                      <th className="pb-2 pr-3 font-medium">Point-Biserial</th>
                      <th className="pb-2 pr-3 font-medium">IRT a</th>
                      <th className="pb-2 pr-3 font-medium">IRT b</th>
                      <th className="pb-2 pr-3 font-medium">IRT c</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedItems.map((item, i) => (
                      <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-2 pr-3 text-muted-foreground">{i + 1}</td>
                        <td className="py-2 pr-3 max-w-[200px]">
                          <span className="line-clamp-2 text-xs">{item.stem}</span>
                        </td>
                        <td className="py-2 pr-3">
                          <Badge variant="outline" className="text-xs">{item.type}</Badge>
                        </td>
                        <td className="py-2 pr-3">
                          <span className="text-xs">{item.difficultyLabel}</span>
                        </td>
                        <td className="py-2 pr-3 font-mono text-xs">
                          {item.pValue !== null ? item.pValue.toFixed(3) : "—"}
                        </td>
                        <td className="py-2 pr-3 font-mono text-xs">
                          {item.pointBiserial !== null ? (
                            <span className={item.pointBiserial < 0.2 ? "text-red-500 font-bold" : ""}>
                              {item.pointBiserial.toFixed(3)}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="py-2 pr-3 font-mono text-xs">{item.irtA !== null ? item.irtA.toFixed(2) : "—"}</td>
                        <td className="py-2 pr-3 font-mono text-xs">{item.irtB !== null ? item.irtB.toFixed(2) : "—"}</td>
                        <td className="py-2 pr-3 font-mono text-xs">{item.irtC !== null ? item.irtC.toFixed(2) : "—"}</td>
                        <td className="py-2">
                          {item.flag ? (
                            <Badge className={`text-xs ${FLAG_COLORS[item.flag]}`}>
                              {FLAG_LABELS[item.flag]}
                            </Badge>
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {summary.itemStats.length > 15 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full gap-1 text-muted-foreground"
                  onClick={() => setShowAllItems(v => !v)}
                >
                  {showAllItems ? (
                    <><ChevronUp className="h-4 w-4" /> Show Less</>
                  ) : (
                    <><ChevronDown className="h-4 w-4" /> Show All {summary.itemStats.length} Items</>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* IRT Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                IRT Parameter Guide (3PL Model)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-semibold mb-1">a — Discrimination</p>
                  <p className="text-muted-foreground text-xs">How well the item separates high from low performers.</p>
                  <p className="text-xs mt-1"><strong>Target:</strong> 0.5 – 2.0. Below 0.5 = poor discrimination.</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-semibold mb-1">b — Difficulty (IRT)</p>
                  <p className="text-muted-foreground text-xs">Theta (ability) level at which 50% of candidates answer correctly.</p>
                  <p className="text-xs mt-1"><strong>Target:</strong> −2.0 to +2.0. Higher = harder.</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-semibold mb-1">c — Guessing</p>
                  <p className="text-muted-foreground text-xs">Lower asymptote — probability of a very low-ability candidate guessing correctly.</p>
                  <p className="text-xs mt-1"><strong>Target:</strong> &lt; 0.25. For MCQ with 4 options, expected = 0.25.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Essay Score Distribution */}
          {summary.essayDist.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Automated Essay Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4 font-medium">#</th>
                        <th className="pb-2 pr-4 font-medium">Final Score</th>
                        <th className="pb-2 font-medium">AI Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.essayDist.slice(0, 20).map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-1.5 pr-4 text-muted-foreground">{i + 1}</td>
                          <td className="py-1.5 pr-4 font-mono">{row.finalScore !== null ? row.finalScore.toFixed(1) : "—"}</td>
                          <td className="py-1.5 font-mono">{row.aiScore !== null ? row.aiScore.toFixed(1) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {summary.essayDist.length} essay responses scored by AI rubric evaluation.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty state */}
      {!selectedExamId && !summaryLoading && (
        <div className="text-center py-16 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium">Select an exam to view its psychometric report</p>
          <p className="text-sm mt-1">Item statistics, Cronbach's Alpha, IRT parameters, and AES scores will appear here.</p>
        </div>
      )}
    </div>
  </SDCLayout>
  );
}
