"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useUserStore } from "@/store/userStore";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { User, Bell, Palette, AlertTriangle, ShieldCheck, Mail, Save, Building2, Phone, Hash, Trash2 } from "lucide-react";
import DeleteAccountModal from "@/components/ui/modals/DeleteAccountModal";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";




export default function SettingsPage() {
  const user = useUserStore((state) => state.user);
  const [settings, setSettings] = useState({
    username: "",
    email: user?.email || "",
    company: "",
    phone: "",
    age: "",
    notifications: true,
    emailUpdates: true,
  });


  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const router = useRouter();
  const logout = useUserStore((state) => state.logout);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/user/settings");
      if (response.data) {
        const userData = response.data;
        setSettings((prev) => ({
          ...prev,
          username: userData.username || "",
          email: userData.email || "",
          company: userData.company || "",
          phone: userData.phone || "",
          age: userData.age?.toString() || "",
          notifications: userData.settings?.notifications ?? true,
          emailUpdates: userData.settings?.emailUpdates ?? true,
        }));

      }

    } catch (error) {
      console.error("Failed to load settings", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchSettings();
  }, []);

  if (!mounted) return null;


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/user/settings", { settings });
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.delete("/user/account");
      toast.success("Account successfully deleted");
      
      // Clear store, sign out and redirect
      logout();
      await supabase.auth.signOut();
      router.push("/");
    } catch (error: any) {
      console.error("Failed to delete account", error);
      toast.error(error.response?.data?.error || "Failed to delete account");
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold text-text-primary uppercase tracking-tight">
          System Preferences
        </h1>
        <p className="text-text-secondry font-medium flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/40" />
          Manage your operational identity and communication protocols.
        </p>
      </div>

      {/* Profile Settings */}
      <div className="bg-background-secondry/40 backdrop-blur-xl border border-border-light rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
            <User size={24} className="text-brand-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary tracking-tight">Operational Profile</h2>
            <p className="text-[10px] font-bold text-text-secondry uppercase tracking-widest">Personal identification data</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="space-y-3 md:col-span-2">
            <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest ml-1">
              Operational Callsign (Username)
            </label>
            <div className="relative">
              <input
                type="text"
                value={settings.username}
                onChange={(e) =>
                  setSettings({ ...settings, username: e.target.value })
                }
                placeholder="Ex: Maverick"
                className="w-full px-5 py-4 bg-background-main/30 border border-border-muted rounded-2xl focus:outline-none focus:border-brand-primary/50 text-text-primary font-medium transition-all transition-duration-300 pl-12"
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondry opacity-40" size={18} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:col-span-2">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest ml-1">
                Organization / Company
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.company}
                  onChange={(e) =>
                    setSettings({ ...settings, company: e.target.value })
                  }
                  placeholder="Ex: Skynet Systems"
                  className="w-full px-5 py-4 bg-background-main/30 border border-border-muted rounded-2xl focus:outline-none focus:border-brand-primary/50 text-text-primary font-medium transition-all transition-duration-300 pl-12"
                />
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondry opacity-40" size={18} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest ml-1">
                Contact Frequency (Phone)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                  placeholder="Ex: +1 (555) 000-0000"
                  className="w-full px-5 py-4 bg-background-main/30 border border-border-muted rounded-2xl focus:outline-none focus:border-brand-primary/50 text-text-primary font-medium transition-all transition-duration-300 pl-12"
                />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondry opacity-40" size={18} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:col-span-2">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest ml-1">
                Service Duration (Age)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.age}
                  onChange={(e) =>
                    setSettings({ ...settings, age: e.target.value })
                  }
                  placeholder="Ex: 28"
                  className="w-full px-5 py-4 bg-background-main/30 border border-border-muted rounded-2xl focus:outline-none focus:border-brand-primary/50 text-text-primary font-medium transition-all transition-duration-300 pl-12"
                />
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondry opacity-40" size={18} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest ml-1">Communication Endpoint (Email)</label>
              <div className="relative">
                <input
                  type="email"
                  value={settings.email}
                  disabled
                  title="Email cannot be changed"
                  className="w-full px-5 py-4 bg-background-main/10 border border-border-muted rounded-2xl text-text-secondry font-medium transition-all cursor-not-allowed pl-12 opacity-60"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondry opacity-40" size={18} />
              </div>
            </div>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-brand-primary hover:bg-brand-primary-strong text-text-button rounded-2xl font-bold transition-all transition-duration-300 shadow-xl shadow-brand-primary/20 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} className="transition-transform group-hover:scale-110" />
                Commit Changes
              </>
            )}
          </button>
        </form>
      </div>

      {/* Appearance Settings */}
      <div className="bg-background-secondry/40 backdrop-blur-xl border border-border-light rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
              <Palette size={24} className="text-brand-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">Interface Theme</h2>
              <p className="text-[10px] font-bold text-text-secondry uppercase tracking-widest">Visual system core</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-background-secondry/40 backdrop-blur-xl border border-border-light rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
            <Bell size={24} className="text-brand-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary tracking-tight">Signal Protocols</h2>
            <p className="text-[10px] font-bold text-text-secondry uppercase tracking-widest">Automated alerting system</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between group">
            <div className="space-y-1">
              <h3 className="font-bold text-text-primary group-hover:text-brand-primary transition-colors">Operational Alerts</h3>
              <p className="text-xs text-text-secondry font-medium">
                High-priority signals for task completion and system events.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) =>
                  setSettings({ ...settings, notifications: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-background-main/50 border border-border-muted rounded-full peer peer-checked:bg-brand-primary/20 peer-checked:border-brand-primary/50 transition-all duration-300 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-text-secondry after:rounded-full after:h-[21px] after:w-[21px] after:transition-all peer-checked:after:translate-x-7 peer-checked:after:bg-brand-primary shadow-inner shadow-black/20"></div>
            </label>
          </div>

          <div className="flex items-center justify-between group">
            <div className="space-y-1">
              <h3 className="font-bold text-text-primary group-hover:text-brand-primary transition-colors">Digest Updates (Email)</h3>
              <p className="text-xs text-text-secondry font-medium">
                Asynchronous reporting delivered to your primary endpoint.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailUpdates}
                onChange={(e) =>
                  setSettings({ ...settings, emailUpdates: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-background-main/50 border border-border-muted rounded-full peer peer-checked:bg-brand-primary/20 peer-checked:border-brand-primary/50 transition-all duration-300 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-text-secondry after:rounded-full after:h-[21px] after:w-[21px] after:transition-all peer-checked:after:translate-x-7 peer-checked:after:bg-brand-primary shadow-inner shadow-black/20"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="relative overflow-hidden bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Trash2 size={150} className="text-red-500" />
        </div>
        
        <div className="relative space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-500 tracking-tight text-shadow-red uppercase">Delete Account</h2>
              <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest">Permanent operational erasure</p>
            </div>
          </div>
          
          <p className="text-xs text-text-secondry font-medium max-w-md leading-relaxed">
            Deleting your account will result in permanent loss of all operational history, active requests, and generated assets. Data recovery is not possible after execution.
          </p>
          
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-8 py-3.5 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 rounded-2xl font-bold transition-all duration-300 text-red-500 hover:text-white shadow-lg shadow-red-500/5"
          >
            Permanently Delete Account
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteAccountModal 
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteAccount}
          loading={isDeleting}
        />
      )}

    </div>
  );
}
