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
  EyeOffIcon,
  GripIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ImageIcon,
  VideoIcon,
  SaveIcon,
  XIcon,
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { apiService } from "../services/api"
import { useNotification } from "../contexts/NotificationContext"

interface HomeContentItem {
  id: number
  section: string
  title?: string
  subtitle?: string
  description?: string
  content?: string
  background_image?: string
  featured_image?: string
  video_id?: string
  video_url?: string
  cta_text?: string
  cta_url?: string
  secondary_cta_text?: string
  secondary_cta_url?: string
  button_text?: string
  button_url?: string
  placeholder_text?: string
  projects_completed?: number
  years_experience?: number
  happy_clients?: number
  team_members?: number
  images?: string[]
  features?: Array<{
    icon: string
    title: string
    description: string
    link_text?: string
    link_url?: string
  }>
  gallery?: string[]
  order_index: number
  is_active: boolean
  metadata?: any
  created_at: string
  updated_at: string
}

interface HomeContentFormData {
  section: string
  title: string
  subtitle: string
  description: string
  content: string
  background_image: string
  featured_image: string
  video_id: string
  video_url: string
  cta_text: string
  cta_url: string
  secondary_cta_text: string
  secondary_cta_url: string
  button_text: string
  button_url: string
  placeholder_text: string
  projects_completed: number | null
  years_experience: number | null
  happy_clients: number | null
  team_members: number | null
  images: string[]
  features: Array<{
    icon: string
    title: string
    description: string
    link_text?: string
    link_url?: string
  }>
  gallery: string[]
  is_active: boolean
  metadata: any
}

const sections = [
  { value: "hero", label: "Section Hero" },
  { value: "features", label: "Fonctionnalités" },
  { value: "experience", label: "Expérience" },
  { value: "stats", label: "Statistiques" },
  { value: "services", label: "Services" },
  { value: "projects", label: "Projets" },
  { value: "promise", label: "Promesse" },
  { value: "faq", label: "FAQ" },
  { value: "testimonials", label: "Témoignages" },
  { value: "newsletter", label: "Newsletter" },
]

const iconOptions = [
  "UserIcon",
  "AwardIcon",
  "PhoneIcon",
  "BuildingIcon",
  "ToolIcon",
  "ShieldIcon",
  "ClockIcon",
  "CheckIcon",
  "StarIcon",
  "HeartIcon",
]

