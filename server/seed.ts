import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log("🌱 Starting seed...");

  try {
    // 1. Create a test user via Supabase Admin
    const email = "demo@example.com";
    const password = "password123";

    let userId: string;

    // Check if user exists by listing users (simple check for demo)
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existingUser = listData.users.find((u) => u.email === email);

    if (existingUser) {
      console.log(`ℹ️ User already exists: ${email}`);
      userId = existingUser.id;
    } else {
      console.log("Creating demo user...");
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: "Demo User" },
      });

      if (error) throw error;
      userId = data.user.id;
      console.log(`✅ User created: ${email} / ${password}`);

      // Wait a moment for trigger to create public user record
      await new Promise((r) => setTimeout(r, 1000));
    }

    const user = { id: userId }; // Mock object for remaining code

    // 2. Create some requests
    console.log("Creating requests...");
    const requests = [
      {
        user_id: user.id,
        county: "Los Angeles County",
        package: "Premium Package",
        status: "Pending",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      },
      {
        user_id: user.id,
        county: "San Diego County",
        package: "Basic Package",
        status: "Waiting Confirmation",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
      {
        user_id: user.id,
        county: "Orange County",
        package: "Enterprise Package",
        status: "Finished",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      },
    ];

    for (const req of requests) {
      // Check if similar request exists to avoid duplicates on re-seed
      const { data: existing } = await supabase
        .from("requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("county", req.county)
        .single();

      if (!existing) {
        await supabase.from("requests").insert(req);
      }
    }
    console.log(`✅ Requests created`);

    // 3. Create notifications
    console.log("Creating notifications...");
    const notifications = [
      {
        user_id: user.id,
        message: "Your request for Orange County is ready for download",
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      },
      {
        user_id: user.id,
        message: "We need additional confirmation for San Diego County",
        is_read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
      },
      {
        user_id: user.id,
        message: "Welcome to SkipScope!",
        is_read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
    ];

    for (const notif of notifications) {
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("message", notif.message)
        .single();

      if (!existing) {
        await supabase.from("notifications").insert(notif);
      }
    }
    console.log(`✅ Notifications created`);

    console.log("✨ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
  }
}

seed();
