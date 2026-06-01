import { useState } from "react";
import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ChevronRight, CheckCircle, AlertCircle, FileText, Zap, Download } from "lucide-react";

const STAGES = [
  { id: "draft", label: "Draft", color: "bg-slate-500", badge: "secondary" as const },
  { id: "expert_review", label: "Expert Review", color: "bg-blue-500", badge: "default" as const },
  { id: "qa_review", label: "QA Review", color: "bg-yellow-500", badge: "outline" as const },
  { id: "approved", label: "Approved", color: "bg-green-500", badge: "default" as const },
  { id: "published", label: "Published", color: "bg-emerald-600", badge: "default" as const },
];

const NEXT_STAGE: Record<string, string> = {
  draft: "expert_review",
  expert_review: "qa_review",
  qa_review: "approved",
  approved: "published",
};

type Stage = "draft" | "expert_review" | "qa_review" | "approved" | "published" | "archived";

export default function ItemReviewWorkflow() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeStageFilter, setActiveStageFilter] = useState<string | undefined>(undefined);

  const { data: allItems = [], isLoading, refetch } = trpc.itemBank.listByWorkflowStage.useQuery(
    { stage: activeStageFilter },
    { refetchOnWindowFocus: false }
  );

  const advanceMutation = trpc.itemBank.advanceWorkflowStage.useMutation({
    onSuccess: () => { refetch(); toast.success("Item moved to next stage"); },
    onError: (e) => toast.error(e.message),
  });

  const bulkAdvanceMutation = trpc.itemBank.bulkAdvanceStage.useMutation({
    onSuccess: (data) => {
      refetch();
      setSelectedIds([]);
      toast.success(`${data.moved} items advanced`);
    },
    onError: (e) => toast.error(e.message),
  });

  const exportCsvQuery = trpc.itemBank.exportCsv.useQuery(
    { stage: activeStageFilter },
    { enabled: false }
  );

  const handleExport = async () => {
    const result = await exportCsvQuery.refetch();
    if (result.data) {
      const blob = new Blob([result.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `item-bank-${activeStageFilter || "all"}-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const groupedByStage = STAGES.reduce((acc, s) => {
    acc[s.id] = allItems.filter(q => (q.workflowStage || "draft") === s.id);
    return acc;
  }, {} as Record<string, typeof allItems>);

  const totalItems = allItems.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SDCLayout>
        <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Item Review Workflow</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalItems} items across {STAGES.length} stages
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const firstSelected = allItems.find(q => selectedIds.includes(q.id));
                const currentStage = firstSelected?.workflowStage || "draft";
                const nextStage = NEXT_STAGE[currentStage];
                if (nextStage) {
                  bulkAdvanceMutation.mutate({ questionIds: selectedIds, stage: nextStage as Stage });
                }
              }}
              disabled={bulkAdvanceMutation.isPending}
            >
              {bulkAdvanceMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
              Advance {selectedIds.length} Selected
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stage Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeStageFilter === undefined ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveStageFilter(undefined)}
        >
          All Stages
        </Button>
        {STAGES.map(s => (
          <Button
            key={s.id}
            variant={activeStageFilter === s.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveStageFilter(activeStageFilter === s.id ? undefined : s.id)}
          >
            {s.label}
            <span className="ml-1 text-xs opacity-70">({groupedByStage[s.id]?.length || 0})</span>
          </Button>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STAGES.map(stage => {
          const stageItems = groupedByStage[stage.id] || [];
          return (
            <div key={stage.id} className="space-y-2">
              {/* Column Header */}
              <div className={`rounded-lg px-3 py-2 flex items-center justify-between ${stage.color} text-white`}>
                <span className="font-semibold text-sm">{stage.label}</span>
                <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">{stageItems.length}</span>
              </div>

              {/* Items */}
              <div className="space-y-2 min-h-[200px]">
                {stageItems.length === 0 && (
                  <div className="border-2 border-dashed rounded-lg p-4 text-center text-muted-foreground text-xs">
                    No items
                  </div>
                )}
                {stageItems.map(item => (
                  <Card
                    key={item.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedIds.includes(item.id) ? "ring-2 ring-primary" : ""}`}
                    onClick={() => toggleSelect(item.id)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium line-clamp-2 leading-tight">
                            {item.stem}
                          </p>
                        </div>
                        {selectedIds.includes(item.id) && (
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge variant="outline" className="text-xs py-0">
                          {item.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs py-0">
                          D{item.difficulty}
                        </Badge>
                        {item.enemySimilarity && Number(item.enemySimilarity) > 0.7 && (
                          <Badge variant="destructive" className="text-xs py-0">
                            Enemy
                          </Badge>
                        )}
                      </div>
                      {item.aiSuggestion && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          <span className="truncate">AI reviewed</span>
                        </div>
                      )}
                      {NEXT_STAGE[stage.id] && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full h-6 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            advanceMutation.mutate({
                              questionId: item.id,
                              stage: NEXT_STAGE[stage.id] as Stage,
                            });
                          }}
                          disabled={advanceMutation.isPending}
                        >
                          <ChevronRight className="h-3 w-3 mr-1" />
                          Move to {STAGES.find(s => s.id === NEXT_STAGE[stage.id])?.label}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
            {STAGES.map(s => (
              <div key={s.id}>
                <p className="text-2xl font-bold">{groupedByStage[s.id]?.length || 0}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </SDCLayout>
  );
}
