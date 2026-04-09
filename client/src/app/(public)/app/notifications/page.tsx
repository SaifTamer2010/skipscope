"use client";

import { useEffect, useState } from "react";
import NotificationCard from "@/components/NotificationCard";
import { useNotificationStore } from "@/store/notificationStore";
import api from "@/lib/api";
import toast from "react-hot-toast";
import LoadingScreen from "@/src/components/LoadingScreen";
import { Bell, BellOff, CheckCheck, Inbox } from "lucide-react";

interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { notifications, setNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.notifications);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      markAsRead(id);
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const unreadNotifications = notifications.filter((n) => !n.is_read);
  const readNotifications = notifications.filter((n) => n.is_read);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold text-text-primary uppercase tracking-tight">
            Notification Center
          </h1>
          <p className="text-text-secondry font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            You have {unreadNotifications.length} unread update{unreadNotifications.length !== 1 ? "s" : ""} requiring attention.
          </p>
        </div>
        
        {unreadNotifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="group flex items-center gap-3 px-6 py-3 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl text-brand-primary font-bold hover:bg-brand-primary hover:text-text-button transition-all duration-300 shadow-lg shadow-brand-primary/5"
          >
            <CheckCheck size={18} className="transition-transform group-hover:scale-110" />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Unread Notifications */}
        {unreadNotifications.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] bg-background-third/50 px-3 py-1 rounded-md border border-border-muted flex items-center gap-2">
                <Bell size={12} className="text-brand-primary" />
                Active Alerts
              </h2>
              <div className="h-[1px] flex-1 bg-border-muted" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              {unreadNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          </div>
        )}

        {/* Read Notifications */}
        {readNotifications.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xs font-black text-text-secondry uppercase tracking-[0.2em] px-3 py-1 flex items-center gap-2 opacity-60">
                <Inbox size={12} />
                Archived
              </h2>
              <div className="h-[1px] flex-1 bg-border-muted opacity-40" />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {readNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-700">
          <div className="w-24 h-24 rounded-[2.5rem] bg-background-secondry/40 backdrop-blur-xl border border-border-light flex items-center justify-center mb-8 shadow-2xl shadow-black/20">
            <BellOff size={40} className="text-text-secondry/20" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary uppercase tracking-tight mb-2">Clear Skies</h3>
          <p className="text-text-secondry max-w-sm mx-auto font-medium">
            Your notification center is currently empty. We'll alert you as soon as there's an update on your requests.
          </p>
        </div>
      )}
    </div>
  );
}
