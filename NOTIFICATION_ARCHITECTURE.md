# Notification System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT SIDE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │  React Component │         │  Webhook Client  │             │
│  │                  │         │                  │             │
│  │ useRealtime      │         │ sendNotification │             │
│  │ Notifications()  │         │ Webhook()        │             │
│  └────────┬─────────┘         └────────┬─────────┘             │
│           │                            │                        │
│           │ SSE Connection             │ HTTP POST              │
│           │ (Real-time)                │ (Webhook)              │
│           ▼                            ▼                        │
│  ┌─────────────────────────────────────────────┐               │
│  │     NotificationToastProvider               │               │
│  │     (Displays toasts automatically)         │               │
│  └─────────────────────────────────────────────┘               │
│                                                                  │
└──────────────────┬────────────────────┬─────────────────────────┘
                   │                    │
                   │ SSE Stream         │ Webhook API
                   │ (EventSource)      │ (fetch)
                   │                    │
┌──────────────────▼────────────────────▼─────────────────────────┐
│                         SERVER SIDE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           API Routes & Middleware                         │  │
│  │  ┌────────────────┐      ┌──────────────────┐           │  │
│  │  │ /notifications │      │ /webhooks        │           │  │
│  │  │ /subscribe     │      │ /notifications   │           │  │
│  │  └───────┬────────┘      └────────┬─────────┘           │  │
│  │          │                         │                      │  │
│  │          │ authMiddleware          │ webhook validation   │  │
│  │          ▼                         ▼                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Controllers                                     │  │
│  │  ┌────────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │ SSE Subscribe  │  │   Webhook    │  │   Kanban     │ │  │
│  │  │ Controller     │  │  Controller  │  │ Controllers  │ │  │
│  │  └───────┬────────┘  └──────┬───────┘  └──────┬───────┘ │  │
│  │          │                   │                 │          │  │
│  │          └───────────────────┴─────────────────┘          │  │
│  │                              │                             │  │
│  │                              ▼                             │  │
│  │          ┌────────────────────────────────────┐           │  │
│  │          │   NotificationService              │           │  │
│  │          │                                    │           │  │
│  │          │  • createNotification()            │           │  │
│  │          │  • notifyKanbanStatusChange()      │           │  │
│  │          │  • notifyRequestAssigned()         │           │  │
│  │          │  • notifyNotesUpdated()            │           │  │
│  │          │  • registerSSEClient()             │           │  │
│  │          │  • emitNotificationEvent()         │           │  │
│  │          └────────┬───────────────┬───────────┘           │  │
│  │                   │               │                        │  │
│  │                   │               │ Real-time emit         │  │
│  │                   │               └────────────┐           │  │
│  │                   ▼                            ▼           │  │
│  │          ┌────────────────┐         ┌────────────────┐    │  │
│  │          │   Database     │         │  SSE Clients   │    │  │
│  │          │  (Supabase)    │         │  (In-memory)   │    │  │
│  │          │                │         │                │    │  │
│  │          │  notifications │         │  Map<userId,   │    │  │
│  │          │  table         │         │   callbacks[]> │    │  │
│  │          └────────────────┘         └────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Event Flow

### 1. Kanban Board Change (Automatic Notification)

```
Admin moves card in Kanban
          │
          ▼
moveRequest.ts Controller
          │
          ▼
NotificationService.notifyKanbanStatusChange()
          │
          ├─────────────────────┬─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
   Save to DB          Emit SSE Event        Log Activity
          │                     │
          │                     ▼
          │            Connected SSE Clients
          │                     │
          │                     ▼
          │            Client receives event
          │                     │
          │                     ▼
          │            Toast notification shown
          │                     │
          └─────────────────────┘
```

### 2. Webhook Notification (Manual Trigger)

```
External System / Client Component
          │
          ▼
POST /api/webhooks/notifications
          │
          ▼
Validate webhook secret
          │
          ▼
NotificationService.createNotification()
          │
          ├─────────────────────┐
          │                     │
          ▼                     ▼
   Save to DB          Emit SSE Event
          │                     │
          │                     ▼
          │            Connected SSE Clients
          │                     │
          │                     ▼
          │            Client receives event
          │                     │
          │                     ▼
          │            Toast notification shown
          │                     │
          └─────────────────────┘
```

## Data Flow

### Notification Object Structure

```typescript
{
  id: string,                    // UUID
  user_id: string,               // Recipient user ID
  message: string,               // Notification text
  type: 'info' | 'success' | 'warning' | 'error',
  metadata: {                    // Optional additional data
    action: string,
    requestId?: string,
    ...custom fields
  },
  request_id?: string,           // Related request (optional)
  is_read: boolean,              // Read status
  created_at: timestamp          // When created
}
```

### SSE Event Format

```typescript
data: {
  type: 'connected' | 'info' | 'success' | 'warning' | 'error',
  message: string,
  metadata?: object,
  requestId?: string
}
```

## Component Integration

```
App Layout
    │
    ├── AuthProvider (Authentication)
    │
    ├── NotificationToastProvider (Auto-display)
    │       │
    │       └── useRealtimeNotifications() hook
    │               │
    │               ├── SSE Connection
    │               ├── Notification State
    │               └── Browser Notifications
    │
    └── Page Components
            │
            └── Can use useRealtimeNotifications()
                    │
                    ├── notifications []
                    ├── isConnected
                    ├── markAsRead()
                    └── markAllAsRead()
```

## Key Technologies

- **SSE (Server-Sent Events)**: Real-time push from server to client
- **Supabase Auth**: JWT token validation
- **React Hooks**: Custom hook for notification management
- **React Hot Toast**: Toast notification display
- **TypeScript**: Type-safe implementation
- **Express.js**: Backend API framework

## Security Layers

```
1. Authentication (Supabase JWT)
   ├── Token in Authorization header
   └── Token in query params (SSE only)

2. Webhook Authentication
   ├── Webhook secret validation
   └── Environment variable configuration

3. User Isolation
   └── Notifications only sent to correct user_id

4. Connection Management
   ├── Automatic cleanup on disconnect
   └── Heartbeat monitoring
```

## Scalability Considerations

### Current Implementation (Development/Small Scale)

- In-memory SSE client storage
- Single server instance
- Direct notification emission

### Production Recommendations (Large Scale)

```
┌─────────────────┐
│  Load Balancer  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Server1│ │Server2│
└───┬───┘ └──┬────┘
    │        │
    └───┬────┘
        │
    ┌───▼────┐
    │ Redis  │  ← Pub/Sub for SSE events
    │Pub/Sub │     across multiple servers
    └────────┘
```

For production at scale:

1. Use Redis Pub/Sub for SSE event distribution
2. Implement sticky sessions for SSE connections
3. Add database indexes on frequently queried columns
4. Consider notification batching for high-volume users
5. Implement rate limiting on webhook endpoints
