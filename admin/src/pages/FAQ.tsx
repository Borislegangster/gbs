"use client"

import React from "react"

import { useState, useEffect } from "react"
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  GripIcon,
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { apiService } from "@/lib/api"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  order: number
  status: "published" | "draft"
  created_at: string
  updated_at: string
}

interface FAQFormData {
  question: string
  answer: string
  category: string
  status: "published" | "draft"
}

const categories = ["Général", "Services", "Projets", "Tarifs", "Délais", "Garanties"]

export function FAQ() {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null)
  const [formData, setFormData] = useState<FAQFormData>({
    question: "",
    answer: "",
    category: "Général",
    status: "published",
  })
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  useEffect(() => {
    loadFAQItems()
  }, [])

  const loadFAQItems = async () => {
    try {
      setLoading(true)
      const response = await apiService.getFAQItems()
      setFaqItems(response.faq_items || [])
    } catch (error) {
      console.error("Failed to load FAQ items:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFAQItems = faqItems.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleCreateFAQItem = () => {
    setEditingItem(null)
    setFormData({
      question: "",
      answer: "",
      category: "Général",
      status: "published",
    })
    setShowModal(true)
  }

  const handleEditFAQItem = (item: FAQItem) => {
    setEditingItem(item)
    setFormData({
      question: item.question,
      answer: item.answer,
      category: item.category,
      status: item.status,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await apiService.updateFAQItem(editingItem.id, formData)
      } else {
        await apiService.createFAQItem(formData)
      }
      await loadFAQItems()
      setShowModal(false)
    } catch (error) {
      console.error("Failed to save FAQ item:", error)
    }
  }

  const handleDeleteFAQItem = async (itemId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette FAQ ?")) {
      try {
        await apiService.deleteFAQItem(itemId)
        await loadFAQItems()
      } catch (error) {
        console.error("Failed to delete FAQ item:", error)
      }
    }
  }

  const handleMoveItem = async (itemId: string, direction: "up" | "down") => {
    try {
      await apiService.reorderFAQItem(itemId, direction)
      await loadFAQItems()
    } catch (error) {
      console.error("Failed to reorder FAQ item:", error)
    }
  }

  const toggleExpandItem = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Foire Aux Questions</h1>
          <p className="text-gray-600">Gérez les questions fréquemment posées</p>
        </div>
        <Button onClick={handleCreateFAQItem} variant="primary">
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouvelle FAQ
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
            <option value="published">Publié</option>
            <option value="draft">Brouillon</option>
          </select>

          <Button variant="ghost">
            <FilterIcon className="w-4 h-4 mr-2" />
            Filtres avancés
          </Button>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
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
              {filteredFAQItems.map((item) => (
                <React.Fragment key={item.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <GripIcon className="w-4 h-4 text-gray-400 cursor-move" />
                        <span className="text-sm text-gray-900">{item.order}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMoveItem(item.id, "up")}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={item.order === 1}
                          >
                            <ChevronUpIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveItem(item.id, "down")}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={item.order === faqItems.length}
                          >
                            <ChevronDownIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleExpandItem(item.id)}
                        className="text-sm font-medium text-gray-900 text-left flex items-center"
                      >
                        {item.question}
                        {expandedItem === item.id ? (
                          <ChevronUpIcon className="w-4 h-4 ml-2" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4 ml-2" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                      >
                        {item.status === "published" ? "Publié" : "Brouillon"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.updated_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditFAQItem(item)}>
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteFAQItem(item.id)}>
                          <TrashIcon className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedItem === item.id && (
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4"></td>
                      <td colSpan={5} className="px-6 py-4">
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">{item.answer}</div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingItem ? "Modifier la FAQ" : "Nouvelle FAQ"}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <input
                  type="text"
                  className="input"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Réponse</label>
                <textarea
                  className="input"
                  rows={6}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <option value="published">Publié</option>
                    <option value="draft">Brouillon</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  {editingItem ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
