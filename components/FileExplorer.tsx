'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Folder,
  File,
  Upload,
  FileText,
  Image as ImageIcon,
  FileCode,
  ChevronRight,
  Home,
  Plus,
  LayoutGrid,
  List,
  FileVideo,
  FileArchive,
  Music,
} from 'lucide-react'
import { Octokit } from '@octokit/rest'

interface FileItem {
  name: string
  path: string
  type: 'file' | 'dir'
  sha: string
  size?: number
}

interface FileExplorerProps {
  token: string
  owner: string
  repoName: string
  onFileSelect: (filePath: string) => void
}

export default function FileExplorer({
  token,
  owner,
  repoName,
  onFileSelect,
}: FileExplorerProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [currentPath, setCurrentPath] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showNewFileModal, setShowNewFileModal] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const octokit = new Octokit({ auth: token })

  const loadFiles = async (path: string = '') => {
    setLoading(true)
    try {
      const response = await octokit.repos.getContent({
        owner,
        repo: repoName,
        path,
      })

      if (Array.isArray(response.data)) {
        const items: FileItem[] = response.data.map((item: any) => ({
          name: item.name,
          path: item.path,
          type: item.type === 'dir' ? 'dir' : 'file',
          sha: item.sha,
          size: item.size,
        }))

        // Sort: directories first, then files
        items.sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name)
          return a.type === 'dir' ? -1 : 1
        })

        setFiles(items)
      }
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFiles(currentPath)
  }, [currentPath])

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'dir') {
      setCurrentPath(item.path)
    } else {
      onFileSelect(item.path)
    }
  }

  const navigateToPath = (path: string) => {
    setCurrentPath(path)
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true)

      for (const file of acceptedFiles) {
        try {
          const reader = new FileReader()
          reader.onload = async (e) => {
            const content = e.target?.result as string
            const base64Content = content.split(',')[1]

            const filePath = currentPath ? `${currentPath}/${file.name}` : file.name

            await octokit.repos.createOrUpdateFileContents({
              owner,
              repo: repoName,
              path: filePath,
              message: `Upload ${file.name}`,
              content: base64Content,
            })

            await loadFiles(currentPath)
          }
          reader.readAsDataURL(file)
        } catch (error) {
          console.error('Error uploading file:', error)
        }
      }

      setUploading(false)
    },
    [currentPath, token, owner, repoName]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleCreateNewFile = async () => {
    if (!newFileName) return

    try {
      const fileName = newFileName.endsWith('.md') ? newFileName : `${newFileName}.md`
      const filePath = currentPath ? `${currentPath}/${fileName}` : fileName

      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo: repoName,
        path: filePath,
        message: `Create ${fileName}`,
        content: btoa('# New Document\n\nStart writing here...'),
      })

      setShowNewFileModal(false)
      setNewFileName('')
      await loadFiles(currentPath)
    } catch (error) {
      console.error('Error creating file:', error)
    }
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()

    if (['md', 'txt', 'doc', 'docx', 'pdf'].includes(ext || ''))
      return <FileText className="w-5 h-5 text-blue-500" />
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico', 'bmp'].includes(ext || ''))
      return <ImageIcon className="w-5 h-5 text-green-500" />
    if (['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'php'].includes(ext || ''))
      return <FileCode className="w-5 h-5 text-purple-500" />
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || ''))
      return <FileVideo className="w-5 h-5 text-pink-500" />
    if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext || ''))
      return <FileArchive className="w-5 h-5 text-orange-500" />
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext || ''))
      return <Music className="w-5 h-5 text-red-500" />

    return <File className="w-5 h-5 text-gray-500 dark:text-gray-400" />
  }

  const getFileStyle = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()

    if (['md', 'txt', 'doc', 'docx', 'pdf'].includes(ext || '')) {
      return {
        icon: <FileText className="w-12 h-12" />,
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-600 dark:text-blue-400',
        borderColor: 'border-blue-200 dark:border-blue-800'
      }
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico', 'bmp'].includes(ext || '')) {
      return {
        icon: <ImageIcon className="w-12 h-12" />,
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-600 dark:text-green-400',
        borderColor: 'border-green-200 dark:border-green-800'
      }
    }
    if (['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'php'].includes(ext || '')) {
      return {
        icon: <FileCode className="w-12 h-12" />,
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        textColor: 'text-purple-600 dark:text-purple-400',
        borderColor: 'border-purple-200 dark:border-purple-800'
      }
    }
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '')) {
      return {
        icon: <FileVideo className="w-12 h-12" />,
        bgColor: 'bg-pink-100 dark:bg-pink-900/30',
        textColor: 'text-pink-600 dark:text-pink-400',
        borderColor: 'border-pink-200 dark:border-pink-800'
      }
    }
    if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext || '')) {
      return {
        icon: <FileArchive className="w-12 h-12" />,
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        textColor: 'text-orange-600 dark:text-orange-400',
        borderColor: 'border-orange-200 dark:border-orange-800'
      }
    }
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext || '')) {
      return {
        icon: <Music className="w-12 h-12" />,
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-600 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-800'
      }
    }

    return {
      icon: <File className="w-12 h-12" />,
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      textColor: 'text-gray-600 dark:text-gray-400',
      borderColor: 'border-gray-200 dark:border-gray-600'
    }
  }

  const pathSegments = currentPath.split('/').filter(Boolean)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header with breadcrumbs */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <button
            onClick={() => navigateToPath('')}
            className="hover:text-blue-600 flex items-center gap-1"
          >
            <Home className="w-4 h-4" />
            <span>Root</span>
          </button>
          {pathSegments.map((segment, index) => {
            const path = pathSegments.slice(0, index + 1).join('/')
            return (
              <div key={path} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                <button
                  onClick={() => navigateToPath(path)}
                  className="hover:text-blue-600"
                >
                  {segment}
                </button>
              </div>
            )
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowNewFileModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Markdown File
          </button>

          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="Vista mosaicos"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="Vista lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg m-4 p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        {uploading ? (
          <p className="text-gray-600 dark:text-gray-400">Uploading files...</p>
        ) : isDragActive ? (
          <p className="text-blue-600 dark:text-blue-400">Drop files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-1">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Upload images, documents, or any file to your repository
            </p>
          </div>
        )}
      </div>

      {/* File list */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            This folder is empty. Upload some files or create a new document!
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((item) => {
              const style = item.type === 'dir'
                ? {
                    icon: <Folder className="w-12 h-12" />,
                    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
                    textColor: 'text-yellow-600 dark:text-yellow-400',
                    borderColor: 'border-yellow-200 dark:border-yellow-800'
                  }
                : getFileStyle(item.name)

              return (
                <button
                  key={item.path}
                  onClick={() => handleItemClick(item)}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 ${style.borderColor} ${style.bgColor} hover:shadow-md transition-all text-center group`}
                >
                  <div className={`${style.textColor} mb-3`}>
                    {style.icon}
                  </div>
                  <p className={`text-sm font-medium ${style.textColor} truncate w-full px-2`}>
                    {item.name}
                  </p>
                  {item.size !== undefined && item.type === 'file' && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {(item.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-1">
            {files.map((item) => (
              <button
                key={item.path}
                onClick={() => handleItemClick(item)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                {item.type === 'dir' ? (
                  <Folder className="w-5 h-5 text-yellow-500" />
                ) : (
                  getFileIcon(item.name)
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  {item.size !== undefined && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(item.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
                {item.type === 'dir' && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New file modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Create New Markdown File</h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="document-name.md"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateNewFile()
                if (e.key === 'Escape') {
                  setShowNewFileModal(false)
                  setNewFileName('')
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNewFileModal(false)
                  setNewFileName('')
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewFile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
