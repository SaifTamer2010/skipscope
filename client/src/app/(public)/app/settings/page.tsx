"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useUserStore } from "@/store/userStore";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const user = useUserStore((state) => state.user);
  const [settings, setSettings] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    notifications: true,
    emailUpdates: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/user/settings");
      if (response.data) {
        setSettings((prev) => ({
          ...prev,
          ...response.data,
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          notifications: response.data.notifications ?? true,
          emailUpdates: response.data.emailUpdates ?? true,
        }));
      }
    } catch (error) {
      console.error("Failed to load settings", error);
    }
  };

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

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-linear-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-text-secondry">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Settings */}
      <div className="bg-background-secondry border border-white/10 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                value={settings.firstName}
                onChange={(e) =>
                  setSettings({ ...settings, firstName: e.target.value })
                }
                placeholder="John"
                className="w-full px-4 py-3 bg-background-main border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={settings.lastName}
                onChange={(e) =>
                  setSettings({ ...settings, lastName: e.target.value })
                }
                placeholder="Doe"
                className="w-full px-4 py-3 bg-background-main border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) =>
                setSettings({ ...settings, email: e.target.value })
              }
              placeholder="john@example.com"
              className="w-full px-4 py-3 bg-background-main border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Appearance Settings */}
      <div className="bg-background-secondry border border-white/10 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Theme</h3>
            <p className="text-sm text-text-secondry">
              Choose your preferred theme
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-background-secondry border border-white/10 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Push Notifications</h3>
              <p className="text-sm text-text-secondry">
                Receive push notifications for updates
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
              <div className="w-11 h-6 bg-background-main border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Email Updates</h3>
              <p className="text-sm text-text-secondry">
                Receive email updates about your requests
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
              <div className="w-11 h-6 bg-background-main border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-red-400">Danger Zone</h2>
        <p className="text-sm text-text-secondry mb-4">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <button className="px-6 py-3 bg-red-500/20 border border-red-500/50 rounded-lg font-semibold hover:bg-red-500/30 transition-colors text-red-400">
          Delete Account
        </button>
      </div>
    </div>
  );
}
