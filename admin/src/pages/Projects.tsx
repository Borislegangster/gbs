"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  MapPinIcon,
  BuildingIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  XIcon,
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { apiService } from "../services/api"
import { useNotification } from "../contexts/NotificationContext"

interface Project {
  id: string
  title: string
  slug: string
  description: string
  category: string
  status: "ongoing" | "completed" | "paused" | "planning"
  progress: number
  location: string
  start_date: string
  end_date: string
  budget: number
  team_size: number
  client_name: string
  featured_image: string
  gallery: string[]
  specifications: {
    surface: string
    duration: string
  }
  milestones: Array<{
    title: string
    date: string
    completed: boolean
  }>
  featured: boolean
  published: boolean
  created_at: string
  updated_at: string
}

interface ProjectFormData {
  title: string
  description: string
  category: string
  status: "ongoing" | "completed" | "paused" | "planning"
  progress: number
  location: string
  start_date: string
  end_date: string
  budget: number
  team_size: number
  client_name: string
  featured_image: string
  gallery: string[]
  specifications: {
    surface: string
    duration: string
  }
  milestones: Array<{
    title: string
    date: string
    completed: boolean
  }>
  featured: boolean
  published: boolean
}

const categories = ["Résidentiel", "Commercial", "Industriel", "Institutionnel", "Médical"]

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { addNotification } = useNotification()

  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    category: "Résidentiel",
    status: "planning",
    progress: 0,
    location: "",
    start_date: "",
    end_date: "",
    budget: 0,
    team_size: 1,
    client_name: "",
    featured_image: "",
    gallery: [],
    specifications: {
      surface: "",
      duration: "",
    },
    milestones: [],
    featured: false,
    published: false,
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const response = await apiService.getProjects()
      if (response.success) {
        setProjects(response.data || [])
      } else {
        addNotification("Erreur lors du chargement des projets", "error")
      }
    } catch (error: any) {
      console.error("Failed to load projects:", error)
      addNotification(error.message || "Erreur lors du chargement des projets", "error")
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || project.category === categoryFilter
    const matchesStatus = statusFilter === "all" || project.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleCreateProject = () => {
    setEditingProject(null)
    setFormData({
      title: "",
      description: "",
      category: "Résidentiel",
      status: "planning",
      progress: 0,
      location: "",
      start_date: "",
      end_date: "",
      budget: 0,
      team_size: 1,
      client_name: "",
      featured_image: "",
      gallery: [],
      specifications: {
        surface: "",
        duration: "",
      },
      milestones: [],
      featured: false,
      published: false,
    })
    setShowModal(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      description: project.description,
      category: project.category,
      status: project.status,
      progress: project.progress,
      location: project.location,
      start_date: project.start_date,
      end_date: project.end_date,
      budget: project.budget,
      team_size: project.team_size,
      client_name: project.client_name,
      featured_image: project.featured_image,
      gallery: project.gallery || [],
      specifications: project.specifications || { surface: "", duration: "" },
      milestones: project.milestones || [],
      featured: project.featured,
      published: project.published,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (submitting) return

    try {
      setSubmitting(true)

      if (editingProject) {
        const response = await apiService.updateProject(editingProject.id, formData)
        if (response.success) {
          addNotification("Projet mis à jour avec succès", "success")
        } else {
          addNotification(response.message || "Erreur lors de la mise à jour", "error")
        }
      } else {
        const response = await apiService.createProject(formData)
        if (response.success) {
          addNotification("Projet créé avec succès", "success")
        } else {
          addNotification(response.message || "Erreur lors de la création", "error")
        }
      }

      await loadProjects()
      setShowModal(false)
    } catch (error: any) {
      console.error("Failed to save project:", error)
      addNotification(error.message || "Erreur lors de l'enregistrement", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) return

    try {
      const response = await apiService.deleteProject(projectId)
      if (response.success) {
        addNotification("Projet supprimé avec succès", "success")
        await loadProjects()
      } else {
        addNotification(response.message || "Erreur lors de la suppression", "error")
      }
    } catch (error: any) {
      console.error("Failed to delete project:", error)
      addNotification(error.message || "Erreur lors de la suppression", "error")
    }
  }

  const handleToggleStatus = async (projectId: string) => {
    try {
      const response = await apiService.toggleProjectStatus(projectId)
      if (response.success) {
        addNotification(response.message || "Statut mis à jour", "success")
        await loadProjects()
      } else {
        addNotification(response.message || "Erreur lors du changement de statut", "error")
      }
    } catch (error: any) {
      console.error("Failed to toggle project status:", error)
      addNotification(error.message || "Erreur lors du changement de statut", "error")
    }
  }

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { title: "", date: "", completed: false }],
    })
  }

  const removeMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index),
    })
  }

  const updateMilestone = (index: number, field: string, value: any) => {
    const updatedMilestones = [...formData.milestones]
    updatedMilestones[index] = { ...updatedMilestones[index], [field]: value }
    setFormData({ ...formData, milestones: updatedMilestones })
  }

  const addGalleryImage = () => {
    setFormData({
      ...formData,
      gallery: [...formData.gallery, ""],
    })
  }

  const removeGalleryImage = (index: number) => {
    setFormData({
      ...formData,
      gallery: formData.gallery.filter((_, i) => i !== index),
    })
  }

  const updateGalleryImage = (index: number, value: string) => {
    const updatedGallery = [...formData.gallery]
    updatedGallery[index] = value
    setFormData({ ...formData, gallery: updatedGallery })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "planning":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ongoing":
        return <ClockIcon className="w-4 h-4" />
      case "completed":
        return <CheckCircleIcon className="w-4 h-4" />
      case "paused":
        return <ClockIcon className="w-4 h-4" />
      case "planning":
        return <CalendarIcon className="w-4 h-4" />
      default:
        return <ClockIcon className="w-4 h-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des projets</h1>
          <p className="text-gray-600">Gérez vos projets de construction</p>
        </div>
        <Button onClick={handleCreateProject} variant="primary">
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouveau projet
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <select className="input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="planning">Planification</option>
            <option value="ongoing">En cours</option>
            <option value="paused">En pause</option>
            <option value="completed">Terminé</option>
          </select>

          <Button variant="ghost">
            <FilterIcon className="w-4 h-4 mr-2" />
            Filtres avancés
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={project.featured_image || "/placeholder.svg?height=200&width=300"}
                alt={project.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                }}
              />
              <div className="absolute top-4 right-4">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                >
                  {getStatusIcon(project.status)}
                  <span className="ml-1">
                    {project.status === "ongoing"
                      ? "En cours"
                      : project.status === "completed"
                        ? "Terminé"
                        : project.status === "paused"
                          ? "En pause"
                          : "Planification"}
                  </span>
                </span>
              </div>
              <div className="absolute top-4 left-4">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    project.published ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {project.published ? "Publié" : "Brouillon"}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{project.title}</h3>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  {project.location || "Non spécifié"}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <BuildingIcon className="w-4 h-4 mr-2" />
                  {project.category}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <UsersIcon className="w-4 h-4 mr-2" />
                  {project.team_size} personnes
                </div>
                {project.start_date && project.end_date && (
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {formatDate(project.start_date)} - {formatDate(project.end_date)}
                  </div>
                )}
              </div>

              {project.status === "ongoing" && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progression</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-900">
                  {project.budget ? formatCurrency(project.budget) : "Budget non défini"}
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(project.id)}
                    title={project.published ? "Dépublier" : "Publier"}
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditProject(project)}>
                    <EditIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)}>
                    <TrashIcon className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingProject ? "Modifier le projet" : "Nouveau projet"}</h2>
              <Button variant="ghost" onClick={() => setShowModal(false)}>
                <XIcon className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre du projet</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    className="input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="planning">Planification</option>
                    <option value="ongoing">En cours</option>
                    <option value="paused">En pause</option>
                    <option value="completed">Terminé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget (€)</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taille de l'équipe</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={formData.team_size}
                    onChange={(e) => setFormData({ ...formData, team_size: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progression (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="input"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surface</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.specifications.surface}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specifications: { ...formData.specifications, surface: e.target.value },
                      })
                    }
                    placeholder="ex: 25,000 m²"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.specifications.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specifications: { ...formData.specifications, duration: e.target.value },
                      })
                    }
                    placeholder="ex: 15 mois"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image principale (URL)</label>
                  <input
                    type="url"
                    className="input"
                    value={formData.featured_image}
                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                {/* Gallery */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Galerie d'images</label>
                  <div className="space-y-2">
                    {formData.gallery.map((image, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="url"
                          className="input flex-1"
                          value={image}
                          onChange={(e) => updateGalleryImage(index, e.target.value)}
                          placeholder="URL de l'image"
                        />
                        <Button type="button" variant="ghost" onClick={() => removeGalleryImage(index)}>
                          <XIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="ghost" onClick={addGalleryImage}>
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Ajouter une image
                    </Button>
                  </div>
                </div>

                {/* Milestones */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Étapes du projet</label>
                  <div className="space-y-3">
                    {formData.milestones.map((milestone, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border rounded">
                        <input
                          type="text"
                          className="input"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, "title", e.target.value)}
                          placeholder="Titre de l'étape"
                        />
                        <input
                          type="date"
                          className="input"
                          value={milestone.date}
                          onChange={(e) => updateMilestone(index, "date", e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={milestone.completed}
                              onChange={(e) => updateMilestone(index, "completed", e.target.checked)}
                              className="mr-2"
                            />
                            Terminé
                          </label>
                          <Button type="button" variant="ghost" onClick={() => removeMilestone(index)}>
                            <XIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="ghost" onClick={addMilestone}>
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Ajouter une étape
                    </Button>
                  </div>
                </div>

                {/* Options */}
                <div className="md:col-span-2">
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="mr-2"
                      />
                      Projet mis en avant
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.published}
                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                        className="mr-2"
                      />
                      Publier le projet
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? "Enregistrement..." : editingProject ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
