import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Banknote,
  CreditCard,
  ArrowDownToLine,
  Building2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  paid_out: "bg-blue-100 text-blue-700 border-blue-200",
};

const payoutStatusColors: Record<string, string> = {
  requested: "bg-amber-100 text-amber-700 border-amber-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

// Build monthly chart data from earnings
function buildMonthlyData(earnings: any[]) {
  const months: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    months[key] = 0;
  }
  earnings.forEach((e) => {
    const d = new Date(e.earnedAt);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    if (key in months) {
      months[key] += e.amount;
    }
  });
  return Object.entries(months).map(([month, amount]) => ({
    month,
    amount: amount / 100,
  }));
}

export default function ProctorEarnings() {
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Bank form
  const [bankForm, setBankForm] = useState({
    accountHolderName: "",
    bankName: "",
    accountLast4: "",
    routingNumber: "",
    accountType: "checking" as "checking" | "savings",
  });

  const { data: summary, refetch: refetchSummary } = trpc.proctor.earnings.summary.useQuery();
  const { data: earnings = [], refetch: refetchEarnings } = trpc.proctor.earnings.list.useQuery();
  const { data: payouts = [], refetch: refetchPayouts } = trpc.proctor.payouts.list.useQuery();
  const { data: bankAccount, refetch: refetchBank } = trpc.proctor.bankAccount.get.useQuery();

  const requestPayout = trpc.proctor.payouts.request.useMutation({
    onSuccess: () => {
      toast.success("Withdrawal request submitted successfully");
      setWithdrawOpen(false);
      setWithdrawAmount("");
      refetchSummary();
      refetchPayouts();
    },
    onError: (err) => toast.error(err.message),
  });

  const saveBank = trpc.proctor.bankAccount.save.useMutation({
    onSuccess: () => {
      toast.success("Bank account saved successfully");
      setBankOpen(false);
      refetchBank();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleWithdraw = () => {
    const cents = Math.round(parseFloat(withdrawAmount) * 100);
    if (isNaN(cents) || cents < 1000) {
      toast.error("Minimum withdrawal is $10.00");
      return;
    }
    requestPayout.mutate({ amount: cents });
  };

  const handleSaveBank = () => {
    if (!bankForm.accountHolderName || !bankForm.bankName || !bankForm.accountLast4 || !bankForm.routingNumber) {
      toast.error("Please fill in all required fields");
      return;
    }
    saveBank.mutate(bankForm);
  };

  const monthlyData = buildMonthlyData(earnings);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings & Payouts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your proctoring earnings and manage withdrawals
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              if (bankAccount) {
                setBankForm({
                  accountHolderName: bankAccount.accountHolderName,
                  bankName: bankAccount.bankName,
                  accountLast4: bankAccount.accountLast4,
                  routingNumber: bankAccount.routingNumber,
                  accountType: bankAccount.accountType as "checking" | "savings",
                });
              }
              setBankOpen(true);
            }}
          >
            <Building2 className="w-4 h-4" />
            {bankAccount ? "Update Bank Account" : "Add Bank Account"}
          </Button>
          <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-[#c8972a] hover:bg-[#b07d1e] text-white gap-2"
                disabled={!bankAccount || (summary?.available ?? 0) < 1000}
              >
                <ArrowDownToLine className="w-4 h-4" />
                Request Withdrawal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ArrowDownToLine className="w-5 h-5 text-[#c8972a]" />
                  Request Withdrawal
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-xs text-emerald-700 font-medium">Available Balance</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">
                    {formatCents(summary?.available ?? 0)}
                  </p>
                </div>

                {bankAccount && (
                  <div className="bg-gray-50 border rounded-lg p-3 flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">{bankAccount.bankName}</p>
                      <p className="text-xs text-gray-500">
                        {bankAccount.accountType} ••••{bankAccount.accountLast4}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Withdrawal Amount (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      min="10"
                      step="0.01"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum withdrawal: $10.00</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-[#c8972a] hover:bg-[#b07d1e] text-white"
                    onClick={handleWithdraw}
                    disabled={requestPayout.isPending}
                  >
                    {requestPayout.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <ArrowDownToLine className="w-4 h-4 mr-2" />
                    )}
                    Submit Request
                  </Button>
                  <Button variant="outline" onClick={() => setWithdrawOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bank Account Dialog */}
      <Dialog open={bankOpen} onOpenChange={setBankOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#c8972a]" />
              Bank Account Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Your banking information is encrypted and stored securely. Payouts are processed within 2-3 business days.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Account Holder Name *</Label>
                <Input
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                  placeholder="Full legal name"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Bank Name *</Label>
                <Input
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  placeholder="e.g. Chase, Bank of America"
                />
              </div>
              <div className="space-y-2">
                <Label>Last 4 Digits *</Label>
                <Input
                  value={bankForm.accountLast4}
                  onChange={(e) => setBankForm({ ...bankForm, accountLast4: e.target.value.slice(0, 4) })}
                  placeholder="1234"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select
                  value={bankForm.accountType}
                  onValueChange={(v) => setBankForm({ ...bankForm, accountType: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Routing Number *</Label>
                <Input
                  value={bankForm.routingNumber}
                  onChange={(e) => setBankForm({ ...bankForm, routingNumber: e.target.value })}
                  placeholder="9-digit routing number"
                  maxLength={9}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-[#c8972a] hover:bg-[#b07d1e] text-white"
                onClick={handleSaveBank}
                disabled={saveBank.isPending}
              >
                {saveBank.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Save Bank Account
              </Button>
              <Button variant="outline" onClick={() => setBankOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Earned",
            value: formatCents(summary?.total ?? 0),
            icon: DollarSign,
            color: "text-gray-700",
            bg: "bg-gray-50",
            desc: "All time",
          },
          {
            label: "Available",
            value: formatCents(summary?.available ?? 0),
            icon: CheckCircle,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            desc: "Ready to withdraw",
          },
          {
            label: "Pending",
            value: formatCents(summary?.pending ?? 0),
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
            desc: "Processing",
          },
          {
            label: "Paid Out",
            value: formatCents(summary?.paidOut ?? 0),
            icon: TrendingUp,
            color: "text-blue-600",
            bg: "bg-blue-50",
            desc: "Withdrawn",
          },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Monthly Earnings</CardTitle>
          <CardDescription className="text-xs">Last 6 months earnings trend</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Earnings"]}
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="amount"
                fill="#c8972a"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings History */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Earnings History</CardTitle>
            <CardDescription className="text-xs">Per-session earnings breakdown</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="text-xs font-semibold text-gray-600 pl-4">Description</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">Amount</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 pr-4">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                      <Banknote className="w-6 h-6 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No earnings yet</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  earnings.slice(0, 10).map((e) => (
                    <TableRow key={e.id} className="hover:bg-gray-50/50">
                      <TableCell className="pl-4">
                        <p className="text-xs font-medium text-gray-700">
                          {e.description || `Session #${e.sessionId || e.id}`}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{e.type.replace("_", " ")}</p>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCents(e.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${statusColors[e.status] || ""}`}
                        >
                          {e.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 pr-4">
                        {new Date(e.earnedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payout History */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Payout History</CardTitle>
            <CardDescription className="text-xs">Withdrawal requests and status</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="text-xs font-semibold text-gray-600 pl-4">Amount</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">Bank</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 pr-4">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                      <CreditCard className="w-6 h-6 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No payouts yet</p>
                      <p className="text-xs mt-1">Request a withdrawal to get started</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  payouts.map((p) => (
                    <TableRow key={p.id} className="hover:bg-gray-50/50">
                      <TableCell className="pl-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCents(p.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {p.bankAccountName ? (
                          <span>••••{p.bankAccountLast4}</span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${payoutStatusColors[p.status] || ""}`}
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 pr-4">
                        {new Date(p.requestedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Bank Account Status */}
      {!bankAccount && (
        <Card className="border-0 shadow-sm border-l-4 border-l-amber-400 bg-amber-50/50">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">No bank account on file</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Add your bank account details to enable withdrawal requests.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => setBankOpen(true)}
            >
              Add Bank Account
            </Button>
          </CardContent>
        </Card>
      )}
  </div>
  );
}
