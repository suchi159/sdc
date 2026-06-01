import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  CheckCircle,
  Zap,
  Building2,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  CreditCard,
} from "lucide-react";

const packageIcons: Record<string, typeof Coins> = {
  starter: Zap,
  professional: Coins,
  enterprise: Building2,
};

const packageColors: Record<string, { bg: string; border: string; badge: string }> = {
  starter: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  professional: {
    bg: "bg-amber-50",
    border: "border-amber-200 ring-2 ring-amber-400",
    badge: "bg-amber-100 text-amber-700",
  },
  enterprise: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
  },
};

export default function BuyTokens() {
  const [, navigate] = useLocation();
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { data: packages = [] } = trpc.stripe.packages.useQuery();

  const createCheckout = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to create checkout session");
        setLoadingPkg(null);
      }
    },
    onError: (err) => {
      toast.error(err.message);
      setLoadingPkg(null);
    },
  });

  const verifyPayment = trpc.stripe.verifyPayment.useMutation({
    onSuccess: (data) => {
      setVerifying(false);
      if (data.success) {
        setPaymentSuccess(true);
        toast.success(`Payment successful! ${data.credits} credits added to your account.`);
      } else {
        toast.error(data.message || "Payment verification failed");
      }
    },
    onError: (err) => {
      setVerifying(false);
      toast.error(err.message);
    },
  });

  // Handle return from Stripe Checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      setVerifying(true);
      verifyPayment.mutate({ sessionId });
    }
  }, []);

  const handlePurchase = (packageId: string) => {
    setLoadingPkg(packageId);
    const origin = window.location.origin;
    createCheckout.mutate({
      packageId,
      successUrl: `${origin}/buy-tokens?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/buy-tokens`,
    });
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-[#c8972a] animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Verifying your payment...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait while we confirm your transaction.</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-0 shadow-lg text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 mb-6">
              Your credits have been added to your account and are ready to use.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                className="bg-[#c8972a] hover:bg-[#b07d1e] text-white"
                onClick={() => navigate("/org")}
              >
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => setPaymentSuccess(false)}>
                Buy More Credits
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/org")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium mb-3">
              <Sparkles className="w-3 h-3" />
              Powered by Stripe
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Buy Exam Credits</h1>
            <p className="text-gray-500 mt-2 max-w-lg mx-auto">
              Credits are used to deliver exams to your candidates. Choose the package that fits your organization's needs.
            </p>
          </div>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {packages.map((pkg) => {
            const Icon = packageIcons[pkg.id] || Coins;
            const colors = packageColors[pkg.id] || packageColors.starter;
            const isPopular = pkg.id === "professional";
            const isLoading = loadingPkg === pkg.id;

            return (
              <Card
                key={pkg.id}
                className={`border-0 shadow-sm relative overflow-hidden transition-all hover:shadow-md ${colors.border}`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
                )}
                <CardHeader className={`${colors.bg} pb-4`}>
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl ${colors.badge} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isPopular && (
                      <Badge className="bg-amber-500 text-white text-xs">Most Popular</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 mt-3">
                    {pkg.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    {pkg.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${(pkg.price / 100).toFixed(0)}
                    </span>
                    <span className="text-gray-400 text-sm ml-1">USD</span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{pkg.credits.toLocaleString()} exam credits</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>
                        ${((pkg.price / 100) / pkg.credits).toFixed(2)} per credit
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Credits never expire</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Instant activation</span>
                    </div>
                  </div>

                  <Button
                    className={`w-full gap-2 ${
                      isPopular
                        ? "bg-[#c8972a] hover:bg-[#b07d1e] text-white"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isLoading || createCheckout.isPending}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    {isLoading ? "Redirecting..." : "Purchase Now"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Security note */}
        <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payments are processed securely by Stripe. We never store your card details.</span>
        </div>
      </div>
    </div>
  );
}
