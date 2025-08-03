"use client"

import { useState, useEffect, useCallback, createContext, useContext } from "react"
import api from "../api"

// Create the Theme Context
const ThemeContext = createContext()

// Custom hook to consume the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

// Theme Provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark")
  const [wallpaper, setWallpaper] = useState("")
  const [wallpaperDimming, setWallpaperDimming] = useState(0.3)

  // Function to load all settings from API
  const loadAllSettings = useCallback(async () => {
    try {
      const response = await api.get("/api/settings")
      if (response.data) {
        setTheme(response.data.theme || "dark")
        setWallpaper(response.data.wallpaper || "")
        setWallpaperDimming(response.data.dimLevel || 0.3)
        console.log(
          "ThemeContext: Settings loaded from API. Theme:",
          response.data.theme || "dark",
          "Wallpaper:",
          response.data.wallpaper || "",
          "Dimming:",
          response.data.dimLevel || 0.3,
        )
      }
    } catch (error) {
      console.error("ThemeContext: Could not load settings from API, using defaults", error)
      // Ensure theme defaults to dark for consistency if loading fails
      setTheme("dark")
      setWallpaper("")
      setWallpaperDimming(0.3)
    }
  }, [])

  // Initial load of settings on app start
  useEffect(() => {
    loadAllSettings()
  }, [loadAllSettings])

  // Log theme changes for debugging
  useEffect(() => {
    console.log("ThemeContext: Current theme state is:", theme)
  }, [theme])

  // Function to update theme
  const updateTheme = useCallback((newTheme) => {
    console.log("ThemeContext: updateTheme called with:", newTheme)
    setTheme(newTheme)
  }, [])

  // Function to update all settings from SettingsPage
  const updateAllSettings = useCallback(
    (newSettings) => {
      console.log("ThemeContext: updateAllSettings called. New settings received:", newSettings)
      setTheme(newSettings.theme || theme)
      // Fix: Explicitly check if newSettings.wallpaper is provided, even if it's an empty string
      setWallpaper(newSettings.wallpaper !== undefined ? newSettings.wallpaper : wallpaper)
      setWallpaperDimming(newSettings.dimLevel !== undefined ? newSettings.dimLevel : wallpaperDimming)
      console.log(
        "ThemeContext: Wallpaper state after updateAllSettings:",
        newSettings.wallpaper !== undefined ? newSettings.wallpaper : wallpaper,
      )
    },
    [theme, wallpaper, wallpaperDimming],
  )

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, wallpaper, wallpaperDimming, updateAllSettings }}>
      {children}
    </ThemeContext.Provider>
  )
}
