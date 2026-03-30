# Notification System Documentation

## Overview

This notification system provides real-time notifications for Kanban board changes and other events in your application. It consists of:

1. **Backend Notification Service** - Centralized notification management
2. **Real-time SSE (Server-Sent Events)** - Push notifications to clients
3. **Webhook Endpoint** - Allow external systems to trigger notifications
4. **Client-side Integration** - React hooks and components for consuming notifications

## Features

### Automatic Notifications

The system automatically sends notifications when:

- ✅ Request status changes in the Kanban board
- ✅ Request is assigned to an admin
- ✅ Client notes are updated
- ✅ Files are uploaded (can be integrated)

### Real-time Delivery

- Server-Sent Events (SSE) for instant notification delivery
- Automatic reconnection on connection loss
- Browser notifications support
- Toast notifications in the UI

### Webhook Support

- Client-side webhook endpoint: `/app/api/notifications/webhook`
- Backend webhook endpoint: `/api/webhooks/notifications`
- Secure webhook secret authentication

## Setup Instructions

### 1. Backend Setup

Add the webhook secret to your server `.env` file:

```env
WEBHOOK_SECRET=your-super-secret-webhook-key-here
```

### 2. Client Setup

Add these environment variables to your client `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WEBHOOK_SECRET=your-super-secret-webhook-key-here
WEBHOOK_SECRET=your-super-secret-webhook-key-here
```

### 3. Add Notification Provider to Your Layout

Update your client app layout to include the notification toast provider:

```tsx
import NotificationToastProvider from "@/components/NotificationToastProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NotificationToastProvider />
      {children}
    </>
  );
}
```

### 4. Database Schema

Ensure your `notifications` table has these columns:

- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to users)
- `message` (text)
- `type` (text) - 'info', 'success', 'warning', 'error'
- `metadata` (jsonb) - optional additional data
- `request_id` (uuid, optional) - link to related request
- `is_read` (boolean)
- `created_at` (timestamp)

## Usage

### Using the React Hook

```tsx
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

function MyComponent() {
  const { notifications, isConnected, markAsRead, markAllAsRead } =
    useRealtimeNotifications();

  return (
    <div>
      <p>Connection Status: {isConnected ? "Connected" : "Disconnected"}</p>

      {notifications.map((notification) => (
        <div key={notification.id}>
          <p>{notification.message}</p>
          {!notification.is_read && (
            <button onClick={() => markAsRead(notification.id!)}>
              Mark as Read
            </button>
          )}
        </div>
      ))}

      <button onClick={markAllAsRead}>Mark All as Read</button>
    </div>
  );
}
```

### Triggering Notifications via Webhook (Client-side)

```tsx
import { sendNotificationWebhook } from "@/utils/notificationWebhook";

// In your component or function
const handleCustomAction = async () => {
  const result = await sendNotificationWebhook({
    userId: "user-id-here",
    message: "Your custom action was completed!",
    type: "success",
    requestId: "optional-request-id",
    metadata: { customData: "any data you want" },
  });

  if (result.success) {
    console.log("Notification sent successfully!");
  } else {
    console.error("Failed to send notification:", result.error);
  }
};
```

### Triggering Notifications via Webhook (External API)

```bash
curl -X POST http://localhost:3000/app/api/notifications/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-here",
    "message": "Your request has been updated!",
    "type": "info",
    "requestId": "request-uuid-here",
    "webhookSecret": "your-super-secret-webhook-key-here"
  }'
```

### Backend: Creating Notifications Programmatically

```typescript
import { NotificationService } from "@/services/notificationService";

// In any backend controller or service
await NotificationService.createNotification({
  userId: "user-id",
  message: "Custom notification message",
  type: "info",
  requestId: "optional-request-id",
  metadata: { any: "data" },
});

// Or use the pre-built helper methods
await NotificationService.notifyKanbanStatusChange(
  userId,
  requestId,
  "Old Status",
  "New Status",
);

await NotificationService.notifyRequestAssigned(
  userId,
  requestId,
  "Admin Name",
);

await NotificationService.notifyNotesUpdated(userId, requestId, "client");
```

## API Endpoints

### Client-side Webhook

- **URL**: `POST /app/api/notifications/webhook`
- **Auth**: Webhook secret in request body
- **Body**:
  ```json
  {
    "userId": "string",
    "message": "string",
    "type": "info|success|warning|error",
    "metadata": {},
    "requestId": "string",
    "webhookSecret": "string"
  }
  ```

### Backend Webhook

- **URL**: `POST /api/webhooks/notifications`
- **Auth**: Webhook secret in request body
- **Body**: Same as client-side webhook

### SSE Subscribe

- **URL**: `GET /api/notifications/subscribe`
- **Auth**: Bearer token in Authorization header
- **Returns**: SSE stream of notifications

### Get All Notifications

- **URL**: `GET /api/notifications`
- **Auth**: Bearer token
- **Returns**: Array of notifications

### Mark as Read

- **URL**: `PATCH /api/notifications/:id/read`
- **Auth**: Bearer token

### Mark All as Read

- **URL**: `POST /api/notifications/read-all`
- **Auth**: Bearer token

## Notification Types

- **info** (ℹ️) - General information, default type
- **success** (✅) - Success messages, confirmations
- **warning** (⚠️) - Important notices, cautions
- **error** (❌) - Error messages, failures

## Architecture

### Server-Side Flow

1. Kanban board action occurs (move, assign, update notes)
2. Controller calls `NotificationService` method
3. NotificationService:
   - Saves notification to database
   - Emits SSE event to connected clients
4. Client receives real-time notification

### Client-Side Flow

1. User logs in
2. `useRealtimeNotifications` hook connects to SSE endpoint
3. Hook receives notifications in real-time
4. `NotificationToastProvider` shows toast messages
5. User can view all notifications in notification center

## Production Considerations

### SSE Connection Management

- The current implementation uses in-memory storage for SSE clients
- For production with multiple server instances, use **Redis Pub/Sub** or similar
- Consider implementing connection limits per user

### Webhook Security

- Change default webhook secret to a strong, random value
- Consider implementing rate limiting
- Add IP whitelisting if needed
- Log all webhook attempts for auditing

### Browser Notifications

- Request permission responsibly (don't ask immediately on page load)
- Respect user's notification preferences
- Test across different browsers

### Performance

- Consider pagination for notification lists
- Implement automatic cleanup of old notifications
- Add database indexes on `user_id` and `created_at`

## Troubleshooting

### SSE Not Connecting

- Check CORS settings on the backend
- Verify the API URL is correct in environment variables
- Check browser console for errors
- Ensure user is authenticated

### Notifications Not Appearing

- Check if SSE connection is established
- Verify notification is being created in database
- Check browser notification permissions
- Look for errors in server logs

### Webhook Failing

- Verify webhook secret matches on both ends
- Check request payload format
- Review server logs for detailed error messages

## Future Enhancements

- [ ] Email notifications for important events
- [ ] SMS notifications via Twilio
- [ ] Notification preferences per user
- [ ] Notification history with search/filter
- [ ] Push notifications for mobile apps
- [ ] Notification batching to reduce spam
- [ ] Custom notification sounds
- [ ] Notification categories and filtering
