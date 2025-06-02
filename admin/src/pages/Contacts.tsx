"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  SearchIcon,
  FilterIcon,
  EyeIcon,
  TrashIcon,
  MailIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
  MessageSquareIcon,
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { apiService } from "@/lib/api"

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  service: string
  message: string
  status: "pending" | "contacted" | "converted" | "closed"
  priority: "low" | "medium" | "high"
  source: "website" | "phone" | "email" | "referral"
  assigned_to: string | null
  notes: string
  created_at: string
  updated_at: string
  responded_at: string | null
}

interface ContactFormData {
  status: "pending" | "contacted" | "converted" | "closed"
  priority: "low" | "medium" | "high"
  assigned_to: string
  notes: string
}

export function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [showModal, setShowModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState<ContactFormData>({
    status: "pending",
    priority: "medium",
    assigned_to: "",
    notes: "",
  })

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const response = await apiService.getContacts()
      setContacts(response.contacts || [])
    } catch (error) {
      console.error("Failed to load contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.service.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || contact.status === statusFilter
    const matchesPriority = priorityFilter === "all" || contact.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact)
    setFormData({
      status: contact.status,
      priority: contact.priority,
      assigned_to: contact.assigned_to || "",
      notes: contact.notes,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedContact) {
        await apiService.updateContact(selectedContact.id, formData)
        await loadContacts()
        setShowModal(false)
      }
    } catch (error) {
      console.error("Failed to update contact:", error)
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) {
      try {
        await apiService.deleteContact(contactId)
        await loadContacts()
      } catch (error) {
        console.error("Failed to delete contact:", error)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "contacted":
        return "bg-blue-100 text-blue-800"
      case "converted":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <ClockIcon className="w-4 h-4" />
      case "contacted":
        return <MailIcon className="w-4 h-4" />
      case "converted":
        return <CheckCircleIcon className="w-4 h-4" />
      case "closed":
        return <XCircleIcon className="w-4 h-4" />
      default:
        return <ClockIcon className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStats = () => {
    return {
      total: contacts.length,
      pending: contacts.filter((c) => c.status === "pending").length,
      contacted: contacts.filter((c) => c.status === "contacted").length,
      converted: contacts.filter((c) => c.status === "converted").length,
      closed: contacts.filter((c) => c.status === "closed").length,
    }
  }

  const stats = getStats()

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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des contacts</h1>
          <p className="text-gray-600">Gérez les demandes de contact et les prospects</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <UserIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contactés</p>
              <p className="text-2xl font-bold text-blue-600">{stats.contacted}</p>
            </div>
            <MailIcon className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Convertis</p>
              <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fermés</p>
              <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
            </div>
            <XCircleIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
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

          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="contacted">Contacté</option>
            <option value="converted">Converti</option>
            <option value="closed">Fermé</option>
          </select>

          <select className="input" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">Toutes les priorités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>

          <Button variant="ghost">
            <FilterIcon className="w-4 h-4 mr-2" />
            Filtres avancés
          </Button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                        <div className="text-sm text-gray-500">{contact.email}</div>
                        <div className="text-sm text-gray-500">{contact.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {contact.service}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}
                    >
                      {getStatusIcon(contact.status)}
                      <span className="ml-1">
                        {contact.status === "pending"
                          ? "En attente"
                          : contact.status === "contacted"
                            ? "Contacté"
                            : contact.status === "converted"
                              ? "Converti"
                              : "Fermé"}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(contact.priority)}`}
                    >
                      {contact.priority === "high" ? "Haute" : contact.priority === "medium" ? "Moyenne" : "Basse"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(contact.created_at)}</div>
                    {contact.assigned_to && (
                      <div className="text-xs text-gray-500">Assigné à {contact.assigned_to}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewContact(contact)}>
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquareIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteContact(contact.id)}>
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
      {showModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Détails du contact</h2>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <p className="text-sm text-gray-900">{selectedContact.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedContact.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <p className="text-sm text-gray-900">{selectedContact.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service demandé</label>
                  <p className="text-sm text-gray-900">{selectedContact.service}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">{selectedContact.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de création</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedContact.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Source</label>
                  <p className="text-sm text-gray-900">{selectedContact.source}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="pending">En attente</option>
                    <option value="contacted">Contacté</option>
                    <option value="converted">Converti</option>
                    <option value="closed">Fermé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <select
                    className="input"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigné à</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    placeholder="Nom de la personne assignée"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ajouter des notes..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  Mettre à jour
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
