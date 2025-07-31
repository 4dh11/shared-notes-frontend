"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, ChevronDown, ChevronRight, Settings, Plus, Eye, EyeOff } from "lucide-react"
import api from "./api"
import NotePage from "./components/NotePage"
import SettingsPage from "./components/SettingsPage"
import "./App.css"

const LoginModal = ({ onLogin }) => {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!password.trim()) {
      setError("Please enter the password")
      return
    }

    try {
      setLoading(true)
      setError("")

      console.log("Attempting login with password:", password)

      const response = await api.post("/api/auth/login", {
        password: password.trim(),
      })

      console.log("Login response:", response.data)

      if (response.data && response.data.token) {
        const { token } = response.data
        localStorage.setItem("token", token)
        onLogin(token)
      } else {
        setError("Invalid response from server")
      }
    } catch (err) {
      console.error("Login error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
      })

      if (err.response?.status === 401) {
        setError("Invalid password")
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again.")
      } else if (err.code === "NETWORK_ERROR" || err.message.includes("Network Error")) {
        setError("Connection failed. Please check your internet and try again.")
      } else if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        setError("Request timeout. The server might be starting up, please wait and try again.")
      } else {
        setError(`Login failed: ${err.response?.data?.message || err.message || "Unknown error"}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-xl p-6 w-full max-w-md mx-4 border border-neutral-700">
        <h2 className="text-white text-2xl font-bold mb-6 text-center">Access Shared Notes</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">{error}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-700 text-white px-4 py-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 border border-yellow-500"
                placeholder="Enter password"
                disabled={loading}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? "Accessing..." : "Access Notes"}
          </button>
        </form>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-2 bg-gray-800 rounded text-xs text-gray-400">
            <div>Backend URL: https://shared-notes-backend.onrender.com</div>
            <div>Login endpoint: /api/auth/login</div>
          </div>
        )}
      </div>
    </div>
  )
}

const Header = ({ onSettingsClick }) => {
  return (
    <header className="bg-neutral-800 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">Shared Notes</h1>
        <div className="flex items-center gap-2">
          <button onClick={onSettingsClick} className="text-white hover:text-gray-300 p-2">
            <Settings className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  )
}

const ContextMenu = ({ x, y, onDelete, onClose }) => {
  useEffect(() => {
    const handleClickOutside = () => onClose()
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [onClose])

  return (
    <div
      className="fixed bg-neutral-700 border border-neutral-600 rounded-lg shadow-lg z-50 py-1"
      style={{ left: x, top: y }}
    >
      <button onClick={onDelete} className="w-full px-4 py-2 text-left text-red-400 hover:bg-neutral-600 text-sm">
        Delete
      </button>
    </div>
  )
}

const NoteCard = ({ note, onContextMenu, onLongPress, handleNoteClick }) => {
  let longPressTimer = null

  const handleMouseDown = () => {
    longPressTimer = setTimeout(() => onLongPress(note._id), 500)
  }

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  const handleClick = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
    handleNoteClick(note._id)
  }

  return (
    <div
      key={note._id}
      className="bg-neutral-800 rounded-xl p-3 mb-4 w-[calc(50%-6px)] cursor-pointer hover:bg-neutral-700 transition-colors"
      onClick={handleClick}
      onContextMenu={(e) => onContextMenu(e, note._id)}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      <h3 className="text-white font-medium mb-2 text-sm">{note.title}</h3>
      <p className="text-gray-400 text-xs leading-relaxed">
        {note.content.length > 100 ? `${note.content.substring(0, 100)}...` : note.content}
      </p>
    </div>
  )
}

const App = () => {
  const [isPinnedExpanded, setIsPinnedExpanded] = useState(true)
  const [isAllNotesExpanded, setIsAllNotesExpanded] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pinnedNotes, setPinnedNotes] = useState([])
  const [allNotes, setAllNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [contextMenu, setContextMenu] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [currentView, setCurrentView] = useState("home")
  const [currentNoteId, setCurrentNoteId] = useState(null)

  const handleLogout = useCallback(() => {
    console.log("Logging out...")
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    setShowLoginModal(true)
    setPinnedNotes([])
    setAllNotes([])
    setError("")
    setCurrentView("home")
    setCurrentNoteId(null)
  }, [])

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true)
      console.log("Fetching notes...")

      const [pinnedRes, allRes] = await Promise.all([api.get("/api/notes/pinned"), api.get("/api/notes")])

      console.log("Notes fetched successfully")
      setPinnedNotes(pinnedRes.data)
      setAllNotes(allRes.data.filter((note) => !note.pinned))
      setError("")
    } catch (err) {
      console.error("Error fetching notes:", err)
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.")
        handleLogout()
      } else {
        setError("Failed to fetch notes. Please check your connection.")
      }
      setPinnedNotes([])
      setAllNotes([])
    } finally {
      setLoading(false)
    }
  }, [handleLogout])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      console.log("Found existing token, attempting to verify...")
      verifyTokenAndFetchNotes(token)
    } else {
      console.log("No existing token found, showing login modal")
      setShowLoginModal(true)
      setLoading(false)
    }
  }, [fetchNotes])

  const verifyTokenAndFetchNotes = useCallback(async (token) => {
    try {
      setLoading(true)
      console.log("Verifying token and fetching notes...")

      const [pinnedRes, allRes] = await Promise.all([api.get("/api/notes/pinned"), api.get("/api/notes")])

      console.log("Token verification successful, notes fetched")
      setPinnedNotes(pinnedRes.data)
      setAllNotes(allRes.data.filter((note) => !note.pinned))
      setIsLoggedIn(true)
      setShowLoginModal(false)
      setError("")
    } catch (err) {
      console.error("Token verification failed:", err)
      localStorage.removeItem("token")
      setIsLoggedIn(false)
      setShowLoginModal(true)
      setPinnedNotes([])
      setAllNotes([])
      setError("")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogin = useCallback(
    (token) => {
      console.log("Login successful, token received")
      setIsLoggedIn(true)
      setShowLoginModal(false)
      fetchNotes()
    },
    [fetchNotes],
  )

  const deleteNote = async (noteId) => {
    try {
      console.log("Deleting note:", noteId)
      await api.delete(`/api/notes/${noteId}`)

      setPinnedNotes((prev) => prev.filter((note) => note._id !== noteId))
      setAllNotes((prev) => prev.filter((note) => note._id !== noteId))
      setContextMenu(null)
      console.log("Note deleted successfully")
    } catch (err) {
      console.error("Error deleting note:", err)
      setError("Failed to delete note")
    }
  }

  const handleNoteClick = useCallback((noteId) => {
    setCurrentNoteId(noteId)
    setCurrentView("note")
  }, [])

  const handleCreateNote = useCallback(() => {
    setCurrentNoteId(null)
    setCurrentView("note")
  }, [])

  const handleBackToHome = useCallback(() => {
    setCurrentView("home")
    setCurrentNoteId(null)
    fetchNotes()
  }, [fetchNotes])

  const handleContextMenu = useCallback((e, noteId) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      noteId,
    })
  }, [])

  const handleLongPress = useCallback((noteId) => {
    setContextMenu({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      noteId,
    })
  }, [])

  const handleSettingsClick = useCallback(() => {
    console.log("Settings clicked, showing settings page")
    setCurrentView("settings")
  }, [])

  const handleBackFromSettings = useCallback(() => {
    setCurrentView("home")
    fetchNotes()
  }, [fetchNotes])

  const filterNotes = (notes) => {
    if (!searchQuery.trim()) return notes
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  const filteredPinnedNotes = filterNotes(pinnedNotes)
  const filteredAllNotes = filterNotes(allNotes)

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white">Loading notes...</div>
      </div>
    )
  }

  if (currentView === "note") {
    return <NotePage noteId={currentNoteId} onBack={handleBackToHome} />
  }

  if (currentView === "settings") {
    return <SettingsPage onBack={handleBackFromSettings} />
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      {showLoginModal && <LoginModal onLogin={handleLogin} />}

      {isLoggedIn && (
        <>
          <Header onSettingsClick={handleSettingsClick} />

          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="px-4 py-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-800 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="px-4 py-2">
            <button
              onClick={() => setIsPinnedExpanded(!isPinnedExpanded)}
              className="flex items-center justify-between w-full text-white text-lg font-medium mb-3"
            >
              <span>Pinned</span>
              {isPinnedExpanded ? (
                <ChevronDown className="h-5 w-5 text-yellow-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-yellow-500" />
              )}
            </button>

            {isPinnedExpanded && (
              <div className="flex flex-wrap gap-3 justify-between">
                {filteredPinnedNotes.length > 0 ? (
                  filteredPinnedNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onContextMenu={handleContextMenu}
                      onLongPress={handleLongPress}
                      handleNoteClick={handleNoteClick}
                    />
                  ))
                ) : searchQuery ? (
                  <div className="text-gray-400 text-sm w-full">No pinned notes found</div>
                ) : (
                  <div className="text-gray-400 text-sm w-full">No pinned notes</div>
                )}
              </div>
            )}
          </div>

          <div className="mx-4 py-1">
            <hr className="border-gray-600" />
          </div>

          <div className="px-4 py-4">
            <button
              onClick={() => setIsAllNotesExpanded(!isAllNotesExpanded)}
              className="flex items-center justify-between w-full text-white text-lg font-medium mb-3"
            >
              <span>Notes</span>
              {isAllNotesExpanded ? (
                <ChevronDown className="h-5 w-5 text-yellow-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-yellow-500" />
              )}
            </button>

            {isAllNotesExpanded && (
              <div className="flex flex-wrap gap-3 justify-between pb-6">
                {filteredAllNotes.length > 0 ? (
                  filteredAllNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onContextMenu={handleContextMenu}
                      onLongPress={handleLongPress}
                      handleNoteClick={handleNoteClick}
                    />
                  ))
                ) : searchQuery ? (
                  <div className="text-gray-400 text-sm w-full">No notes found</div>
                ) : (
                  <div className="text-gray-400 text-sm w-full">No notes yet</div>
                )}
              </div>
            )}
          </div>

          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              onDelete={() => deleteNote(contextMenu.noteId)}
              onClose={() => setContextMenu(null)}
            />
          )}

          <button
            onClick={handleCreateNote}
            className="fixed bottom-4 right-4 bg-neutral-700 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-neutral-600 transition-colors"
          >
            <Plus className="h-6 w-6 text-white" />
          </button>
        </>
      )}
    </div>
  )
}

export default App
