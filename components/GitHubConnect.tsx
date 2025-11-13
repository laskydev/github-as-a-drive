'use client'

import { useState } from 'react'
import { Github } from 'lucide-react'

interface GitHubConnectProps {
  onConnect: (token: string, owner: string, repoName: string) => void
}

export default function GitHubConnect({ onConnect }: GitHubConnectProps) {
  const [token, setToken] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Parse repository URL or owner/repo format
    let owner = ''
    let repoName = ''

    try {
      if (repoUrl.includes('github.com')) {
        // Parse URL format: https://github.com/owner/repo
        const urlParts = repoUrl.replace('https://github.com/', '').split('/')
        owner = urlParts[0]
        repoName = urlParts[1]?.replace('.git', '')
      } else if (repoUrl.includes('/')) {
        // Parse owner/repo format
        const parts = repoUrl.split('/')
        owner = parts[0]
        repoName = parts[1]
      } else {
        throw new Error('Invalid repository format')
      }

      if (!owner || !repoName) {
        throw new Error('Invalid repository format')
      }

      // Verify token and repository access
      const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error('Invalid token or repository not found')
      }

      onConnect(token, owner, repoName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Github className="w-16 h-16 text-gray-800" />
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          GitHub Drive
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Connect your repository and manage it like a cloud drive
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Personal Access Token
            </label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Need a token?{' '}
              <a
                href="https://github.com/settings/tokens/new?scopes=repo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Create one here
              </a>
            </p>
          </div>

          <div>
            <label htmlFor="repo" className="block text-sm font-medium text-gray-700 mb-2">
              Repository
            </label>
            <input
              id="repo"
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="owner/repo or https://github.com/owner/repo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Connect Repository
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Your token is stored locally and never sent to any server except GitHub API
          </p>
        </div>
      </div>
    </div>
  )
}