export function HomeContent() {
  const [content, setContent] = useState<HomeContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sectionFilter, setSectionFilter] = useState<string>("all")
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<HomeContentItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { addNotification } = useNotification()

  const [formData, setFormData] = useState<HomeContentFormData>({
    section: "hero",
    title: "",
    subtitle: "",
    description: "",
    content: "",
    background_image: "",
    featured_image: "",
    video_id: "",
    video_url: "",
    cta_text: "",
    cta_url: "",
    secondary_cta_text: "",
    secondary_cta_url: "",
    button_text: "",
    button_url: "",
    placeholder_text: "",
    projects_completed: null,
    years_experience: null,
    happy_clients: null,
    team_members: null,
    images: [],
    features: [],
    gallery: [],
    is_active: true,
    metadata: {},
  })

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      const response = await apiService.getHomeContentAdmin()
      setContent(response.content || [])
      addNotification("Contenu chargé avec succès", "success")
    } catch (error: any) {
      console.error("Failed to load home content:", error)
      addNotification(`Erreur lors du chargement: ${error.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.section.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSection = sectionFilter === "all" || item.section === sectionFilter

    return matchesSearch && matchesSection
  })

  const resetForm = () => {
    setFormData({
      section: "hero",
      title: "",
      subtitle: "",
      description: "",
      content: "",
      background_image: "",
      featured_image: "",
      video_id: "",
      video_url: "",
      cta_text: "",
      cta_url: "",
      secondary_cta_text: "",
      secondary_cta_url: "",
      button_text: "",
      button_url: "",
      placeholder_text: "",
      projects_completed: null,
      years_experience: null,
      happy_clients: null,
      team_members: null,
      images: [],
      features: [],
      gallery: [],
      is_active: true,
      metadata: {},
    })
  }

  const handleCreateContent = () => {
    setEditingItem(null)
    resetForm()
    setShowModal(true)
  }

  const handleEditContent = (item: HomeContentItem) => {
    setEditingItem(item)
    setFormData({
      section: item.section,
      title: item.title || "",
      subtitle: item.subtitle || "",
      description: item.description || "",
      content: item.content || "",
      background_image: item.background_image || "",
      featured_image: item.featured_image || "",
      video_id: item.video_id || "",
      video_url: item.video_url || "",
      cta_text: item.cta_text || "",
      cta_url: item.cta_url || "",
      secondary_cta_text: item.secondary_cta_text || "",
      secondary_cta_url: item.secondary_cta_url || "",
      button_text: item.button_text || "",
      button_url: item.button_url || "",
      placeholder_text: item.placeholder_text || "",
      projects_completed: item.projects_completed || null,
      years_experience: item.years_experience || null,
      happy_clients: item.happy_clients || null,
      team_members: item.team_members || null,
      images: item.images || [],
      features: item.features || [],
      gallery: item.gallery || [],
      is_active: item.is_active,
      metadata: item.metadata || {},
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    try {
      setSubmitting(true)

      if (!formData.section) {
        addNotification("La section est obligatoire", "error")
        return
      }

      if (editingItem) {
        await apiService.updateHomeContent(editingItem.id, formData)
        addNotification("Contenu mis à jour avec succès", "success")
      } else {
        await apiService.createHomeContent(formData)
        addNotification("Contenu créé avec succès", "success")
      }

      await loadContent()
      setShowModal(false)
      resetForm()
    } catch (error: any) {
      console.error("Failed to save content:", error)
      addNotification(`Erreur lors de la sauvegarde: ${error.message}`, "error")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteContent = async (itemId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce contenu ?")) return

    try {
      await apiService.deleteHomeContent(itemId)
      addNotification("Contenu supprimé avec succès", "success")
      await loadContent()
    } catch (error: any) {
      console.error("Failed to delete content:", error)
      addNotification(`Erreur lors de la suppression: ${error.message}`, "error")
    }
  }

  const handleToggleActive = async (itemId: number, isActive: boolean) => {
    try {
      await apiService.updateHomeContent(itemId, { is_active: !isActive })
      addNotification(`Contenu ${!isActive ? "activé" : "désactivé"} avec succès`, "success")
      await loadContent()
    } catch (error: any) {
      console.error("Failed to toggle content:", error)
      addNotification(`Erreur lors de la modification: ${error.message}`, "error")
    }
  }

  const handleMoveContent = async (itemId: number, direction: "up" | "down") => {
    const currentIndex = content.findIndex((item) => item.id === itemId)
    if ((direction === "up" && currentIndex === 0) || (direction === "down" && currentIndex === content.length - 1)) {
      return
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const newContent = [...content]
    const [movedItem] = newContent.splice(currentIndex, 1)
    newContent.splice(newIndex, 0, movedItem)

    const reorderData = newContent.map((item, index) => ({
      id: item.id,
      order_index: index + 1,
    }))

    try {
      await apiService.reorderHomeContent(reorderData)
      addNotification("Ordre mis à jour avec succès", "success")
      await loadContent()
    } catch (error: any) {
      console.error("Failed to reorder content:", error)
      addNotification(`Erreur lors du réordonnancement: ${error.message}`, "error")
    }
  }

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { icon: "UserIcon", title: "", description: "", link_text: "", link_url: "" }],
    })
  }

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index)
    setFormData({ ...formData, features: newFeatures })
  }

  const updateFeature = (index: number, field: string, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = { ...newFeatures[index], [field]: value }
    setFormData({ ...formData, features: newFeatures })
  }

  const addImage = () => {
    setFormData({ ...formData, images: [...formData.images, ""] })
  }

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  const updateImage = (index: number, value: string) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData({ ...formData, images: newImages })
  }

  const getSectionLabel = (section: string) => {
    const sectionObj = sections.find((s) => s.value === section)
    return sectionObj ? sectionObj.label : section
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contenu de la page d'accueil</h1>
          <p className="text-gray-600">Gérez le contenu dynamique de votre page d'accueil</p>
        </div>
        <Button onClick={handleCreateContent} variant="primary" className="w-full sm:w-auto">
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouveau contenu
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 input w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className="input w-full" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
            <option value="all">Toutes les sections</option>
            {sections.map((section) => (
              <option key={section.value} value={section.value}>
                {section.label}
              </option>
            ))}
          </select>

          <Button variant="ghost" className="w-full sm:w-auto" onClick={loadContent}>
            <FilterIcon className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contenu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Aucun contenu trouvé
                  </td>
                </tr>
              ) : (
                filteredContent.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <GripIcon className="w-4 h-4 text-gray-400 cursor-move" />
                        <span className="text-sm text-gray-900">{item.order_index}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMoveContent(item.id, "up")}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={item.order_index === 1}
                          >
                            <ChevronUpIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveContent(item.id, "down")}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={item.order_index === content.length}
                          >
                            <ChevronDownIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getSectionLabel(item.section)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {item.title || "Sans titre"}
                      </div>
                      {item.subtitle && <div className="text-sm text-gray-500 max-w-xs truncate">{item.subtitle}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {item.description || item.content || "Aucun contenu"}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {item.background_image && <ImageIcon className="w-4 h-4 text-green-500" />}
                        {item.video_id && <VideoIcon className="w-4 h-4 text-red-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(item.id, item.is_active)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.is_active ? "Actif" : "Inactif"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.updated_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleToggleActive(item.id, item.is_active)}>
                          {item.is_active ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditContent(item)}>
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteContent(item.id)}>
                          <TrashIcon className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingItem ? "Modifier le contenu" : "Nouveau contenu"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                  <select
                    className="input w-full"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    required
                  >
                    {sections.map((section) => (
                      <option key={section.value} value={section.value}>
                        {section.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Contenu actif</span>
                  </label>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titre du contenu"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sous-titre</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Sous-titre du contenu"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="input w-full"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description principale"
                  />
                </div>

                {/* Champs spécifiques selon la section */}
                {(formData.section === "services" ||
                  formData.section === "projects" ||
                  formData.section === "faq" ||
                  formData.section === "testimonials") && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Texte du bouton</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={formData.cta_text}
                        onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                        placeholder="Voir plus"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL du bouton</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={formData.cta_url}
                        onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                        placeholder="/services"
                      />
                    </div>
                  </>
                )}

                {/* Section spécifique Hero */}
                {formData.section === "hero" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image de fond</label>
                      <input
                        type="url"
                        className="input w-full"
                        value={formData.background_image}
                        onChange={(e) => setFormData({ ...formData, background_image: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Texte CTA principal</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={formData.cta_text}
                        onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                        placeholder="Obtenir un devis"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL CTA principal</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={formData.cta_url}
                        onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                        placeholder="/contact"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Texte CTA secondaire</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={formData.secondary_cta_text}
                        onChange={(e) => setFormData({ ...formData, secondary_cta_text: e.target.value })}
                        placeholder="Voir nos projets"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL CTA secondaire</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={formData.secondary_cta_url}
                        onChange={(e) => setFormData({ ...formData, secondary_cta_url: e.target.value })}
                        placeholder="/projects"
                      />
                    </div>
                  </>
                )}

                {/* Section spécifique Stats */}
                {formData.section === "stats" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Projets réalisés</label>
                      <input
                        type="number"
                        className="input w-full"
                        value={formData.projects_completed || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            projects_completed: e.target.value ? Number.parseInt(e.target.value) : null,
                          })
                        }
                        placeholder="150"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Années d'expérience</label>
                      <input
                        type="number"
                        className="input w-full"
                        value={formData.years_experience || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            years_experience: e.target.value ? Number.parseInt(e.target.value) : null,
                          })
                        }
                        placeholder="15"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Clients satisfaits</label>
                      <input
                        type="number"
                        className="input w-full"
                        value={formData.happy_clients || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            happy_clients: e.target.value ? Number.parseInt(e.target.value) : null,
                          })
                        }
                        placeholder="200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Membres de l'équipe</label>
                      <input
                        type="number"
                        className="input w-full"
                        value={formData.team_members || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            team_members: e.target.value ? Number.parseInt(e.target.value) : null,
                          })
                        }
                        placeholder="25"
                      />
                    </div>
                  </>
                )}

                {/* Section spécifique Features */}
                {formData.section === "features" && (
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fonctionnalités</label>
                    <div className="space-y-4">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Fonctionnalité {index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                              className="input w-full"
                              value={feature.icon}
                              onChange={(e) => updateFeature(index, "icon", e.target.value)}
                            >
                              {iconOptions.map((icon) => (
                                <option key={icon} value={icon}>
                                  {icon}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              placeholder="Titre"
                              className="input w-full"
                              value={feature.title}
                              onChange={(e) => updateFeature(index, "title", e.target.value)}
                            />
                            <div className="md:col-span-2">
                              <textarea
                                placeholder="Description"
                                className="input w-full"
                                rows={2}
                                value={feature.description}
                                onChange={(e) => updateFeature(index, "description", e.target.value)}
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Texte du lien"
                              className="input w-full"
                              value={feature.link_text || ""}
                              onChange={(e) => updateFeature(index, "link_text", e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder="URL du lien"
                              className="input w-full"
                              value={feature.link_url || ""}
                              onChange={(e) => updateFeature(index, "link_url", e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addFeature}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600"
                      >
                        + Ajouter une fonctionnalité
                      </button>
                    </div>
                  </div>
                )}

                {/* Section spécifique Experience */}
                {formData.section === "experience" && (
                  <>
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                      <div className="space-y-2">
                        {formData.images.map((image, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="url"
                              placeholder="URL de l'image"
                              className="input flex-1"
                              value={image}
                              onChange={(e) => updateImage(index, e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XIcon className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addImage}
                          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-2 text-gray-500 hover:border-gray-400 hover:text-gray-600"
                        >
                          + Ajouter une image
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Texte du bouton</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={formData.cta_text}
                        onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                        placeholder="En savoir plus"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL du bouton</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={formData.cta_url}
                        onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                        placeholder="/about"
                      />
                    </div>
                  </>
                )}

                {/* Section spécifique Promise */}
                {formData.section === "promise" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Vidéo YouTube</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={formData.video_id}
                        onChange={(e) => setFormData({ ...formData, video_id: e.target.value })}
                        placeholder="dQw4w9WgXcQ"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image de fond</label>
                      <input
                        type="url"
                        className="input w-full"
                        value={formData.background_image}
                        onChange={(e) => setFormData({ ...formData, background_image: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Texte du bouton</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={formData.cta_text}
                        onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                        placeholder="En savoir plus"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL du bouton</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={formData.cta_url}
                        onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                        placeholder="https://youtube.com/@ameConstruction"
                      />
                    </div>
                  </>
                )}

                {/* Section spécifique Newsletter */}
                {formData.section === "newsletter" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Texte placeholder</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={formData.placeholder_text}
                        onChange={(e) => setFormData({ ...formData, placeholder_text: e.target.value })}
                        placeholder="Votre email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Texte du bouton</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={formData.button_text}
                        onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                        placeholder="S'abonner"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)} disabled={submitting}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  <SaveIcon className="w-4 h-4 mr-2" />
                  {submitting ? "Sauvegarde..." : editingItem ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
