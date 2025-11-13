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

    if (['md', 'txt'].includes(ext || '')) return <FileText className="w-5 h-5 text-blue-500" />
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || ''))
      return <ImageIcon className="w-5 h-5 text-green-500" />
    if (['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css'].includes(ext || ''))
      return <FileCode className="w-5 h-5 text-purple-500" />

    return <File className="w-5 h-5 text-gray-500" />
  }

  const pathSegments = currentPath.split('/').filter(Boolean)

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header with breadcrumbs */}
      <div className="border-b border-gray-200 p-4">
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Markdown File
          </button>
        </div>
      </div>

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg m-4 p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        {uploading ? (
          <p className="text-gray-600">Uploading files...</p>
        ) : isDragActive ? (
          <p className="text-blue-600">Drop files here...</p>
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
          <div className="text-center py-8 text-gray-500">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            This folder is empty. Upload some files or create a new document!
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((item) => (
              <button
                key={item.path}
                onClick={() => handleItemClick(item)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                {item.type === 'dir' ? (
                  <Folder className="w-5 h-5 text-yellow-500" />
                ) : (
                  getFileIcon(item.name)
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  {item.size !== undefined && (
                    <p className="text-xs text-gray-500">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Markdown File</h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="document-name.md"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
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
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewFile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
