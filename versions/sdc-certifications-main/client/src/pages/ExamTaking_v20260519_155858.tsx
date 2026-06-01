import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, AlertTriangle, Shield, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";

export default function ExamTaking() {
  const params = useParams<{ examId: string }>();
  const [, navigate] = useLocation();
  const examId = parseInt(params.examId || "0");

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(3600); // 60 min default
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);

  const { data: exam } = trpc.exams.get.useQuery({ id: examId }, { enabled: !!examId });
  const startMutation = trpc.exams.attempts.start.useMutation({
    onSuccess: () => toast.success("Exam started"),
  });
  const submitMutation = trpc.exams.attempts.submit.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setSubmitted(true);
      // Navigate to detailed results page if attemptId is returned
      if (data.attemptId) {
        setTimeout(() => navigate(`/candidate/results/${data.attemptId}`), 3000);
      }
    },
  });

  // Demo questions
  const demoQuestions = [
    {
      id: 1,
      stem: "Which of the following best describes the principle of 'defense in depth' in cybersecurity?",
      options: [
        { id: "a", text: "Using a single, very strong security measure" },
        { id: "b", text: "Implementing multiple layers of security controls" },
        { id: "c", text: "Relying solely on firewalls for protection" },
        { id: "d", text: "Encrypting all data at rest only" },
      ],
      correctAnswer: "b",
    },
    {
      id: 2,
      stem: "What is the primary purpose of a Certificate Authority (CA) in a PKI infrastructure?",
      options: [
        { id: "a", text: "To encrypt network traffic" },
        { id: "b", text: "To issue and manage digital certificates" },
        { id: "c", text: "To monitor network intrusions" },
        { id: "d", text: "To store private keys securely" },
      ],
      correctAnswer: "b",
    },
    {
      id: 3,
      stem: "Which hashing algorithm produces a 256-bit hash value?",
      options: [
        { id: "a", text: "MD5" },
        { id: "b", text: "SHA-1" },
        { id: "c", text: "SHA-256" },
        { id: "d", text: "SHA-512" },
      ],
      correctAnswer: "c",
    },
  ];

  const questions = demoQuestions;
  const totalQuestions = questions.length;

  // Timer
  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (questionId: number, answerId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const toggleFlag = (questionId: number) => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const handleSubmit = useCallback(() => {
    const responses: Record<string, any> = {};
    Object.entries(answers).forEach(([k, v]) => { responses[k] = v; });
    // Pass question answers for real server-side scoring
    const questionAnswers = questions.map(q => ({
      questionId: q.id,
      correctAnswer: q.correctAnswer,
    }));
    submitMutation.mutate({ attemptId: attemptId || 1, responses, questionAnswers });
  }, [answers, attemptId, submitMutation, questions]);

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;
  const currentQuestion = questions[currentQ];

  // Results screen
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card p-10 max-w-md w-full text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            result.passed ? "bg-green-500/20" : "bg-red-500/20"
          }`}>
            {result.passed
              ? <CheckCircle className="w-10 h-10 text-green-400" />
              : <AlertTriangle className="w-10 h-10 text-red-400" />
            }
          </div>
          <h1 className="text-3xl font-extrabold mb-2">
            {result.passed ? "Congratulations!" : "Keep Practicing"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {result.passed
              ? "You passed the exam! Your credential will be issued shortly."
              : "You didn't pass this time. Review the material and try again."}
          </p>
          <div className="glass p-6 rounded-2xl mb-6">
            <div className="text-5xl font-extrabold text-primary mb-1">{result.score}%</div>
            <div className="text-sm text-muted-foreground">Your Score</div>
            <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${result.passed ? "bg-green-500" : "bg-red-500"}`}
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-border/50" onClick={() => navigate("/candidate")}>
              Dashboard
            </Button>
            {result.passed && (
              <Button className="flex-1 bg-gold-gradient text-background font-bold" onClick={() => navigate("/wallet")}>
                View Credential
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Exam Header */}
      <div className="sticky top-0 z-40 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm("Leave exam? Your progress will be lost.")) {
                  navigate(-1 as any);
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card/60 transition-colors border border-border/40"
              title="Exit exam"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Exit
            </button>
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <div className="font-bold text-sm">{exam?.title || "Practice Exam"}</div>
              <div className="text-xs text-muted-foreground">
                Question {currentQ + 1} of {totalQuestions}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${
              timeLeft < 300 ? "bg-red-500/20 text-red-400" : "bg-card/50 text-foreground"
            }`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              size="sm"
              className="bg-gold-gradient text-background font-bold"
            >
              Submit Exam
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mt-2">
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 grid md:grid-cols-4 gap-6">
        {/* Question Panel */}
        <div className="md:col-span-3 space-y-6">
          {currentQuestion && (
            <div className="glass-card p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <Badge variant="outline" className="text-xs mb-3 border-border/50">
                    Question {currentQ + 1}
                  </Badge>
                  <p className="text-base font-medium leading-relaxed">{currentQuestion.stem}</p>
                </div>
                <button
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    flagged.has(currentQuestion.id)
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "hover:bg-white/5 text-muted-foreground"
                  }`}
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt) => {
                  const selected = answers[currentQuestion.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswer(currentQuestion.id, opt.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/50 bg-card/30 hover:bg-card/60 hover:border-border text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selected ? "border-primary bg-primary" : "border-border"
                        }`}>
                          {selected && <div className="w-2 h-2 bg-background rounded-full" />}
                        </div>
                        <span className="text-sm">{opt.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-6 pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
                  disabled={currentQ === 0}
                  className="border-border/50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCurrentQ(prev => Math.min(totalQuestions - 1, prev + 1))}
                  disabled={currentQ === totalQuestions - 1}
                  className="bg-primary/20 text-primary border border-primary/30"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Question Navigator */}
        <div className="md:col-span-1">
          <div className="glass-card p-4 sticky top-24">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Navigator</h3>
            <div className="grid grid-cols-5 md:grid-cols-4 gap-1.5">
              {questions.map((q, idx) => {
                const answered = !!answers[q.id];
                const isFlagged = flagged.has(q.id);
                const isCurrent = idx === currentQ;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQ(idx)}
                    className={`w-full aspect-square rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isFlagged
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : answered
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-card/50 text-muted-foreground hover:bg-card"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
                <span className="text-muted-foreground">Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/30" />
                <span className="text-muted-foreground">Flagged ({flagged.size})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-card/50" />
                <span className="text-muted-foreground">Unanswered ({totalQuestions - answeredCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
