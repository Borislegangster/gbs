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
  ToggleLeftIcon,
  ToggleRightIcon,
  ImageIcon,
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { apiService } from "../services/api"
import { useNotification } from "../contexts/NotificationContext"

interface Service {
  id: string
  title: string
  description: string
  longDescription: string
  category: string
  icon: string
  image: string
  gallery: string[]
  features: string[]
  process: Array<{
    title: string
    description: string
  }>
  faq: Array<{
    question: string
    answer: string
  }>
  price: number
  duration: string
  status: "active" | "inactive"
  featured: boolean
  published: boolean
  created_at: string
  updated_at: string
}

interface ServiceFormData {
  title: string
  description: string
  longDescription: string
  category: string
  icon: string
  image: string
  gallery: string[]
  features: string[]
  process: Array<{
    title: string
    description: string
  }>
  faq: Array<{
    question: string
    answer: string
  }>
  price: number
  duration: string
  status: "active" | "inactive"
  featured: boolean
  published: boolean
}

const categories = ["Construction", "Rénovation", "Études et Conception", "Consultation"]

const iconOptions = [
  "HomeIcon",
  "BuildingIcon",
  "WrenchIcon",
  "HardHatIcon",
  "HammerIcon",
  "RulerIcon",
  "PaintBucketIcon",
  "PencilIcon",
]

