"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  ArrowLeft,
  Pin,
  PinOff,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Type,
  Undo,
  Redo,
  List,
  ListOrdered,
} from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api"
import { useTheme } from "../contexts/ThemeContext.jsx"
import { markdownToHtml } from "../utils/markdownToHtml.js"
import { htmlToMarkdown } from "../utils/htmlToMarkdown.js"

function NotePage() {
  const { noteId } = useParams()
  const navigate = useNavigate()

  const { theme, wallpaper, wallpaperDimming } = useTheme()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isPinned, setIsPinned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [activeBlockStyle, setActiveBlockStyle] = useState("p")
  const [isBoldActive, setIsBoldActive] = useState(false)
  const [isItalicActive, setIsItalicActive] = useState(false)
  const [isBulletListActive, setIsBulletListActive] = useState(false)
  const [isNumberedListActive, setIsNumberedListActive] = useState(false)

  const contentRef = useRef(null)
  const titleRef = useRef(null)

  const loadNote = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/notes/${noteId}`)
      const noteData = response.data
      console.log("NotePage: Fetched noteData object:", noteData)
      console.log("NotePage: Raw Markdown from backend (noteData.content):", noteData.content)
      const htmlContentForEditor = markdownToHtml(noteData.content)
      console.log("NotePage: HTML after markdownToHtml conversion:", htmlContentForEditor)
      setTitle(noteData.title)
      setContent(htmlContentForEditor)
      setIsPinned(noteData.pinned)
    } catch (err) {
      setError("Failed to load note")
      console.error("Error loading note:", err)
    } finally {
      setLoading(false)
    }
  }, [noteId])

  useEffect(() => {
    console.log("NotePage: Current theme from context is:", theme)
    console.log("NotePage: Current wallpaper from context is:", wallpaper)
  }, [theme, wallpaper])

  const getBackgroundStyle = () => {
    const style = {}

    if (!wallpaper) {
      style.backgroundColor = theme === "dark" ? "#171717" : "#f5f5f5"
    } else {
      const wallpaperBaseUrl = import.meta.env.VITE_API_URL || "https://shared-notes-backend.onrender.com"
      const wallpaperUrl = wallpaper.startsWith("http") ? wallpaper : `${wallpaperBaseUrl}${wallpaper}`

      style.backgroundImage = `linear-gradient(rgba(0,0,0,${wallpaperDimming}), rgba(0,0,0,${wallpaperDimming})), url(${wallpaperUrl})`
      style.backgroundSize = "cover"
      style.backgroundPosition = "center"
      style.backgroundRepeat = "no-repeat"
      style.backgroundAttachment = "fixed"
      style.backgroundColor = theme === "dark" ? "#171717" : "#f5f5f5"
    }
    console.log("NotePage: getBackgroundStyle returning:", style)
    return style
  }

  const updateActiveBlockStyle = useCallback(() => {
    if (!contentRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setActiveBlockStyle("p")
      setIsBoldActive(false)
      setIsItalicActive(false)
      setIsBulletListActive(false)
      setIsNumberedListActive(false)
      return
    }

    // Update block style
    const currentFormatBlock = document.queryCommandValue("formatBlock").toLowerCase()
    if (currentFormatBlock === "h1") {
      setActiveBlockStyle("h1")
    } else if (currentFormatBlock === "h2") {
      setActiveBlockStyle("h2")
    } else {
      setActiveBlockStyle("p")
    }

    // Update inline styles
    setIsBoldActive(document.queryCommandState("bold"))
    setIsItalicActive(document.queryCommandState("italic"))

    // Update list states
    const currentNode = selection.anchorNode
    const parentLi = currentNode?.nodeType === Node.TEXT_NODE 
      ? currentNode.parentElement?.closest("li") 
      : currentNode?.closest?.("li")
    
    if (parentLi) {
      const parentList = parentLi.closest("ul, ol")
      if (parentList) {
        setIsBulletListActive(parentList.tagName.toLowerCase() === "ul")
        setIsNumberedListActive(parentList.tagName.toLowerCase() === "ol")
      }
    } else {
      setIsBulletListActive(false)
      setIsNumberedListActive(false)
    }
  }, [])

  useEffect(() => {
    if (noteId && noteId !== "new") {
      loadNote()
    } else {
      if (contentRef.current) {
        contentRef.current.innerHTML = ""
      }
      setTitle("")
      setContent("")
      setIsPinned(false)
      setActiveBlockStyle("p")
      setIsBoldActive(false)
      setIsItalicActive(false)
      setIsBulletListActive(false)
      setIsNumberedListActive(false)
    }
    
    const timeoutId = setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.focus()
        updateActiveBlockStyle()
      }
    }, 0)
    
    if (contentRef.current) {
      console.log("NotePage: contentRef.current.innerHTML after load/reset:", contentRef.current.innerHTML)
    }
    return () => clearTimeout(timeoutId)
  }, [noteId, loadNote, updateActiveBlockStyle])

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== content) {
      contentRef.current.innerHTML = content
      updateActiveBlockStyle()
    }
  }, [content, updateActiveBlockStyle])

  const handleContentChange = () => {
    if (contentRef.current) {
      let htmlContent = contentRef.current.innerHTML

      // Clean up formatting artifacts
      htmlContent = htmlContent.replace(/<p>\s*\*\s*<\/p>/g, "<p><br></p>")
      htmlContent = htmlContent.replace(/^\s*\*\s*$/gm, "")

      if (htmlContent !== contentRef.current.innerHTML) {
        contentRef.current.innerHTML = htmlContent
      }

      setContent(htmlContent)
      updateActiveBlockStyle()
    }
  }

  const applyFormat = (command, value = null) => {
    if (!contentRef.current) return

    contentRef.current.focus()

    if (command === "bold") {
      document.execCommand("bold", false, value)
      setIsBoldActive(document.queryCommandState("bold"))
    } else if (command === "italic") {
      document.execCommand("italic", false, value)
      setIsItalicActive(document.queryCommandState("italic"))
    } else if (command === "formatBlock") {
      const currentFormatBlock = document.queryCommandValue("formatBlock").toLowerCase()

      if (currentFormatBlock === value?.toLowerCase()) {
        document.execCommand("formatBlock", false, "P")
      } else {
        document.execCommand("formatBlock", false, value)
      }
      updateActiveBlockStyle()
    } else if (command === "insertUnorderedList") {
      document.execCommand("insertUnorderedList", false, value)
      setIsBulletListActive(document.queryCommandState("insertUnorderedList"))
      setIsNumberedListActive(false)
      updateActiveBlockStyle()
    } else if (command === "insertOrderedList") {
      document.execCommand("insertOrderedList", false, value)
      setIsNumberedListActive(document.queryCommandState("insertOrderedList"))
      setIsBulletListActive(false)
      updateActiveBlockStyle()
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault()

      const selection = window.getSelection()
      if (!selection.rangeCount) return

      const range = selection.getRangeAt(0)
      const currentNode = range.startContainer.nodeType === Node.TEXT_NODE 
        ? range.startContainer.parentElement 
        : range.startContainer
      const currentLi = currentNode.closest("li")

      if (currentLi) {
        const textContent = currentLi.textContent.trim()

        if (!textContent) {
          // Empty list item - break out of list
          document.execCommand("insertParagraph")
          // Clean up empty list items that might remain
          setTimeout(() => {
            const emptyLis = contentRef.current.querySelectorAll("li:empty")
            emptyLis.forEach(li => {
              if (!li.textContent.trim()) {
                const list = li.parentElement
                li.remove()
                if (!list.children.length) {
                  list.remove()
                }
              }
            })
          }, 0)
        } else {
          // Create new list item
          const newLi = document.createElement("li")
          newLi.innerHTML = "<br>"

          currentLi.parentNode.insertBefore(newLi, currentLi.nextSibling)

          // Position cursor
          range.setStart(newLi, 0)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      } else {
        // Not in a list
        document.execCommand("insertText", false, "\n")
      }
      handleContentChange()
    } else if (event.key === " ") {
      event.preventDefault()
      document.execCommand("insertHTML", false, "&nbsp;")
      handleContentChange()
    }
  }

  const handleUndo = () => {
    document.execCommand("undo")
    updateActiveBlockStyle()
  }

  const handleRedo = () => {
    document.execCommand("redo")
    updateActiveBlockStyle()
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Please enter a title")
      titleRef.current?.focus()
      return
    }

    try {
      setSaving(true)
      setError("")

      const markdownContent = htmlToMarkdown(contentRef.current.innerHTML)
      console.log("NotePage: Markdown content before saving (htmlToMarkdown output):", markdownContent)

      const noteData = {
        title: title.trim(),
        content: markdownContent.trim(),
        pinned: isPinned,
      }

      console.log("NotePage: Saving note with data:", noteData)

      if (noteId && noteId !== "new") {
        await api.put(`/api/notes/${noteId}`, noteData)
      } else {
        await api.post("/api/notes", noteData)
      }

      setError("")
      setTimeout(() => navigate("/"), 500)
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

  const getButtonClasses = (styleName) => {
    const baseClasses = `p-2 rounded transition-colors`
    const activeClasses = theme === "dark" ? "bg-yellow-500 text-black" : "bg-yellow-500 text-black"
    const inactiveClasses =
      theme === "dark"
        ? "text-gray-400 hover:text-white hover:bg-neutral-700"
        : "text-gray-600 hover:text-black hover:bg-gray-100"

    if (["h1", "h2", "p"].includes(styleName)) {
      return `${baseClasses} ${activeBlockStyle === styleName ? activeClasses : inactiveClasses}`
    }
    if (styleName === "bold") {
      return `${baseClasses} ${isBoldActive ? activeClasses : inactiveClasses}`
    }
    if (styleName === "italic") {
      return `${baseClasses} ${isItalicActive ? activeClasses : inactiveClasses}`
    }
    if (styleName === "bulletList") {
      return `${baseClasses} ${isBulletListActive ? activeClasses : inactiveClasses}`
    }
    if (styleName === "numberedList") {
      return `${baseClasses} ${isNumberedListActive ? activeClasses : inactiveClasses}`
    }

    return baseClasses
  }

  return (
    <div key={`${theme}-${wallpaper}`} className="min-h-screen flex flex-col" style={getBackgroundStyle()}>
      {/* TOP TOOLBAR WITH SAFE AREA SUPPORT */}
      <header
        className={`note-editor-toolbar flex items-center justify-between border-b ${
          theme === "dark"
            ? "bg-neutral-800 bg-opacity-90 border-neutral-700"
            : "bg-white bg-opacity-90 border-gray-300"
        }`}
      >
        <div className="px-4 pb-4 w-full flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
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
              onClick={handleUndo}
              className={`p-2 rounded transition-colors ${
                theme === "dark"
                  ? "text-gray-400 hover:text-white hover:bg-neutral-700"
                  : "text-gray-500 hover:text-black hover:bg-gray-100"
              }`}
              title="Undo"
            >
              <Undo className="h-6 w-6" />
            </button>

            <button
              onClick={handleRedo}
              className={`p-2 rounded transition-colors ${
                theme === "dark"
                  ? "text-gray-400 hover:text-white hover:bg-neutral-700"
                  : "text-gray-500 hover:text-black hover:bg-gray-100"
              }`}
              title="Redo"
            >
              <Redo className="h-6 w-6" />
            </button>

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
        </div>
      </header>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">{error}</div>
      )}

      <div className="px-6 pt-6 pb-4">
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

      <div className="flex-1 px-6 pb-20">
        <div
          ref={contentRef}
          contentEditable={true}
          onInput={handleContentChange}
          onBlur={handleContentChange}
          onKeyUp={updateActiveBlockStyle}
          onMouseUp={updateActiveBlockStyle}
          onKeyDown={handleKeyDown}
          className={`w-full h-full min-h-96 bg-transparent text-base focus:outline-none resize-none leading-relaxed ${
            theme === "dark" ? "text-white" : "text-black"
          }`}
          style={{
            wordWrap: "break-word",
          }}
          suppressContentEditableWarning={true}
          data-placeholder="Start typing..."
        />
      </div>

      {/* BOTTOM TOOLBAR WITH SAFE AREA SUPPORT */}
      <div className={`fixed bottom-0 left-0 right-0 w-full note-editor-bottom-toolbar z-50`}>
        <div className="px-4">
          <div
            className={`flex items-center justify-center gap-2 p-2 rounded-lg border mx-auto max-w-md ${
              theme === "dark" ? "bg-neutral-800 border-neutral-700" : "bg-white border-gray-300"
            }`}
          >
            <button onClick={() => applyFormat("bold")} className={getButtonClasses("bold")} title="Bold">
              <Bold className="h-4 w-4" />
            </button>

            <button onClick={() => applyFormat("italic")} className={getButtonClasses("italic")} title="Italic">
              <Italic className="h-4 w-4" />
            </button>

            <div className={`w-px h-6 mx-1 ${theme === "dark" ? "bg-neutral-600" : "bg-gray-300"}`}></div>

            <button onClick={() => applyFormat("formatBlock", "H1")} className={getButtonClasses("h1")} title="Heading 1">
              <Heading1 className="h-4 w-4" />
            </button>

            <button onClick={() => applyFormat("formatBlock", "H2")} className={getButtonClasses("h2")} title="Heading 2">
              <Heading2 className="h-4 w-4" />
            </button>

            <button onClick={() => applyFormat("formatBlock", "P")} className={getButtonClasses("p")} title="Normal Text">
              <Type className="h-4 w-4" />
            </button>

            <div className={`w-px h-6 mx-1 ${theme === "dark" ? "bg-neutral-600" : "bg-gray-300"}`}></div>

            <button
              onClick={() => applyFormat("insertUnorderedList")}
              className={getButtonClasses("bulletList")}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </button>

            <button
              onClick={() => applyFormat("insertOrderedList")}
              className={getButtonClasses("numberedList")}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: ${theme === "dark" ? "#6b7280" : "#9ca3af"};
          font-style: italic;
        }
        
        [contenteditable]:focus {
          outline: none;
        }
        
        [contenteditable]::selection {
          background-color: ${theme === "dark" ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.2)"};
        }
        
        [contenteditable] strong {
          font-weight: bold;
        }
        
        [contenteditable] em {
          font-style: italic;
        }
        
        [contenteditable] {
          line-height: 1.6;
          white-space: pre-wrap;
        }

        [contenteditable] h1 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 0;
          margin-bottom: 0;
        }
        [contenteditable] h2 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-top: 0;
          margin-bottom: 0;
        }
        [contenteditable] h3 {
          font-size: 1.125rem;
          font-weight: bold;
          margin-top: 0;
          margin-bottom: 0;
        }
        
        [contenteditable] p {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        [contenteditable] ul {
          list-style: disc;
          padding-left: 20px;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        [contenteditable] ol {
          list-style: decimal;
          padding-left: 20px;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        [contenteditable] li {
          margin-bottom: 0.2em;
          padding-left: 0;
          margin-left: 0;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  )
}

export default NotePage