"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Pin, PinOff, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Undo, Redo } from "lucide-react"
import api from "../api"
import { useTheme } from "../App"

function NotePage({ noteId, onBack }) {
  const { theme, wallpaper, wallpaperDimming } = useTheme()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isPinned, setIsPinned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const contentRef = useRef(null)
  const titleRef = useRef(null)

  // Generate background style based on wallpaper (same as main app)
  const getBackgroundStyle = () => {
    if (!wallpaper) {
      return { backgroundColor: theme === "dark" ? "#171717" : "#f5f5f5" }
    }

    // IMPORTANT: Ensure process.env.REACT_APP_API_URL is correctly configured for Next.js
    // For Next.js, client-side environment variables must be prefixed with NEXT_PUBLIC_
    // e.g., process.env.NEXT_PUBLIC_API_URL
    const wallpaperUrl = wallpaper.startsWith("http")
      ? wallpaper
      : `${process.env.NEXT_PUBLIC_API_URL || "https://shared-notes-backend.onrender.com"}${wallpaper}`

    return {
      backgroundImage: `linear-gradient(rgba(0,0,0,${wallpaperDimming}), rgba(0,0,0,${wallpaperDimming})), url(${wallpaperUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
    }
  }

  // Load existing note if editing
  useEffect(() => {
    if (noteId) {
      loadNote()
    } else {
      // For new notes, clear the content editor
      if (contentRef.current) {
        contentRef.current.innerHTML = ""
      }
      setTitle("") // Clear title for new notes
      setContent("") // Clear content state for new notes
      setIsPinned(false) // Reset pinned state for new notes
    }
  }, [noteId])

  const loadNote = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/notes/${noteId}`)

      const note = response.data
      setTitle(note.title)
      setContent(note.content)
      setIsPinned(note.pinned)

      // Set content in contentEditable div with proper HTML formatting
      if (contentRef.current) {
        // Create a temporary div to safely HTML-escape the content
        const tempDiv = document.createElement("div")
        tempDiv.textContent = note.content // Safely escapes HTML characters

        let htmlContent = tempDiv.innerHTML // Get the HTML-escaped content

        // Now apply markdown-like formatting on the HTML-escaped content
        htmlContent = htmlContent
          .replace(/\n/g, "<br>")
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")

        contentRef.current.innerHTML = htmlContent
      }
    } catch (err) {
      setError("Failed to load note")
      console.error("Error loading note:", err)
    } finally {
      setLoading(false)
    }
  }

  // Handle content changes in contentEditable div
  const handleContentChange = () => {
    if (contentRef.current) {
      // Convert HTML back to plain text while preserving some formatting
      const textContent = contentRef.current.innerHTML
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<p>/gi, "")
        .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
        .replace(/<b>(.*?)<\/b>/gi, "**$1**")
        .replace(/<em>(.*?)<\/em>/gi, "*$1*")
        .replace(/<i>(.*?)<\/i>/gi, "*$1*")
        .replace(/<[^>]*>/g, "") // Remove any other HTML tags
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")

      setContent(textContent)
    }
  }

  // Formatting functions
  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value)
    contentRef.current?.focus()
    // Update content state after formatting
    setTimeout(() => handleContentChange(), 10)
  }

  // Undo/Redo functions
  const handleUndo = () => {
    document.execCommand("undo")
    setTimeout(() => handleContentChange(), 10)
  }

  const handleRedo = () => {
    document.execCommand("redo")
    setTimeout(() => handleContentChange(), 10)
  }

  // Save note
  const handleSave = async () => {
    if (!title.trim()) {
      setError("Please enter a title")
      titleRef.current?.focus()
      return
    }

    try {
      setSaving(true)
      setError("")

      const noteData = {
        title: title.trim(),
        content: content.trim(),
        pinned: isPinned,
      }

      if (noteId) {
        // Update existing note
        await api.put(`/api/notes/${noteId}`, noteData)
      } else {
        // Create new note
        await api.post("/api/notes", noteData)
      }

      // Success feedback
      setError("")
      setTimeout(() => onBack(), 500) // Brief delay to show success
    } catch (err) {
      setError("Failed to save note")
      console.error("Error saving note:", err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={getBackgroundStyle()}>
        <div
          className={`${theme === "dark" ? "text-white" : "text-black"} bg-black bg-opacity-50 px-4 py-2 rounded-lg`}
        >
          Loading note...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={getBackgroundStyle()}>
      {/* Top Bar */}
      <header
        className={`p-4 flex items-center justify-between border-b ${
          theme === "dark"
            ? "bg-neutral-800 bg-opacity-90 border-neutral-700"
            : "bg-white bg-opacity-90 border-gray-300"
        }`}
      >
        <button
          onClick={onBack}
          className={`p-2 rounded-lg ${
            theme === "dark"
              ? "text-white hover:text-gray-300 hover:bg-neutral-700"
              : "text-black hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`p-2 rounded ${
              isPinned
                ? "text-yellow-500"
                : theme === "dark"
                  ? "text-gray-400 hover:text-white hover:bg-neutral-700"
                  : "text-gray-500 hover:text-black hover:bg-gray-100"
            }`}
          >
            {isPinned ? <Pin className="h-6 w-6" /> : <PinOff className="h-6 w-6" />}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              theme === "dark"
                ? "bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 text-white"
                : "bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-black"
            } disabled:cursor-not-allowed`}
          >
            {saving ? "Saving..." : "Done"}
          </button>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">{error}</div>
      )}

      {/* Title Input */}
      <div className="px-4 pt-6 pb-4">
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title..."
          className={`w-full bg-transparent text-2xl font-bold focus:outline-none ${
            theme === "dark" ? "text-white placeholder-gray-500" : "text-black placeholder-gray-600"
          }`}
        />
      </div>

      {/* Formatting Toolbar */}
      <div className="px-4 pb-4">
        <div
          className={`flex items-center gap-2 p-2 rounded-lg border ${
            theme === "dark"
              ? "bg-neutral-800 bg-opacity-90 border-neutral-700"
              : "bg-white bg-opacity-90 border-gray-300"
          }`}
        >
          {/* Text Formatting */}
          <button
            onClick={() => applyFormat("bold")}
            className={`p-2 rounded transition-colors ${
              theme === "dark"
                ? "text-gray-400 hover:text-white hover:bg-neutral-700"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
            }`}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>

          <button
            onClick={() => applyFormat("italic")}
            className={`p-2 rounded transition-colors ${
              theme === "dark"
                ? "text-gray-400 hover:text-white hover:bg-neutral-700"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
            }`}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>

          <div className={`w-px h-6 mx-1 ${theme === "dark" ? "bg-neutral-600" : "bg-gray-300"}`}></div>

          {/* Alignment */}
          <button
            onClick={() => applyFormat("justifyLeft")}
            className={`p-2 rounded transition-colors ${
              theme === "dark"
                ? "text-gray-400 hover:text-white hover:bg-neutral-700"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
            }`}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => applyFormat("justifyCenter")}
            className={`p-2 rounded transition-colors ${
              theme === "dark"
                ? "text-gray-400 hover:text-white hover:bg-neutral-700"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
            }`}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>

          <button
            onClick={() => applyFormat("justifyRight")}
            className={`p-2 rounded transition-colors ${
              theme === "dark"
                ? "text-gray-400 hover:text-white hover:bg-neutral-700"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
            }`}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </button>

          <div className={`w-px h-6 mx-1 ${theme === "dark" ? "bg-neutral-600" : "bg-gray-300"}`}></div>

          {/* Undo/Redo */}
          <button
            onClick={handleUndo}
            className={`p-2 rounded transition-colors ${
              theme === "dark"
                ? "text-gray-400 hover:text-white hover:bg-neutral-700"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
            }`}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>

          <button
            onClick={handleRedo}
            className={`p-2 rounded transition-colors ${
              theme === "dark"
                ? "text-gray-400 hover:text-white hover:bg-neutral-700"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
            }`}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-4 pb-6">
        <div
          ref={contentRef}
          contentEditable={true}
          onInput={handleContentChange}
          onBlur={handleContentChange}
          className={`w-full h-full min-h-96 bg-transparent text-base focus:outline-none resize-none leading-relaxed ${
            theme === "dark" ? "text-white" : "text-black"
          }`}
          style={{
            wordWrap: "break-word",
            minHeight: "400px",
          }}
          suppressContentEditableWarning={true}
          data-placeholder="Start typing..."
        />
      </div>

      {/* Custom CSS for placeholder and better styling */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: ${theme === "dark" ? "#6b7280" : "#9ca3af"};
          font-style: italic;
        }
        
        [contenteditable]:focus {
          outline: none;
        }
        
        /* Ensure proper text selection styling */
        [contenteditable]::selection {
          background-color: ${theme === "dark" ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.2)"};
        }
        
        /* Style for formatted text within the editor */
        [contenteditable] strong {
          font-weight: bold;
        }
        
        [contenteditable] em {
          font-style: italic;
        }
        
        /* Improve readability with better line spacing */
        [contenteditable] {
          line-height: 1.6;
        }
      `}</style>
    </div>
  )
}

export default NotePage