export function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { addNotification } = useNotification()

  const [formData, setFormData] = useState<ServiceFormData>({
    title: "",
    description: "",
    longDescription: "",
    category: "Construction",
    icon: "HomeIcon",
    image: "",
    gallery: [],
    features: [""],
    process: [{ title: "", description: "" }],
    faq: [{ question: "", answer: "" }],
    price: 0,
    duration: "",
    status: "active",
    featured: false,
    published: true,
  })

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      const response = await apiService.getServices()
      if (response.success) {
        // CORRECTION : Accéder directement aux services
        setServices(response.data.services || response.data || [])
      } else {
        addNotification("Erreur lors du chargement des services", "error")
      }
    } catch (error: any) {
      console.error("Failed to load services:", error)
      addNotification(error.message || "Erreur lors du chargement des services", "error")
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter
    const matchesStatus = statusFilter === "all" || service.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleCreateService = () => {
    setEditingService(null)
    setFormData({
      title: "",
      description: "",
      longDescription: "",
      category: "Construction",
      icon: "HomeIcon",
      image: "",
      gallery: [],
      features: [""],
      process: [{ title: "", description: "" }],
      faq: [{ question: "", answer: "" }],
      price: 0,
      duration: "",
      status: "active",
      featured: false,
      published: true,
    })
    setShowModal(true)
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setFormData({
      title: service.title,
      description: service.description,
      longDescription: service.longDescription || "",
      category: service.category,
      icon: service.icon || "HomeIcon",
      image: service.image || "",
      gallery: service.gallery || [],
      features: service.features || [""],
      process: service.process || [{ title: "", description: "" }],
      faq: service.faq || [{ question: "", answer: "" }],
      price: service.price || 0,
      duration: service.duration || "",
      status: service.status,
      featured: service.featured || false,
      published: service.published || true,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    try {
      setSubmitting(true)

      // Nettoyer les données
      const cleanedData = {
        ...formData,
        features: formData.features.filter((f) => f.trim() !== ""),
        process: formData.process.filter((p) => p.title.trim() !== "" || p.description.trim() !== ""),
        faq: formData.faq.filter((f) => f.question.trim() !== "" || f.answer.trim() !== ""),
        gallery: formData.gallery.filter((g) => g.trim() !== ""),
      }

      let response
      if (editingService) {
        response = await apiService.updateService(editingService.id, cleanedData)
        addNotification("Service mis à jour avec succès", "success")
      } else {
        response = await apiService.createService(cleanedData)
        addNotification("Service créé avec succès", "success")
      }

      if (response.success) {
        await loadServices()
        setShowModal(false)
      }
    } catch (error: any) {
      console.error("Failed to save service:", error)
      addNotification(error.message || "Erreur lors de la sauvegarde", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (serviceId: string) => {
    try {
      const response = await apiService.updateService(serviceId, {
        status: services.find((s) => s.id === serviceId)?.status === "active" ? "inactive" : "active",
      })

      if (response.success) {
        addNotification("Statut mis à jour avec succès", "success")
        await loadServices()
      }
    } catch (error: any) {
      console.error("Failed to toggle service status:", error)
      addNotification(error.message || "Erreur lors du changement de statut", "error")
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) return

    try {
      const response = await apiService.deleteService(serviceId)
      if (response.success) {
        addNotification("Service supprimé avec succès", "success")
        await loadServices()
      }
    } catch (error: any) {
      console.error("Failed to delete service:", error)
      addNotification(error.message || "Erreur lors de la suppression", "error")
    }
  }

  // Fonctions pour gérer les champs dynamiques
  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] })
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({ ...formData, features: newFeatures })
  }

  const addProcessStep = () => {
    setFormData({
      ...formData,
      process: [...formData.process, { title: "", description: "" }],
    })
  }

  const removeProcessStep = (index: number) => {
    setFormData({
      ...formData,
      process: formData.process.filter((_, i) => i !== index),
    })
  }

  const updateProcessStep = (index: number, field: "title" | "description", value: string) => {
    const newProcess = [...formData.process]
    newProcess[index][field] = value
    setFormData({ ...formData, process: newProcess })
  }

  const addFAQItem = () => {
    setFormData({
      ...formData,
      faq: [...formData.faq, { question: "", answer: "" }],
    })
  }

  const removeFAQItem = (index: number) => {
    setFormData({
      ...formData,
      faq: formData.faq.filter((_, i) => i !== index),
    })
  }

  const updateFAQItem = (index: number, field: "question" | "answer", value: string) => {
    const newFAQ = [...formData.faq]
    newFAQ[index][field] = value
    setFormData({ ...formData, faq: newFAQ })
  }

  const addGalleryImage = () => {
    setFormData({ ...formData, gallery: [...formData.gallery, ""] })
  }

  const removeGalleryImage = (index: number) => {
    setFormData({
      ...formData,
      gallery: formData.gallery.filter((_, i) => i !== index),
    })
  }

  const updateGalleryImage = (index: number, value: string) => {
    const newGallery = [...formData.gallery]
    newGallery[index] = value
    setFormData({ ...formData, gallery: newGallery })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des services</h1>
          <p className="text-gray-600">Gérez vos prestations de services</p>
        </div>
        <Button onClick={handleCreateService} variant="primary">
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouveau service
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
              className="input pl-10"
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
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>

          <Button variant="ghost">
            <FilterIcon className="w-4 h-4 mr-2" />
            Filtres avancés
          </Button>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {service.image ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={service.image || "/placeholder.svg"}
                            alt={service.title}
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                              e.currentTarget.nextElementSibling?.classList.remove("hidden")
                            }}
                          />
                        ) : null}
                        <div
                          className={`h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center ${
                            service.image ? "hidden" : ""
                          }`}
                        >
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{service.title}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{service.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {service.price ? formatCurrency(service.price) : "Sur devis"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.duration || "Variable"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => handleToggleStatus(service.id)}>
                      {service.status === "active" ? (
                        <ToggleRightIcon className="w-6 h-6 text-green-600" />
                      ) : (
                        <ToggleLeftIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditService(service)}>
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteService(service.id)}>
                        <TrashIcon className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingService ? "Modifier le service" : "Nouveau service"}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icône</label>
                  <select
                    className="input"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
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
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="ex: 8-12 mois"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="mr-2"
                    />
                    Service vedette
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="mr-2"
                    />
                    Publié
                  </label>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description courte *</label>
                  <textarea
                    className="input"
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description détaillée</label>
                  <textarea
                    className="input"
                    rows={4}
                    value={formData.longDescription}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                  />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image principale (URL)</label>
                  <input
                    type="url"
                    className="input"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Galerie d'images</label>
                  {formData.gallery.map((image, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="url"
                        className="input flex-1"
                        value={image}
                        onChange={(e) => updateGalleryImage(index, e.target.value)}
                        placeholder="URL de l'image..."
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeGalleryImage(index)}>
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="ghost" onClick={addGalleryImage}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Ajouter une image
                  </Button>
                </div>
              </div>

              {/* Caractéristiques */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caractéristiques</label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      className="input flex-1"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Caractéristique..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      disabled={formData.features.length === 1}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="ghost" onClick={addFeature}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Ajouter une caractéristique
                </Button>
              </div>

              {/* Processus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Processus de travail</label>
                {formData.process.map((step, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Étape {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProcessStep(index)}
                        disabled={formData.process.length === 1}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        className="input"
                        value={step.title}
                        onChange={(e) => updateProcessStep(index, "title", e.target.value)}
                        placeholder="Titre de l'étape..."
                      />
                      <textarea
                        className="input"
                        value={step.description}
                        onChange={(e) => updateProcessStep(index, "description", e.target.value)}
                        placeholder="Description de l'étape..."
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="ghost" onClick={addProcessStep}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Ajouter une étape
                </Button>
              </div>

              {/* FAQ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Questions fréquentes</label>
                {formData.faq.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">FAQ {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFAQItem(index)}
                        disabled={formData.faq.length === 1}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        className="input"
                        value={item.question}
                        onChange={(e) => updateFAQItem(index, "question", e.target.value)}
                        placeholder="Question..."
                      />
                      <textarea
                        className="input"
                        value={item.answer}
                        onChange={(e) => updateFAQItem(index, "answer", e.target.value)}
                        placeholder="Réponse..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="ghost" onClick={addFAQItem}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Ajouter une FAQ
                </Button>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)} disabled={submitting}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? "Sauvegarde..." : editingService ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
