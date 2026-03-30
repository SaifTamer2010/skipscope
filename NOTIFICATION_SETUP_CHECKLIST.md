# Notification System - Setup Checklist

## ✅ Pre-implementation Checklist

- [x] NotificationService created
- [x] SSE endpoint implemented
- [x] Webhook endpoints created
- [x] Kanban controllers updated
- [x] React hooks created
- [x] Toast provider added
- [x] Client webhook endpoint added
- [x] Documentation written

## 🚀 Setup Checklist (Do This Now!)

### 1. Environment Variables

#### Server (.env)

```bash
cd server
```

Add to `.env`:

```env
# Notification System
WEBHOOK_SECRET=your-super-secret-random-string-here-change-this
```

**Generate a secure secret:**

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32
```

- [ ] Added WEBHOOK_SECRET to server/.env
- [ ] Generated a random, secure secret (not the example one!)

#### Client (.env.local)

```bash
cd client
```

Add to `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Notification System - Use the SAME secret as server
NEXT_PUBLIC_WEBHOOK_SECRET=your-super-secret-random-string-here-change-this
WEBHOOK_SECRET=your-super-secret-random-string-here-change-this
```

- [ ] Added NEXT_PUBLIC_API_URL to client/.env.local
- [ ] Added WEBHOOK_SECRET (same as server) to client/.env.local
- [ ] Added NEXT_PUBLIC_WEBHOOK_SECRET to client/.env.local

### 2. Database Schema

Your `notifications` table should have:

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  metadata JSONB DEFAULT '{}',
  request_id UUID REFERENCES requests(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
```

- [ ] Notifications table exists
- [ ] Indexes created (optional but recommended)

### 3. Install Dependencies (if needed)

Both should already be installed, but verify:

```bash
# Client
cd client
npm list react-hot-toast  # Should be installed (used in layout)

# Server
cd server
npm list @supabase/supabase-js  # Should be installed
```

- [ ] Dependencies verified

### 4. Test the Implementation

#### Step 1: Start Services

```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

- [ ] Server running on http://localhost:5000
- [ ] Client running on http://localhost:3000

#### Step 2: Test Real-time Notifications

1. Open browser: http://localhost:3000
2. Login as user: `demo@example.com` / `password123`
3. Open another browser tab/window (incognito)
4. Login as admin: `admin@example.com` / `adminpassword123`
5. In admin dashboard, go to Kanban board
6. Move a request card to another column
7. Check the user window - you should see a toast notification appear! 🎉

- [ ] User logged in successfully
- [ ] Admin logged in successfully
- [ ] Moved card in Kanban board
- [ ] Notification appeared in user window
- [ ] Toast message displayed correctly

#### Step 3: Test Webhook (Optional)

```bash
# Replace with actual user ID from your database
curl -X POST http://localhost:3000/app/api/notifications/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-uuid-here",
    "message": "Test webhook notification!",
    "type": "success",
    "webhookSecret": "your-webhook-secret"
  }'
```

- [ ] Webhook call successful
- [ ] Notification appeared for user

### 5. Verify Real-time Connection

Open browser console (F12) in the user window and look for:

```
SSE connection opened
Connected to notifications stream
```

- [ ] SSE connection established
- [ ] No errors in console

## 🔍 Troubleshooting

### Issue: No notifications appearing

**Check:**

- [ ] Environment variables set correctly?
- [ ] Both server and client running?
- [ ] User logged in?
- [ ] Browser console showing errors?
- [ ] Server logs showing errors?

**Solution:**

1. Check browser console for errors
2. Check server terminal for errors
3. Verify NEXT_PUBLIC_API_URL is correct
4. Ensure you're logged in as the correct user

### Issue: SSE not connecting

**Check:**

- [ ] NEXT_PUBLIC_API_URL in .env.local?
- [ ] CORS enabled on server?
- [ ] Token being sent correctly?

**Solution:**

1. Check Network tab in browser dev tools
2. Look for `/api/notifications/subscribe` request
3. Check if it's blocked or returning errors
4. Verify auth token is valid

### Issue: Webhook failing

**Check:**

- [ ] Webhook secret matches on both sides?
- [ ] Using correct endpoint?
- [ ] User ID exists in database?

**Solution:**

1. Check server logs for webhook errors
2. Verify webhook secret in environment variables
3. Use correct endpoint: `/app/api/notifications/webhook` (client) or `/api/webhooks/notifications` (server)

## 📊 Monitoring

### Check Notification History

```sql
-- See recent notifications
SELECT * FROM notifications
ORDER BY created_at DESC
LIMIT 10;

-- Count unread notifications per user
SELECT user_id, COUNT(*)
FROM notifications
WHERE is_read = false
GROUP BY user_id;
```

### Check SSE Connections (Development)

In your server code, you can log:

```typescript
console.log("Active SSE connections:", NotificationService.sseClients.size);
```

## 🎯 Next Actions

### Immediate:

- [ ] Set environment variables
- [ ] Test real-time notifications
- [ ] Verify SSE connection
- [ ] Test webhook (optional)

### Soon:

- [ ] Update UI to show notification count
- [ ] Add notification center page
- [ ] Customize notification messages
- [ ] Add email notifications (future)

### Later:

- [ ] Set up Redis for production SSE
- [ ] Add rate limiting
- [ ] Implement notification preferences
- [ ] Add analytics

## 📚 Resources

- Quick Start: `NOTIFICATION_QUICKSTART.md`
- Full Documentation: `NOTIFICATION_SYSTEM.md`
- Architecture: `NOTIFICATION_ARCHITECTURE.md`
- Implementation Summary: `IMPLEMENTATION_SUMMARY.md`
- Examples: `client/src/examples/notificationWebhookExamples.tsx`

## ✨ Success Criteria

You'll know it's working when:

- ✅ Toast notifications appear automatically
- ✅ Real-time updates happen instantly
- ✅ SSE connection shows as connected
- ✅ No errors in console or logs
- ✅ Notifications saved to database
- ✅ Users only see their own notifications

---

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

**Date Completed:** ****\_\_****

**Notes:**
_Add any notes or issues encountered here_
