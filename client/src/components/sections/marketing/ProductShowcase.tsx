"use client";

import { motion, useScroll, useSpring, useTransform, useMotionValue } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const ProductShowcase = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const showcaseRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: showcaseRef,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.4], [isMobile ? 5 : 15, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 });
  const springScale = useSpring(scale, { stiffness: 100, damping: 30 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const cardX = useSpring(useTransform(mouseX, [-500, 500], [-25, 25]), { stiffness: 150, damping: 30 });
  const cardY = useSpring(useTransform(mouseY, [-500, 500], [-25, 25]), { stiffness: 150, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX - innerWidth / 2);
    mouseY.set(clientY - innerHeight / 2);
  };

  return (
    <section id="showcase" ref={showcaseRef} onMouseMove={handleMouseMove} className="w-full max-w-7xl py-32 px-6 overflow-hidden">
      <div className="mb-20 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4 italic">Product Showcase</h2>
        <p className="text-text-secondry">Experience the most powerful real estate lead management interface.</p>
      </div>

      <motion.div
        style={{
          rotateX: springRotateX,
          scale: springScale,
          opacity
        }}
        className="relative w-full max-w-5xl mx-auto perspective-1000"
      >
        <div className="bg-gradient-to-br from-background-third to-background-main p-1 rounded-[24px] md:rounded-[40px] border border-border-light shadow-2xl shadow-brand-glow h-[350px] md:h-[600px]">
          <div className="bg-background-secondry rounded-[22px] md:rounded-[38px] h-full overflow-hidden border border-border-light relative shadow-inner ">
            
            <div className="h-12 border-b border-border-light flex items-center justify-between px-6 bg-background-secondry/50">
              <div className="flex gap-2">
                <div className="w-32 h-2 bg-border-light rounded-full"></div>
              </div>
              <div className="flex gap-3">
                <div className="w-3 h-3 rounded-full bg-border-light"></div>
                <div className="w-3 h-3 rounded-full bg-border-light"></div>
              </div>
            </div>

            <div className="p-4 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 opacity-20">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="space-y-4">
                  <div className="w-full h-3 bg-border-light rounded-full"></div>
                  <div className="w-full h-24 bg-background-third/50 rounded-2xl border border-border-muted"></div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-primary-strong/10 to-transparent pointer-events-none"></div>

            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
              <motion.div
                style={{
                  x: cardX,
                  y: cardY,
                }}
                whileHover={{ scale: 1.02 }}
                className="p-6 md:p-12 bg-background-main/80 backdrop-blur-3xl border border-border-light rounded-3xl md:rounded-[2.5rem] shadow-primary z-10 text-center max-w-sm md:max-w-md relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-background-third/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <h4 className="text-xl md:text-3xl font-bold text-text-primary mb-2 md:mb-4 tracking-tight">Lead Insights</h4>
                <p className="text-text-secondry text-xs md:text-lg font-medium leading-relaxed opacity-90">
                  Get a complete view of your property owners, verified contacts, and deal status in only one place.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="absolute -inset-10 bg-brand-primary-strong/5 blur-[100px] -z-10 rounded-[50px]"></div>
      </motion.div>
    </section>
  );
};

export default ProductShowcase;
