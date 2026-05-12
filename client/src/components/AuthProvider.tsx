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
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error.message);
        await supabase.auth.signOut();
        setUser(null);
      }

      const session = data.session;
      const isAuthPage = pathname.startsWith("/app/auth");

      if (session && isAuthPage) {
        setUser(session.user);
        router.push("/app/dashboard");
      } else if (!session && !isAuthPage) {
        router.push("/app/auth/login");
      } else if (session) {
        setUser(session.user);
      }

      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN") {
        setLoading(false);
        if (pathname.startsWith("/app/auth")) {
          router.push("/app/dashboard");
        }
      } else if (event === "SIGNED_OUT") {
        setLoading(false);
        router.push("/app/auth/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, router, pathname]);

  if (loading) {
    return <FullScreenLoading />;
  }

  return <>{children}</>;
}
