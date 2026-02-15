"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/userStore";
import { usePathname, useRouter } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useUserStore((state) => state.setUser);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getSession: any = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (
        data.session &&
        (pathname === "/app/auth/login" || pathname === "/app/auth/register")
      ) {
        setUser(data.session.user);
        router.push("/app/dashboard");
      } else if (!data.session && !pathname.startsWith("/app/auth")) {
        router.push("/app/auth/login");
      } else if (data.session) {
        setUser(data.session.user);
      }
    };

    getSession();

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
  }, [setUser, router, pathname]);

  return <>{children}</>;
}
