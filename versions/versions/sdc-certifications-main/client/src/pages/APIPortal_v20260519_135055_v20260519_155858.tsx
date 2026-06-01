import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Key, Plus, Copy, Trash2, Code, Globe, Zap, Lock, CheckCircle, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

const API_ENDPOINTS = [
  { method: "GET", path: "/api/v1/credentials/{id}/verify", description: "Verify a credential by ID", auth: false },
  { method: "POST", path: "/api/v1/credentials/issue", description: "Issue a new credential", auth: true },
  { method: "GET", path: "/api/v1/credentials", description: "List credentials for an org", auth: true },
  { method: "POST", path: "/api/v1/exams", description: "Create a new exam", auth: true },
  { method: "GET", path: "/api/v1/exams", description: "List all exams", auth: true },
  { method: "POST", path: "/api/v1/vouchers/generate", description: "Generate exam vouchers", auth: true },
  { method: "POST", path: "/api/v1/vouchers/redeem", description: "Redeem a voucher", auth: true },
  { method: "GET", path: "/api/v1/books", description: "List available books", auth: false },
  { method: "GET", path: "/api/v1/analytics/overview", description: "Get org analytics", auth: true },
  { method: "POST", path: "/api/v1/webhooks", description: "Register a webhook endpoint", auth: true },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  POST: "bg-green-500/20 text-green-400 border-green-500/30",
  PUT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
  PATCH: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export default function APIPortal() {
  const [activeTab, setActiveTab] = useState<"keys" | "docs" | "webhooks">("keys");
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>([]);
  const [webhooks, setWebhooks] = useState<{url: string; events: string[]; id: number}[]>([]);

  const { data: apiKeys, refetch } = trpc.apiKeys.list.useQuery();
  const createKeyMutation = trpc.apiKeys.create.useMutation({
    onSuccess: (data) => {
      setNewKey(data.key);
      refetch();
      setShowCreateKey(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const revokeKeyMutation = trpc.apiKeys.revoke.useMutation({
    onSuccess: () => { toast.success("Key revoked"); refetch(); },
  });

  const { register, handleSubmit, reset } = useForm<any>();

  const onCreateKey = (data: any) => {
    createKeyMutation.mutate({ name: data.name, rateLimit: parseInt(data.rateLimit) || 1000 });
    reset();
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard!");
  };

  return (
    <SDCLayout title="API Portal">
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card p-6 bg-gradient-to-br from-teal-500/10 to-blue-500/5 border border-teal-500/20">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-5 h-5 text-teal-400" />
                <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">API-First Platform</span>
              </div>
              <h1 className="text-2xl font-extrabold mb-1">Developer API Portal</h1>
              <p className="text-muted-foreground text-sm">
                Headless REST API with OpenAPI 3.0 documentation, webhook subscriptions, and rate limiting.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10">
                <ExternalLink className="w-4 h-4 mr-1" /> Swagger UI
              </Button>
            </div>
          </div>
        </div>

        {/* New Key Alert */}
        {newKey && (
          <div className="glass-card p-5 border border-green-500/30 bg-green-500/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="font-bold text-sm text-green-400">API Key Created</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Copy this key now. It will not be shown again.
                </p>
                <code className="font-mono text-sm bg-card/80 px-3 py-2 rounded-lg border border-border/50 block break-all">
                  {newKey}
                </code>
              </div>
              <Button size="sm" onClick={() => copyKey(newKey)} className="bg-green-500/20 text-green-400 border border-green-500/30 shrink-0">
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="mt-3 text-xs text-muted-foreground" onClick={() => setNewKey(null)}>
              Dismiss
            </Button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 glass rounded-xl w-fit">
          {[
            { id: "keys", label: "API Keys" },
            { id: "docs", label: "API Reference" },
            { id: "webhooks", label: "Webhooks" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* API Keys */}
        {activeTab === "keys" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">API Keys ({apiKeys?.length || 0})</h2>
              <Button
                size="sm"
                className="bg-gold-gradient text-background font-bold"
                onClick={() => setShowCreateKey(!showCreateKey)}
              >
                <Plus className="w-4 h-4 mr-1" /> New Key
              </Button>
            </div>

            {showCreateKey && (
              <div className="glass-card p-5 max-w-md">
                <h3 className="font-bold mb-4">Create API Key</h3>
                <form onSubmit={handleSubmit(onCreateKey)} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Key Name *</label>
                    <Input {...register("name", { required: true })} placeholder="e.g. Production Integration" className="bg-input border-border/50" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Rate Limit (req/hour)</label>
                    <Input {...register("rateLimit")} type="number" defaultValue={1000} className="bg-input border-border/50" />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" className="bg-gold-gradient text-background font-bold" disabled={createKeyMutation.isPending}>
                      Create Key
                    </Button>
                    <Button type="button" variant="outline" className="border-border/50" onClick={() => setShowCreateKey(false)}>Cancel</Button>
                  </div>
                </form>
              </div>
            )}

            {(!apiKeys || apiKeys.length === 0) ? (
              <div className="glass-card p-12 text-center">
                <Key className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No API keys yet. Create one to start integrating.</p>
              </div>
            ) : (
              <div className="glass-card p-6">
                <div className="space-y-3">
                  {apiKeys.map((key: any) => (
                    <div key={key.id} className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/30">
                      <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                        <Key className="w-4 h-4 text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{key.name}</div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <code className="font-mono">{key.keyPrefix}••••••••••••</code>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" /> {key.rateLimit}/hr
                          </span>
                          {key.lastUsedAt && (
                            <>
                              <span>·</span>
                              <span>Last used {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge className={`text-xs border ${
                        key.status === "active"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }`}>
                        {key.status}
                      </Badge>
                      {key.status === "active" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:bg-red-500/10 h-7 px-2"
                          onClick={() => revokeKeyMutation.mutate({ id: key.id })}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* API Docs */}
        {activeTab === "docs" && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" /> API Reference
              </h2>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 border text-xs">
                v1.0 · OpenAPI 3.0
              </Badge>
            </div>

            <div className="mb-4 p-4 rounded-xl bg-card/50 border border-border/30">
              <div className="text-xs font-semibold text-muted-foreground mb-2">Base URL</div>
              <code className="font-mono text-sm text-primary">{window.location.origin}/api/v1</code>
            </div>

            <div className="mb-4 p-4 rounded-xl bg-card/50 border border-border/30">
              <div className="text-xs font-semibold text-muted-foreground mb-2">Authentication</div>
              <code className="font-mono text-sm text-muted-foreground">
                Authorization: Bearer {"<your-api-key>"}
              </code>
            </div>

            <div className="space-y-2">
              {API_ENDPOINTS.map((ep, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30 hover:border-border transition-colors">
                  <Badge className={`text-[10px] border font-mono shrink-0 ${METHOD_COLORS[ep.method]}`}>
                    {ep.method}
                  </Badge>
                  <code className="font-mono text-xs text-foreground flex-1 truncate">{ep.path}</code>
                  <span className="text-xs text-muted-foreground hidden sm:block">{ep.description}</span>
                  {ep.auth ? (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-green-400/50 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Webhooks */}
        {activeTab === "webhooks" && (
          <div className="glass-card p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" /> Webhook Subscriptions
            </h2>
            <div className="text-center py-12">
              <Zap className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">No webhooks configured yet.</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Subscribe to events like credential.issued, exam.completed, voucher.redeemed, and more.
              </p>
              <Button size="sm" className="mt-4 bg-gold-gradient text-background font-bold" onClick={() => setShowAddWebhook(true)}>
                <Plus className="w-4 h-4 mr-1" /> Add Webhook
              </Button>
              {showAddWebhook && (
                <div className="mt-4 p-4 rounded-xl border border-border/30 bg-card/50 text-left">
                  <p className="text-xs font-semibold text-foreground mb-3">Register Webhook Endpoint</p>
                  <input
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                    placeholder="https://your-server.com/webhook"
                    className="w-full px-3 py-2 rounded-lg text-xs mb-3 outline-none"
                    style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  />
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Select Events</p>
                  <div className="grid grid-cols-2 gap-1 mb-3">
                    {["credential.issued","credential.revoked","exam.completed","exam.failed","voucher.redeemed","proctor.incident","user.registered","book.purchased"].map(ev => (
                      <label key={ev} className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input type="checkbox" checked={webhookEvents.includes(ev)} onChange={e => setWebhookEvents(prev => e.target.checked ? [...prev, ev] : prev.filter(x => x !== ev))} />
                        <code className="text-muted-foreground">{ev}</code>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-gold-gradient text-background font-bold" onClick={() => {
                      if (!webhookUrl.startsWith("http")) { toast.error("Please enter a valid URL"); return; }
                      if (!webhookEvents.length) { toast.error("Select at least one event"); return; }
                      setWebhooks(prev => [...prev, { url: webhookUrl, events: webhookEvents, id: Date.now() }]);
                      toast.success("Webhook registered successfully");
                      setWebhookUrl(""); setWebhookEvents([]); setShowAddWebhook(false);
                    }}>Register</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddWebhook(false)}>Cancel</Button>
                  </div>
                </div>
              )}
              {webhooks.length > 0 && (
                <div className="mt-4 space-y-2">
                  {webhooks.map(wh => (
                    <div key={wh.id} className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-card/50">
                      <div>
                        <p className="text-xs font-mono text-foreground">{wh.url}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{wh.events.join(", ")}</p>
                      </div>
                      <button onClick={() => { setWebhooks(prev => prev.filter(w => w.id !== wh.id)); toast.success("Webhook removed"); }} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-card/50 border border-border/30">
              <div className="text-xs font-semibold text-muted-foreground mb-3">Available Events</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "credential.issued", "credential.revoked", "exam.completed",
                  "exam.failed", "voucher.redeemed", "proctor.incident",
                  "user.registered", "book.purchased",
                ].map(event => (
                  <div key={event} className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                    <code className="font-mono text-muted-foreground">{event}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </SDCLayout>
  );
}
