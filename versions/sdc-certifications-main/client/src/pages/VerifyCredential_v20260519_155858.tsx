import { useState } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, Search, Award, Calendar, User, Building2, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function VerifyCredential() {
  const params = useParams<{ credentialId?: string }>();
  const [inputId, setInputId] = useState(params.credentialId || "");
  const [searchId, setSearchId] = useState(params.credentialId || "");

  const { data, isLoading, error } = trpc.credentials.verify.useQuery(
    { credentialId: searchId },
    { enabled: !!searchId }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchId(inputId.trim());
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/50 glass sticky top-0 z-10">
        <div className="container h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gold-gradient flex items-center justify-center">
              <Shield className="w-4 h-4 text-background" />
            </div>
            <span className="font-bold text-sm">SDC Certifications</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
        </div>
      </div>

      <div className="container py-16 max-w-2xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-6 glow-gold pulse-glow">
            <Shield className="w-8 h-8 text-background" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            Verify a <span className="text-gold-gradient">Credential</span>
          </h1>
          <p className="text-muted-foreground">
            Enter a credential ID to instantly verify its authenticity and status.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="glass-card p-6 mb-8">
          <label className="block text-sm font-semibold mb-2">Credential ID</label>
          <div className="flex gap-3">
            <Input
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="e.g. SDC-2026-ABCD1234"
              className="bg-input border-border/50 flex-1"
            />
            <Button type="submit" className="bg-gold-gradient text-background font-bold shrink-0">
              <Search className="w-4 h-4 mr-2" /> Verify
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Credential IDs are found on digital badges, PDF certificates, and wallet cards.
          </p>
        </form>

        {/* Loading */}
        {isLoading && (
          <div className="glass-card p-8 text-center">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying credential...</p>
          </div>
        )}

        {/* Result */}
        {data && !isLoading && (
          <div className={`glass-card p-8 border-2 ${data.valid ? "border-green-500/40" : "border-red-500/40"}`}>
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                data.valid ? "bg-green-500/20" : "bg-red-500/20"
              }`}>
                {data.valid
                  ? <CheckCircle className="w-6 h-6 text-green-400" />
                  : <XCircle className="w-6 h-6 text-red-400" />
                }
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">
                  {data.valid ? "Credential Verified" : "Verification Failed"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {data.valid
                    ? "This credential is authentic and has been cryptographically verified."
                    : "This credential could not be verified. It may be invalid or revoked."}
                </p>
              </div>
            </div>

            {data.valid && data.credential && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-card/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Award className="w-3.5 h-3.5" /> Credential
                    </div>
                    <div className="font-semibold text-sm">{data.credential.templateName}</div>
                  </div>
                  <div className="bg-card/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <User className="w-3.5 h-3.5" /> Holder
                    </div>
                    <div className="font-semibold text-sm">{data.credential.holderName}</div>
                  </div>
                  <div className="bg-card/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Building2 className="w-3.5 h-3.5" /> Issuing Organization
                    </div>
                    <div className="font-semibold text-sm">{data.credential.orgName}</div>
                  </div>
                  <div className="bg-card/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Calendar className="w-3.5 h-3.5" /> Issue Date
                    </div>
                    <div className="font-semibold text-sm">
                      {new Date(data.credential.issueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge className={`border ${
                    data.credential.status === "active"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  }`}>
                    {data.credential.status.toUpperCase()}
                  </Badge>
                  {data.credential.score && (
                    <span className="text-sm text-muted-foreground">
                      Score: <span className="font-bold text-foreground">{data.credential.score}%</span>
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-green-400" />
                    Cryptographically signed · ID: {data.credential.credentialId}
                  </p>
                </div>
              </div>
            )}

            {!data.valid && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
                {data.message || "No credential found with this ID. Please check and try again."}
              </div>
            )}
          </div>
        )}

        {error && !isLoading && (
          <div className="glass-card p-6 border border-red-500/30 text-center">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Unable to verify credential. Please try again.</p>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 glass-card p-5">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> How Verification Works
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              Each credential has a unique cryptographic signature that cannot be forged.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              Verification is instant and requires no login or account.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              Revoked or expired credentials are clearly indicated.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
