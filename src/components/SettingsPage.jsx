"use client"

import { useEffect } from "react"
import { useState } from "react"
import { ChevronLeft, ChevronDown, ChevronRight, Eye, EyeOff, Check, Upload } from "lucide-react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import { useTheme } from "../contexts/ThemeContext.jsx"

const sliderStyles = `
  .slider {
    -webkit-appearance: none;
    appearance: none;
    background: #d1d5db;
    outline: none;
  }
  
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #eab308;
    cursor: pointer;
  }
  
  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #eab308;
    cursor: pointer;
    border: none;
  }
`

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style")
  styleSheet.innerText = sliderStyles
  document.head.appendChild(styleSheet)
}

const BACKEND_WALLPAPER_PRESETS = [
  { name: "Eat Cat", path: "/uploads/wallpapers/eat%20cat.jpg" },
  { name: "Sleep Cat", path: "/uploads/wallpapers/sleep%20cat.jpg" },
  { name: "Tuxedo and Orange", path: "/uploads/wallpapers/tuxedo%20and%20orange.jpg" },
]

const ThemeSection = ({ theme, onThemeChange }) => {
  return (
    <div className={`${theme === "dark" ? "bg-neutral-800" : "bg-white"} rounded-xl p-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`${theme === "dark" ? "text-white" : "text-black"} text-lg font-semibold`}>Dark Theme</h3>
        </div>
        {/* Improved Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={() => onThemeChange(theme === "dark" ? "light" : "dark")}
            className="sr-only"
          />
          <div className={`relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out ${
            theme === "dark" ? "bg-yellow-500" : "bg-gray-300"
          }`}>
            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
              theme === "dark" ? "translate-x-6" : "translate-x-0"
            }`} />
          </div>
        </label>
      </div>
    </div>
  )
}

