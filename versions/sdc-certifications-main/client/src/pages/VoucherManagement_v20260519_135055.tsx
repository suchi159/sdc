import React, { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import SDCLayout from "@/components/SDCLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Ticket,
  Plus,
  Download,
  Search,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  BarChart3,
  RefreshCw,
  Tag,
  Upload,
  MoreHorizontal,
  Ban,
  FileText,
  Filter,
} from "lucide-react";

export default function VoucherManagement() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [importText, setImportText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate form state
  const [genType, setGenType] = useState<"exam" | "book" | "bundle">("exam");
  const [genCount, setGenCount] = useState(10);
  const [genExpiryDays, setGenExpiryDays] = useState(30);
  const [genExamId, setGenExamId] = useState<number | undefined>();
  const [genBookId, setGenBookId] = useState<number | undefined>();

  const { data: vouchers = [], refetch: refetchVouchers } = trpc.vouchers.list.useQuery();
  const { data: stats } = trpc.vouchers.stats.useQuery();
  const { data: exams = [] } = trpc.exams.list.useQuery();
  const { data: books = [] } = trpc.books.list.useQuery();

  const generateMutation = trpc.vouchers.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedCodes(data.codes);
      refetchVouchers();
      toast.success(`${data.count} vouchers generated successfully`);
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelMutation = trpc.vouchers.cancel.useMutation({
    onSuccess: () => {
      refetchVouchers();
      toast.success("Voucher cancelled");
    },
    onError: (err) => toast.error(err.message),
  });

  const bulkImportMutation = trpc.vouchers.bulkImport.useMutation({
    onSuccess: (data) => {
      refetchVouchers();
      if (data.skipped > 0) {
        toast.success(`Imported ${data.imported} voucher${data.imported !== 1 ? 's' : ''}. ${data.skipped} skipped (duplicates).`);
      } else {
        toast.success(`${data.imported} voucher${data.imported !== 1 ? 's' : ''} imported successfully`);
      }
      setImportOpen(false);
      setImportText("");
    },
    onError: (err) => toast.error(err.message || "Import failed"),
  });

  const handleGenerate = () => {
    generateMutation.mutate({
      type: genType,
      count: genCount,
      expiryDays: genExpiryDays,
      examId: genType !== "book" ? genExamId : undefined,
      bookId: genType !== "exam" ? genBookId : undefined,
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyAllCodes = () => {
    navigator.clipboard.writeText(generatedCodes.join("\n"));
    toast.success("All codes copied to clipboard");
  };

  const downloadCodes = () => {
    const blob = new Blob([generatedCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vouchers-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAllCodes = () => {
    const rows = [
      ["Code", "Type", "Status", "Created", "Expires", "Redeemed By"],
      ...(vouchers as any[]).map((v: any) => [
        v.code,
        v.type,
        v.status || "active",
        v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "",
        v.expiresAt ? new Date(v.expiresAt).toLocaleDateString() : "No expiry",
        v.redeemedBy ? `User #${v.redeemedBy}` : "",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vouchers-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Vouchers exported as CSV");
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImportText(ev.target?.result as string || "");
    reader.readAsText(file);
  };

  const filtered = (vouchers as any[]).filter((v: any) => {
    const matchSearch = !search || v.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || v.status === filterStatus;
    const matchType = filterType === "all" || v.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const statusStyle: Record<string, { bg: string; color: string }> = {
    active:    { bg: "rgba(5,150,105,0.15)",   color: "#10b981" },
    redeemed:  { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa" },
    expired:   { bg: "rgba(220,38,38,0.15)",   color: "#f87171" },
    cancelled: { bg: "rgba(107,114,128,0.15)", color: "#9ca3af" },
  };

  const typeStyle: Record<string, { bg: string; color: string }> = {
    exam:   { bg: "rgba(139,92,246,0.15)", color: "#a78bfa" },
    book:   { bg: "rgba(200,151,42,0.15)", color: "#c8972a" },
    bundle: { bg: "rgba(20,184,166,0.15)", color: "#2dd4bf" },
  };

  const statCards = [
    { label: "Total Vouchers",   value: (stats as any)?.total ?? 0,              icon: Ticket,      color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
    { label: "Active",           value: (stats as any)?.active ?? 0,             icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    { label: "Redeemed",         value: (stats as any)?.redeemed ?? 0,           icon: Users,       color: "#60a5fa", bg: "rgba(59,130,246,0.12)" },
    { label: "Expired",          value: (stats as any)?.expired ?? 0,            icon: XCircle,     color: "#f87171", bg: "rgba(239,68,68,0.12)" },
    { label: "Redemption Rate",  value: `${(stats as any)?.redemptionRate ?? 0}%`, icon: BarChart3, color: "#c8972a", bg: "rgba(200,151,42,0.12)" },
  ];

  return (
    <SDCLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Voucher Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Generate, track, and manage exam and book access vouchers
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Import */}
            <button
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm border border-border bg-card text-foreground hover:bg-muted transition-colors"
            >
              <Upload className="w-4 h-4" /> Import
            </button>
            {/* Export */}
            <button
              onClick={exportAllCodes}
              className="flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm border border-border bg-card text-foreground hover:bg-muted transition-colors"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            {/* Generate */}
            <button
              onClick={() => { setGeneratedCodes([]); setGenerateOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)" }}
            >
              <Plus className="w-4 h-4" /> Generate Vouchers
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="p-4 rounded-2xl bg-card border border-border">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="text-2xl font-extrabold text-foreground tracking-tight">{value}</p>
              <p className="text-xs font-semibold text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Voucher Table */}
        <div className="rounded-2xl overflow-hidden bg-card border border-border">
          {/* Filters row */}
          <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-border">
            <div>
              <p className="font-bold text-sm text-foreground">Voucher List</p>
              <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} of {(vouchers as any[]).length} vouchers</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  placeholder="Search codes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl text-xs outline-none w-44 bg-background border border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 w-32 text-xs bg-background border-input"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="redeemed">Redeemed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-8 w-28 text-xs bg-background border-input"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="bundle">Bundle</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => { setSearch(""); setFilterStatus("all"); setFilterType("all"); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
              >
                <Filter className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border">
                  {["Code", "Type", "Status", "Created", "Expires", "Redeemed By", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                      <Tag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No vouchers found</p>
                      <p className="text-xs mt-1">Generate vouchers to get started</p>
                    </td>
                  </tr>
                ) : filtered.map((v: any) => {
                  const ss = statusStyle[v.status || "active"] || statusStyle.active;
                  const ts = typeStyle[v.type] || typeStyle.exam;
                  const isActive = (v.status || "active") === "active";
                  return (
                    <tr key={v.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono px-2 py-0.5 rounded-lg" style={{ background: "rgba(200,151,42,0.1)", color: "#c8972a" }}>{v.code}</code>
                          <button onClick={() => copyCode(v.code)} className="text-muted-foreground hover:text-foreground transition-colors">
                            {copiedCode === v.code ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold capitalize" style={{ background: ts.bg, color: ts.color }}>{v.type}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold capitalize" style={{ background: ss.bg, color: ss.color }}>{v.status || "active"}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {v.expiresAt ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(v.expiresAt).toLocaleDateString()}
                          </span>
                        ) : "No expiry"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {v.redeemedBy ? `User #${v.redeemedBy}` : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => copyCode(v.code)} className="gap-2 cursor-pointer">
                              <Copy className="w-3.5 h-3.5" /> Copy Code
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const blob = new Blob([v.code], { type: "text/plain" });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url; a.download = `${v.code}.txt`; a.click();
                              URL.revokeObjectURL(url);
                            }} className="gap-2 cursor-pointer">
                              <FileText className="w-3.5 h-3.5" /> Download
                            </DropdownMenuItem>
                            {isActive && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => cancelMutation.mutate({ voucherId: v.id })}
                                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <Ban className="w-3.5 h-3.5" /> Cancel Voucher
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Generate Vouchers Dialog */}
        <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
          <DialogContent className="max-w-lg bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <Ticket className="w-5 h-5 text-[#c8972a]" />
                Generate Vouchers
              </DialogTitle>
            </DialogHeader>
            {generatedCodes.length === 0 ? (
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Voucher Type</label>
                  <Select value={genType} onValueChange={(v) => setGenType(v as any)}>
                    <SelectTrigger className="bg-background border-input"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exam">Exam Access</SelectItem>
                      <SelectItem value="book">Book Access</SelectItem>
                      <SelectItem value="bundle">Bundle (Exam + Book)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(genType === "exam" || genType === "bundle") && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Exam</label>
                    <Select value={genExamId?.toString() || ""} onValueChange={(v) => setGenExamId(parseInt(v))}>
                      <SelectTrigger className="bg-background border-input"><SelectValue placeholder="Select exam..." /></SelectTrigger>
                      <SelectContent>
                        {(exams as any[]).map((e: any) => (
                          <SelectItem key={e.id} value={e.id.toString()}>{e.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {(genType === "book" || genType === "bundle") && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Book</label>
                    <Select value={genBookId?.toString() || ""} onValueChange={(v) => setGenBookId(parseInt(v))}>
                      <SelectTrigger className="bg-background border-input"><SelectValue placeholder="Select book..." /></SelectTrigger>
                      <SelectContent>
                        {(books as any[]).map((b: any) => (
                          <SelectItem key={b.id} value={b.id.toString()}>{b.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Quantity</label>
                    <input
                      type="number" min={1} max={500} value={genCount}
                      onChange={(e) => setGenCount(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl text-sm bg-background border border-input text-foreground outline-none focus:ring-2 focus:ring-ring"
                    />
                    <p className="text-xs text-muted-foreground">Max 500 at once</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Expiry (days)</label>
                    <input
                      type="number" min={1} value={genExpiryDays}
                      onChange={(e) => setGenExpiryDays(parseInt(e.target.value) || 30)}
                      className="w-full px-3 py-2 rounded-xl text-sm bg-background border border-input text-foreground outline-none focus:ring-2 focus:ring-ring"
                    />
                    <p className="text-xs text-muted-foreground">From today</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-60"
                    style={{ background: "#c8972a" }}
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending}
                  >
                    {generateMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
                    Generate {genCount} Vouchers
                  </button>
                  <button
                    className="px-4 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    onClick={() => setGenerateOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{generatedCodes.length} vouchers generated</p>
                  <div className="flex gap-2">
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={copyAllCodes}
                    >
                      <Copy className="w-3 h-3" /> Copy All
                    </button>
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={downloadCodes}
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto rounded-xl divide-y divide-border border border-border bg-background">
                  {generatedCodes.map((code) => (
                    <div key={code} className="flex items-center justify-between px-3 py-2 hover:bg-muted/30 transition-colors">
                      <code className="text-xs font-mono text-foreground">{code}</code>
                      <button onClick={() => copyCode(code)} className="text-muted-foreground hover:text-foreground transition-colors">
                        {copiedCode === code ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
                    style={{ background: "#c8972a" }}
                    onClick={() => { setGeneratedCodes([]); setGenerateOpen(false); }}
                  >
                    Done
                  </button>
                  <button
                    className="px-4 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    onClick={() => setGeneratedCodes([])}
                  >
                    Generate More
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogContent className="max-w-lg bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <Upload className="w-5 h-5 text-[#c8972a]" />
                Import Voucher Codes
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Upload a <strong className="text-foreground">.txt</strong> or <strong className="text-foreground">.csv</strong> file with one voucher code per line, or paste codes below.
              </p>
              <div
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-[#c8972a] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Click to upload file</p>
                <p className="text-xs text-muted-foreground mt-1">.txt or .csv, one code per line</p>
                <input ref={fileInputRef} type="file" accept=".txt,.csv" className="hidden" onChange={handleImportFile} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Or paste codes manually</label>
                <textarea
                  rows={5}
                  placeholder={"SDC-EXAM-XXXX\nSDC-EXAM-YYYY\n..."}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-background border border-input text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
                />
              </div>
              {importText && (
                <p className="text-xs text-muted-foreground">
                  {importText.split("\n").filter(l => l.trim()).length} codes detected
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-60"
                  style={{ background: "#c8972a", opacity: bulkImportMutation.isPending ? 0.7 : 1 }}
                  disabled={!importText.trim() || bulkImportMutation.isPending}
                  onClick={() => {
                    const codes = importText.split("\n").map(l => l.trim()).filter(Boolean);
                    if (!codes.length) { toast.error("No codes found"); return; }
                    bulkImportMutation.mutate({
                      vouchers: codes.map(code => ({ code, type: "exam" as const })),
                    });
                  }}
                >
                  {bulkImportMutation.isPending ? "Importing..." : `Import ${importText.split("\n").filter(l => l.trim()).length || 0} Codes`}
                </button>
                <button
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => { setImportOpen(false); setImportText(""); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </SDCLayout>
  );
}
