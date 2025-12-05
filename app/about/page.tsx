"use client";

import Header from "@/components/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Brain,
  Zap,
  Trophy,
  LineChart,
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function About() {
  return (
    <div className="min-h-screen bg-[#FDF6E9]">
      <Header/>
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
            About tr
            <span className="text-[#509048]">a</span>
            <span className="text-[#509048]">i</span>
            der
          </h1>
          <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Master the markets with our high-performance simulation engine and AI-driven insights.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-12 items-center mb-20"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeIn}>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Simulation First
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Traider provides a risk-free environment to test your trading strategies. 
              Powered by a custom C++ engine, our simulator offers professional-grade order execution 
              and portfolio analytics without putting real capital at risk.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Whether you are testing a new hypothesis or learning the ropes, our tools 
              give you the data you need to make informed decisions.
            </p>
            <Link href="/simulator">
              <Button className="bg-[#509048] hover:bg-[#509048]/90 text-white">
                Start Trading <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg"
            variants={fadeIn}
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Platform Features
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-[#80b048]/10 rounded-lg">
                <p className="text-lg font-bold text-[#80b048]">C++ Core</p>
                <p className="text-sm text-gray-600">High-Speed Engine</p>
              </div>
              <div className="text-center p-4 bg-[#509048]/10 rounded-lg">
                <p className="text-lg font-bold text-[#509048]">AI Analyst</p>
                <p className="text-sm text-gray-600">Llama 3.3 Powered</p>
              </div>
              <div className="text-center p-4 bg-[#509048]/10 rounded-lg">
                <p className="text-lg font-bold text-[#509048]">Real-Time</p>
                <p className="text-sm text-gray-600">Market Data</p>
              </div>
              <div className="text-center p-4 bg-[#80b048]/10 rounded-lg">
                <p className="text-lg font-bold text-[#80b048]">Global</p>
                <p className="text-sm text-gray-600">Leaderboards</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
            Built for Serious Learning
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: "Fast Execution",
                description: "Experience low-latency simulated fills with our native C++ backend.",
              },
              {
                icon: Brain,
                title: "AI Analysis",
                description: "Get honest, no-fluff investment insights from our AI financial analyst.",
              },
              {
                icon: Trophy,
                title: "Compete",
                description: "Climb the leaderboard and prove your strategy against other traders.",
              },
              {
                icon: LineChart,
                title: "Deep Metrics",
                description: "Analyze your performance with professional-grade portfolio tools.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                whileHover={{ y: -5 }}
                variants={fadeIn}
              >
                <feature.icon className="h-12 w-12 text-[#509048] mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-8 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
            Ready to Test Your Strategy?
          </h2>
          <p className="text-gray-600 mb-6 text-center max-w-3xl mx-auto leading-relaxed">
            Join other traders in a realistic simulation environment. Use our calculator to plan your moves, 
            consult our AI for market sentiment, and execute your trades on a professional platform.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/simulator">
              <Button className="bg-[#408830] hover:bg-[#408830]/90 text-white">
                Open Simulator
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="outline" className="border-[#408830] text-[#408830] hover:bg-[#408830]/10">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
