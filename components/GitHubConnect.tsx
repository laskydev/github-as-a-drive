'use client'

import { useState, useEffect } from 'react'
import { Github, Upload, History, Zap } from 'lucide-react'

interface GitHubConnectProps {
  onConnect: (token: string, owner: string, repoName: string) => void
  onSwitchToOAuth?: () => void
}

interface SavedConnection {
  owner: string
  repoName: string
  lastUsed: number
}

export default function GitHubConnect({ onConnect, onSwitchToOAuth }: GitHubConnectProps) {
  const [token, setToken] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [error, setError] = useState('')
  const [recentConnections, setRecentConnections] = useState<SavedConnection[]>([])
  const [showJsonUpload, setShowJsonUpload] = useState(false)

  // Load saved token and recent connections on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('github_token')
    const savedRepo = localStorage.getItem('github_repo')
    const savedConnections = localStorage.getItem('github_recent_connections')

    if (savedToken) setToken(savedToken)
    if (savedRepo) setRepoUrl(savedRepo)
    if (savedConnections) {
      setRecentConnections(JSON.parse(savedConnections))
    }

    // Auto-connect if we have both token and repo
    if (savedToken && savedRepo) {
      handleConnect(savedToken, savedRepo, true)
    }
  }, [])

  const parseRepoUrl = (url: string): { owner: string; repoName: string } | null => {
    let owner = ''
    let repoName = ''

    if (url.includes('github.com')) {
      // Parse URL format: https://github.com/owner/repo
      const urlParts = url.replace('https://github.com/', '').split('/')
      owner = urlParts[0]
      repoName = urlParts[1]?.replace('.git', '')
    } else if (url.includes('/')) {
      // Parse owner/repo format
      const parts = url.split('/')
      owner = parts[0]
      repoName = parts[1]
    } else {
      return null
    }

    if (!owner || !repoName) return null
    return { owner, repoName }
  }

  const saveConnection = (owner: string, repoName: string) => {
    const connections = recentConnections.filter(
      (c) => !(c.owner === owner && c.repoName === repoName)
    )
    const newConnection: SavedConnection = {
      owner,
      repoName,
      lastUsed: Date.now(),
    }
    const updated = [newConnection, ...connections].slice(0, 5) // Keep only 5 most recent
    setRecentConnections(updated)
    localStorage.setItem('github_recent_connections', JSON.stringify(updated))
  }

  const handleConnect = async (tokenToUse: string, repoToUse: string, silent = false) => {
    if (!silent) setError('')

    const parsed = parseRepoUrl(repoToUse)
    if (!parsed) {
      if (!silent) setError('Invalid repository format')
      return
    }

    const { owner, repoName } = parsed

    try {
      // Verify token and repository access
      const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: {
          Authorization: `token ${tokenToUse}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error('Invalid token or repository not found')
      }

      // Save credentials to localStorage
      localStorage.setItem('github_token', tokenToUse)
      localStorage.setItem('github_repo', repoToUse)

      // Save to recent connections
      saveConnection(owner, repoName)

      onConnect(tokenToUse, owner, repoName)
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleConnect(token, repoUrl)
  }

  const handleRecentConnect = async (connection: SavedConnection) => {
    const repoStr = `${connection.owner}/${connection.repoName}`
    setRepoUrl(repoStr)
    if (token) {
      await handleConnect(token, repoStr)
    }
  }

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)

        if (!json.token || !json.repository) {
          setError('Invalid JSON format. Required fields: token, repository')
          return
        }

        setToken(json.token)
        setRepoUrl(json.repository)
        await handleConnect(json.token, json.repository)
      } catch (err) {
        setError('Error parsing JSON file')
      }
    }
    reader.readAsText(file)
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

        {/* Recent Connections */}
        {recentConnections.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <History className="w-4 h-4" />
              Conexiones recientes
            </div>
            <div className="space-y-2">
              {recentConnections.map((conn) => (
                <button
                  key={`${conn.owner}/${conn.repoName}`}
                  onClick={() => handleRecentConnect(conn)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {conn.owner}/{conn.repoName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(conn.lastUsed).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3 text-center">
              <span className="text-xs text-gray-500">o conecta a un nuevo repositorio:</span>
            </div>
          </div>
        )}

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

        {/* JSON Upload Option */}
        <div className="mt-4">
          <button
            onClick={() => setShowJsonUpload(!showJsonUpload)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            Cargar desde archivo JSON
          </button>

          {showJsonUpload && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">
                Sube un archivo <code className="bg-white px-1 py-0.5 rounded">github-config.json</code> con este formato:
              </p>
              <pre className="text-xs bg-white p-2 rounded mb-3 overflow-x-auto">
{`{
  "token": "ghp_xxxxx",
  "repository": "owner/repo"
}`}
              </pre>
              <input
                type="file"
                accept=".json"
                onChange={handleJsonUpload}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-2">
            Tu token se guarda localmente en tu navegador y solo se envía a la API de GitHub
          </p>
          {onSwitchToOAuth && (
            <div className="text-center">
              <button
                onClick={onSwitchToOAuth}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                ¿Prefieres OAuth? Inicia sesión con GitHub
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
