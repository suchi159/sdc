import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Upload, FileText, CheckCircle, XCircle, AlertTriangle,
  Download, Trash2, Play, ChevronDown, ChevronUp
} from "lucide-react";
import SDCLayout from "@/components/SDCLayout";

interface CandidateRow {
  email: string;
  score?: string;
  status?: "issued" | "skipped" | "error";
  credentialId?: string;
  reason?: string;
}

export default function BulkIssue() {
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [templateId, setTemplateId] = useState<number | "">("");
  const [examId, setExamId] = useState<number | "">("");
  const [expiryMonths, setExpiryMonths] = useState<number | "">("");
  const [results, setResults] = useState<{ issued: number; skipped: number; errors: number; results: CandidateRow[] } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [manualScore, setManualScore] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: templates } = trpc.credentials.templates.list.useQuery();
  const { data: exams } = trpc.exams.list.useQuery();

  const bulkIssue = trpc.credentials.bulkIssue.useMutation({
    onSuccess: (data) => {
      setResults(data);
      setShowResults(true);
      toast.success(`Done: ${data.issued} issued, ${data.skipped} skipped, ${data.errors} errors`);
      // Update local rows with statuses
      const statusMap = new Map(data.results.map((r) => [r.email, r]));
      setCandidates((prev) => prev.map((c) => ({
        ...c,
        ...(statusMap.get(c.email) || {}),
      })));
    },
    onError: (e) => toast.error(e.message),
  });

  const parseCSV = (text: string): CandidateRow[] => {
    const lines = text.trim().split("\n").filter(Boolean);
    if (!lines.length) return [];
    // Skip header if first line contains "email"
    const startIdx = lines[0]?.toLowerCase().includes("email") ? 1 : 0;
    return lines.slice(startIdx).map((line) => {
      const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
      return { email: parts[0] || "", score: parts[1] || undefined };
    }).filter((r) => r.email.includes("@"));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      if (!rows.length) { toast.error("No valid email rows found in CSV"); return; }
      setCandidates(rows);
      toast.success(`Loaded ${rows.length} candidates from CSV`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const addManual = () => {
    if (!manualEmail.includes("@")) { toast.error("Enter a valid email"); return; }
    if (candidates.some((c) => c.email === manualEmail)) { toast.error("Email already in list"); return; }
    setCandidates((prev) => [...prev, { email: manualEmail, score: manualScore || undefined }]);
    setManualEmail("");
    setManualScore("");
  };

  const removeRow = (email: string) => setCandidates((prev) => prev.filter((c) => c.email !== email));

  const downloadTemplate = () => {
    const csv = "email,score\njohn.doe@example.com,85.5\njane.smith@example.com,92.0\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-issue-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleIssue = () => {
    if (!templateId) { toast.error("Select a credential template"); return; }
    if (!candidates.length) { toast.error("Add at least one candidate"); return; }
    bulkIssue.mutate({
      templateId: templateId as number,
      examId: examId ? (examId as number) : undefined,
      expiryMonths: expiryMonths ? (expiryMonths as number) : undefined,
      candidates: candidates.map((c) => ({ email: c.email, score: c.score })),
    });
  };

  const statusIcon = (status?: string) => {
    if (status === "issued") return <CheckCircle className="w-4 h-4" style={{ color: "#10b981" }} />;
    if (status === "skipped") return <AlertTriangle className="w-4 h-4" style={{ color: "#f59e0b" }} />;
    if (status === "error") return <XCircle className="w-4 h-4" style={{ color: "#ef4444" }} />;
    return null;
  };

  return (
    <SDCLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Bulk Credential Issuance</h1>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
              Issue credentials to multiple candidates at once via CSV upload or manual entry.
            </p>
          </div>
          <button onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}>
            <Download className="w-4 h-4" /> CSV Template
          </button>
        </div>

        {/* Configuration */}
        <div className="rounded-2xl p-6 mb-4" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider" style={{ color: "#64748b" }}>
            Issuance Configuration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
                Credential Template <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                style={{ background: "#0f172a", border: "1px solid #334155" }}>
                <option value="">Select template…</option>
                {templates?.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Exam (optional)</label>
              <select
                value={examId}
                onChange={(e) => setExamId(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                style={{ background: "#0f172a", border: "1px solid #334155" }}>
                <option value="">No exam linked</option>
                {exams?.map((e) => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Validity (months)</label>
              <input
                type="number"
                min={1}
                max={120}
                value={expiryMonths}
                onChange={(e) => setExpiryMonths(e.target.value ? Number(e.target.value) : "")}
                placeholder="No expiry"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                style={{ background: "#0f172a", border: "1px solid #334155" }}
              />
            </div>
          </div>
        </div>

        {/* Upload + Manual Entry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* CSV Upload */}
          <div
            className="rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
            style={{ background: "#1e293b", border: "2px dashed #334155" }}
            onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
            <Upload className="w-8 h-8" style={{ color: "#64748b" }} />
            <div className="text-center">
              <p className="text-sm font-medium text-white">Upload CSV</p>
              <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Columns: email, score (optional)</p>
            </div>
          </div>

          {/* Manual Entry */}
          <div className="rounded-2xl p-5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "#64748b" }}>Add Manually</p>
            <div className="flex gap-2 mb-2">
              <input
                type="email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addManual()}
                placeholder="candidate@email.com"
                className="flex-1 px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                style={{ background: "#0f172a", border: "1px solid #334155" }}
              />
              <input
                type="text"
                value={manualScore}
                onChange={(e) => setManualScore(e.target.value)}
                placeholder="Score"
                className="w-20 px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                style={{ background: "#0f172a", border: "1px solid #334155" }}
              />
            </div>
            <button onClick={addManual}
              className="w-full py-2 rounded-lg text-sm font-medium"
              style={{ background: "rgba(212,160,23,0.15)", color: "#d4a017", border: "1px solid rgba(212,160,23,0.3)" }}>
              Add Candidate
            </button>
          </div>
        </div>

        {/* Candidate List */}
        {candidates.length > 0 && (
          <div className="rounded-2xl mb-4" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #334155" }}>
              <p className="text-sm font-semibold text-white">{candidates.length} candidate{candidates.length !== 1 ? "s" : ""}</p>
              <button onClick={() => setCandidates([])}
                className="text-xs flex items-center gap-1"
                style={{ color: "#ef4444" }}>
                <Trash2 className="w-3 h-3" /> Clear all
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {candidates.map((c, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5"
                  style={{ borderBottom: i < candidates.length - 1 ? "1px solid #0f172a" : "none" }}>
                  {statusIcon(c.status)}
                  <span className="flex-1 text-sm text-white font-mono">{c.email}</span>
                  {c.score && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#0f172a", color: "#94a3b8" }}>{c.score}%</span>}
                  {c.reason && <span className="text-xs" style={{ color: "#f59e0b" }}>{c.reason}</span>}
                  {!c.status && (
                    <button onClick={() => removeRow(c.email)} style={{ color: "#475569" }}>
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issue Button */}
        <button
          onClick={handleIssue}
          disabled={bulkIssue.isPending || !templateId || !candidates.length}
          className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          style={{ background: "linear-gradient(135deg,#b8860b,#d4a017)", color: "#fff" }}>
          <Play className="w-4 h-4" />
          {bulkIssue.isPending
            ? `Issuing ${candidates.length} credentials…`
            : `Issue ${candidates.length || ""} Credential${candidates.length !== 1 ? "s" : ""}`}
        </button>

        {/* Results Summary */}
        {results && (
          <div className="mt-4 rounded-2xl overflow-hidden" style={{ border: "1px solid #334155" }}>
            <button
              onClick={() => setShowResults(!showResults)}
              className="w-full flex items-center justify-between px-5 py-4"
              style={{ background: "#1e293b" }}>
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#10b981" }}>
                  <CheckCircle className="w-4 h-4" /> {results.issued} Issued
                </span>
                <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#f59e0b" }}>
                  <AlertTriangle className="w-4 h-4" /> {results.skipped} Skipped
                </span>
                <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#ef4444" }}>
                  <XCircle className="w-4 h-4" /> {results.errors} Errors
                </span>
              </div>
              {showResults ? <ChevronUp className="w-4 h-4" style={{ color: "#64748b" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "#64748b" }} />}
            </button>
            {showResults && (
              <div className="max-h-64 overflow-y-auto" style={{ background: "#0f172a" }}>
                {results.results.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-2.5"
                    style={{ borderBottom: "1px solid #1e293b" }}>
                    {statusIcon(r.status)}
                    <span className="flex-1 text-sm font-mono" style={{ color: "#e2e8f0" }}>{r.email}</span>
                    {r.credentialId && <span className="text-xs font-mono" style={{ color: "#64748b" }}>{r.credentialId}</span>}
                    {r.reason && <span className="text-xs" style={{ color: "#f59e0b" }}>{r.reason}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </SDCLayout>
  );
}
