import { useState } from "react";
import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2, Sparkles, CheckCircle, AlertTriangle, Search, Zap } from "lucide-react";

export default function AIItemGeneration() {
  const [topic, setTopic] = useState("");
  const [questionType, setQuestionType] = useState<"mcq" | "true_false" | "short_answer" | "multi_select">("mcq");
  const [difficulty, setDifficulty] = useState(3);
  const [count, setCount] = useState(5);
  const [context, setContext] = useState("");
  const [generatedItems, setGeneratedItems] = useState<any[]>([]);
  const [enemyTarget, setEnemyTarget] = useState("");

  const generateMutation = trpc.itemBank.generateItems.useMutation({
    onSuccess: (data) => {
      toast.success(`Generated ${data.generated} items and saved to Item Bank`);
      setGeneratedItems([]);
    },
    onError: (e) => toast.error(e.message),
  });

  const { data: allItems = [] } = trpc.itemBank.listByWorkflowStage.useQuery(
    { stage: undefined },
    { refetchOnWindowFocus: false }
  );

  const detectEnemyMutation = trpc.itemBank.detectEnemyItems.useMutation({
    onSuccess: (data) => {
      if (data.enemies.length === 0) {
        toast.success("No enemy items found — this question is unique.");
      } else {
        toast.warning(`Found ${data.enemies.length} similar (enemy) items`);
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    generateMutation.mutate({ topic, questionType, difficulty, count, context: context || undefined });
  };

  const handleDetectEnemy = () => {
    const id = parseInt(enemyTarget);
    if (!id) { toast.error("Enter a valid question ID"); return; }
    detectEnemyMutation.mutate({ questionId: id });
  };

  const difficultyLabels = ["", "Very Easy", "Easy", "Medium", "Hard", "Very Hard"];

  return (
    <SDCLayout>
      <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Item Generation</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Generate high-quality exam questions using AI, then review them in the workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Generate New Items
              </CardTitle>
              <CardDescription>
                AI will generate draft questions and save them to the Item Bank for review.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Topic / Learning Objective</Label>
                <Input
                  placeholder="e.g., TCP/IP networking fundamentals, Project risk management..."
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select value={questionType} onValueChange={v => setQuestionType(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                      <SelectItem value="multi_select">Multiple Select</SelectItem>
                      <SelectItem value="true_false">True / False</SelectItem>
                      <SelectItem value="short_answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Number of Items: {count}</Label>
                  <Slider
                    min={1} max={10} step={1}
                    value={[count]}
                    onValueChange={([v]) => setCount(v!)}
                    className="mt-3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Difficulty: {difficultyLabels[difficulty]}</Label>
                <Slider
                  min={1} max={5} step={1}
                  value={[difficulty]}
                  onValueChange={([v]) => setDifficulty(v!)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Very Easy</span>
                  <span>Very Hard</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Source Material / Context (optional)</Label>
                <Textarea
                  placeholder="Paste relevant text, chapter content, or learning objectives to ground the questions..."
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !topic.trim()}
              >
                {generateMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating {count} items...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" />Generate {count} {questionType.replace("_", " ")} items</>
                )}
              </Button>

              {generateMutation.isSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Items generated and saved to Item Bank as drafts. Go to the Review Workflow to advance them.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enemy Item Detection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-orange-500" />
                Enemy Item Detection
              </CardTitle>
              <CardDescription>
                Scan the item bank for semantically similar questions that should not appear in the same exam.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Question ID to scan..."
                  value={enemyTarget}
                  onChange={e => setEnemyTarget(e.target.value)}
                  type="number"
                />
                <Button
                  variant="outline"
                  onClick={handleDetectEnemy}
                  disabled={detectEnemyMutation.isPending || !enemyTarget}
                >
                  {detectEnemyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {detectEnemyMutation.isSuccess && (
                <div className="space-y-2">
                  {detectEnemyMutation.data.enemies.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      No enemy items found. This question is unique in the bank.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        {detectEnemyMutation.data.enemies.length} similar items found:
                      </p>
                      {detectEnemyMutation.data.enemies.map((enemy: any) => (
                        <div key={enemy.id} className="p-3 border rounded-lg space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Question #{enemy.id}</span>
                            <Badge variant={enemy.similarity > 0.85 ? "destructive" : "outline"}>
                              {Math.round(enemy.similarity * 100)}% similar
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{enemy.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Item Bank Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Item Bank Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Total Items", value: allItems.length, icon: FileText },
                { label: "Draft", value: allItems.filter(q => (q.workflowStage || "draft") === "draft").length },
                { label: "In Review", value: allItems.filter(q => ["expert_review", "qa_review"].includes(q.workflowStage || "")).length },
                { label: "Approved", value: allItems.filter(q => q.workflowStage === "approved").length },
                { label: "Published", value: allItems.filter(q => q.workflowStage === "published").length },
                { label: "With Enemy Flags", value: allItems.filter(q => q.enemySimilarity && Number(q.enemySimilarity) > 0.7).length },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between py-1 border-b last:border-0">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <span className="font-semibold">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {["mcq", "multi_select", "true_false", "short_answer", "essay"].map(type => {
                const count = allItems.filter(q => q.type === type).length;
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{type.replace("_", " ")}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                AI Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>Provide specific topics for better quality. Vague topics produce generic questions.</p>
              <p>Paste source material to ground questions in your actual content.</p>
              <p>Generated items start as <strong>Draft</strong> — always review before publishing.</p>
              <p>Run enemy detection after bulk generation to avoid duplicate knowledge points.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </SDCLayout>
  );
}

function FileText({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}
