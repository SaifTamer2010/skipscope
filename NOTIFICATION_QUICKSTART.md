# Quick Start Guide - Notification System

## 🚀 Getting Started in 5 Minutes

### Step 1: Set Environment Variables

**Server** (`server/.env`):

```bash
WEBHOOK_SECRET=change-this-to-a-random-secure-string
```

**Client** (`client/.env.local`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WEBHOOK_SECRET=change-this-to-a-random-secure-string
WEBHOOK_SECRET=change-this-to-a-random-secure-string
```

### Step 2: That's it! 🎉

The notification system is already integrated into your app. When you:

- Move a request in the Kanban board → User gets notified
- Assign a request to an admin → User gets notified
- Update client notes → User gets notified

### Test It Now

1. Start your server: `cd server && npm run dev`
2. Start your client: `cd client && npm run dev`
3. Log in as a user (demo@example.com / password123)
4. Log in as an admin in another window
5. Move a request in the Kanban board
6. See the notification toast appear instantly! ✨

## 📱 What You Get

✅ Real-time notification toasts  
✅ Browser notifications (if permitted)  
✅ Automatic reconnection on disconnect  
✅ Webhook support for custom notifications  
✅ Type-safe TypeScript implementation

## 🔧 Customization

### Send Custom Notifications (Client-side)

```typescript
import { sendNotificationWebhook } from "@/utils/notificationWebhook";

await sendNotificationWebhook({
  userId: "user-id-here",
  message: "Your custom message!",
  type: "success", // 'info' | 'success' | 'warning' | 'error'
});
```

### Create Notifications (Backend)

```typescript
import { NotificationService } from "@/services/notificationService";

await NotificationService.createNotification({
  userId: "user-id",
  message: "Backend notification",
  type: "info",
});
```

## 📚 Full Documentation

See [NOTIFICATION_SYSTEM.md](./NOTIFICATION_SYSTEM.md) for complete documentation.

## 🆘 Need Help?

### Notifications Not Appearing?

- Check browser console for errors
- Verify environment variables are set
- Ensure you're logged in
- Check server logs

### SSE Not Connecting?

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings if using different domains
- Look for connection errors in browser console

## 🎨 Examples

### Display Unread Count

```typescript
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

function NotificationBadge() {
  const { notifications } = useRealtimeNotifications();
  const unread = notifications.filter(n => !n.is_read).length;

  return <div>Notifications ({unread})</div>;
}
```

### Notification List

```typescript
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

function NotificationList() {
  const { notifications, markAsRead, markAllAsRead } = useRealtimeNotifications();

  return (
    <div>
      <button onClick={markAllAsRead}>Mark All Read</button>
      {notifications.map(n => (
        <div key={n.id} onClick={() => markAsRead(n.id!)}>
          {n.message}
          {!n.is_read && <span>NEW</span>}
        </div>
      ))}
    </div>
  );
}
```

---

**That's it!** Your notification system is ready to use. 🚀
