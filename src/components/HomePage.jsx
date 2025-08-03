"use client"
import { useTheme } from "../App" // Assuming useTheme is still in App.jsx

function HomePage() {
  const { theme } = useTheme() // Access theme from context

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 ${theme === "dark" ? "text-white" : "text-black"}`}
    >
      <h1 className="text-4xl font-bold mb-4">Welcome to Shared Notes!</h1>
      <p className="text-lg text-center max-w-prose">
        Your personal space to create, organize, and share notes securely. Use the navigation above or the '+' button to
        get started.
      </p>
      {/* You can add more content here, like a list of recent notes or quick links */}
    </div>
  )
}

export default HomePage
