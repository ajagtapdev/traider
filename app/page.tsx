"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LineChart, PieChart, BarChart } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/header";

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

export default function Home() {

  return (
    <div className="min-h-screen bg-[#FDF6E9]">
      <Header />
      <main>
        <section className="pt-32 pb-20">
          <motion.div
            className="container mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Master Your Trading Journey
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Advanced portfolio tracking, real-time simulations, and powerful
                analytics to help you make informed trading decisions.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-[#4ADE80] hover:bg-[#4ADE80]/90 text-white px-8 py-6 text-lg">
                  Create Account
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </section>
        <section className="py-16 bg-white/50">
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
              <motion.div className="text-center" variants={fadeIn} whileHover={{ y: -10 }}>
                <div className="w-16 h-16 bg-[#FDA4AF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LineChart className="w-8 h-8 text-[#FDA4AF]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Portfolio Tracking</h3>
                <p className="text-gray-600">
                  Monitor your investments with real-time updates and detailed analytics
                </p>
              </motion.div>
              <motion.div className="text-center" variants={fadeIn} whileHover={{ y: -10 }}>
                <div className="w-16 h-16 bg-[#4ADE80]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <PieChart className="w-8 h-8 text-[#4ADE80]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Risk Analysis</h3>
                <p className="text-gray-600">
                  Understand your portfolio distribution and optimize for better returns
                </p>
              </motion.div>
              <motion.div className="text-center" variants={fadeIn} whileHover={{ y: -10 }}>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Trading Simulator</h3>
                <p className="text-gray-600">
                  Practice trading strategies without risking real money
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <footer className="border-t border-neutral-200 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} TradePro. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                Privacy
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                Contact
              </Link>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
