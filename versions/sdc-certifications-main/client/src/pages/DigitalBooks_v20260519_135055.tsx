import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { BookOpen, Lock, Search, ShoppingCart, MessageSquare, Send, X, Cpu, Star, BookMarked, ChevronRight, GraduationCap, CheckCircle2, XCircle, RotateCcw, Trophy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function DigitalBooks() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"store" | "library">("store");
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);

  const [readingBook, setReadingBook] = useState<any>(null);
  const [practiceBook, setPracticeBook] = useState<any>(null);
  const [practiceQ, setPracticeQ] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, string>>({});
  const [practiceRevealed, setPracticeRevealed] = useState<Record<number, boolean>>({});
  const [practiceDone, setPracticeDone] = useState(false);

  const openPractice = (book: any) => {
    setPracticeBook(book);
    setPracticeQ(0);
    setPracticeAnswers({});
    setPracticeRevealed({});
    setPracticeDone(false);
  };

  const closePractice = () => setPracticeBook(null);

  // Live practice questions from the Question Bank
  const { data: liveQuestions, isLoading: practiceLoading } = trpc.questions.forBook.useQuery(
    { bookId: practiceBook?.id ?? 0, limit: 10 },
    { enabled: !!practiceBook?.id }
  );

  const utils = trpc.useUtils();
  const { data: allBooks, isLoading: booksLoading } = trpc.books.list.useQuery();
  const { data: myBooks, refetch: refetchMyBooks } = trpc.books.myBooks.useQuery();
  const purchaseMutation = trpc.books.purchase.useMutation({
    onSuccess: (data: any) => {
      toast.success(`"${data.bookTitle}" added to your library!`);
      refetchMyBooks();
    },
    onError: (e: any) => toast.error(e.message || "Purchase failed"),
  });
  const aiTutorMutation = trpc.books.aiTutor.useMutation({
    onSuccess: (data: any) => {
      const answerText = typeof data.answer === "string" ? data.answer : String(data.answer || "");
      setChatHistory(prev => [...prev, { role: "ai" as const, text: answerText }]);
    },
    onError: () => toast.error("AI Tutor error. Please try again."),
  });

  const bookList = (allBooks as any) || [];
  const myBookList = (myBooks as any) || [];
  const filteredBooks = bookList.filter((b: any) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    (b.author || "").toLowerCase().includes(search.toLowerCase())
  );
  // myBooks returns {access, book} join rows — extract the book id from the nested object
  const ownedIds = new Set(myBookList.map((b: any) => b.book?.id ?? b.access?.bookId ?? b.id).filter(Boolean));

  const openTutor = (book: any) => {
    setSelectedBook(book);
    setAiTutorOpen(true);
    setChatHistory([{ role: "ai", text: `Hello! I'm your AI Tutor for "${book.title}". Ask me anything about this book's content.` }]);
  };

  const handleAskTutor = () => {
    if (!question.trim() || !selectedBook) return;
    setChatHistory(prev => [...prev, { role: "user", text: question }]);
    aiTutorMutation.mutate({ bookId: selectedBook.id, question });
    setQuestion("");
  };

  // Flatten myBookList for the library tab: each row is {access, book} — extract the book object
  const myBooksFlat = myBookList.map((b: any) => b.book ?? b).filter((b: any) => b?.id);
  const displayBooks = activeTab === "store" ? filteredBooks : myBooksFlat;

  return (
    <SDCLayout>
      <div className="p-8 space-y-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--sdc-heading)" }}>Digital Library</h1>
            <p style={{ color: "var(--sdc-subheading)", fontSize: 15, marginTop: 4 }}>Browse, purchase, and study with AI-powered digital books.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)" }}>
            <BookOpen className="w-4 h-4" style={{ color: "#8b5cf6" }} />
            <span className="text-sm font-bold" style={{ color: "#8b5cf6" }}>{myBookList.length} Books Owned</span>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            {[{ key: "store", label: "Book Store" }, { key: "library", label: "My Library" }].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key as any)}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                style={{ background: activeTab === key ? "#c8972a" : "transparent", color: activeTab === key ? "#fff" : "#64748b" }}>
                {label}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--sdc-text-muted)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books by title or author..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
          </div>
        </div>

        {/* Books Grid */}
        {booksLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                {/* Cover skeleton */}
                <Skeleton className="h-40 w-full rounded-none" style={{ background: "#1e293b" }} />
                {/* Info skeleton */}
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4 bg-[var(--sdc-skeleton-base)]" />
                  <Skeleton className="h-3 w-1/2 bg-[var(--sdc-skeleton-base)]" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-12 bg-[var(--sdc-skeleton-base)]" />
                    <Skeleton className="h-5 w-10 rounded-lg bg-[var(--sdc-skeleton-base)]" />
                  </div>
                  <Skeleton className="h-8 w-full rounded-xl bg-[var(--sdc-skeleton-base)]" />
                </div>
              </div>
            ))}
          </div>
        ) : displayBooks.length === 0 ? (
          <div className="py-20 text-center rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <BookOpen className="w-14 h-14 mx-auto mb-4" style={{ color: "#d1d5db" }} />
            <h3 className="font-bold text-lg mb-2" style={{ color: "var(--sdc-text)" }}>
              {activeTab === "library" ? "No books in your library" : "No books found"}
            </h3>
            <p style={{ color: "var(--sdc-text-muted)", fontSize: 14 }}>
              {activeTab === "library" ? "Browse the store to purchase books." : "Try a different search term."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayBooks.map((book: any) => {
              const owned = ownedIds.has(book.id);
              return (
                <div key={book.id} className="rounded-2xl overflow-hidden transition-all group"
                  style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  {/* Cover */}
                  <div className="h-40 flex items-center justify-center relative overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #0a1628, #1e293b)" }}>
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-12 h-12" style={{ color: "rgba(200,151,42,0.4)" }} />
                    )}
                    {book.drmEnabled && (
                      <div className="absolute top-2 right-2 p-1.5 rounded-lg" style={{ background: "rgba(0,0,0,0.4)" }}>
                        <Lock className="w-3 h-3" style={{ color: "var(--sdc-text-muted)" }} />
                      </div>
                    )}
                    {owned && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-xs font-bold"
                        style={{ background: "rgba(16,185,129,0.2)", color: "#10b981", border: "1px solid rgba(16,185,129,0.4)" }}>
                        Owned
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-1 line-clamp-2" style={{ color: "var(--sdc-heading)" }}>{book.title}</h3>
                    <p className="text-xs mb-3" style={{ color: "var(--sdc-text-muted)" }}>{book.author || "SDC Publications"}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold" style={{ color: "#c8972a", fontSize: 16 }}>
                        {book.price ? `$${book.price}` : "Free"}
                      </span>
                      {book.edition && <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "var(--sdc-page-bg)", color: "var(--sdc-subheading)" }}>v{book.edition}</span>}
                    </div>
                    <div className="flex flex-col gap-2">
                      {owned ? (
                        activeTab === "store" ? (
                          // Store tab: show disabled Already Owned button + quick-access Read shortcut
                          <>
                            <button
                              disabled
                              className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                              style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", opacity: 0.85 }}>
                              <CheckCircle className="w-3.5 h-3.5" /> Already Owned
                            </button>
                            <button onClick={() => setReadingBook(book)}
                              className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                              style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.2)" }}>
                              <BookMarked className="w-3.5 h-3.5" /> Read
                            </button>
                          </>
                        ) : (
                          // Library tab: show Read + AI Tutor + Practice Test
                          <>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setReadingBook(book)}
                                className="flex-1 py-2 rounded-xl text-xs font-bold"
                                style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.2)" }}>
                                <BookMarked className="w-3.5 h-3.5 inline mr-1" /> Read
                              </button>
                              <button onClick={() => openTutor(book)}
                                className="flex-1 py-2 rounded-xl text-xs font-bold"
                                style={{ background: "rgba(200,151,42,0.1)", color: "#c8972a", border: "1px solid rgba(200,151,42,0.2)" }}>
                                <Cpu className="w-3.5 h-3.5 inline mr-1" /> AI Tutor
                              </button>
                            </div>
                            <button onClick={() => openPractice(book)}
                              className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                              style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                              <GraduationCap className="w-3.5 h-3.5" /> Practice Test
                            </button>
                          </>
                        )
                      ) : (
                        <button
                          onClick={() => purchaseMutation.mutate({ bookId: book.id })}
                          disabled={purchaseMutation.isPending}
                          className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                          style={{ background: "linear-gradient(135deg, #c8972a, #e6b84a)", color: "#fff", opacity: purchaseMutation.isPending ? 0.7 : 1 }}>
                          <ShoppingCart className="w-3.5 h-3.5" /> {purchaseMutation.isPending ? "Processing..." : (book.price ? `Buy $${book.price}` : "Get Free")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* E-Reader Modal */}
      {readingBook && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#1e293b" }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ background: "var(--sdc-notif-bg)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(200,151,42,0.2)" }}>
                <BookOpen className="w-4 h-4" style={{ color: "#c8972a" }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: "#fff" }}>{readingBook.title}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{readingBook.author || "SDC Publications"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => { setReadingBook(null); openTutor(readingBook); }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                style={{ background: "rgba(200,151,42,0.2)", color: "#c8972a" }}>
                <Cpu className="w-3.5 h-3.5" /> AI Tutor
              </button>
              <button onClick={() => setReadingBook(null)} className="p-2 rounded-lg" style={{ color: "rgba(255,255,255,0.5)" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
            <div className="prose prose-invert max-w-none">
              <h2 style={{ color: "#e2e8f0", fontWeight: 800, fontSize: 24, marginBottom: 16 }}>{readingBook.title}</h2>
              {readingBook.author && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 24 }}>By {readingBook.author}</p>}
              {readingBook.description ? (
                <div style={{ color: "#cbd5e1", lineHeight: 1.8, fontSize: 16 }}>
                  {readingBook.description.split("\n").map((para: string, i: number) => (
                    <p key={i} style={{ marginBottom: 16 }}>{para}</p>
                  ))}
                </div>
              ) : (
                <div style={{ color: "var(--sdc-text-muted)", textAlign: "center", paddingTop: 80 }}>
                  <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: "rgba(200,151,42,0.3)" }} />
                  <p style={{ fontSize: 18, fontWeight: 600, color: "var(--sdc-subheading)", marginBottom: 8 }}>Content Preview</p>
                  <p style={{ fontSize: 14 }}>Full digital content for "{readingBook.title}" is available in the complete edition.</p>
                  <p style={{ fontSize: 13, marginTop: 8 }}>Use the AI Tutor to ask questions about this book's topics.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Tutor Panel */}
      {aiTutorOpen && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            {/* Header */}
            <div className="flex items-center justify-between p-5" style={{ background: "linear-gradient(135deg, #03071e, #0a1628)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(200,151,42,0.2)" }}>
                  <Cpu className="w-5 h-5" style={{ color: "#c8972a" }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#fff" }}>AI Tutor</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{selectedBook.title}</p>
                </div>
              </div>
              <button onClick={() => setAiTutorOpen(false)} className="p-2 rounded-lg" style={{ color: "rgba(255,255,255,0.5)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Chat */}
            <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 320 }}>
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm"
                    style={{
                      background: msg.role === "user" ? "linear-gradient(135deg, #c8972a, #e6b84a)" : "#f8fafc",
                      color: msg.role === "user" ? "#fff" : "#1e293b",
                      border: msg.role === "ai" ? "1px solid #eef1f7" : "none"
                    }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiTutorMutation.isPending && (
                <div className="flex justify-start">
                  <div className="px-4 py-2.5 rounded-2xl text-sm" style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-text-muted)" }}>
                    Thinking...
                  </div>
                </div>
              )}
            </div>
            {/* Input */}
            <div className="p-4 flex items-center gap-3" style={{ borderTop: "1px solid #f1f5f9" }}>
              <input value={question} onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAskTutor()}
                placeholder="Ask about this book..."
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
              <button onClick={handleAskTutor} disabled={!question.trim() || aiTutorMutation.isPending}
                className="p-2.5 rounded-xl"
                style={{ background: "linear-gradient(135deg, #c8972a, #e6b84a)", color: "#fff" }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Practice Test Modal */}
      {practiceBook && (() => {
        // Normalise live questions from the Question Bank into the modal's expected shape
        const normaliseQ = (q: any) => ({
          id: q.id,
          stem: q.stem,
          options: Array.isArray(q.options) ? q.options : [
            { id: "a", text: "Option A" }, { id: "b", text: "Option B" },
            { id: "c", text: "Option C" }, { id: "d", text: "Option D" },
          ],
          correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : (q.correctAnswer ?? "a"),
          explanation: q.explanation || "No explanation provided.",
        });

        const questions = (liveQuestions && liveQuestions.length > 0)
          ? (liveQuestions as any[]).map(normaliseQ)
          : [];
        const total = questions.length;
        const currentQuestion = questions[practiceQ];
        const selectedAnswer = practiceAnswers[practiceQ];
        const revealed = practiceRevealed[practiceQ];
        const score = Object.entries(practiceAnswers).filter(([qi, ans]) => questions[parseInt(qi)]?.correctAnswer === ans).length;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
            <div className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col" style={{ background: "var(--sdc-card-bg)", maxHeight: "90vh" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ background: "linear-gradient(135deg, #03071e, #0a1628)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.2)" }}>
                    <GraduationCap className="w-5 h-5" style={{ color: "#10b981" }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#fff" }}>Practice Test</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{practiceBook.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{practiceQ + 1} / {total}</span>
                  <button onClick={closePractice} className="p-2 rounded-lg" style={{ color: "rgba(255,255,255,0.5)" }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 w-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-1 transition-all" style={{ width: `${((practiceQ + 1) / total) * 100}%`, background: "#10b981" }} />
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {practiceLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                    <p style={{ color: "var(--sdc-subheading)", fontSize: 14 }}>Loading practice questions from Question Bank…</p>
                  </div>
                ) : total === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(200,151,42,0.1)" }}>
                      <GraduationCap className="w-8 h-8" style={{ color: "#c8972a" }} />
                    </div>
                    <div>
                      <p className="font-bold text-base" style={{ color: "var(--sdc-heading)" }}>No practice questions yet</p>
                      <p className="text-sm mt-1" style={{ color: "var(--sdc-subheading)" }}>A psychometrician needs to publish active questions for this topic in the Question Bank first.</p>
                    </div>
                    <button onClick={closePractice}
                      className="px-5 py-2.5 rounded-xl font-bold text-sm"
                      style={{ background: "rgba(200,151,42,0.15)", color: "#c8972a", border: "1px solid rgba(200,151,42,0.3)" }}>
                      Close
                    </button>
                  </div>
                ) : practiceDone ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: score / total >= 0.7 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)" }}>
                      <Trophy className="w-10 h-10" style={{ color: score / total >= 0.7 ? "#10b981" : "#ef4444" }} />
                    </div>
                    <h3 className="text-2xl font-extrabold mb-1" style={{ color: "var(--sdc-heading)" }}>
                      {score / total >= 0.7 ? "Well done!" : "Keep practising"}
                    </h3>
                    <p style={{ color: "var(--sdc-subheading)", marginBottom: 24 }}>
                      You scored <strong>{score}</strong> out of <strong>{total}</strong> ({Math.round((score / total) * 100)}%)
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => { setPracticeQ(0); setPracticeAnswers({}); setPracticeRevealed({}); setPracticeDone(false); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
                        style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
                        <RotateCcw className="w-4 h-4" /> Retry
                      </button>
                      <button onClick={() => { closePractice(); openTutor(practiceBook); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
                        style={{ background: "rgba(200,151,42,0.1)", color: "#c8972a", border: "1px solid rgba(200,151,42,0.3)" }}>
                        <Cpu className="w-4 h-4" /> Ask AI Tutor
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-base mb-5" style={{ color: "var(--sdc-heading)", lineHeight: 1.6 }}>{currentQuestion.stem}</p>
                    <div className="space-y-3">
                      {currentQuestion.options.map((opt: { id: string; text: string }) => {
                        const isSelected = selectedAnswer === opt.id;
                        const isCorrect = opt.id === currentQuestion.correctAnswer;
                        let bg = "var(--sdc-page-bg)";
                        let border = "var(--sdc-card-border)";
                        let color = "var(--sdc-heading)";
                        if (revealed) {
                          if (isCorrect) { bg = "rgba(16,185,129,0.12)"; border = "#10b981"; color = "#10b981"; }
                          else if (isSelected && !isCorrect) { bg = "rgba(239,68,68,0.1)"; border = "#ef4444"; color = "#ef4444"; }
                        } else if (isSelected) {
                          bg = "rgba(200,151,42,0.12)"; border = "#c8972a"; color = "#c8972a";
                        }
                        return (
                          <button key={opt.id} disabled={revealed}
                            onClick={() => setPracticeAnswers(prev => ({ ...prev, [practiceQ]: opt.id }))}
                            className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3"
                            style={{ background: bg, border: `1.5px solid ${border}`, color }}>
                            <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                              style={{ background: isSelected || (revealed && isCorrect) ? border : "rgba(255,255,255,0.06)", color: isSelected || (revealed && isCorrect) ? "#fff" : "var(--sdc-text-muted)" }}>
                              {opt.id.toUpperCase()}
                            </span>
                            {opt.text}
                            {revealed && isCorrect && <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: "#10b981" }} />}
                            {revealed && isSelected && !isCorrect && <XCircle className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: "#ef4444" }} />}
                          </button>
                        );
                      })}
                    </div>
                    {revealed && (
                      <div className="mt-4 p-4 rounded-xl text-sm" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--sdc-subheading)" }}>
                        <strong style={{ color: "#10b981" }}>Explanation: </strong>{currentQuestion.explanation}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              {!practiceLoading && total > 0 && !practiceDone && (
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: "1px solid var(--sdc-card-border)" }}>
                  <button disabled={practiceQ === 0}
                    onClick={() => setPracticeQ(q => q - 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-30"
                    style={{ background: "var(--sdc-page-bg)", color: "var(--sdc-subheading)", border: "1px solid var(--sdc-card-border)" }}>
                    ← Prev
                  </button>
                  <div className="flex items-center gap-2">
                    {!revealed && (
                      <button disabled={!selectedAnswer}
                        onClick={() => setPracticeRevealed(prev => ({ ...prev, [practiceQ]: true }))}
                        className="px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-30"
                        style={{ background: "rgba(200,151,42,0.15)", color: "#c8972a", border: "1px solid rgba(200,151,42,0.3)" }}>
                        Check Answer
                      </button>
                    )}
                    {practiceQ < total - 1 ? (
                      <button disabled={!selectedAnswer}
                        onClick={() => setPracticeQ(q => q + 1)}
                        className="px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-30"
                        style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}>
                        Next →
                      </button>
                    ) : (
                      <button disabled={!selectedAnswer}
                        onClick={() => setPracticeDone(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-30"
                        style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}>
                        Finish
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </SDCLayout>
  );
}
