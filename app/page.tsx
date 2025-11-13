'use client'

import { useState } from 'react'
import FileExplorer from '@/components/FileExplorer'
import MarkdownEditor from '@/components/MarkdownEditor'
import GitHubOAuth from '@/components/GitHubOAuth'
import GitHubConnect from '@/components/GitHubConnect'
import ThemeToggle from '@/components/ThemeToggle'

export default function Home() {
  const [token, setToken] = useState<string>('')
  const [repo, setRepo] = useState<{ owner: string; name: string } | null>(null)
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [view, setView] = useState<'explorer' | 'editor'>('explorer')
  const [authMode, setAuthMode] = useState<'oauth' | 'manual'>('oauth')

  const handleConnect = (newToken: string, repoOwner: string, repoName: string) => {
    setToken(newToken)
    setRepo({ owner: repoOwner, name: repoName })
  }

  const handleFileSelect = (filePath: string) => {
    setCurrentFile(filePath)
    setView('editor')
  }

  const handleBackToExplorer = () => {
    setView('explorer')
    setCurrentFile(null)
  }

  if (!token || !repo) {
    if (authMode === 'oauth') {
      return (
        <GitHubOAuth
          onConnect={handleConnect}
          onSwitchToManual={() => setAuthMode('manual')}
        />
      )
    } else {
      return (
        <GitHubConnect
          onConnect={handleConnect}
          onSwitchToOAuth={() => setAuthMode('oauth')}
        />
      )
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GitHub Drive</h1>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {repo.owner}/{repo.name}
            </span>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <button
              onClick={() => setView('explorer')}
              className={`px-4 py-2 rounded-lg ${
                view === 'explorer'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Explorer
            </button>
            {currentFile && (
              <button
                onClick={() => setView('editor')}
                className={`px-4 py-2 rounded-lg ${
                  view === 'editor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Editor
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {view === 'explorer' ? (
          <FileExplorer
            token={token}
            owner={repo.owner}
            repoName={repo.name}
            onFileSelect={handleFileSelect}
          />
        ) : (
          <MarkdownEditor
            token={token}
            owner={repo.owner}
            repoName={repo.name}
            filePath={currentFile}
            onBack={handleBackToExplorer}
          />
        )}
      </div>
    </main>
  )
}
