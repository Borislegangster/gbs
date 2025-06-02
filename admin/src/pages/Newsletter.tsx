"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { SearchIcon, FilterIcon, TrashIcon, MailIcon, DownloadIcon, PlusIcon, FileTextIcon } from "lucide-react"
import { Button } from "../components/ui/Button"
import { apiService } from "@/lib/api"

interface Subscriber {
  id: string
  email: string
  name: string | null
  status: "active" | "unsubscribed" | "bounced"
  source: string
  created_at: string
  updated_at: string
  last_email_sent_at: string | null
}

interface Campaign {
  id: string
  title: string
  subject: string
  content: string
  status: "draft" | "scheduled" | "sent" | "failed"
  scheduled_at: string | null
  sent_at: string | null
  recipients_count: number
  open_rate: number | null
  click_rate: number | null
  created_at: string
  updated_at: string
}

export function Newsletter() {
  const [activeTab, setActiveTab] = useState<"subscribers" | "campaigns">("subscribers")
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    subject: "",
    content: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [subscribersResponse, campaignsResponse] = await Promise.all([
        apiService.getNewsletterSubscribers(),
        apiService.getNewsletterCampaigns(),
      ])
      setSubscribers(subscribersResponse.subscribers || [])
      setCampaigns(campaignsResponse.campaigns || [])
    } catch (error) {
      console.error("Failed to load newsletter data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesSearch =
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || subscriber.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet abonné ?")) {
      try {
        await apiService.deleteNewsletterSubscriber(subscriberId)
        await loadData()
      } catch (error) {
        console.error("Failed to delete subscriber:", error)
      }
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette campagne ?")) {
      try {
        await apiService.deleteNewsletterCampaign(campaignId)
        await loadData()
      } catch (error) {
        console.error("Failed to delete campaign:", error)
      }
    }
  }

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiService.createNewsletterCampaign(newCampaign)
      await loadData()
      setNewCampaign({
        title: "",
        subject: "",
        content: "",
      })
      setShowNewCampaignModal(false)
    } catch (error) {
      console.error("Failed to create campaign:", error)
    }
  }

  const handleImportSubscribers = async () => {
    try {
      // Logic for importing subscribers from CSV
      await loadData()
      setShowImportModal(false)
    } catch (error) {
      console.error("Failed to import subscribers:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "unsubscribed":
        return "bg-yellow-100 text-yellow-800"
      case "bounced":
        return "bg-red-100 text-red-800"
      case "sent":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Actif"
      case "unsubscribed":
        return "Désabonné"
      case "bounced":
        return "Rebond"
      case "sent":
        return "Envoyé"
      case "draft":
        return "Brouillon"
      case "scheduled":
        return "Programmé"
      case "failed":
        return "Échec"
      default:
        return status
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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
          <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-gray-600">Gérez vos abonnés et vos campagnes</p>
        </div>
        <div className="flex items-center space-x-2">
          {activeTab === "subscribers" ? (
            <Button onClick={() => setShowImportModal(true)} variant="ghost">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Importer
            </Button>
          ) : (
            <Button onClick={() => setShowNewCampaignModal(true)} variant="primary">
              <PlusIcon className="w-4 h-4 mr-2" />
              Nouvelle campagne
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("subscribers")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "subscribers"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Abonnés
          </button>
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "campaigns"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Campagnes
          </button>
        </nav>
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
            {activeTab === "subscribers" ? (
              <>
                <option value="active">Actifs</option>
                <option value="unsubscribed">Désabonnés</option>
                <option value="bounced">Rebonds</option>
              </>
            ) : (
              <>
                <option value="draft">Brouillons</option>
                <option value="scheduled">Programmés</option>
                <option value="sent">Envoyés</option>
                <option value="failed">Échecs</option>
              </>
            )}
          </select>

          <Button variant="ghost">
            <FilterIcon className="w-4 h-4 mr-2" />
            Filtres avancés
          </Button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "subscribers" ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernier email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                            {subscriber.name
                              ? subscriber.name.charAt(0).toUpperCase()
                              : subscriber.email.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{subscriber.email}</div>
                          {subscriber.name && <div className="text-sm text-gray-500">{subscriber.name}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscriber.status)}`}
                      >
                        {getStatusText(subscriber.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscriber.source}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscriber.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscriber.last_email_sent_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <MailIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSubscriber(subscriber.id)}>
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
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campagne
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destinataires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'envoi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                            <FileTextIcon className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                          <div className="text-sm text-gray-500">{campaign.subject}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}
                      >
                        {getStatusText(campaign.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.recipients_count} destinataires
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.status === "sent"
                        ? formatDate(campaign.sent_at)
                        : campaign.status === "scheduled"
                          ? formatDate(campaign.scheduled_at)
                          : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.open_rate !== null ? (
                        <div>
                          <div>Ouverture: {campaign.open_rate}%</div>
                          <div>Clics: {campaign.click_rate}%</div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <MailIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCampaign(campaign.id)}>
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
      )}

      {/* New Campaign Modal */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nouvelle campagne</h2>

            <form onSubmit={handleCreateCampaign} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la campagne</label>
                <input
                  type="text"
                  className="input"
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet de l'email</label>
                <input
                  type="text"
                  className="input"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                <textarea
                  className="input"
                  rows={8}
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                  placeholder="Contenu HTML de votre newsletter..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowNewCampaignModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  Créer la campagne
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Importer des abonnés</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fichier CSV</label>
                <input type="file" accept=".csv" className="input" />
                <p className="text-xs text-gray-500 mt-1">Format attendu: email, nom (optionnel)</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowImportModal(false)}>
                  Annuler
                </Button>
                <Button type="button" variant="primary" onClick={handleImportSubscribers}>
                  Importer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
