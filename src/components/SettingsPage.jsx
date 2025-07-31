"use client"

import { useState, useEffect, useRef } from "react"
import { Save, ArrowLeft, Eye, EyeOff, Upload, Sun, Moon } from "lucide-react"
import api from "../api" // Assuming api.js is in the parent directory

// Placeholder wallpaper images
const WALLPAPER_PRESETS = [
  "/placeholder.svg?height=100&width=150",
  "/placeholder.svg?height=100&width=150",
  "/placeholder.svg?height=100&width=150",
  "/placeholder.svg?height=100&width=150",
  "/placeholder.svg?height=100&width=150",
]

export default function SettingsPage({ onBack }) {
  const [theme, setTheme] = useState("light") // 'light' or 'dark'
  const [selectedWallpaper, setSelectedWallpaper] = useState("")
  const [appPassword, setAppPassword] = useState("") // Encrypted password from backend
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false) // To track if save button should be active

  const initialSettings = useRef({}) // To compare for changes

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await api.get("/api/settings")
        const settings = response.data

        setTheme(settings.theme || "light")
        setSelectedWallpaper(settings.wallpaper || "")
        setAppPassword(settings.password || "") // Store encrypted password

        initialSettings.current = {
          theme: settings.theme || "light",
          wallpaper: settings.wallpaper || "",
        }
        setHasChanges(false)
      } catch (err) {
        console.error("Error fetching settings:", err)
        setError("Failed to load settings.")
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  // Effect to track changes for save button
  useEffect(() => {
    const currentSettings = {
      theme,
      wallpaper: selectedWallpaper,
    }
    const changed = JSON.stringify(currentSettings) !== JSON.stringify(initialSettings.current)
    setHasChanges(changed)
  }, [theme, selectedWallpaper])

  const handleThemeToggle = (newTheme) => {
    setTheme(newTheme)
  }

  const handleWallpaperSelect = (presetUrl) => {
    setSelectedWallpaper(presetUrl)
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsSaving(true)
    setError("")
    try {
      const formData = new FormData()
      formData.append("wallpaper", file)

      // Upload the file
      const uploadResponse = await api.post("/api/settings/upload-wallpaper", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const newWallpaperUrl = uploadResponse.data.url // Assuming backend returns { url: '...' }
      setSelectedWallpaper(newWallpaperUrl)
      // The save button will now be active, and the actual PUT will happen on save click
    } catch (err) {
      console.error("Error uploading wallpaper:", err)
      setError("Failed to upload wallpaper.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setError("")
    try {
      const updatedSettings = {
        theme,
        wallpaper: selectedWallpaper,
      }
      await api.put("/api/settings", updatedSettings)
      initialSettings.current = updatedSettings // Update initial settings after successful save
      setHasChanges(false)
      // Optionally, show a success message
    } catch (err) {
      console.error("Error saving settings:", err)
      setError("Failed to save settings.")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">Loading settings...</div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-4 sm:p-6 lg:p-8 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors" aria-label="Go back">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-3xl font-bold text-white flex-grow text-center -ml-6">Settings</h1>
        <div className="w-6" /> {/* Spacer for alignment */}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">{error}</div>
      )}

      <div className="max-w-3xl mx-auto space-y-8 pb-20">
        {/* Theme Section */}
        <div className="bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-700">
          <h2 className="text-yellow-500 text-xl font-semibold mb-4">Theme</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Dark Theme</span>
            <button
              onClick={() => handleThemeToggle(theme === "dark" ? "light" : "dark")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-neutral-800 ${
                theme === "dark" ? "bg-yellow-500" : "bg-neutral-600"
              }`}
              aria-checked={theme === "dark"}
              role="switch"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === "dark" ? "translate-x-6" : "translate-x-1"
                }`}
              />
              <span
                className={`absolute left-1 top-1/2 -translate-y-1/2 ${theme === "dark" ? "opacity-0" : "opacity-100"}`}
              >
                <Sun className="h-4 w-4 text-yellow-500" />
              </span>
              <span
                className={`absolute right-1 top-1/2 -translate-y-1/2 ${
                  theme === "dark" ? "opacity-100" : "opacity-0"
                }`}
              >
                <Moon className="h-4 w-4 text-neutral-800" />
              </span>
            </button>
          </div>
        </div>

        {/* Wallpaper Section */}
        <div className="bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-700">
          <h2 className="text-yellow-500 text-xl font-semibold mb-4">Wallpaper</h2>
          <div className="mb-4">
            <h3 className="text-gray-300 text-lg mb-2">Presets</h3>
            <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
              {WALLPAPER_PRESETS.map((preset, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                    selectedWallpaper === preset
                      ? "border-yellow-500 ring-2 ring-yellow-500"
                      : "border-neutral-700 hover:border-neutral-600"
                  }`}
                  onClick={() => handleWallpaperSelect(preset)}
                >
                  <img
                    src={preset || "/placeholder.svg"}
                    alt={`Wallpaper preset ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-gray-300 text-lg mb-2">Custom</h3>
            <label
              htmlFor="wallpaper-upload"
              className="flex items-center justify-center px-4 py-3 bg-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-600 transition-colors text-white"
            >
              <Upload className="h-5 w-5 mr-2" />
              Choose from Gallery
              <input
                id="wallpaper-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isSaving}
              />
            </label>
            {selectedWallpaper && !WALLPAPER_PRESETS.includes(selectedWallpaper) && (
              <div className="mt-2 text-sm text-gray-400">
                Current custom wallpaper: <span className="truncate">{selectedWallpaper.split("/").pop()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-700">
          <h2 className="text-yellow-500 text-xl font-semibold mb-4">Privacy</h2>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">App Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={appPassword ? "********" : ""} // Always display masked if present
                readOnly // Not editable as per requirements
                className="w-full bg-neutral-700 text-white px-4 py-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 border border-neutral-700 cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {appPassword && <p className="text-xs text-gray-500 mt-1">Password is set. Contact support to change.</p>}
            {!appPassword && <p className="text-xs text-gray-500 mt-1">No password set. Access is open.</p>}
          </div>
        </div>
      </div>

      {/* Floating Save Button */}
      <button
        onClick={handleSaveSettings}
        disabled={isSaving || !hasChanges}
        className={`fixed bottom-4 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300
          ${
            hasChanges && !isSaving
              ? "bg-yellow-500 hover:bg-yellow-600 text-neutral-900"
              : "bg-neutral-700 text-gray-400 cursor-not-allowed"
          }`}
        aria-label="Save settings"
      >
        {isSaving ? (
          <span className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <Save className="h-7 w-7" />
        )}
      </button>
    </div>
  )
}