const WallpaperSection = ({
  theme,
  selectedWallpaper,
  onWallpaperChange,
  uploadedImage,
  onImageUpload,
  wallpaperDimming,
  onDimmingChange,
  loadingSettings,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [availablePresets, setAvailablePresets] = useState(BACKEND_WALLPAPER_PRESETS)
  const [imageLoadErrors, setImageLoadErrors] = useState({})

  useEffect(() => {
    const loadPresets = async () => {
      try {
        const response = await api.get("/api/settings/wallpapers")
        if (response.data?.presets) {
          setAvailablePresets(response.data.presets)
        }
      } catch (error) {
        console.log("Using default wallpaper presets")
      }
    }
    loadPresets()
  }, [])

  const handleImageError = (presetPath) => {
    setImageLoadErrors((prev) => ({ ...prev, [presetPath]: true }))
  }

  return (
    <div className={`${theme === "dark" ? "bg-neutral-800" : "bg-white"} rounded-xl p-6 shadow-lg`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
        disabled={loadingSettings}
      >
        <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>Wallpaper Presets</h3>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-yellow-500" />
        ) : (
          <ChevronRight className="h-5 w-5 text-yellow-500" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <button
              onClick={() => onWallpaperChange("")}
              className={`w-full p-3 rounded-lg border-2 transition-all text-center ${
                !selectedWallpaper
                  ? "border-yellow-500 ring-2 ring-yellow-500 ring-opacity-50"
                  : theme === "dark"
                    ? "border-neutral-600 hover:border-neutral-500"
                    : "border-gray-300 hover:border-gray-400"
              } ${theme === "dark" ? "bg-neutral-700" : "bg-gray-100"}`}
              disabled={loadingSettings}
            >
              <div className="flex items-center justify-center gap-2">
                {!selectedWallpaper && <Check className="h-5 w-5 text-yellow-500" />}
                <span className={`font-medium ${theme === "dark" ? "text-white" : "text-black"}`}>No Wallpaper</span>
              </div>
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-black"}`}>
                Wallpaper Dimming
              </label>
              <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {Math.round(wallpaperDimming * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.1"
              value={wallpaperDimming}
              onChange={(e) => onDimmingChange(Number.parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
              disabled={loadingSettings}
            />
            <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
              Adjust dimming to improve text visibility over wallpaper
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {availablePresets.map((preset, index) => {
              const presetPath = typeof preset === "string" ? preset : preset.path
              const presetName = typeof preset === "string" ? `Preset ${index + 1}` : preset.name
              const fullUrl = `${import.meta.env.VITE_API_URL || "https://shared-notes-backend.onrender.com"}${presetPath}`

              return (
                <button
                  key={index}
                  onClick={() => onWallpaperChange(presetPath)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    selectedWallpaper === presetPath
                      ? "border-yellow-500 ring-2 ring-yellow-500 ring-opacity-50"
                      : theme === "dark"
                        ? "border-neutral-600 hover:border-neutral-500"
                        : "border-gray-300 hover:border-gray-400"
                  }`}
                  disabled={loadingSettings}
                >
                  {!imageLoadErrors[presetPath] ? (
                    <img
                      src={fullUrl || "/placeholder.svg"}
                      alt={presetName}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(presetPath)}
                      onLoad={() => console.log(`Loaded: ${presetName}`)}
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center ${
                        theme === "dark" ? "bg-neutral-700 text-gray-400" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-xs font-medium">{presetName}</div>
                        <div className="text-xs opacity-75">Failed to load</div>
                      </div>
                    </div>
                  )}
                  {selectedWallpaper === presetPath && (
                    <div className="absolute inset-0 bg-yellow-500 bg-opacity-20 flex items-center justify-center">
                      <Check className="h-6 w-6 text-yellow-500" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const PrivacySection = ({
  theme,
  loadingSettings,
  currentPasswordInput,
  newPasswordInput,
  confirmNewPasswordInput,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmNewPasswordChange,
  onChangePasswordSubmit,
  changePasswordLoading,
  changePasswordError,
  changePasswordSuccess,
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`${theme === "dark" ? "bg-neutral-800" : "bg-white"} rounded-xl p-6 shadow-lg`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
        disabled={loadingSettings}
      >
        <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>Privacy</h3>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-yellow-500" />
        ) : (
          <ChevronRight className="h-5 w-5 text-yellow-500" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4 mt-4">
          <h4 className={`text-base font-medium ${theme === "dark" ? "text-white" : "text-black"}`}>
            Change App Password
          </h4>

          {changePasswordError && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
              {changePasswordError}
            </div>
          )}
          {changePasswordSuccess && (
            <div className="p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-300 text-sm">
              {changePasswordSuccess}
            </div>
          )}

          <div>
            <label className={`block ${theme === "dark" ? "text-gray-300" : "text-gray-700"} text-sm font-medium mb-2`}>
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPasswordInput}
                onChange={(e) => onCurrentPasswordChange(e.target.value)}
                className={`w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                  theme === "dark"
                    ? "bg-neutral-700 border-neutral-600 text-white"
                    : "bg-gray-50 border-gray-300 text-black"
                }`}
                placeholder="Enter current password"
                disabled={loadingSettings || changePasswordLoading}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"
                }`}
                disabled={loadingSettings || changePasswordLoading}
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className={`block ${theme === "dark" ? "text-gray-300" : "text-gray-700"} text-sm font-medium mb-2`}>
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPasswordInput}
                onChange={(e) => onNewPasswordChange(e.target.value)}
                className={`w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                  theme === "dark"
                    ? "bg-neutral-700 border-neutral-600 text-white"
                    : "bg-gray-50 border-gray-300 text-black"
                }`}
                placeholder="Enter new password"
                disabled={loadingSettings || changePasswordLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"
                }`}
                disabled={loadingSettings || changePasswordLoading}
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className={`block ${theme === "dark" ? "text-gray-300" : "text-gray-700"} text-sm font-medium mb-2`}>
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmNewPassword ? "text" : "password"}
                value={confirmNewPasswordInput}
                onChange={(e) => onConfirmNewPasswordChange(e.target.value)}
                className={`w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                  theme === "dark"
                    ? "bg-neutral-700 border-neutral-600 text-white"
                    : "bg-gray-50 border-gray-300 text-black"
                }`}
                placeholder="Confirm new password"
                disabled={loadingSettings || changePasswordLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"
                }`}
                disabled={loadingSettings || changePasswordLoading}
              >
                {showConfirmNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            onClick={onChangePasswordSubmit}
            disabled={
              loadingSettings ||
              changePasswordLoading ||
              !currentPasswordInput ||
              !newPasswordInput ||
              !confirmNewPasswordInput
            }
            className={`w-full font-medium py-3 rounded-lg transition-colors ${
              theme === "dark"
                ? "bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 text-black"
                : "bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 text-black"
            } disabled:cursor-not-allowed`}
          >
            {changePasswordLoading ? "Changing Password..." : "Change Password"}
          </button>
        </div>
      )}
    </div>
  )
}

const SettingsPage = ({ onLogout, onSettingsUpdated }) => {
  const { theme, updateTheme } = useTheme()
  const navigate = useNavigate()
  const [selectedWallpaper, setSelectedWallpaper] = useState("")
  const [wallpaperDimming, setWallpaperDimming] = useState(0.3)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pendingChanges, setPendingChanges] = useState({})
  const [passwordError, setPasswordError] = useState("")

  const [currentPasswordInput, setCurrentPasswordInput] = useState("")
  const [newPasswordInput, setNewPasswordInput] = useState("")
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState("")
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [changePasswordError, setChangePasswordError] = useState("")
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("")

  // Log theme in SettingsPage
  useEffect(() => {
    console.log("SettingsPage: Current theme from context is:", theme)
  }, [theme])

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await api.get("/api/settings")
        const settings = response.data

        // Removed updateTheme(settings.theme || "dark") from here.
        // The ThemeProvider already loads initial settings.
        // SettingsPage should read from context, not force update it on every fetch.
        setSelectedWallpaper(settings.wallpaper || "")
        setWallpaperDimming(settings.dimLevel || 0.3)
        console.log(
          "SettingsPage: Fetched settings. Wallpaper:",
          settings.wallpaper || "",
          "Dimming:",
          settings.dimLevel || 0.3,
        )
      } catch (error) {
        console.error("SettingsPage: Error fetching settings:", error)
        setPasswordError("Failed to load settings.")
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, []) // Empty dependency array to run only once on mount

  const handleThemeChange = (newTheme) => {
    console.log("SettingsPage: handleThemeChange called with:", newTheme)
    updateTheme(newTheme) // This updates the theme in the context
    setPendingChanges((prev) => ({ ...prev, theme: newTheme }))
  }

  const handleWallpaperChange = (wallpaper) => {
    console.log("SettingsPage: handleWallpaperChange called with:", wallpaper)
    setSelectedWallpaper(wallpaper)
    setPendingChanges((prev) => ({ ...prev, wallpaper }))
  }

  const handleDimmingChange = (dimming) => {
    console.log("SettingsPage: handleDimmingChange called with:", dimming)
    setWallpaperDimming(dimming)
    setPendingChanges((prev) => ({ ...prev, dimLevel: dimming }))
  }

  const handleImageUpload = (url, file) => {
    setUploadedImage(file)
    setSelectedWallpaper(url)
    setPendingChanges((prev) => ({ ...prev, wallpaper: url }))
  }

  const handleSave = async () => {
    if (Object.keys(pendingChanges).length === 0) return

    console.log("SettingsPage: handleSave called. Pending changes:", pendingChanges)
    try {
      setSaving(true)
      const payload = { ...pendingChanges }
      delete payload.appPassword

      console.log("SettingsPage: Sending payload to API:", payload)
      await api.put("/api/settings", payload)
      setPendingChanges({})
      console.log("SettingsPage: Settings saved successfully.")

      if (onSettingsUpdated) {
        const updatedSettingsForContext = {
          theme: pendingChanges.theme || theme,
          wallpaper: pendingChanges.wallpaper || selectedWallpaper,
          dimLevel: pendingChanges.dimLevel !== undefined ? pendingChanges.dimLevel : wallpaperDimming,
        }
        console.log("SettingsPage: Calling onSettingsUpdated with:", updatedSettingsForContext)
        onSettingsUpdated(updatedSettingsForContext)
      }
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePasswordSubmit = async () => {
    setChangePasswordLoading(true)
    setChangePasswordError("")
    setChangePasswordSuccess("")

    if (!currentPasswordInput || !newPasswordInput || !confirmNewPasswordInput) {
      setChangePasswordError("All password fields are required.")
      setChangePasswordLoading(false)
      return
    }

    if (newPasswordInput !== confirmNewPasswordInput) {
      setChangePasswordError("New password and confirmation do not match.")
      setChangePasswordLoading(false)
      return
    }

    if (newPasswordInput.length < 6) {
      setChangePasswordError("New password must be at least 6 characters long.")
      setChangePasswordLoading(false)
      return
    }

    try {
      const response = await api.put("/api/settings/change-password", {
        currentPassword: currentPasswordInput,
        newPassword: newPasswordInput,
      })
      setChangePasswordSuccess(response.data.message || "Password changed successfully!")
      setCurrentPasswordInput("")
      setNewPasswordInput("")
      setConfirmNewPasswordInput("")

      setTimeout(() => {
        onLogout()
      }, 1500)
    } catch (error) {
      console.error("Error changing password:", error)
      setChangePasswordError(error.response?.data?.message || "Failed to change password.")
    } finally {
      setChangePasswordLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-neutral-900" : "bg-gray-100"}`}>
      <header 
        className={`${theme === "dark" ? "bg-neutral-800" : "bg-white"} p-4 shadow-sm`}
        style={{ paddingTop: '2rem' }} // Add extra padding for status bar
      >
        <div className="flex items-center">
          <button
            onClick={() => navigate("/")}
            className={`mr-4 p-2 rounded-lg ${theme === "dark" ? "text-white hover:bg-neutral-700" : "text-black hover:bg-gray-100"}`}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className={`${theme === "dark" ? "text-white" : "text-black"} text-xl font-bold`}>Settings</h1>
        </div>
      </header>

      <div className="p-4 space-y-6 pb-20">
        <ThemeSection theme={theme} onThemeChange={handleThemeChange} />

        <WallpaperSection
          theme={theme}
          selectedWallpaper={selectedWallpaper}
          onWallpaperChange={handleWallpaperChange}
          uploadedImage={uploadedImage}
          onImageUpload={handleImageUpload}
          wallpaperDimming={wallpaperDimming}
          onDimmingChange={handleDimmingChange}
          loadingSettings={loading}
        />

        <PrivacySection
          theme={theme}
          loadingSettings={loading}
          currentPasswordInput={currentPasswordInput}
          newPasswordInput={newPasswordInput}
          confirmNewPasswordInput={confirmNewPasswordInput}
          onCurrentPasswordChange={setCurrentPasswordInput}
          onNewPasswordChange={setNewPasswordInput}
          onConfirmNewPasswordChange={setConfirmNewPasswordInput}
          onChangePasswordSubmit={handleChangePasswordSubmit}
          changePasswordLoading={changePasswordLoading}
          changePasswordError={changePasswordError}
          changePasswordSuccess={changePasswordSuccess}
        />
      </div>

      {Object.keys(pendingChanges).length > 0 && (
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="fixed bottom-6 right-6 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors"
        >
          {saving ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check className="h-6 w-6 text-white" />
          )}
        </button>
      )}
    </div>
  )
}

export default SettingsPage