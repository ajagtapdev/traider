// import { User } from "lucide-react";
import Link from "next/link";
// import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  SignInButton,
  UserButton
} from '@clerk/nextjs'
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

interface HeaderProps {
  isLoading: boolean;
  isAuthenticated: boolean;
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

const Header: React.FC<HeaderProps> = ({ isLoading, isAuthenticated }) => {

  return (
    <ClerkProvider publishableKey="pk_test_Y2l2aWwtcG9ueS0zNi5jbGVyay5hY2NvdW50cy5kZXYk">
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <header className="w-full z-10">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  href="/"
                  className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
                >
                  traider
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
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Simulator
                  </Link>
                </motion.div>
              </nav>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >

            {isLoading && (isAuthenticated ? <UserButton /> : <SignInButton />)}

            </motion.div>
          </div>
        </header>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
};

export default Header;
// export function Header() {
//   return (
//     <header className="flex h-16 items-center justify-between bg-[#F8F4E3]/50 backdrop-blur-sm px-6 border-b border-[#E8D8B2]">
//       <h1 className="text-2xl font-bold text-gray-800">Trading Dashboard</h1>
//       <div className="flex items-center space-x-4">
//         <button className="rounded-full bg-white/50 p-2 text-gray-600 transition-colors hover:bg-white/70">
//           <User size={20} />
//         </button>
//       </div>
//     </header>
//   );
// }
