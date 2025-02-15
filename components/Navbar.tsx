import Link from "next/link"

export default function Navbar() {
  return (
    <header className="bg-green-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">FinTech Solutions</h1>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="#" className="hover:text-green-200">
                Home
              </Link>
            </li>
            <li>
              <Link href="/simulator" className="hover:text-green-200">
                Simulator
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-green-200">
                About
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-green-200">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
