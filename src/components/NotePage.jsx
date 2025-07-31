import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Pin, PinOff, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Undo, Redo } from 'lucide-react'
import api from '../api' // Import your configured api instance

function NotePage({ noteId, onBack }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const contentRef = useRef(null)
  const titleRef = useRef(null)

  // Load existing note if editing
  useEffect(() => {
    if (noteId) {
      loadNote()
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
      
      // Set content in contentEditable div
      if (contentRef.current) {
        contentRef.current.innerHTML = note.content.replace(/\n/g, '<br>')
      }
    } catch (err) {
      setError('Failed to load note')
      console.error('Error loading note:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle content changes in contentEditable div
  const handleContentChange = () => {
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML.replace(/<br>/g, '\n').replace(/<[^>]*>/g, ''))
    }
  }

  // Formatting functions
  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value)
    contentRef.current?.focus()
  }

  // Undo/Redo functions
  const handleUndo = () => {
    document.execCommand('undo')
    handleContentChange()
  }

  const handleRedo = () => {
    document.execCommand('redo')
    handleContentChange()
  }

  // Save note
  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title')
      titleRef.current?.focus()
      return
    }

    try {
      setSaving(true)
      setError('')
      
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        pinned: isPinned
      }

      if (noteId) {
        // Update existing note
        await api.put(`/api/notes/${noteId}`, noteData)
      } else {
        // Create new note
        await api.post('/api/notes', noteData)
      }

      // Success feedback
      setError('')
      setTimeout(() => onBack(), 500) // Brief delay to show success
    } catch (err) {
      setError('Failed to save note')
      console.error('Error saving note:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white">Loading note...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col">
      {/* Top Bar */}
      <header className="bg-neutral-800 p-4 flex items-center justify-between border-b border-neutral-700">
        <button
          onClick={onBack}
          className="text-white hover:text-gray-300 p-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`p-2 rounded ${isPinned ? 'text-yellow-500' : 'text-gray-400 hover:text-white'}`}
          >
            {isPinned ? <Pin className="h-6 w-6" /> : <PinOff className="h-6 w-6" />}
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Done'}
          </button>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Title Input */}
      <div className="px-4 pt-6 pb-4">
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title..."
          className="w-full bg-transparent text-white text-2xl font-bold placeholder-gray-500 focus:outline-none"
        />
      </div>

      {/* Formatting Toolbar */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 p-2 bg-neutral-800 rounded-lg border border-neutral-700">
          {/* Text Formatting */}
          <button
            onClick={() => applyFormat('bold')}
            className="p-2 text-gray-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => applyFormat('italic')}
            className="p-2 text-gray-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-neutral-600 mx-1"></div>

          {/* Alignment */}
          <button
            onClick={() => applyFormat('justifyLeft')}
            className="p-2 text-gray-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => applyFormat('justifyCenter')}
            className="p-2 text-gray-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => applyFormat('justifyRight')}
            className="p-2 text-gray-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-neutral-600 mx-1"></div>

          {/* Undo/Redo */}
          <button
            onClick={handleUndo}
            className="p-2 text-gray-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleRedo}
            className="p-2 text-gray-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
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
          className="w-full h-full min-h-96 bg-transparent text-white text-base placeholder-gray-500 focus:outline-none resize-none leading-relaxed"
          style={{ wordWrap: 'break-word' }}
          suppressContentEditableWarning={true}
          data-placeholder="Start typing..."
        />
      </div>

      {/* Custom CSS for placeholder */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #6b7280;
          font-style: italic;
        }
      `}</style>
    </div>
  )
}

export default NotePage