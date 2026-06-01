import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { lazy, Suspense } from "react";
import { PortalSkeleton } from "./components/PortalSkeleton";


// Lazy-load all portal pages
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const OnboardingWizard = lazy(() => import("./pages/OnboardingWizard"));
const VerifyCredential = lazy(() => import("./pages/VerifyCredential"));
const CertificateRoster = lazy(() => import("./pages/CertificateRoster"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminPortal = lazy(() => import("./pages/AdminPortal"));
const OrgPortal = lazy(() => import("./pages/OrgPortal"));
const CandidatePortal = lazy(() => import("./pages/CandidatePortal"));
const PsychometricsPortal = lazy(() => import("./pages/PsychometricsPortal"));
const ExamBuilder = lazy(() => import("./pages/ExamBuilder"));
const ProctorPortal = lazy(() => import("./pages/ProctorPortal"));
const InstructorPortal = lazy(() => import("./pages/InstructorPortal"));
const ExamTaking = lazy(() => import("./pages/ExamTaking"));
const CredentialWallet = lazy(() => import("./pages/CredentialWallet"));
const DigitalBooks = lazy(() => import("./pages/DigitalBooks"));
const TestArena = lazy(() => import("./pages/TestArena"));
const FinancialLedger = lazy(() => import("./pages/FinancialLedger"));
const APIPortal = lazy(() => import("./pages/APIPortal"));
const VoucherManagement = lazy(() => import("./pages/VoucherManagement"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const BuyVouchers = lazy(() => import("./pages/BuyVouchers"));
const ItemReviewWorkflow = lazy(() => import("./pages/ItemReviewWorkflow"));
const AIItemGeneration = lazy(() => import("./pages/AIItemGeneration"));
const ExamBlueprintBuilder = lazy(() => import("./pages/ExamBlueprintBuilder"));
const EssayScoring = lazy(() => import("./pages/EssayScoring"));
const PreExamCheck = lazy(() => import("./pages/PreExamCheck"));
const PsychometricReport = lazy(() => import("./pages/PsychometricReport"));
const AnomalyDashboard = lazy(() => import("./pages/AnomalyDashboard"));
const CandidateSchedule = lazy(() => import("./pages/CandidateSchedule"));
const ProctorCalendar = lazy(() => import("./pages/ProctorCalendar"));
const ExamResults = lazy(() => import("./pages/ExamResults"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Settings = lazy(() => import("./pages/Settings"));
const BulkIssue = lazy(() => import("./pages/BulkIssue"));
const CandidateExams = lazy(() => import("./pages/CandidateExams"));
const LiveArena = lazy(() => import("./pages/LiveArena"));
const Gamification = lazy(() => import("./pages/Gamification"));
const OrgOnboarding = lazy(() => import("./pages/OrgOnboarding"));
const Integrations = lazy(() => import("./pages/Integrations"));

// PortalSkeleton is imported above — it renders a full layout-accurate shimmer

function Router() {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/onboarding" component={OnboardingWizard} />
        <Route path="/org/onboard" component={OrgOnboarding} />
        <Route path="/verify" component={VerifyCredential} />
        <Route path="/verify/roster" component={CertificateRoster} />
        <Route path="/verify/:credentialId" component={VerifyCredential} />
        <Route path="/dashboard" component={Dashboard} />

        {/* Exam taking */}
        <Route path="/exam/:examId" component={ExamTaking} />

        {/* Standalone pages */}
        <Route path="/wallet" component={CredentialWallet} />
        <Route path="/test-arena" component={TestArena} />
        <Route path="/ledger" component={FinancialLedger} />
        <Route path="/buy-tokens"><Redirect to="/org/buy-vouchers" /></Route>
        <Route path="/org/buy-vouchers" component={BuyVouchers} />
        <Route path="/payment-success" component={OrderConfirmation} />

        {/* Item Bank (standalone) */}
        <Route path="/item-bank/workflow" component={ItemReviewWorkflow} />
        <Route path="/item-bank/generate" component={AIItemGeneration} />
        <Route path="/item-bank/blueprints" component={ExamBlueprintBuilder} />
        <Route path="/item-bank/essay-scoring" component={EssayScoring} />
        <Route path="/item-bank/report" component={PsychometricReport} />

        {/* Pre-Exam Check */}
        <Route path="/exam-check/:attemptId" component={PreExamCheck} />
        <Route path="/exam-check" component={PreExamCheck} />

        {/* Password Reset Flow */}
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />

        {/* Account Settings */}
        <Route path="/settings" component={Settings} />

        {/* ─── Candidate specific pages BEFORE wildcard ─── */}
        <Route path="/candidate/exams" component={CandidateExams} />
        <Route path="/candidate/library" component={DigitalBooks} />
        <Route path="/candidate/live-arena" component={LiveArena} />
        <Route path="/candidate/gamification" component={Gamification} />
        <Route path="/candidate/schedule" component={CandidateSchedule} />
        <Route path="/candidate/results/:attemptId" component={ExamResults} />

        {/* Candidate portal — wildcard tab route AFTER specific routes */}
        <Route path="/candidate" component={CandidatePortal} />
        <Route path="/candidate/:tab" component={CandidatePortal} />

        {/* ─── Org specific pages BEFORE wildcard ─── */}
        <Route path="/org/vouchers" component={VoucherManagement} />
        <Route path="/org/bulk-issue" component={BulkIssue} />

        {/* Org portal — wildcard tab route AFTER specific routes */}
        <Route path="/org" component={OrgPortal} />
        <Route path="/org/profile" component={OrgPortal} />
        <Route path="/org/:tab" component={OrgPortal} />

        {/* ─── Proctor specific pages BEFORE wildcard ─── */}
        {/* /proctor/earnings and /proctor/monitor are handled by ProctorPortal's TAB_MAP */}
        <Route path="/proctor/anomalies" component={AnomalyDashboard} />
        <Route path="/proctor/availability"><Redirect to="/proctor/calendar" /></Route>
        <Route path="/proctor/calendar" component={ProctorCalendar} />

        {/* Proctor portal — wildcard tab route AFTER specific routes */}
        <Route path="/proctor" component={ProctorPortal} />
        <Route path="/proctor/:tab" component={ProctorPortal} />

        {/* Admin portal — all sub-routes render AdminPortal with tab param */}
        <Route path="/admin/integrations" component={Integrations} />
        <Route path="/admin" component={AdminPortal} />
        <Route path="/admin/:tab" component={AdminPortal} />

        {/* Psychometrics portal — all sub-routes (including two-level paths like /question/create) */}
        <Route path="/psychometrics" component={PsychometricsPortal} />
        <Route path="/psychometrics/question/create" component={PsychometricsPortal} />
        <Route path="/psychometrics/:tab/:subtab" component={PsychometricsPortal} />
        <Route path="/psychometrics/:tab" component={PsychometricsPortal} />

        {/* Exam builder — all sub-routes */}
        <Route path="/exam-builder" component={ExamBuilder} />
        <Route path="/exam-builder/:tab" component={ExamBuilder} />

        {/* Instructor portal — all sub-routes */}
        <Route path="/instructor" component={InstructorPortal} />
        <Route path="/instructor/:tab" component={InstructorPortal} />

        {/* Digital Books */}
        <Route path="/books" component={DigitalBooks} />
        <Route path="/books/:tab" component={DigitalBooks} />

        {/* API Portal */}
        <Route path="/api-portal" component={APIPortal} />
        <Route path="/api-portal/:tab" component={APIPortal} />

        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
