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
import { Loader2, Plus, Trash2, Zap, BookOpen, CheckCircle } from "lucide-react";

interface Section {
  name: string;
  difficulty: number;
  count: number;
  tags: string[];
}

export default function ExamBlueprintBuilder() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(50);
  const [passingScore, setPassingScore] = useState("70.00");
  const [timeLimit, setTimeLimit] = useState(90);
  const [sections, setSections] = useState<Section[]>([
    { name: "Core Concepts", difficulty: 2, count: 20, tags: [] },
    { name: "Applied Knowledge", difficulty: 3, count: 20, tags: [] },
    { name: "Advanced Topics", difficulty: 4, count: 10, tags: [] },
  ]);
  const [assembleResult, setAssembleResult] = useState<{ count: number; questionIds: number[] } | null>(null);

  const { data: blueprints = [], refetch } = trpc.itemBank.blueprints.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const createMutation = trpc.itemBank.blueprints.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Blueprint created");
      setName(""); setDescription("");
    },
    onError: (e) => toast.error(e.message),
  });

  const assembleMutation = trpc.itemBank.blueprints.assemble.useMutation({
    onSuccess: (data) => {
      setAssembleResult({ count: data.count, questionIds: data.assembledQuestionIds });
      toast.success(`Assembled ${data.count} questions from approved item bank`);
    },
    onError: (e) => toast.error(e.message),
  });

  const addSection = () => {
    setSections(prev => [...prev, { name: "", difficulty: 3, count: 10, tags: [] }]);
  };

  const removeSection = (idx: number) => {
    setSections(prev => prev.filter((_, i) => i !== idx));
  };

  const updateSection = (idx: number, field: keyof Section, value: any) => {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const handleCreate = () => {
    if (!name.trim()) { toast.error("Blueprint name is required"); return; }
    createMutation.mutate({
      name, description: description || undefined,
      totalQuestions, passingScore, timeLimit,
      sections,
    });
  };

  return (
    <SDCLayout>
      <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Exam Blueprint Builder</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Define exam structure with section-level difficulty targets, then auto-assemble from the approved item bank.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Blueprint Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                New Blueprint
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label>Blueprint Name</Label>
                  <Input placeholder="e.g., CCNA Certification Exam v2" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Total Questions</Label>
                  <Input type="number" min={1} max={500} value={totalQuestions} onChange={e => setTotalQuestions(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Time Limit (minutes)</Label>
                  <Input type="number" min={10} max={480} value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Passing Score (%)</Label>
                  <Input value={passingScore} onChange={e => setPassingScore(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Description (optional)</Label>
                  <Textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} />
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Sections ({sections.length})</Label>
                  <Button size="sm" variant="outline" onClick={addSection}>
                    <Plus className="h-3 w-3 mr-1" /> Add Section
                  </Button>
                </div>

                {sections.map((section, idx) => (
                  <div key={idx} className="p-3 border rounded-lg space-y-2 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder={`Section ${idx + 1} name`}
                        value={section.name}
                        onChange={e => updateSection(idx, "name", e.target.value)}
                        className="flex-1 h-8 text-sm"
                      />
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => removeSection(idx)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Questions</label>
                        <Input type="number" min={1} max={200} value={section.count}
                          onChange={e => updateSection(idx, "count", Number(e.target.value))}
                          className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Difficulty (1-5)</label>
                        <Input type="number" min={1} max={5} value={section.difficulty}
                          onChange={e => updateSection(idx, "difficulty", Number(e.target.value))}
                          className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Tags (comma-sep)</label>
                        <Input
                          placeholder="networking,tcp"
                          value={section.tags.join(",")}
                          onChange={e => updateSection(idx, "tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="text-xs text-muted-foreground">
                  Total questions in sections: {sections.reduce((s, sec) => s + sec.count, 0)} / {totalQuestions}
                </div>
              </div>

              <Button className="w-full" onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Save Blueprint
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Saved Blueprints */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Saved Blueprints ({blueprints.length})</CardTitle>
              <CardDescription>Click Assemble to auto-select questions from the approved item bank.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {blueprints.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No blueprints yet</p>
              ) : (
                blueprints.map(bp => (
                  <div key={bp.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{bp.name}</p>
                        <p className="text-xs text-muted-foreground">{bp.totalQuestions} questions · {bp.timeLimit}min · Pass {bp.passingScore}%</p>
                      </div>
                      <Badge variant={bp.status === "active" ? "default" : "outline"} className="text-xs">
                        {bp.status}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-7 text-xs"
                      onClick={() => assembleMutation.mutate({ blueprintId: bp.id })}
                      disabled={assembleMutation.isPending}
                    >
                      {assembleMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Zap className="h-3 w-3 mr-1" />
                      )}
                      Auto-Assemble
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {assembleResult && (
            <Card className="border-green-500">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Assembly Complete</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {assembleResult.count} questions selected from approved item bank.
                </p>
                <p className="text-xs text-muted-foreground">
                  Question IDs: {assembleResult.questionIds.slice(0, 10).join(", ")}
                  {assembleResult.questionIds.length > 10 ? ` +${assembleResult.questionIds.length - 10} more` : ""}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  </SDCLayout>
  );
}
