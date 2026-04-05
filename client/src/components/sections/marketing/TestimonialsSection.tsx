"use client";

import { motion, useScroll, useSpring, useTransform, useVelocity, useAnimationFrame, useMotionValue } from "framer-motion";
import { useRef } from "react";

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Senior Real Estate Broker",
    quote: "Skipscope changed the way we handle our lead generation. The accuracy is unmatched.",
  },
  {
    name: "Michael Chen",
    role: "Property Investor",
    quote: "The deep search feature found contacts we'd been trying to trace for months.",
  },
  {
    name: "Emily Rodriguez",
    role: "Acquisitions Specialist",
    quote: "Fast, reliable, and premium. The dashboard makes managing huge sets of data effortlessly.",
  },
];

const TestimonialMarquee = ({ testimonials, baseVelocity = -10 }: { testimonials: any[], baseVelocity?: number }) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  const x = useTransform(baseX, (v) => `${(v % 100)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="relative flex overflow-hidden">
      <motion.div className="flex gap-8 px-4 " style={{ x }}>
        {[...testimonials, ...testimonials, ...testimonials, ...testimonials].map((t, idx) => (
          <div
            key={idx}
            className="w-[350px] md:w-[550px] p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex flex-col gap-4 flex-shrink-0"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-800/50 border border-white/10 flex items-center justify-center text-[10px] text-gray-500 uppercase tracking-tighter italic">
                Image
              </div>
              <div>
                <div className="font-bold text-white text-sm">{t.name}</div>
                <div className="text-xs text-red-500 opacity-80">{t.role}</div>
              </div>
            </div>
            <p className="text-gray-300 italic text-sm leading-relaxed whitespace-normal text-wrap">"{t.quote}"</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="w-full py-32 overflow-hidden bg-gradient-to-b from-transparent via-red-600/5 to-transparent">
      <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 italic">Voices from the Field</h2>
        <div className="h-1 w-24 bg-red-600 mx-auto rounded-full"></div>
      </div>

      <TestimonialMarquee testimonials={testimonials} baseVelocity={-1} />
    </section>
  );
};

export default TestimonialsSection;
