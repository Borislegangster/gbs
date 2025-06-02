"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  TrashIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { apiService } from "@/lib/api"

interface Testimonial {
  id: string
  name: string
  position: string
  company: string
  avatar: string
  content: string
  rating: number
  status: "pending" | "approved" | "rejected"
  featured: boolean
  created_at: string
  updated_at: string
}

interface TestimonialFormData {
  name: string
  position: string
  company: string
  avatar: string
  content: string
  rating: number
  status: "pending" | "approved" | "rejected"
  featured: boolean
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showModal, setShowModal] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState<TestimonialFormData>({
    name: "",
    position: "",
    company: "",
    avatar: "",
    content: "",
    rating: 5,
    status: "pending",
    featured: false,
  })

  useEffect(() => {
    loadTestimonials()
  }, [])

  const loadTestimonials = async () => {
    try {
      setLoading(true)
      const response = await apiService.getTestimonials()
      setTestimonials(response.testimonials || [])
    } catch (error) {
      console.error("Failed to load testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTestimonials = testimonials.filter((testimonial) => {
    const matchesSearch =
      testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || testimonial.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleCreateTestimonial = () => {
    setEditingTestimonial(null)
    setFormData({
      name: "",
      position: "",
      company: "",
      avatar: "",
      content: "",
      rating: 5,
      status: "pending",
      featured: false,
    })
    setShowModal(true)
  }

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      name: testimonial.name,
      position: testimonial.position,
      company: testimonial.company,
      avatar: testimonial.avatar,
      content: testimonial.content,
      rating: testimonial.rating,
      status: testimonial.status,
      featured: testimonial.featured,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTestimonial) {
        await apiService.updateTestimonial(editingTestimonial.id, formData)
      } else {
        await apiService.createTestimonial(formData)
      }
      await loadTestimonials()
      setShowModal(false)
    } catch (error) {
      console.error("Failed to save testimonial:", error)
    }
  }

  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce témoignage ?")) {
      try {
        await apiService.deleteTestimonial(testimonialId)
        await loadTestimonials()
      } catch (error) {
        console.error("Failed to delete testimonial:", error)
      }
    }
  }

  const handleToggleFeatured = async (testimonialId: string) => {
    try {
      const testimonial = testimonials.find((t) => t.id === testimonialId)
      if (testimonial) {
        await apiService.updateTestimonial(testimonialId, { featured: !testimonial.featured })
        await loadTestimonials()
      }
    } catch (error) {
      console.error("Failed to toggle featured status:", error)
    }
  }

  const handleUpdateStatus = async (testimonialId: string, status: "pending" | "approved" | "rejected") => {
    try {
      await apiService.updateTestimonial(testimonialId, { status })
      await loadTestimonials()
    } catch (error) {
      console.error("Failed to update testimonial status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Approuvé"
      case "pending":
        return "En attente"
      case "rejected":
        return "Rejeté"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <StarIcon key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
      ))
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
          <h1 className="text-2xl font-bold text-gray-900">Témoignages</h1>
          <p className="text-gray-600">Gérez les témoignages clients</p>
        </div>
        <Button onClick={handleCreateTestimonial} variant="primary">
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouveau témoignage
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="approved">Approuvés</option>
            <option value="pending">En attente</option>
            <option value="rejected">Rejetés</option>
          </select>

          <Button variant="ghost">
            <FilterIcon className="w-4 h-4 mr-2" />
            Filtres avancés
          </Button>
        </div>
      </div>

      {/* Testimonials Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Témoignage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
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
              {filteredTestimonials.map((testimonial) => (
                <tr key={testimonial.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {testimonial.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={testimonial.avatar || "/placeholder.svg"}
                            alt={testimonial.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                            {testimonial.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">
                          {testimonial.position}
                          {testimonial.company && ` - ${testimonial.company}`}
                        </div>
                        {testimonial.featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            À la une
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{testimonial.content}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">{renderStars(testimonial.rating)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(testimonial.status)}`}
                    >
                      {getStatusText(testimonial.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(testimonial.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {testimonial.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(testimonial.id, "approved")}
                          >
                            <CheckCircleIcon className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(testimonial.id, "rejected")}
                          >
                            <XCircleIcon className="w-4 h-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleToggleFeatured(testimonial.id)}>
                        <StarIcon
                          className={`w-4 h-4 ${
                            testimonial.featured ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
                          }`}
                        />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditTestimonial(testimonial)}>
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTestimonial(testimonial.id)}>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTestimonial ? "Modifier le témoignage" : "Nouveau témoignage"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avatar (URL)</label>
                  <input
                    type="url"
                    className="input"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Témoignage</label>
                  <textarea
                    className="input"
                    rows={4}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="focus:outline-none"
                      >
                        <StarIcon
                          className={`w-6 h-6 ${
                            star <= formData.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="pending">En attente</option>
                    <option value="approved">Approuvé</option>
                    <option value="rejected">Rejeté</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Mettre à la une</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  {editingTestimonial ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
