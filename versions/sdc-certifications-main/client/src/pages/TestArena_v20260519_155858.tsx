import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestTube, Clock, BookOpen, Play, Trophy, Target, Zap, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function TestArena() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { data: exams } = trpc.exams.list.useQuery();
  const { data: books } = trpc.books.list.useQuery();

  const publishedExams = exams?.filter((e: any) => e.status === "published") || [];

  const categories = ["all", "IT", "Healthcare", "Finance", "Legal", "Engineering"];

  const filteredExams = selectedCategory === "all"
    ? publishedExams
    : publishedExams.filter((e: any) => e.industry === selectedCategory);

  return (
    <SDCLayout title="Test Arena">
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="glass-card p-8 bg-gradient-to-br from-accent/10 to-primary/5 border border-accent/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TestTube className="w-5 h-5 text-accent" />
                <span className="text-xs font-bold text-accent uppercase tracking-widest">Practice Environment</span>
              </div>
              <h1 className="text-2xl font-extrabold mb-2">Test Arena</h1>
              <p className="text-muted-foreground text-sm max-w-lg">
                Practice with real exam questions in a safe environment. No proctoring required.
                Improve your score before the official exam.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
              {[
                { label: "Exams Available", value: publishedExams.length, icon: TestTube },
                { label: "Practice Mode", value: "Free", icon: Zap },
                { label: "Instant Results", value: "Yes", icon: Trophy },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="glass p-3 rounded-xl text-center">
                  <Icon className="w-4 h-4 text-accent mx-auto mb-1" />
                  <div className="text-lg font-extrabold">{value}</div>
                  <div className="text-[10px] text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Exam List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-bold text-lg">Available Practice Exams</h2>
            {filteredExams.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <TestTube className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No practice exams available yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Check back soon or contact your administrator.</p>
              </div>
            ) : (
              filteredExams.map((exam: any) => (
                <div key={exam.id} className="glass-card p-5 group hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-sm">{exam.title}</h3>
                        {exam.industry && (
                          <Badge variant="outline" className="text-[10px] border-border/50">{exam.industry}</Badge>
                        )}
                      </div>
                      {exam.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{exam.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {exam.totalQuestions && (
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" /> {exam.totalQuestions} questions
                          </span>
                        )}
                        {exam.timeLimit && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {exam.timeLimit} min
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> Pass: {exam.passingScore}%
                        </span>
                      </div>
                    </div>
                    <Link href={`/exam/${exam.id}`}>
                      <Button size="sm" className="bg-gold-gradient text-background font-bold shrink-0">
                        <Play className="w-3 h-3 mr-1" /> Practice
                      </Button>
                    </Link>
                  </div>

                  {/* Linked book cross-sell */}
                  {exam.linkedBookId && (
                    <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                        <span>Study guide available for this exam</span>
                      </div>
                      <Link href="/books">
                        <Button size="sm" variant="ghost" className="text-xs text-purple-400 h-6 px-2">
                          Get Book <ChevronRight className="w-3 h-3 ml-0.5" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Sidebar: Book Recommendations */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg">Recommended Books</h2>
            {(!books || books.length === 0) ? (
              <div className="glass-card p-6 text-center">
                <BookOpen className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No books available yet.</p>
              </div>
            ) : (
              books.slice(0, 4).map((book: any) => (
                <div key={book.id} className="glass-card p-4 group hover:border-primary/30 transition-all">
                  <div className="flex gap-3">
                    <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-primary/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs mb-1 line-clamp-2">{book.title}</h4>
                      {book.author && <p className="text-[10px] text-muted-foreground mb-2">by {book.author}</p>}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">
                          {book.price ? `$${book.price}` : "Free"}
                        </span>
                        <Link href="/books">
                          <Button size="sm" variant="ghost" className="text-[10px] h-6 px-2 text-accent">
                            View <ChevronRight className="w-3 h-3 ml-0.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <Link href="/books">
              <Button variant="outline" className="w-full border-border/50 text-sm">
                Browse All Books <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </SDCLayout>
  );
}
