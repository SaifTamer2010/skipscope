"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";

export default function AdminAuthProvideradm({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useUserStore((state) => state.setUser);
  const router = useRouter();

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Admin Session error:", error.message);
        supabase.auth.signOut();
      }
      setUser(session?.user ?? null);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === "SIGNED_OUT") {
        router.push("/app/auth/login"); // Redirect to login on sign out
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, router]);

  return <>{children}</>;
}
