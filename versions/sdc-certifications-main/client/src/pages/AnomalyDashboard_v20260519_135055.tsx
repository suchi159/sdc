import { useState, useMemo } from "react";
import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  AlertTriangle,
  Shield,
  Clock,
  Users,
  TrendingDown,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  RefreshCw,
  ScanSearch,
  Network,
} from "lucide-react";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RISK_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#3b82f6",
  clean: "#22c55e",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#3b82f6",
};

const ANOMALY_TYPE_LABELS: Record<string, string> = {
  too_fast: "Too Fast (Pre-Knowledge)",
  too_slow: "Too Slow (Possible Assistance)",
  iqr_outlier_fast: "IQR Outlier (Fast)",
  iqr_outlier_slow: "IQR Outlier (Slow)",
  collusion: "Collusion Detected",
  uniform_speed: "Uniform Speed (Bot-Like)",
  acceleration: "Speed Acceleration",
  copy_pattern: "Copy Pattern",
};

function RiskBadge({ level }: { level: string }) {
  const colorMap: Record<string, string> = {
    critical: "bg-red-100 text-red-800 border-red-300",
    high: "bg-orange-100 text-orange-800 border-orange-300",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    low: "bg-blue-100 text-blue-800 border-blue-300",
    clean: "bg-green-100 text-green-800 border-green-300",
  };
  return (
    <Badge variant="outline" className={`capitalize font-semibold ${colorMap[level] ?? ""}`}>
      {level}
    </Badge>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colorMap: Record<string, string> = {
    critical: "bg-red-500 text-white",
    high: "bg-orange-500 text-white",
    medium: "bg-yellow-500 text-white",
    low: "bg-blue-500 text-white",
  };
  return (
    <Badge className={`capitalize ${colorMap[severity] ?? ""}`}>{severity}</Badge>
  );
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ─── Attempt Detail Modal ─────────────────────────────────────────────────────

function AttemptDetailModal({
  attemptId,
  onClose,
}: {
  attemptId: number;
  onClose: () => void;
}) {
  const [reviewNote, setReviewNote] = useState("");
  const { data, isLoading, refetch } = trpc.anomalyDetection.getAttemptAnomalies.useQuery(
    { attemptId },
    { enabled: !!attemptId }
  );
  const reviewMutation = trpc.anomalyDetection.reviewAnomaly.useMutation({
    onSuccess: () => {
      toast.success("Review saved");
      refetch();
    },
    onError: () => toast.error("Failed to save review"),
  });

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { anomalies = [], responses = [], summary } = data ?? {};

  const chartData = responses.map((r) => {
    const hasAnomaly = anomalies.some((a) => a.questionId === r.questionId);
    return {
      name: `Q${r.questionIndex + 1}`,
      time: r.responseTimeMs,
      fill: hasAnomaly ? "#ef4444" : "#3b82f6",
    };
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Attempt #{attemptId} — Response-Time Analysis
          </DialogTitle>
        </DialogHeader>

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold" style={{ color: RISK_COLORS[summary.riskLevel] }}>
                  {Number(summary.riskScore).toFixed(0)}/100
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Anomalies</p>
                <p className="text-2xl font-bold text-red-500">{summary.totalAnomalies}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Mean Response</p>
                <p className="text-2xl font-bold">{formatMs(summary.meanResponseTimeMs)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Std Dev</p>
                <p className="text-2xl font-bold">{formatMs(summary.stdDevResponseTimeMs)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {chartData.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">
                Per-Question Response Times{" "}
                <span className="text-muted-foreground font-normal">(red = flagged)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}s`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [formatMs(v), "Response Time"]} />
                  <Bar dataKey="time">
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="anomalies">
          <TabsList>
            <TabsTrigger value="anomalies">Anomalies ({anomalies.length})</TabsTrigger>
            <TabsTrigger value="responses">All Responses ({responses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="anomalies">
            {anomalies.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No anomalies detected for this attempt.</p>
            ) : (
              <div className="space-y-3">
                {anomalies.map((a) => (
                  <Card key={a.id} className="border-l-4" style={{ borderLeftColor: RISK_COLORS[a.severity] }}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <SeverityBadge severity={a.severity} />
                            <span className="font-medium text-sm">
                              {ANOMALY_TYPE_LABELS[a.anomalyType] ?? a.anomalyType}
                            </span>
                            {a.questionId > 0 && (
                              <span className="text-xs text-muted-foreground">Q{a.questionId}</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {a.aiNarrative ?? "No narrative available."}
                          </p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Z-score: {Number(a.zScore).toFixed(2)}</span>
                            <span>Response: {formatMs(a.responseTimeMs)}</span>
                            <span>Mean: {formatMs(a.meanTimeMs)}</span>
                            {a.collusionSimilarityScore && (
                              <span>Similarity: {(Number(a.collusionSimilarityScore) * 100).toFixed(1)}%</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[120px]">
                          {a.reviewStatus === "pending" ? (
                            <>
                              <Textarea
                                placeholder="Review note..."
                                className="text-xs h-16"
                                value={reviewNote}
                                onChange={(e) => setReviewNote(e.target.value)}
                              />
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-green-600 border-green-300 hover:bg-green-50"
                                  onClick={() =>
                                    reviewMutation.mutate({ anomalyId: a.id, status: "confirmed", note: reviewNote })
                                  }
                                >
                                  <CheckCircle className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                                  onClick={() =>
                                    reviewMutation.mutate({ anomalyId: a.id, status: "dismissed", note: reviewNote })
                                  }
                                >
                                  <XCircle className="w-3 h-3" />
                                </Button>
                              </div>
                            </>
                          ) : (
                            <Badge
                              variant="outline"
                              className={a.reviewStatus === "confirmed" ? "text-green-600" : "text-gray-500"}
                            >
                              {a.reviewStatus}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="responses">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Q#</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Revisits</TableHead>
                  <TableHead>Flagged</TableHead>
                  <TableHead>Correct</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">Q{r.questionIndex + 1}</TableCell>
                    <TableCell>{formatMs(r.responseTimeMs)}</TableCell>
                    <TableCell>{r.revisitCount}</TableCell>
                    <TableCell>
                      {r.flaggedForReview ? (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-300">Flagged</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.isCorrect === null ? (
                        <span className="text-muted-foreground text-xs">—</span>
                      ) : r.isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ─── Similarity Heatmap Cell ──────────────────────────────────────────────────

function HeatmapCell({ value, isHeader = false }: { value: number | string; isHeader?: boolean }) {
  if (isHeader) {
    return (
      <div className="w-10 h-10 flex items-center justify-center text-xs font-semibold text-muted-foreground bg-muted rounded">
        {value}
      </div>
    );
  }
  const num = typeof value === "number" ? value : 0;
  // Colour scale: 0=white, 0.5=yellow, 0.85+=red
  const getColor = (v: number) => {
    if (v >= 0.97) return "#7f1d1d"; // dark red
    if (v >= 0.92) return "#ef4444"; // red
    if (v >= 0.85) return "#f97316"; // orange
    if (v >= 0.70) return "#fbbf24"; // amber
    if (v >= 0.50) return "#fef9c3"; // light yellow
    return "#f8fafc"; // near-white
  };
  const textColor = num >= 0.85 ? "#fff" : num >= 0.5 ? "#78350f" : "#64748b";
  return (
    <div
      className="w-10 h-10 flex items-center justify-center text-xs rounded font-mono"
      style={{ backgroundColor: getColor(num), color: textColor }}
      title={`Similarity: ${(num * 100).toFixed(1)}%`}
    >
      {num === 1 ? "—" : (num * 100).toFixed(0)}
    </div>
  );
}

// ─── Collusion Scan Panel ─────────────────────────────────────────────────────

function CollusionScanPanel() {
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [threshold, setThreshold] = useState<number>(85); // stored as 0–100 for slider
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanning, setScanning] = useState(false);

  const examsQuery = trpc.exams.list.useQuery();
  const exams = examsQuery.data ?? [];

  const scanMutation = trpc.anomalyDetection.collusionScan.useMutation({
    onSuccess: (data) => {
      setScanResult(data);
      setScanning(false);
      if (data.summary.flaggedCount > 0) {
        toast.warning(`Scan complete — ${data.summary.flaggedCount} suspicious pair(s) detected`);
      } else {
        toast.success(`Scan complete — no collusion detected across ${data.scannedAttempts} attempts`);
      }
    },
    onError: (err) => {
      setScanning(false);
      toast.error(`Scan failed: ${err.message}`);
    },
  });

  const handleScan = () => {
    if (!selectedExamId) {
      toast.error("Please select an exam first");
      return;
    }
    setScanning(true);
    setScanResult(null);
    scanMutation.mutate({ examId: parseInt(selectedExamId), threshold: threshold / 100 });
  };

  // Build heatmap labels (attempt IDs shortened)
  const heatmapLabels = useMemo(() => {
    if (!scanResult?.attemptIds) return [];
    return (scanResult.attemptIds as number[]).map((id: number) => `#${id}`);
  }, [scanResult]);

  const flaggedPairs = scanResult?.flaggedPairs ?? [];
  const summary = scanResult?.summary;
  const matrix: number[][] = scanResult?.matrix ?? [];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ScanSearch className="w-5 h-5 text-orange-500" />
            Collusion Scan Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Exam</label>
              <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an exam to scan..." />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((e: any) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Similarity Threshold: <span className="font-bold text-orange-600">{threshold}%</span>
              </label>
              <Slider
                min={50}
                max={99}
                step={1}
                value={[threshold]}
                onValueChange={([v]) => setThreshold(v)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground">
                Pairs above this threshold are flagged as potential collusion. Default: 85%.
              </p>
            </div>
          </div>
          <Button
            onClick={handleScan}
            disabled={scanning || !selectedExamId}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {scanning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Scanning…
              </>
            ) : (
              <>
                <ScanSearch className="w-4 h-4 mr-2" />
                Run Collusion Scan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {scanResult && (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Attempts Scanned</p>
                <p className="text-2xl font-bold">{scanResult.scannedAttempts}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Pairs Compared</p>
                <p className="text-2xl font-bold">{summary?.totalPairs ?? 0}</p>
              </CardContent>
            </Card>
            <Card className={summary?.flaggedCount > 0 ? "border-red-300" : "border-green-300"}>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Flagged Pairs</p>
                <p className={`text-2xl font-bold ${summary?.flaggedCount > 0 ? "text-red-600" : "text-green-600"}`}>
                  {summary?.flaggedCount ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Max Similarity</p>
                <p className="text-2xl font-bold">
                  {((summary?.maxSimilarity ?? 0) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card className={summary?.collusionRingCount > 0 ? "border-red-300" : ""}>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Collusion Rings (≥3)</p>
                <p className={`text-2xl font-bold ${summary?.collusionRingCount > 0 ? "text-red-600" : ""}`}>
                  {summary?.collusionRingCount ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Similarity Heatmap */}
          {matrix.length > 0 && matrix.length <= 40 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Answer Similarity Matrix
                  <span className="text-xs font-normal text-muted-foreground ml-2">
                    (values = % identical answers; orange/red = flagged)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="inline-block">
                  {/* Column headers */}
                  <div className="flex gap-1 mb-1 ml-11">
                    {heatmapLabels.map((label: string, i: number) => (
                      <HeatmapCell key={i} value={label} isHeader />
                    ))}
                  </div>
                  {/* Rows */}
                  {matrix.map((row: number[], rowIdx: number) => (
                    <div key={rowIdx} className="flex gap-1 mb-1">
                      <HeatmapCell value={heatmapLabels[rowIdx]} isHeader />
                      {row.map((cell: number, colIdx: number) => (
                        <HeatmapCell key={colIdx} value={cell} />
                      ))}
                    </div>
                  ))}
                </div>
                {matrix.length > 40 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Heatmap hidden for scans with &gt;40 attempts. Review the flagged pairs table below.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {matrix.length > 40 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-4">
                <p className="text-sm text-yellow-800">
                  <strong>{matrix.length} attempts</strong> scanned — similarity matrix is too large to display as a heatmap.
                  Review the flagged pairs table below for all suspicious pairs.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Flagged Pairs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-red-500" />
                Flagged Pairs ({flaggedPairs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {flaggedPairs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Shield className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm">No suspicious pairs detected above the {threshold}% threshold</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Candidate A</TableHead>
                      <TableHead>Candidate B</TableHead>
                      <TableHead>Similarity</TableHead>
                      <TableHead>Matching Answers</TableHead>
                      <TableHead>Narrative</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flaggedPairs.map((pair: any, i: number) => (
                      <TableRow key={i} className={pair.severity === "critical" ? "bg-red-50" : pair.severity === "high" ? "bg-orange-50" : ""}>
                        <TableCell>
                          <SeverityBadge severity={pair.severity} />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{pair.candidateNameA}</p>
                            <p className="text-xs text-muted-foreground font-mono">Attempt #{pair.attemptIdA}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{pair.candidateNameB}</p>
                            <p className="text-xs text-muted-foreground font-mono">Attempt #{pair.attemptIdB}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${Math.round(pair.similarityScore * 60)}px`,
                                backgroundColor: SEVERITY_COLORS[pair.severity],
                              }}
                            />
                            <span className="font-bold font-mono text-sm" style={{ color: SEVERITY_COLORS[pair.severity] }}>
                              {(pair.similarityScore * 100).toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono text-sm">
                          {pair.matchingAnswers}/{pair.totalQuestions}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs">
                          {pair.narrative}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AnomalyDashboard() {
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const statsQuery = trpc.anomalyDetection.dashboardStats.useQuery();
  const flaggedQuery = trpc.anomalyDetection.listFlaggedAttempts.useQuery({
    riskLevel:
      riskFilter === "all"
        ? undefined
        : (riskFilter as "clean" | "low" | "medium" | "high" | "critical"),
    limit: 50,
    offset: 0,
  });

  const stats = statsQuery.data?.totals;
  const anomalyTypeCounts = statsQuery.data?.anomalyTypeCounts ?? [];
  const recentFlagged = statsQuery.data?.recentFlagged ?? [];
  const flaggedAttempts = flaggedQuery.data?.attempts ?? [];

  const chartData = anomalyTypeCounts.map((t) => ({
    name: ANOMALY_TYPE_LABELS[t.anomalyType] ?? t.anomalyType,
    count: Number(t.count),
  }));

  return (
    <SDCLayout>
        <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-500" />
            Test Security & Anomaly Detection
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Statistical response-time analysis and collusion detection for exam integrity
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            statsQuery.refetch();
            flaggedQuery.refetch();
          }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Response-Time Anomalies
          </TabsTrigger>
          <TabsTrigger value="collusion" className="flex items-center gap-2">
            <ScanSearch className="w-4 h-4" />
            Collusion Scan
          </TabsTrigger>
        </TabsList>

        {/* ── Response-Time Anomaly Tab ── */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Total Flagged</span>
                </div>
                <p className="text-3xl font-bold">{stats?.totalFlagged ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-muted-foreground">Critical</span>
                </div>
                <p className="text-3xl font-bold text-red-500">{stats?.criticalCount ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="border-orange-200">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-muted-foreground">High</span>
                </div>
                <p className="text-3xl font-bold text-orange-500">{stats?.highCount ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="border-yellow-200">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">Medium</span>
                </div>
                <p className="text-3xl font-bold text-yellow-500">{stats?.mediumCount ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Avg Risk Score</span>
                </div>
                <p className="text-3xl font-bold">{stats?.avgRiskScore ?? "0.0"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts + Recent */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Anomaly Type Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <Shield className="w-12 h-12 mb-2 opacity-30" />
                    <p className="text-sm">No anomalies detected yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent High-Risk Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                {recentFlagged.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mb-2 opacity-30" />
                    <p className="text-sm">No high-risk attempts</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentFlagged.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 cursor-pointer"
                        onClick={() => setSelectedAttemptId(a.attemptId)}
                      >
                        <div>
                          <p className="text-sm font-medium">Attempt #{a.attemptId}</p>
                          <p className="text-xs text-muted-foreground">{a.totalAnomalies} anomalies</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <RiskBadge level={a.riskLevel} />
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Flagged Attempts Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Flagged Attempts
                </CardTitle>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {flaggedQuery.isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : flaggedAttempts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Shield className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm">No flagged attempts found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Attempt</TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Anomalies</TableHead>
                      <TableHead>Too Fast</TableHead>
                      <TableHead>Too Slow</TableHead>
                      <TableHead>Collusion</TableHead>
                      <TableHead>Mean Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flaggedAttempts.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono text-xs">#{a.attemptId}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{(a as any).candidateName}</p>
                            <p className="text-xs text-muted-foreground">{(a as any).candidateEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{(a as any).examTitle}</TableCell>
                        <TableCell><RiskBadge level={a.riskLevel} /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${Math.min(60, Number(a.riskScore))}px`,
                                backgroundColor: RISK_COLORS[a.riskLevel],
                              }}
                            />
                            <span className="text-sm font-mono">{Number(a.riskScore).toFixed(0)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold">{a.totalAnomalies}</TableCell>
                        <TableCell className="text-center">
                          {a.tooFastCount > 0 ? (
                            <span className="flex items-center gap-1 text-red-500">
                              <TrendingDown className="w-3 h-3" />{a.tooFastCount}
                            </span>
                          ) : <span className="text-muted-foreground">0</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          {a.tooSlowCount > 0 ? (
                            <span className="flex items-center gap-1 text-orange-500">
                              <TrendingUp className="w-3 h-3" />{a.tooSlowCount}
                            </span>
                          ) : <span className="text-muted-foreground">0</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          {a.collusionCount > 0 ? (
                            <Badge variant="outline" className="text-red-600 border-red-300">
                              <Users className="w-3 h-3 mr-1" />{a.collusionCount}
                            </Badge>
                          ) : <span className="text-muted-foreground">0</span>}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{formatMs(a.meanResponseTimeMs)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => setSelectedAttemptId(a.attemptId)}>
                            <Eye className="w-3 h-3 mr-1" />Inspect
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Collusion Scan Tab ── */}
        <TabsContent value="collusion">
          <CollusionScanPanel />
        </TabsContent>
      </Tabs>

      {/* Attempt Detail Modal */}
      {selectedAttemptId && (
        <AttemptDetailModal
          attemptId={selectedAttemptId}
          onClose={() => setSelectedAttemptId(null)}
        />
      )}
    </div>
    </SDCLayout>
  );
}
