"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

import MainButton from "@/src/components/buttons/MainButton";
import Logo from "../ui/logo/logo";

const links = [
  { href: "#home", label: "Home" },
  { href: "#showcase", label: "Product Showcase" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#industries", label: "Industries" },
  { href: "#features", label: "Features" },
  { href: "#comparison", label: "Comparison" },
];

const MarketingNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const isProgrammaticScroll = useRef(false);




  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Only update active section via scroll if we're not currently doing a programmatic jump
      if (!isProgrammaticScroll.current) {
        const sectionIds = links.map(link => link.href.replace("#", ""));
        const scrollPos = window.scrollY + 200; // Better default offset

        for (const id of sectionIds) {
          const section = document.getElementById(id);
          if (section) {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
              setActiveSection(id);
            }
          }
        }
      }
    };

    // Initial check to prevent mount-flicker
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);

    if (element) {
      // 1. Block scroll-based updates instantly and snap the indicator to destination
      isProgrammaticScroll.current = true;
      setActiveSection(targetId);


      // 2. Perform the scroll
      const navHeight = scrolled ? 64 : 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight - 20;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      // 3. Re-enable scroll tracking after the smooth scroll finishes
      setTimeout(() => {
        isProgrammaticScroll.current = false;
        window.history.pushState(null, "", href);
      }, 1000);
    }
  };

  const navVariants = {
    top: {
      left: "0%",
      right: "0%",
      top: 0,
      borderRadius: 0,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "rgba(255, 255, 255, 0.05)",
      height: 80,
      paddingLeft: "2rem",
      paddingRight: "2rem",
      boxShadow: "0 0 0 rgba(0,0,0,0)",
    },
    scrolled: {
      left: "3%",
      right: "3%",
      top: 16,
      borderRadius: 100,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      borderColor: "rgba(220, 38, 38, 0.3)",
      height: 64,
      paddingLeft: "1.5rem",
      paddingRight: "1.5rem",
      boxShadow: "0 25px 50px -12px rgba(220, 38, 38, 0.15)",
    }
  };

  return (
    <>
      <motion.nav
        variants={navVariants}
        initial="top"
        animate={scrolled ? "scrolled" : "top"}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 50,
          mass: 1
        }}
        className="fixed z-50 flex justify-between items-center border backdrop-blur-xl group"
        aria-label="Main Navigation"
      >
        {/* Logo */}
        <motion.div
          className="relative z-10"
        >
          <Logo />
        </motion.div>

        {/* Desktop Navbar Links */}
        <motion.div
          className="hidden md:flex justify-between items-center gap-12"
        >
          {links.map((link) => {
            const isActive = activeSection === link.href.replace("#", "");

            return (
              <Link
                key={link.href}
                href={link.href}
                scroll={false}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`relative text-sm sm:text-lg font-bold text-center transition-all duration-300
                  ${isActive ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" : "text-white/40 hover:text-white/80"}
                `}
              >
                {link.label}

                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white shadow-[0_0_15px_rgba(255,255,255,1)]"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </motion.div>

        {/* Desktop CTA / Auth */}
        <div className="hidden md:flex items-center gap-8 z-10">
          <Link
            href="/app/auth/login"
            className="text-sm font-bold text-white/50 hover:text-white transition-colors uppercase tracking-widest italic"
          >
            Login
          </Link>
          <MainButton Goto="/app/auth/register">
            <p className="text-white font-black italic uppercase tracking-widest text-xs">
              Join Skipscope
            </p>
          </MainButton>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 z-[60] relative focus:outline-none"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          <motion.span
            animate={isMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            className="w-8 h-0.5 bg-white mb-1.5 block rounded-full"
          />
          <motion.span
            animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="w-8 h-0.5 bg-white mb-1.5 block rounded-full"
          />
          <motion.span
            animate={isMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            className="w-8 h-0.5 bg-white block rounded-full"
          />
        </button>

        {/* Mobile Menu logic */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed left-0 right-0 top-20 bg-black/95 backdrop-blur-2xl z-50 md:hidden flex flex-col p-8 border-b border-white/10 shadow-2xl shadow-black h-[calc(100vh-80px)]"
            >
              <div className="flex flex-col gap-6">
                {links.map((link, idx) => {
                  const isActive = activeSection === link.href.replace("#", "");
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        scroll={false}
                        onClick={(e) => {
                          setIsMenuOpen(false);
                          scrollToSection(e, link.href);
                        }}
                        className={`text-4xl font-black italic uppercase tracking-tighter transition-all duration-300 ${isActive ? "text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "text-white/20"
                          }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-auto flex flex-col gap-4 "
              >
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push("/app/auth/login");
                  }}
                  className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold tracking-tighter text-2xl hover:bg-white/10 transition-colors mt-8 uppercase italic"
                >
                  LOG IN
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push("/app/auth/register");
                  }}
                  className="w-full py-5 rounded-2xl bg-[#c91e1e] text-white font-black italic uppercase tracking-widest text-xl shadow-lg shadow-[#c91e1e]/20"
                >
                  Join Skipscope
                </button>
              </motion.div>

              <div className="mt-12 text-center text-white/20 text-xs font-bold uppercase tracking-[0.3em]">
                Fast Track Intelligence
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default MarketingNavbar;
