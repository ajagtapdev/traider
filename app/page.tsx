"use client";

import type React from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LineChart, PieChart, BarChart } from "lucide-react";
import Header from "@/components/header";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
} from "framer-motion";
import { useEffect, useState } from "react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => {
    const delay = i * 0.1; // Reduced delay between elements
    return {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay, type: "spring", duration: 0.8, bounce: 0 }, // Reduced duration
        opacity: { delay, duration: 0.01 },
      },
    };
  },
};

const pulse = {
  scale: [1, 1.1, 1],
  transition: {
    duration: 2,
    repeat: Number.POSITIVE_INFINITY,
    ease: "easeInOut",
  },
};

export default function Home() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  const controls = useAnimation();

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    controls.start("visible");
    return () => window.removeEventListener("resize", updateDimensions);
  }, [controls]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  return (
    <div className="min-h-screen bg-[#FDF6E9] overflow-hidden">
      <Header />
      <main>
        <section
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
          onMouseMove={handleMouse}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              rotateX: rotateX,
              rotateY: rotateY,
              perspective: 1000,
            }}
          >
            <motion.svg
              className="w-full h-full"
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              initial="hidden"
              animate={controls}
            >
              {/* Grid pattern */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.line
                  key={`horizontal-${i}`}
                  x1="0"
                  y1={i * (dimensions.height / 20)}
                  x2={dimensions.width}
                  y2={i * (dimensions.height / 20)}
                  stroke="#80b048"
                  strokeWidth="0.5"
                  variants={draw}
                  custom={i * 0.5} // Adjust the multiplier to speed up or slow down the sequence
                  whileHover={{ stroke: "#FDA4AF", strokeWidth: 2 }}
                />
              ))}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.line
                  key={`vertical-${i}`}
                  x1={i * (dimensions.width / 20)}
                  y1="0"
                  x2={i * (dimensions.width / 20)}
                  y2={dimensions.height}
                  stroke="#FDA4AF"
                  strokeWidth="0.5"
                  variants={draw}
                  custom={i * 0.5 + 10} // Offset to start after horizontal lines
                  whileHover={{ stroke: "#80b048", strokeWidth: 2 }}
                />
              ))}

              {/* Abstract financial patterns */}
              <motion.path
                d={`M ${dimensions.width * 0.1} ${dimensions.height * 0.3} Q ${dimensions.width * 0.15} ${dimensions.height * 0.05} ${dimensions.width * 0.2} ${dimensions.height * 0.3} T ${dimensions.width * 0.3} ${dimensions.height * 0.3} T ${dimensions.width * 0.4} ${dimensions.height * 0.3} T ${dimensions.width * 0.5} ${dimensions.height * 0.3}`}
                stroke="#80b048"
                strokeWidth="2"
                fill="none"
                variants={draw}
                custom={20} // Reduced delay
                whileHover={{ stroke: "#FDA4AF" }}
              />
              <motion.path
                d={`M ${dimensions.width * 0.7} ${dimensions.height * 0.6} Q ${dimensions.width * 0.8} ${dimensions.height * 0.4} ${dimensions.width * 0.9} ${dimensions.height * 0.6} T ${dimensions.width} ${dimensions.height * 0.6}`}
                stroke="#FDA4AF"
                strokeWidth="2"
                fill="none"
                variants={draw}
                custom={21} // Reduced delay
                whileHover={{ stroke: "#80b048" }}
              />

              {/* Animated circles */}
              <motion.circle
                cx={dimensions.width * 0.15}
                cy={dimensions.height * 0.15}
                r={dimensions.width * 0.05}
                stroke="#80b048"
                strokeWidth="2"
                fill="none"
                variants={draw}
                custom={22} // Reduced delay
                whileHover={{ stroke: "#FDA4AF" }}
              />
              <motion.circle
                cx={dimensions.width * 0.85}
                cy={dimensions.height * 0.85}
                r={dimensions.width * 0.1}
                stroke="#FDA4AF"
                strokeWidth="2"
                fill="none"
                variants={draw}
                custom={23} // Reduced delay
                whileHover={{ stroke: "#80b048" }}
              />

              {/* Pulsing elements */}
              <motion.circle
                cx={dimensions.width * 0.5}
                cy={dimensions.height * 0.5}
                r="10"
                fill="#80b048"
                animate={pulse}
              />
              <motion.circle
                cx={dimensions.width * 0.2}
                cy={dimensions.height * 0.8}
                r="8"
                fill="#FDA4AF"
                animate={pulse}
              />
              <motion.circle
                cx={dimensions.width * 0.8}
                cy={dimensions.height * 0.2}
                r="12"
                fill="#80b048"
                animate={pulse}
              />
            </motion.svg>
          </motion.div>

          <motion.div
            className="relative z-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Master Your Trading Journey
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Advanced portfolio simulations, detailed feedback, and real-time
              analytics to help you make informed trading decisions.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-[#80b048] hover:bg-[#509048]/90 text-white px-8 py-6 text-lg">
                Create Account
              </Button>
            </motion.div>
          </motion.div>
        </section>

        <section className="py-16 bg-white/50 relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Powerful Trading Tools
            </h2>
            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div
                className="text-center"
                variants={fadeIn}
                whileHover={{ y: -10 }}
              >
                <div className="w-16 h-16 bg-[#FDA4AF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LineChart className="w-8 h-8 text-[#FDA4AF]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Portfolio Tracking
                </h3>
                <p className="text-gray-600">
                  Monitor your investments with real-time updates and detailed
                  analytics
                </p>
              </motion.div>
              <motion.div
                className="text-center"
                variants={fadeIn}
                whileHover={{ y: -10 }}
              >
                <div className="w-16 h-16 bg-[#4ADE80]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <PieChart className="w-8 h-8 text-[#4ADE80]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Risk Analysis</h3>
                <p className="text-gray-600">
                  Understand your portfolio distribution and optimize for better
                  returns
                </p>
              </motion.div>
              <motion.div
                className="text-center"
                variants={fadeIn}
                whileHover={{ y: -10 }}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Trading Simulator
                </h3>
                <p className="text-gray-600">
                  Practice trading strategies without risking real money
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <footer className="border-t border-neutral-200 py-8 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} traider. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/terms"
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Contact
              </Link>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
