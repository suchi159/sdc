import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import SDCLayout from "@/components/SDCLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Ticket,
  BookOpen,
  Package,
  Minus,
  Plus,
  ShoppingCart,
  Search,
  Clock,
  RefreshCw,
  CheckCircle,
  History,
  CreditCard,
  ChevronRight,
  GraduationCap,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Types ────────────────────────────────────────────────────────────────────

type PurchaseType = "vouchers" | "books" | "bundle";

type BookItem = {
  id: number;
  title: string;
  author?: string | null;
  isbn?: string | null;
  description?: string | null;
  price?: string | null;
  industry?: string | null;
  coverUrl?: string | null;
  linkedExamId?: number | null;
  status?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VOUCHER_PRICE = 25; // $ per voucher
const QUICK_COUNTS = [10, 25, 50, 100];

function fmt(dollars: number) {
  return `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function bookPrice(book: BookItem): number {
  const p = parseFloat(book.price || "49");
  return isNaN(p) ? 49 : p;
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function PurchaseTypeCard({
  type,
  label,
  sublabel,
  icon: Icon,
  selected,
  badge,
  onClick,
}: {
  type: PurchaseType;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  selected: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer w-full ${
        selected
          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
          : "border-border bg-card hover:border-amber-400/60 hover:bg-muted/50"
      }`}
    >
      {badge && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
          {badge}
        </span>
      )}
      <div
        className={`h-10 w-10 rounded-xl flex items-center justify-center ${
          selected ? "bg-amber-500/20" : "bg-muted"
        }`}
      >
        <Icon
          className={`h-5 w-5 ${selected ? "text-amber-500" : "text-muted-foreground"}`}
        />
      </div>
      <div className="text-center">
        <p className={`font-semibold text-sm ${selected ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </div>
    </button>
  );
}

function BookCard({
  book,
  selected,
  onToggle,
}: {
  book: BookItem;
  selected: boolean;
  onToggle: () => void;
}) {
  const price = bookPrice(book);
  const levelLabel = book.industry || "General";
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 text-left ${
        selected
          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
          : "border-border bg-card hover:border-amber-400/40 hover:bg-muted/30"
      }`}
    >
      <div
        className={`h-16 w-12 rounded-lg overflow-hidden flex items-center justify-center shrink-0 ${
          selected ? "ring-2 ring-amber-500" : ""
        }`}
      >
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={`h-full w-full flex items-center justify-center ${
            selected ? "bg-amber-500/20" : "bg-muted"
          }`}>
            <BookOpen className={`h-6 w-6 ${selected ? "text-amber-500" : "text-muted-foreground"}`} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{book.title}</p>
        {book.author && (
          <p className="text-xs text-muted-foreground truncate">{book.author}</p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            <GraduationCap className="h-2.5 w-2.5 mr-1" />
            {levelLabel}
          </Badge>
          {book.isbn && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              {book.isbn}
            </span>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-bold text-base text-foreground">{fmt(price)}</p>
        {selected && (
          <CheckCircle className="h-4 w-4 text-amber-500 ml-auto mt-1" />
        )}
      </div>
    </button>
  );
}

function TransactionHistoryDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: history = [], isLoading } = trpc.stripe.history.useQuery(undefined, {
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <History className="h-5 w-5 text-amber-500" />
            Transaction History
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (history as any[]).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Vouchers</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(history as any[]).map((tx: any) => (
                  <TableRow key={tx.id} className="border-border">
                    <TableCell className="text-sm text-muted-foreground">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-foreground capitalize">
                      {tx.plan || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {tx.amount ? fmt(tx.amount / 100) : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {tx.credits ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          tx.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                            : tx.status === "pending"
                            ? "bg-amber-500/20 text-amber-500 border-amber-500/30"
                            : "bg-red-500/20 text-red-500 border-red-500/30"
                        }
                        variant="outline"
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BuyVouchers() {
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("vouchers");
  const [voucherCount, setVoucherCount] = useState(10);
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [bookSearch, setBookSearch] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Data
  const { data: booksData = [], isLoading: booksLoading } = trpc.books.list.useQuery();
  const { data: balanceData } = trpc.ledger.balance.useQuery();
  const balance = (balanceData as any)?.balance ?? 0;

  const allBooks = booksData as BookItem[];

  const filteredBooks = useMemo(() => {
    if (!bookSearch.trim()) return allBooks;
    const q = bookSearch.toLowerCase();
    return allBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.author || "").toLowerCase().includes(q) ||
        (b.industry || "").toLowerCase().includes(q)
    );
  }, [allBooks, bookSearch]);

  // Checkout mutation
  const createCustomCheckout = trpc.stripe.createCustomCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to secure checkout…");
        window.open(data.url, "_blank");
      } else {
        toast.error("Failed to create checkout session");
      }
      setCheckoutLoading(false);
    },
    onError: (err) => {
      toast.error(err.message);
      setCheckoutLoading(false);
    },
  });

  const verifyPayment = trpc.stripe.verifyPayment.useMutation({
    onSuccess: (data) => {
      setVerifying(false);
      if (data.success) {
        setPaymentSuccess(true);
        toast.success(`Payment successful! ${data.credits} vouchers added.`);
      } else {
        toast.error(data.message || "Payment verification failed");
      }
    },
    onError: () => {
      setVerifying(false);
      toast.error("Payment verification failed");
    },
  });

  // Handle payment-success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId && !verifying && !paymentSuccess) {
      setVerifying(true);
      verifyPayment.mutate({ sessionId });
    }
  }, []);

  // ── Derived order summary ──────────────────────────────────────────────────

  const voucherSubtotal =
    (purchaseType === "vouchers" || purchaseType === "bundle") ? voucherCount * VOUCHER_PRICE : 0;

  const selectedBooks = useMemo(
    () => allBooks.filter((b) => selectedBookIds.includes(b.id)),
    [allBooks, selectedBookIds]
  );

  const booksSubtotal =
    (purchaseType === "books" || purchaseType === "bundle")
      ? selectedBooks.reduce((sum, b) => sum + bookPrice(b), 0)
      : 0;

  const subtotal = voucherSubtotal + booksSubtotal;

  const isBundleEligible =
    purchaseType === "bundle" && voucherCount > 0 && selectedBookIds.length > 0;

  const discount = isBundleEligible ? Math.round(subtotal * 0.15) : 0;
  const total = subtotal - discount;

  const canCheckout =
    (purchaseType === "vouchers" && voucherCount > 0) ||
    (purchaseType === "books" && selectedBookIds.length > 0) ||
    (purchaseType === "bundle" && (voucherCount > 0 || selectedBookIds.length > 0));

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleVoucherCount(delta: number) {
    setVoucherCount((c) => Math.max(1, Math.min(10000, c + delta)));
  }

  function handleVoucherInput(val: string) {
    const n = parseInt(val, 10);
    if (!isNaN(n)) setVoucherCount(Math.max(1, Math.min(10000, n)));
  }

  function toggleBook(id: number) {
    setSelectedBookIds((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]
    );
  }

  function handleCheckout() {
    if (!canCheckout) return;
    setCheckoutLoading(true);
    const origin = window.location.origin;
    createCustomCheckout.mutate({
      purchaseType,
      voucherCount: purchaseType === "books" ? 0 : voucherCount,
      bookIds: purchaseType === "vouchers" ? [] : selectedBookIds,
      successUrl: `${origin}/org/buy-vouchers?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/org/buy-vouchers`,
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const showVouchers = purchaseType === "vouchers" || purchaseType === "bundle";
  const showBooks = purchaseType === "books" || purchaseType === "bundle";

  return (
    <SDCLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Purchase Exam Vouchers</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Buy exam vouchers to schedule assessments through Assess.ai integration
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5">
              <Ticket className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-[10px] text-muted-foreground leading-none">Current Balance</p>
                <p className="text-lg font-extrabold text-amber-500 leading-tight">
                  {Number(balance).toLocaleString()} vouchers
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoryOpen(true)}
              className="border-border text-foreground"
            >
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
          </div>
        </div>

        {/* Payment success / verifying banners */}
        {verifying && (
          <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3">
            <RefreshCw className="h-5 w-5 text-blue-400 animate-spin shrink-0" />
            <p className="text-blue-400 font-medium text-sm">Verifying your payment…</p>
          </div>
        )}
        {paymentSuccess && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
            <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            <p className="text-emerald-400 font-medium text-sm">
              Payment successful! Your vouchers have been added to your account.
            </p>
          </div>
        )}

        {/* Main configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: configurator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Purchase type */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="font-semibold text-foreground mb-4">What would you like to purchase?</p>
              <div className="grid grid-cols-3 gap-3">
                <PurchaseTypeCard
                  type="vouchers"
                  label="Voucher Only"
                  sublabel="Exam access"
                  icon={Ticket}
                  selected={purchaseType === "vouchers"}
                  onClick={() => setPurchaseType("vouchers")}
                />
                <PurchaseTypeCard
                  type="books"
                  label="Book Only"
                  sublabel="Study materials"
                  icon={BookOpen}
                  selected={purchaseType === "books"}
                  onClick={() => setPurchaseType("books")}
                />
                <PurchaseTypeCard
                  type="bundle"
                  label="Bundle"
                  sublabel="Both included"
                  icon={Package}
                  selected={purchaseType === "bundle"}
                  badge="SAVE 15%"
                  onClick={() => setPurchaseType("bundle")}
                />
              </div>
            </div>

            {/* Step 2: Exam Vouchers */}
            {showVouchers && (
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Ticket className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Exam Vouchers</p>
                    <p className="text-xs text-muted-foreground">${VOUCHER_PRICE} per voucher</p>
                  </div>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleVoucherCount(-1)}
                    className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors border border-border"
                  >
                    <Minus className="h-4 w-4 text-foreground" />
                  </button>
                  <input
                    type="number"
                    value={voucherCount}
                    onChange={(e) => handleVoucherInput(e.target.value)}
                    className="flex-1 h-11 text-center text-xl font-bold bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    min={1}
                    max={10000}
                  />
                  <button
                    onClick={() => handleVoucherCount(1)}
                    className="h-11 w-11 rounded-xl bg-amber-500 flex items-center justify-center hover:bg-amber-600 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-white" />
                  </button>
                </div>

                {/* Quick-select chips */}
                <div className="flex gap-2 flex-wrap">
                  {QUICK_COUNTS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setVoucherCount(n)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        voucherCount === n
                          ? "bg-amber-500 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/70 border border-border"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Study Materials */}
            {showBooks && (
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Study Materials</p>
                    <p className="text-xs text-muted-foreground">Choose your certification</p>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by certification, name, or level…"
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    className="w-full pl-9 pr-4 h-10 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  {bookSearch && (
                    <button
                      onClick={() => setBookSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>

                {/* Book list */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {booksLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredBooks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">
                        {bookSearch ? "No books match your search" : "No books available"}
                      </p>
                    </div>
                  ) : (
                    filteredBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        selected={selectedBookIds.includes(book.id)}
                        onToggle={() => toggleBook(book.id)}
                      />
                    ))
                  )}
                </div>

                {selectedBookIds.length > 0 && (
                  <p className="text-xs text-amber-500 font-medium">
                    {selectedBookIds.length} book{selectedBookIds.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-5 sticky top-6 space-y-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-foreground" />
                <h3 className="font-bold text-foreground">Order Summary</h3>
              </div>

              {!canCheckout ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
                  <Package className="h-12 w-12 opacity-20" />
                  <p className="text-sm text-center">Select items to see pricing</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Vouchers line */}
                  {showVouchers && voucherCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-blue-500" />
                        <span className="text-foreground">
                          {voucherCount} Exam Voucher{voucherCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground">{fmt(voucherSubtotal)}</span>
                    </div>
                  )}

                  {/* Books lines */}
                  {showBooks &&
                    selectedBooks.map((book) => (
                      <div key={book.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <BookOpen className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="text-foreground truncate max-w-[140px]">{book.title}</span>
                        </div>
                        <span className="font-semibold text-foreground shrink-0">{fmt(bookPrice(book))}</span>
                      </div>
                    ))}

                  {/* Subtotal */}
                  {(voucherSubtotal > 0 || booksSubtotal > 0) && (
                    <>
                      <div className="border-t border-border pt-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">{fmt(subtotal)}</span>
                      </div>

                      {/* Bundle discount */}
                      {isBundleEligible && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-emerald-500 font-medium">Bundle Discount (15%)</span>
                          <span className="text-emerald-500 font-medium">-{fmt(discount)}</span>
                        </div>
                      )}

                      {/* Total */}
                      <div className="border-t border-border pt-2 flex items-center justify-between">
                        <span className="font-bold text-foreground">Total</span>
                        <span className="text-2xl font-extrabold text-foreground">{fmt(total)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Checkout button */}
              <Button
                onClick={handleCheckout}
                disabled={!canCheckout || checkoutLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-11"
              >
                {checkoutLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Proceed to Checkout
                {canCheckout && !checkoutLoading && (
                  <ChevronRight className="h-4 w-4 ml-1" />
                )}
              </Button>

              {/* Cancel link */}
              <button
                onClick={() => {
                  setVoucherCount(10);
                  setSelectedBookIds([]);
                  setBookSearch("");
                  setPurchaseType("vouchers");
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                Cancel
              </button>

              {/* Test card notice */}
              <div className="border-t border-border pt-3">
                <p className="text-[11px] text-muted-foreground">
                  <strong className="text-foreground">Test mode:</strong> Use{" "}
                  <code className="bg-muted px-1 rounded text-[10px] font-mono">4242 4242 4242 4242</code>{" "}
                  with any future expiry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TransactionHistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </SDCLayout>
  );
}
