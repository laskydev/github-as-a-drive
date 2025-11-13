'use client'

import { useState, useEffect } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Github, Search, Star, GitFork, Loader2 } from 'lucide-react'
import { Octokit } from '@octokit/rest'

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  stargazers_count: number
  forks_count: number
  updated_at: string
}

interface GitHubOAuthProps {
  onConnect: (token: string, owner: string, repoName: string) => void
}

export default function GitHubOAuth({ onConnect }: GitHubOAuthProps) {
  const { data: session, status } = useSession()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (session?.accessToken) {
      loadRepositories()
    }
  }, [session])

  useEffect(() => {
    if (searchQuery) {
      const filtered = repositories.filter((repo) =>
        repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredRepos(filtered)
    } else {
      setFilteredRepos(repositories)
    }
  }, [searchQuery, repositories])

  const loadRepositories = async () => {
    if (!session?.accessToken) return

    setLoading(true)
    try {
      const octokit = new Octokit({ auth: session.accessToken })

      const response = await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      })

      setRepositories(response.data as Repository[])
      setFilteredRepos(response.data as Repository[])
    } catch (error) {
      console.error('Error loading repositories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRepoSelect = (repo: Repository) => {
    if (!session?.accessToken) return

    const [owner, repoName] = repo.full_name.split('/')
    onConnect(session.accessToken, owner, repoName)
  }

  const handleSignIn = () => {
    signIn('github')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando...</span>
        </div>
      </div>
    )
  }

  if (!session) {
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
            Gestiona tu repositorio como un drive en la nube
          </p>

          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-lg transition-colors"
          >
            <Github className="w-5 h-5" />
            Iniciar sesión con GitHub
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              OAuth seguro - Solo solicitamos permisos de lectura/escritura en repositorios
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>¿Primera vez?</strong> Necesitarás configurar una GitHub OAuth App.
              Lee las instrucciones en el README.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Github className="w-10 h-10 text-gray-800" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Selecciona un repositorio
                </h1>
                <p className="text-sm text-gray-600">
                  Conectado como {session.user?.name || session.user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Cerrar sesión
            </button>
          </div>

          {/* Search bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar repositorios..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Repository list */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? 'No se encontraron repositorios' : 'No tienes repositorios'}
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredRepos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => handleRepoSelect(repo)}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {repo.full_name}
                        </h3>
                        {repo.private && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                            Privado
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {repo.stargazers_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" />
                          {repo.forks_count}
                        </div>
                        <span>
                          Actualizado {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
