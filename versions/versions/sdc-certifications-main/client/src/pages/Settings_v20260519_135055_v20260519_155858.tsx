import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  User, Lock, Shield, Download, Trash2, Eye, EyeOff,
  CheckCircle, AlertTriangle, ChevronRight, Bell
} from "lucide-react";
import SDCLayout from "@/components/SDCLayout";

type Tab = "profile" | "security" | "privacy" | "notifications";

export default function Settings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile
  const [name, setName] = useState(user?.name || "");
  const utils = trpc.useUtils();
  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => { toast.success("Profile updated"); utils.auth.me.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const changePassword = trpc.auth.changePassword.useMutation({
    onSuccess: () => { toast.success("Password changed"); setCurrentPw(""); setNewPw(""); setConfirmPw(""); },
    onError: (e) => toast.error(e.message),
  });

  // GDPR
  const [deletePhrase, setDeletePhrase] = useState("");
  const [deletePw, setDeletePw] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const exportData = trpc.gdpr.exportData.useMutation({
    onSuccess: (result) => {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sdc-data-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteAccount = trpc.gdpr.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Account deleted. Redirecting…");
      setTimeout(() => setLocation("/"), 2000);
    },
    onError: (e) => toast.error(e.message),
  });

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "privacy", label: "Privacy & Data", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <SDCLayout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-white mb-6">Account Settings</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: activeTab === tab.id ? "linear-gradient(135deg,#b8860b,#d4a017)" : "transparent",
                  color: activeTab === tab.id ? "#fff" : "#94a3b8",
                }}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="rounded-2xl p-6 space-y-5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <h2 className="text-lg font-semibold text-white">Profile Information</h2>

            <div className="flex items-center gap-4 pb-4" style={{ borderBottom: "1px solid #334155" }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{ background: "linear-gradient(135deg,#b8860b,#d4a017)", color: "#fff" }}>
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold text-white">{user?.name}</p>
                <p className="text-sm" style={{ color: "var(--sdc-text-muted)" }}>{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium"
                  style={{ background: "#0f172a", color: "#d4a017", border: "1px solid #334155" }}>
                  {user?.role?.replace("_", " ")}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#cbd5e1" }}>Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                style={{ background: "#0f172a", border: "1px solid #334155" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#cbd5e1" }}>Email Address</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 rounded-xl text-sm cursor-not-allowed"
                style={{ background: "#0f172a", border: "1px solid #1e293b", color: "var(--sdc-text)" }}
              />
              <p className="text-xs mt-1" style={{ color: "var(--sdc-subheading)" }}>Email cannot be changed. Contact support if needed.</p>
            </div>

            <button
              onClick={() => updateProfile.mutate({ name })}
              disabled={updateProfile.isPending || !name || name === user?.name}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 transition-all"
              style={{ background: "linear-gradient(135deg,#b8860b,#d4a017)", color: "#fff" }}>
              {updateProfile.isPending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="rounded-2xl p-6 space-y-5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <h2 className="text-lg font-semibold text-white">Change Password</h2>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#cbd5e1" }}>Current Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 pr-10 rounded-xl text-sm text-white focus:outline-none"
                  style={{ background: "#0f172a", border: "1px solid #334155" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--sdc-subheading)" }}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#cbd5e1" }}>New Password</label>
              <input
                type={showPw ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                style={{ background: "#0f172a", border: "1px solid #334155" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#cbd5e1" }}>Confirm New Password</label>
              <input
                type={showPw ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                style={{ background: "#0f172a", border: "1px solid #334155" }}
              />
              {confirmPw && newPw !== confirmPw && (
                <p className="text-xs mt-1" style={{ color: "#f87171" }}>Passwords do not match</p>
              )}
            </div>

            <button
              onClick={() => {
                if (newPw !== confirmPw) { toast.error("Passwords do not match"); return; }
                changePassword.mutate({ currentPassword: currentPw, newPassword: newPw });
              }}
              disabled={changePassword.isPending || !currentPw || !newPw || newPw !== confirmPw}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 transition-all"
              style={{ background: "linear-gradient(135deg,#b8860b,#d4a017)", color: "#fff" }}>
              {changePassword.isPending ? "Changing…" : "Change Password"}
            </button>
          </div>
        )}

        {/* Privacy & Data Tab */}
        {activeTab === "privacy" && (
          <div className="space-y-4">
            {/* Export Data */}
            <div className="rounded-2xl p-6" style={{ background: "#1e293b", border: "1px solid #334155" }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(16,185,129,0.15)" }}>
                  <Download className="w-5 h-5" style={{ color: "#10b981" }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Export My Data</h3>
                  <p className="text-sm mb-4" style={{ color: "var(--sdc-text-muted)" }}>
                    Download a JSON file containing all your personal data held by SDC Certifications — including your profile, exam history, credentials, and payment records. This is your right under GDPR Article 20.
                  </p>
                  <button
                    onClick={() => exportData.mutate()}
                    disabled={exportData.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50"
                    style={{ background: "rgba(16,185,129,0.2)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
                    <Download className="w-4 h-4" />
                    {exportData.isPending ? "Preparing export…" : "Download My Data"}
                  </button>
                </div>
              </div>
            </div>

            {/* Delete Account */}
            <div className="rounded-2xl p-6" style={{ background: "#1e293b", border: "1px solid #334155" }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(239,68,68,0.15)" }}>
                  <Trash2 className="w-5 h-5" style={{ color: "#ef4444" }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Delete My Account</h3>
                  <p className="text-sm mb-4" style={{ color: "var(--sdc-text-muted)" }}>
                    Permanently anonymise your account. Your credentials and exam records will be retained for audit purposes but all personal identifiers will be removed. This action cannot be undone.
                  </p>

                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                      style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                      <Trash2 className="w-4 h-4" />
                      Request Account Deletion
                    </button>
                  ) : (
                    <div className="space-y-3 p-4 rounded-xl" style={{ background: "#0f172a", border: "1px solid #ef4444" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4" style={{ color: "#f59e0b" }} />
                        <p className="text-sm font-semibold" style={{ color: "#f59e0b" }}>This cannot be undone</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: "var(--sdc-text-muted)" }}>
                          Type <strong className="text-white">DELETE MY ACCOUNT</strong> to confirm
                        </label>
                        <input
                          type="text"
                          value={deletePhrase}
                          onChange={(e) => setDeletePhrase(e.target.value)}
                          placeholder="DELETE MY ACCOUNT"
                          className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                          style={{ background: "#1e293b", border: "1px solid #334155" }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: "var(--sdc-text-muted)" }}>Your password</label>
                        <input
                          type="password"
                          value={deletePw}
                          onChange={(e) => setDeletePw(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                          style={{ background: "#1e293b", border: "1px solid #334155" }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setShowDeleteConfirm(false); setDeletePhrase(""); setDeletePw(""); }}
                          className="flex-1 py-2 rounded-lg text-sm font-medium"
                          style={{ background: "#1e293b", color: "var(--sdc-text-muted)", border: "1px solid #334155" }}>
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteAccount.mutate({ password: deletePw, confirmPhrase: deletePhrase })}
                          disabled={deleteAccount.isPending || deletePhrase !== "DELETE MY ACCOUNT" || !deletePw}
                          className="flex-1 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                          style={{ background: "#ef4444", color: "#fff" }}>
                          {deleteAccount.isPending ? "Deleting…" : "Delete Account"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <h2 className="text-lg font-semibold text-white mb-4">Notification Preferences</h2>
            {[
              { label: "Exam results available", desc: "When your exam is graded and results are ready", defaultOn: true },
              { label: "Credential issued", desc: "When a new credential is issued to your account", defaultOn: true },
              { label: "Booking confirmations", desc: "When a proctor confirms or declines your exam slot", defaultOn: true },
              { label: "Credential expiry reminders", desc: "30 days before a credential expires", defaultOn: true },
              { label: "Platform announcements", desc: "New features and important platform updates", defaultOn: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3"
                style={{ borderBottom: "1px solid #1e293b" }}>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--sdc-subheading)" }}>{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={item.defaultOn} className="sr-only peer" />
                  <div className="w-10 h-6 rounded-full peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:rounded-full after:transition-all"
                    style={{
                      background: item.defaultOn ? "linear-gradient(135deg,#b8860b,#d4a017)" : "#334155",
                    }} />
                </label>
              </div>
            ))}
            <p className="text-xs pt-2" style={{ color: "var(--sdc-text)" }}>
              Note: Notification preferences are stored locally in your browser. They will persist across sessions on this device.
            </p>
          </div>
        )}
      </div>
    </SDCLayout>
  );
}
