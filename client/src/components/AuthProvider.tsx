"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/userStore";
import { usePathname, useRouter } from "next/navigation";
import FullScreenLoading from "./FullScreenLoading";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const setUser = useUserStore((state) => state.setUser);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getSession: any = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error.message);
        await supabase.auth.signOut();
        setUser(null);
      }

      if (
        data.session &&
        (pathname === "/app/auth/login" || pathname === "/app/auth/register")
      ) {
        setUser(data.session.user);
        router.push("/app/dashboard");
        // setLoading(false);
      } else if (!data.session && !pathname.startsWith("/app/auth")) {
        router.push("/app/auth/login");
        // setLoading(false);
      } else if (data.session) {
        setUser(data.session.user);
        // setLoading(false);
      }
    };

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      console.log(event)
      if (event === "INITIAL_SESSION") {
        router.push("/app/auth/login"); // Redirect to login on sign out
      }
    });

    return () => {
      setLoading(false)
      subscription.unsubscribe();
    };
  }, [setUser, router, pathname]);

  if (loading) {
    return <FullScreenLoading />;
  }

  return <>{children}</>;
}
