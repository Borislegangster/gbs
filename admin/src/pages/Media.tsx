"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  SearchIcon,
  FilterIcon,
  TrashIcon,
  DownloadIcon,
  EyeIcon,
  UploadIcon,
  ImageIcon,
  FileIcon,
  VideoIcon,
  FolderIcon,
  GridIcon,
  ListIcon,
  EditIcon,
  PlusIcon,
  ArrowLeftIcon,
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { apiService } from "../services/api"
import { useNotification } from "../contexts/NotificationContext"

interface MediaFile {
  id: string
  name: string
  original_name: string
  type: "image" | "video" | "document" | "other"
  mime_type: string
  size: number
  url: string
  thumbnail_url?: string
  folder_id: string | null
  alt_text: string
  description: string
  uploaded_by: string
  created_at: string
  updated_at: string
}

interface MediaFolder {
  id: string
  name: string
  parent_id: string | null
  files_count: number
  created_at: string
  created_by: string
}

interface MediaStats {
  total_files: number
  total_size: number
  files_by_type: {
    image: number
    video: number
    document: number
    other: number
  }
}

export function Media() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [stats, setStats] = useState<MediaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [currentFolder, setCurrentFolder] = useState<string>("root")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [newFolderName, setNewFolderName] = useState("")
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const { success, error, warning, info } = useNotification()

  useEffect(() => {
    loadMedia()
    loadStats()
  }, [currentFolder])

  const loadMedia = async () => {
    try {
      setLoading(true)
      const [filesResponse, foldersResponse] = await Promise.all([
        apiService.getMediaFiles(currentFolder === "root" ? undefined : currentFolder),
        apiService.getMediaFolders(),
      ])
      setFiles(filesResponse.files || [])
      setFolders(foldersResponse.folders || [])
      info("Médias chargés", `${filesResponse.files?.length || 0} fichiers trouvés`)
    } catch (err: any) {
      console.error("Failed to load media:", err)
      error("Erreur de chargement", err.message || "Impossible de charger les médias")
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsResponse = await apiService.getMediaStats()
      setStats(statsResponse)
    } catch (err: any) {
      console.error("Failed to load stats:", err)
    }
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.original_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || file.type === typeFilter
    return matchesSearch && matchesType
  })

  const currentFolderData = folders.find((f) => f.id === currentFolder)
  const subFolders = folders.filter((f) => f.parent_id === (currentFolder === "root" ? null : currentFolder))

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files
    if (uploadedFiles && uploadedFiles.length > 0) {
      try {
        setIsUploading(true)
        setUploadProgress(0)

        const formData = new FormData()
        Array.from(uploadedFiles).forEach((file) => {
          formData.append("files", file)
        })
        formData.append("folder_id", currentFolder === "root" ? "" : currentFolder)

        // Simulation du progrès d'upload
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90))
        }, 200)

        const response = await apiService.uploadMediaFiles(formData)

        clearInterval(progressInterval)
        setUploadProgress(100)

        await loadMedia()
        await loadStats()
        setShowUploadModal(false)
        setUploadProgress(0)

        success("Upload réussi", `${uploadedFiles.length} fichier(s) téléchargé(s) avec succès`)
      } catch (err: any) {
        console.error("Failed to upload files:", err)
        error("Erreur d'upload", err.message || "Impossible de télécharger les fichiers")
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    }
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newFolderName.trim()) {
      try {
        await apiService.createMediaFolder({
          name: newFolderName.trim(),
          parent_id: currentFolder === "root" ? undefined : currentFolder,
        })
        await loadMedia()
        setNewFolderName("")
        setShowFolderModal(false)
        success("Dossier créé", `Le dossier "${newFolderName}" a été créé avec succès`)
      } catch (err: any) {
        console.error("Failed to create folder:", err)
        error("Erreur de création", err.message || "Impossible de créer le dossier")
      }
    }
  }

  const handleDeleteFiles = async () => {
    if (selectedFiles.length > 0) {
      const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedFiles.length} fichier(s) ?`)
      if (confirmed) {
        try {
          await Promise.all(selectedFiles.map((fileId) => apiService.deleteMediaFile(fileId)))
          await loadMedia()
          await loadStats()
          setSelectedFiles([])
          success("Suppression réussie", `${selectedFiles.length} fichier(s) supprimé(s)`)
        } catch (err: any) {
          console.error("Failed to delete files:", err)
          error("Erreur de suppression", err.message || "Impossible de supprimer les fichiers")
        }
      }
    }
  }

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le dossier "${folderName}" et tout son contenu ?`,
    )
    if (confirmed) {
      try {
        await apiService.deleteMediaFolder(folderId)
        await loadMedia()
        success("Dossier supprimé", `Le dossier "${folderName}" a été supprimé`)
      } catch (err: any) {
        console.error("Failed to delete folder:", err)
        error("Erreur de suppression", err.message || "Impossible de supprimer le dossier")
      }
    }
  }

  const handleEditFile = (file: MediaFile) => {
    setEditingFile(file)
    setShowEditModal(true)
  }

  const handleUpdateFile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingFile) {
      try {
        await apiService.updateMediaFile(editingFile.id, {
          name: editingFile.name,
          alt_text: editingFile.alt_text,
          description: editingFile.description,
        })
        await loadMedia()
        setShowEditModal(false)
        setEditingFile(null)
        success("Fichier mis à jour", "Les informations du fichier ont été mises à jour")
      } catch (err: any) {
        console.error("Failed to update file:", err)
        error("Erreur de mise à jour", err.message || "Impossible de mettre à jour le fichier")
      }
    }
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-5 h-5" />
      case "video":
        return <VideoIcon className="w-5 h-5" />
      default:
        return <FileIcon className="w-5 h-5" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCurrentFolderName = () => {
    if (currentFolder === "root") return "Racine"
    const folder = folders.find((f) => f.id === currentFolder)
    return folder ? folder.name : "Dossier"
  }

  const getBreadcrumbs = () => {
    const breadcrumbs = [{ id: "root", name: "Racine" }]
    if (currentFolder !== "root" && currentFolderData) {
      // Construire le chemin complet
      let folder = currentFolderData
      const path = [folder]
      while (folder.parent_id) {
        folder = folders.find((f) => f.id === folder.parent_id)!
        if (folder) path.unshift(folder)
      }
      breadcrumbs.push(...path)
    }
    return breadcrumbs
  }

  const downloadFile = (file: MediaFile) => {
    const link = document.createElement("a")
    link.href = file.url
    link.download = file.original_name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    info("Téléchargement", `Téléchargement de "${file.original_name}" démarré`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Médiathèque</h1>
          <p className="text-gray-600">Gérez vos fichiers et médias</p>
          {stats && (
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>{stats.total_files} fichiers</span>
              <span>{formatFileSize(stats.total_size)}</span>
              <span>{stats.files_by_type.image} images</span>
              <span>{stats.files_by_type.video} vidéos</span>
              <span>{stats.files_by_type.document} documents</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowFolderModal(true)} variant="ghost">
            <PlusIcon className="w-4 h-4 mr-2" />
            Nouveau dossier
          </Button>
          <Button onClick={() => setShowUploadModal(true)} variant="primary">
            <UploadIcon className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        {getBreadcrumbs().map((crumb, index) => (
          <div key={crumb.id} className="flex items-center">
            {index > 0 && <span className="mx-2">/</span>}
            <button
              onClick={() => setCurrentFolder(crumb.id)}
              className={`hover:text-primary ${crumb.id === currentFolder ? "font-medium text-primary" : ""}`}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">Tous les types</option>
              <option value="image">Images</option>
              <option value="video">Vidéos</option>
              <option value="document">Documents</option>
              <option value="other">Autres</option>
            </select>

            <Button variant="ghost">
              <FilterIcon className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {selectedFiles.length > 0 && (
              <Button onClick={handleDeleteFiles} variant="danger" size="sm">
                <TrashIcon className="w-4 h-4 mr-2" />
                Supprimer ({selectedFiles.length})
              </Button>
            )}

            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-primary text-white" : "text-gray-600"}`}
              >
                <GridIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-primary text-white" : "text-gray-600"}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Folders */}
        {subFolders.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dossiers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {subFolders.map((folder) => (
                <div key={folder.id} className="relative group">
                  <button
                    onClick={() => setCurrentFolder(folder.id)}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-blue-50 transition w-full"
                  >
                    <FolderIcon className="w-8 h-8 text-blue-500 mb-2" />
                    <span className="text-sm font-medium text-gray-900 truncate w-full text-center">{folder.name}</span>
                    <span className="text-xs text-gray-500">{folder.files_count} fichiers</span>
                  </button>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteFolder(folder.id, folder.name)
                      }}
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Fichiers ({filteredFiles.length})</h3>
            {currentFolder !== "root" && (
              <Button onClick={() => setCurrentFolder("root")} variant="ghost" size="sm">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Retour
              </Button>
            )}
          </div>

          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun fichier</h3>
              <p className="text-gray-500">Commencez par télécharger des fichiers</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`relative group rounded-lg border-2 transition cursor-pointer ${
                    selectedFiles.includes(file.id)
                      ? "border-primary bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => toggleFileSelection(file.id)}
                >
                  <div className="aspect-square p-2">
                    {file.type === "image" ? (
                      <img
                        src={file.thumbnail_url || file.url}
                        alt={file.alt_text || file.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-900 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(file.url, "_blank")
                        }}
                        className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        title="Voir"
                      >
                        <EyeIcon className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadFile(file)
                        }}
                        className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                        title="Télécharger"
                      >
                        <DownloadIcon className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditFile(file)
                        }}
                        className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        title="Modifier"
                      >
                        <EditIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFiles(filteredFiles.map((f) => f.id))
                          } else {
                            setSelectedFiles([])
                          }
                        }}
                        checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fichier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taille
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => toggleFileSelection(file.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {file.type === "image" ? (
                              <img
                                className="h-10 w-10 rounded object-cover"
                                src={file.thumbnail_url || file.url}
                                alt={file.alt_text || file.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                                {getFileIcon(file.type)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                            <div className="text-sm text-gray-500">{file.original_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {file.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFileSize(file.size)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(file.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(file.url, "_blank")}
                            className="text-blue-600 hover:text-blue-900"
                            title="Voir"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadFile(file)}
                            className="text-green-600 hover:text-green-900"
                            title="Télécharger"
                          >
                            <DownloadIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditFile(file)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Modifier"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFiles([file.id])
                              handleDeleteFiles()
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Télécharger des fichiers</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Glissez-déposez vos fichiers ici ou cliquez pour sélectionner</p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className={`btn btn-primary cursor-pointer ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isUploading ? "Upload en cours..." : "Sélectionner des fichiers"}
              </label>
              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{uploadProgress}%</p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button type="button" variant="ghost" onClick={() => setShowUploadModal(false)} disabled={isUploading}>
                {isUploading ? "Fermer après upload" : "Annuler"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Créer un dossier</h2>
            <form onSubmit={handleCreateFolder}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du dossier</label>
                <input
                  type="text"
                  className="input"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nom du dossier"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="ghost" onClick={() => setShowFolderModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  Créer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit File Modal */}
      {showEditModal && editingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Modifier le fichier</h2>
            <form onSubmit={handleUpdateFile}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fichier</label>
                <input
                  type="text"
                  className="input"
                  value={editingFile.name}
                  onChange={(e) => setEditingFile({ ...editingFile, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Texte alternatif</label>
                <input
                  type="text"
                  className="input"
                  value={editingFile.alt_text || ""}
                  onChange={(e) => setEditingFile({ ...editingFile, alt_text: e.target.value })}
                  placeholder="Description pour l'accessibilité"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="input"
                  rows={3}
                  value={editingFile.description || ""}
                  onChange={(e) => setEditingFile({ ...editingFile, description: e.target.value })}
                  placeholder="Description du fichier"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingFile(null)
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  Sauvegarder
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
