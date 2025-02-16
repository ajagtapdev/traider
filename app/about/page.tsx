"use client";

import Header from "@/components/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Users,
  TrendingUp,
  Shield,
  BookOpen,
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
            Empowering traders with cutting-edge technology and unparalleled
            insights
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
              Our Mission
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              At traider, we&apos;re on a mission to democratize trading by
              providing professional-grade tools and education to traders of all
              experience levels. We believe that with the right resources and
              knowledge, anyone can become a successful trader.
            </p>
            <Link href="/simulator">
              <Button className="bg-[#509048] hover:bg-[#509048]/90 text-white">
                Try Our Simulator <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg"
            variants={fadeIn}
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Key Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-[#80b048]/10 rounded-lg">
                <p className="text-4xl font-bold text-[#80b048]">100K+</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
              <div className="text-center p-4 bg-[#509048]/10 rounded-lg">
                <p className="text-4xl font-bold text-[#509048]">$500M+</p>
                <p className="text-sm text-gray-600">Trading Volume</p>
              </div>
              <div className="text-center p-4 bg-[#509048]/10 rounded-lg">
                <p className="text-4xl font-bold text-[#509048]">24/7</p>
                <p className="text-sm text-gray-600">Support</p>
              </div>
              <div className="text-center p-4 bg-[#80b048]/10 rounded-lg">
                <p className="text-4xl font-bold text-[#80b048]">50+</p>
                <p className="text-sm text-gray-600">Trading Tools</p>
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
            Why Choose traider?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Advanced Analytics",
                description: "Real-time market data and predictive insights",
              },
              {
                icon: Shield,
                title: "Secure Platform",
                description: "Bank-level security to protect your assets",
              },
              {
                icon: Users,
                title: "Community Support",
                description: "Connect with fellow traders and experts",
              },
              {
                icon: BookOpen,
                title: "Educational Resources",
                description: "Comprehensive guides and webinars",
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
            Our Commitment to You
          </h2>
          <p className="text-gray-600 mb-6 text-center max-w-3xl mx-auto leading-relaxed">
            At traider, we&apos;re committed to your success. Our platform is
            designed to grow with you, providing the tools and insights you need
            at every stage of your trading journey. From beginners to seasoned
            professionals, we&apos;re here to help you achieve your financial goals.
          </p>
          <div className="flex justify-center">
            <Link href="/">
              <Button className="bg-[#408830] hover:bg-[#408830]/90 text-white">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
