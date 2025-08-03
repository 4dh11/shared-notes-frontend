"use client"

import { Settings } from "lucide-react"
import { Link } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext.jsx" // Import useTheme from its new location

const Header = () => {
  const { theme } = useTheme()

  return (
    <header 
      className={`${theme === "dark" ? "bg-neutral-800" : "bg-white"} app-header shadow-sm`}
    >
      <div className="flex justify-between items-center px-4 pb-4">
        <Link to="/" className={`${theme === "dark" ? "text-white" : "text-black"} text-xl font-bold`}>
          Shared Notes
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/settings"
            className={`p-2 rounded-lg ${
              theme === "dark" ? "text-white hover:bg-neutral-700" : "text-black hover:bg-gray-100"
            }`}
            aria-label="Settings"
          >
            <Settings className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header