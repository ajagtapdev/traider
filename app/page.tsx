import Link from "next/link"
import { DollarSign, TrendingUp, PieChart, Users } from "lucide-react"
import Navbar from "../components/Navbar" 

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-gray-200">
      <header className="bg-green-600 text-white p-4">
        <Navbar />
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-16 text-center">
          <h2 className="text-4xl font-bold mb-4 text-green-400">Your Trusted Partner in Financial Technology</h2>
          <p className="text-xl mb-8 text-gray-400">Empowering your financial decisions with cutting-edge solutions</p>
          <Link
            href="#"
            className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors"
          >
            Get Started
          </Link>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-green-400">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: DollarSign,
                title: "Investment Planning",
                description: "Maximize your returns with our expert investment strategies.",
              },
              {
                icon: TrendingUp,
                title: "Market Analysis",
                description: "Stay ahead with our cutting-edge market analysis tools.",
              },
              {
                icon: PieChart,
                title: "Portfolio Management",
                description: "Optimize your portfolio with our advanced management techniques.",
              },
              {
                icon: Users,
                title: "Financial Consulting",
                description: "Get personalized advice from our team of financial experts.",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-gray-900 p-6 rounded-lg shadow-lg hover:shadow-green-500/20 hover:shadow-xl transition-shadow"
              >
                <service.icon className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">{service.title}</h3>
                <p className="text-gray-400">{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 bg-gray-900 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6 text-center text-green-400">Why Choose Us?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="bg-green-600 text-white rounded-full p-2 mr-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Industry Experience</h3>
                <p className="text-gray-400">Over 20 years of experience in the finance industry</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-green-600 text-white rounded-full p-2 mr-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Cutting-edge Technology</h3>
                <p className="text-gray-400">Advanced tools for accurate market predictions</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-green-600 text-white rounded-full p-2 mr-4">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Personalized Service</h3>
                <p className="text-gray-400">Tailored solutions to meet your financial goals</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-green-600 text-white rounded-full p-2 mr-4">
                <PieChart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Secure & Compliant</h3>
                <p className="text-gray-400">Adherence to all financial regulations</p>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-green-400">Ready to Take Control of Your Financial Future?</h2>
          <p className="text-xl mb-8 text-gray-400">
            Contact us now for a free consultation and start your journey to financial success.
          </p>
          <Link
            href="#"
            className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors text-lg"
          >
            Contact Us
          </Link>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; 2025 FinTech Solutions. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <Link href="#" className="hover:text-green-400 mr-4">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-green-400 mr-4">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-green-400">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
