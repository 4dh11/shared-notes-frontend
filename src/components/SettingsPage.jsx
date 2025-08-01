import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronDown, ChevronRight, Eye, EyeOff, Check, Upload } from 'lucide-react'
import api from '../api'
import { useTheme } from '../App'

// Add CSS for custom slider
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

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style")
  styleSheet.innerText = sliderStyles
  document.head.appendChild(styleSheet)
}

// Backend wallpaper presets - these will be loaded from the backend
const BACKEND_WALLPAPER_PRESETS = [
  '/uploads/wallpapers/eat cat.jpg',
  '/uploads/wallpapers/sleep cat.jpg', 
  '/uploads/wallpapers/tuxedo and orange.jpg'
]

const ThemeSection = ({ theme, onThemeChange }) => {
  return (
    <div className={`${theme === 'dark' ? 'bg-neutral-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-lg font-semibold`}>
            Dark Theme
          </h3>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mt-1`}>
            Switch between light and dark mode
          </p>
        </div>
        <button
          onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            theme === 'dark' ? 'bg-yellow-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  )
}

const WallpaperSection = ({ theme, selectedWallpaper, onWallpaperChange, uploadedImage, onImageUpload, wallpaperDimming, onDimmingChange }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [availablePresets, setAvailablePresets] = useState([])

  // Load available presets from backend
  useEffect(() => {
    const loadPresets = async () => {
      try {
        const response = await api.get('/api/settings/wallpapers')
        setAvailablePresets(response.data.presets || BACKEND_WALLPAPER_PRESETS)
      } catch (error) {
        console.error('Error loading wallpaper presets:', error)
        // Fallback to hardcoded paths
        setAvailablePresets(BACKEND_WALLPAPER_PRESETS)
      }
    }
    loadPresets()
  }, [])

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('wallpaper', file)

      const response = await api.post('/api/settings/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.url) {
        onImageUpload(response.data.url, file)
        onWallpaperChange(response.data.url)
      }
    } catch (error) {
      console.error('Error uploading wallpaper:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-neutral-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Wallpaper Presets</h3>
        {isExpanded ? (
          <ChevronDown className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
        ) : (
          <ChevronRight className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Dimming Control */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Wallpaper Dimming
              </label>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {Math.round(wallpaperDimming * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.1"
              value={wallpaperDimming}
              onChange={(e) => onDimmingChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            />
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
              Adjust dimming to improve text visibility over wallpaper
            </p>
          </div>

          {/* Preset thumbnails */}
          <div className="grid grid-cols-3 gap-3 overflow-x-auto">
            {availablePresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => onWallpaperChange(preset)}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                  selectedWallpaper === preset
                    ? 'border-yellow-500 ring-2 ring-yellow-500 ring-opacity-50'
                    : theme === 'dark' ? 'border-neutral-600 hover:border-neutral-500' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <img
                  src={`${process.env.REACT_APP_API_URL || 'https://shared-notes-backend.onrender.com'}${preset}`}
                  alt={`Wallpaper preset ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to a placeholder if image fails to load
                    e.target.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#374151"/><text x="150" y="100" text-anchor="middle" fill="white" font-size="14">Preset ' + (index + 1) + '</text></svg>')}`
                  }}
                />
                {selectedWallpaper === preset && (
                  <div className="absolute inset-0 bg-yellow-500 bg-opacity-20 flex items-center justify-center">
                    <Check className="h-6 w-6 text-yellow-500" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* File upload */}
          <div>
            <label className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              theme === 'dark' 
                ? 'border-neutral-600 bg-neutral-700 hover:bg-neutral-600' 
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className={`w-8 h-8 mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`mb-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="font-semibold">Choose from Gallery</span>
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  PNG, JPG or JPEG
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Image preview */}
          {uploadedImage && (
            <div className="mt-4">
              <h4 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-sm font-medium mb-2`}>
                Preview:
              </h4>
              <div className="relative aspect-video rounded-lg overflow-hidden border border-yellow-500">
                <img
                  src={typeof uploadedImage === 'string' ? uploadedImage : URL.createObjectURL(uploadedImage)}
                  alt="Uploaded wallpaper preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {uploading && (
            <div className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Uploading...
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const PrivacySection = ({ theme, password, passwordError }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={`${theme === 'dark' ? 'bg-neutral-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
      <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-lg font-semibold mb-4`}>
        Privacy
      </h3>
      
      <div>
        <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium mb-2`}>
          App Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password || ''}
            readOnly
            className={`w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
              theme === 'dark'
                ? 'bg-neutral-700 border-neutral-600 text-white'
                : 'bg-gray-50 border-gray-300 text-black'
            }`}
            placeholder={passwordError || (password ? '' : 'Loading...')}
          />
          {password && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'
              }`}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>
        <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
          {passwordError || 'This password is used to access your shared notes'}
        </p>
      </div>
    </div>
  )
}

const SettingsPage = ({ onBack }) => {
  const { theme, updateTheme } = useTheme()
  const [selectedWallpaper, setSelectedWallpaper] = useState('')
  const [wallpaperDimming, setWallpaperDimming] = useState(0.3)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pendingChanges, setPendingChanges] = useState({})
  const [passwordError, setPasswordError] = useState('')

  // Fetch current settings on load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await api.get('/api/settings')
        const settings = response.data
        
        setTheme(settings.theme || 'dark')
        setSelectedWallpaper(settings.wallpaper || '')
        setPassword(settings.password || '')
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleThemeChange = (newTheme) => {
    updateTheme(newTheme)
    setPendingChanges(prev => ({ ...prev, theme: newTheme }))
  }

  const handleWallpaperChange = (wallpaper) => {
    setSelectedWallpaper(wallpaper)
    setPendingChanges(prev => ({ ...prev, wallpaper }))
  }

  const handleDimmingChange = (dimming) => {
    setWallpaperDimming(dimming)
    setPendingChanges(prev => ({ ...prev, wallpaperDimming: dimming }))
  }

  const handleImageUpload = (url, file) => {
    setUploadedImage(file)
    setSelectedWallpaper(url)
    setPendingChanges(prev => ({ ...prev, wallpaper: url }))
  }

  const handleSave = async () => {
    if (Object.keys(pendingChanges).length === 0) return

    try {
      setSaving(true)
      await api.put('/api/settings', pendingChanges)
      setPendingChanges({})
      console.log('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-neutral-900' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className={`${theme === 'dark' ? 'text-white' : 'text-black'}`}>Loading settings...</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-neutral-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-neutral-800' : 'bg-white'} p-4 shadow-sm`}>
        <div className="flex items-center">
          <button
            onClick={onBack}
            className={`mr-4 p-2 rounded-lg ${theme === 'dark' ? 'text-white hover:bg-neutral-700' : 'text-black hover:bg-gray-100'}`}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-xl font-bold`}>
            Settings
          </h1>
        </div>
      </header>

      {/* Content */}
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
        />
        
        <PrivacySection theme={theme} password={password} passwordError={passwordError} />
      </div>

      {/* Floating Save Button */}
      {Object.keys(pendingChanges).length > 0 && (
        <button
          onClick={handleSave}
          disabled={saving}
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