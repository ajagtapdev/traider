import { User } from "lucide-react"

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between bg-[#F8F4E3]/50 backdrop-blur-sm px-6 border-b border-[#E8D8B2]">
      <h1 className="text-2xl font-bold text-gray-800">Trading Dashboard</h1>
      <div className="flex items-center space-x-4">
        <button className="rounded-full bg-white/50 p-2 text-gray-600 transition-colors hover:bg-white/70">
          <User size={20} />
        </button>
      </div>
    </header>
  )
}

