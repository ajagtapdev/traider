/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";


import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";


const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <header className="w-full z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center group">
              <div className="relative w-8 h-8 mr-2">
                <Image
                  src="/logo2.jpg"
                  alt="Traider Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-2xl font-bold text-gray-800 relative">
                tr
                <span className="text-[#509048]">a</span>
                <span className="text-[#509048]">i</span>
                der
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#408830] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
              </span>
            </Link>
          </motion.div>

          <nav className="hidden md:flex space-x-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                About
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link
                href="/simulator"
                className="text-gray-600 hover:text-black transition-colors"
              >
                Simulator
              </Link>
            </motion.div>
          </nav>
        </div>

        <div className="flex items-center gap-4">
             <Link href="/simulator">
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 className="px-4 py-2 bg-[#408830] text-white rounded-md text-sm font-medium hover:bg-[#509048] transition-colors"
               >
                 Start Trading
               </motion.button>
             </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
