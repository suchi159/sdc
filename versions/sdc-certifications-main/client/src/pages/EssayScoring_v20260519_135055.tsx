import { useState } from "react";
import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Brain, CheckCircle, Star, Plus, Trash2 } from "lucide-react";

interface RubricCriterion {
  criterion: string;
  maxScore: number;
  weight: number;
}

export default function EssayScoring() {
  const [attemptId, setAttemptId] = useState(1);
  const [questionId, setQuestionId] = useState(1);
  const [candidateId, setCandidateId] = useState(1);
  const [responseText, setResponseText] = useState("");
  const [rubric, setRubric] = useState<RubricCriterion[]>([
    { criterion: "Content Accuracy", maxScore: 40, weight: 0.4 },
    { criterion: "Clarity and Structure", maxScore: 30, weight: 0.3 },
    { criterion: "Depth of Analysis", maxScore: 30, weight: 0.3 },
  ]);
  const [scoreResult, setScoreResult] = useState<any>(null);

  const { data: essayScores = [], refetch } = trpc.itemBank.listEssayScores.useQuery(
    { attemptId: undefined },
    { refetchOnWindowFocus: false }
  );

  const scoreMutation = trpc.itemBank.scoreEssay.useMutation({
    onSuccess: (data) => {
      setScoreResult(data);
      refetch();
      toast.success(`Essay scored: ${data.score} / ${rubric.reduce((s, r) => s + r.maxScore, 0)} points`);
    },
    onError: (e) => toast.error(e.message),
  });

  const addCriterion = () => {
    setRubric(prev => [...prev, { criterion: "", maxScore: 20, weight: 0.2 }]);
  };

  const removeCriterion = (idx: number) => {
    setRubric(prev => prev.filter((_, i) => i !== idx));
  };

  const updateCriterion = (idx: number, field: keyof RubricCriterion, value: any) => {
    setRubric(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const handleScore = () => {
    if (!responseText.trim()) { toast.error("Enter a response to score"); return; }
    scoreMutation.mutate({
      attemptId, questionId, candidateId,
      responseText,
      rubric,
    });
  };

  const maxTotal = rubric.reduce((s, r) => s + r.maxScore, 0);

  return (
    <SDCLayout>
      <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Automated Essay Scoring</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI-powered essay evaluation with rubric-based scoring and detailed rationale.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scoring Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Score Essay Response
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Attempt ID</Label>
                  <Input type="number" value={attemptId} onChange={e => setAttemptId(Number(e.target.value))} className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Question ID</Label>
                  <Input type="number" value={questionId} onChange={e => setQuestionId(Number(e.target.value))} className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Candidate ID</Label>
                  <Input type="number" value={candidateId} onChange={e => setCandidateId(Number(e.target.value))} className="h-8" />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Candidate Response</Label>
                <Textarea
                  placeholder="Paste or type the candidate's essay response here..."
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">{responseText.split(/\s+/).filter(Boolean).length} words</p>
              </div>

              {/* Rubric */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Scoring Rubric (Total: {maxTotal} pts)</Label>
                  <Button size="sm" variant="outline" onClick={addCriterion}>
                    <Plus className="h-3 w-3 mr-1" /> Add Criterion
                  </Button>
                </div>
                {rubric.map((r, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <Input
                      placeholder="Criterion name"
                      value={r.criterion}
                      onChange={e => updateCriterion(idx, "criterion", e.target.value)}
                      className="col-span-6 h-8 text-sm"
                    />
                    <Input
                      type="number" min={1} max={100}
                      value={r.maxScore}
                      onChange={e => updateCriterion(idx, "maxScore", Number(e.target.value))}
                      className="col-span-2 h-8 text-sm"
                      placeholder="Max"
                    />
                    <Input
                      type="number" min={0.01} max={1} step={0.01}
                      value={r.weight}
                      onChange={e => updateCriterion(idx, "weight", Number(e.target.value))}
                      className="col-span-3 h-8 text-sm"
                      placeholder="Weight"
                    />
                    <Button size="sm" variant="ghost" className="col-span-1 h-8 w-8 p-0 text-destructive" onClick={() => removeCriterion(idx)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button className="w-full" onClick={handleScore} disabled={scoreMutation.isPending || !responseText.trim()}>
                {scoreMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Scoring with AI...</>
                ) : (
                  <><Brain className="h-4 w-4 mr-2" />Score Essay</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Score Result */}
          {scoreResult && (
            <Card className="border-purple-300 dark:border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    AI Score Result
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    {scoreResult.score} / {maxTotal}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-1">Overall Rationale</p>
                  <p className="text-sm text-muted-foreground">{scoreResult.rationale}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Criterion Breakdown</p>
                  {scoreResult.criterionScores?.map((cs: any, idx: number) => (
                    <div key={idx} className="p-2 border rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{cs.criterion}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < Math.round(cs.score / (rubric[idx]?.maxScore || 20) * 5) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                            />
                          ))}
                          <span className="text-xs ml-1 font-semibold">{cs.score} pts</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{cs.comment}</p>
                    </div>
                  ))}
                </div>

                <Badge variant="outline" className="text-xs">
                  Status: AI Scored — Pending Human Review
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Scores */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Essay Scores</CardTitle>
              <CardDescription>Last {essayScores.length} scored responses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {essayScores.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No essays scored yet</p>
              ) : (
                essayScores.slice(0, 10).map(score => (
                  <div key={score.id} className="p-2 border rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Attempt #{score.attemptId} · Q#{score.questionId}</span>
                      <Badge variant="outline" className="text-xs">{score.aiScore} pts</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={score.status === "human_reviewed" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {score.status?.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(score.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scoring Workflow</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span><strong>AI Scored</strong> — Initial automated score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span><strong>Human Review</strong> — Examiner validates AI score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span><strong>Final</strong> — Score locked and reported</span>
              </div>
              <p className="pt-1">AI scores are advisory. Human review is required before final reporting.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </SDCLayout>
  );
}
