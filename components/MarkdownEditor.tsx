'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Octokit } from '@octokit/rest'
import {
  Save,
  Eye,
  Code,
  ArrowLeft,
  Clock,
  GitCommit,
} from 'lucide-react'

interface MarkdownEditorProps {
  token: string
  owner: string
  repoName: string
  filePath: string | null
  onBack: () => void
}

interface Commit {
  sha: string
  message: string
  date: string
  author: string
}

export default function MarkdownEditor({
  token,
  owner,
  repoName,
  filePath,
  onBack,
}: MarkdownEditorProps) {
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [fileSha, setFileSha] = useState('')
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split')
  const [saving, setSaving] = useState(false)
  const [commitMessage, setCommitMessage] = useState('')
  const [showCommitDialog, setShowCommitDialog] = useState(false)
  const [commits, setCommits] = useState<Commit[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const octokit = new Octokit({ auth: token })

  useEffect(() => {
    if (filePath) {
      loadFile()
      loadCommitHistory()
    }
  }, [filePath])

  const loadFile = async () => {
    if (!filePath) return

    try {
      const response = await octokit.repos.getContent({
        owner,
        repo: repoName,
        path: filePath,
      })

      if ('content' in response.data && !Array.isArray(response.data)) {
        const decodedContent = atob(response.data.content)
        setContent(decodedContent)
        setOriginalContent(decodedContent)
        setFileSha(response.data.sha)
      }
    } catch (error) {
      console.error('Error loading file:', error)
    }
  }

  const loadCommitHistory = async () => {
    if (!filePath) return

    try {
      const response = await octokit.repos.listCommits({
        owner,
        repo: repoName,
        path: filePath,
        per_page: 10,
      })

      const commitHistory: Commit[] = response.data.map((commit: any) => ({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message,
        date: new Date(commit.commit.author.date).toLocaleString(),
        author: commit.commit.author.name,
      }))

      setCommits(commitHistory)
    } catch (error) {
      console.error('Error loading commit history:', error)
    }
  }

  const handleSave = () => {
    setCommitMessage(`Update ${filePath?.split('/').pop()}`)
    setShowCommitDialog(true)
  }

  const confirmSave = async () => {
    if (!filePath || !commitMessage) return

    setSaving(true)
    try {
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo: repoName,
        path: filePath,
        message: commitMessage,
        content: btoa(content),
        sha: fileSha,
      })

      setOriginalContent(content)
      setShowCommitDialog(false)
      setCommitMessage('')
      await loadFile()
      await loadCommitHistory()
    } catch (error) {
      console.error('Error saving file:', error)
      alert('Error saving file. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = content !== originalContent

  if (!filePath) {
    return (
      <div className="text-center py-8 text-gray-500">
        Select a file to edit
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {filePath.split('/').pop()}
            </h2>
            {hasChanges && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Clock className="w-4 h-4" />
              History
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                hasChanges && !saving
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('edit')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              viewMode === 'edit'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Code className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              viewMode === 'split'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Split
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              viewMode === 'preview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex" style={{ height: 'calc(100vh - 300px)' }}>
        {/* Edit pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-1/2 border-r border-gray-200' : 'w-full'
            }`}
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
              placeholder="Start writing your markdown here..."
            />
          </div>
        )}

        {/* Preview pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            } overflow-y-auto`}
          >
            <div className="prose max-w-none p-6 markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || '*No content to preview*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Commit history sidebar */}
      {showHistory && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl overflow-y-auto z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Commit History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="p-4">
            {commits.length === 0 ? (
              <p className="text-gray-500 text-sm">No commits found</p>
            ) : (
              <div className="space-y-4">
                {commits.map((commit) => (
                  <div
                    key={commit.sha}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <GitCommit className="w-4 h-4 text-gray-400 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 break-words">
                          {commit.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {commit.author}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{commit.date}</span>
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {commit.sha}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Commit dialog */}
      {showCommitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Commit Changes</h3>
            <p className="text-sm text-gray-600 mb-4">
              Describe what changes you made to this file
            </p>
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Update document content"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmSave()
                if (e.key === 'Escape') {
                  setShowCommitDialog(false)
                  setCommitMessage('')
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowCommitDialog(false)
                  setCommitMessage('')
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                disabled={!commitMessage || saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                {saving ? 'Saving...' : 'Commit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
