"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LoadingScreen from "@/src/components/LoadingScreen";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // The Supabase client automatically handles the code/token exchange 
      // when it's initialized on the client side if the URL contains them.
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth callback error:", error.message);
        router.push("/app/auth/login?error=callback_failed");
        return;
      }

      const next = searchParams.get("next") || "/app/dashboard";
      
      if (session) {
        router.push(next);
      } else {
        // If no session yet, maybe it's still processing
        // but we'll fallback to login
        router.push("/app/auth/login");
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return <LoadingScreen />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AuthCallbackContent />
    </Suspense>
  );
}

