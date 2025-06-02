"use client"

import { useState, useEffect } from "react"
import {
  UsersIcon,
  BuildingIcon,
  FileTextIcon,
  MailIcon,
  TrendingUpIcon,
  EyeIcon,
  CalendarIcon,
  DollarSignIcon,
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { apiService } from "../services/api"

interface DashboardStats {
  totalUsers: number
  totalProjects: number
  totalPosts: number
  totalContacts: number
  monthlyRevenue: number
  activeProjects: number
  completedProjects: number
  pendingContacts: number
}

interface RecentActivity {
  id: string
  type: "user" | "project" | "contact" | "blog"
  title: string
  description: string
  timestamp: string
  status?: string
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalPosts: 0,
    totalContacts: 0,
    monthlyRevenue: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingContacts: 0,
  })

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, activityData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getRecentActivity(),
      ])

      setStats(statsData)
      setRecentActivity(activityData)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <UsersIcon className="w-4 h-4" />
      case "project":
        return <BuildingIcon className="w-4 h-4" />
      case "contact":
        return <MailIcon className="w-4 h-4" />
      case "blog":
        return <FileTextIcon className="w-4 h-4" />
      default:
        return <FileTextIcon className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "published":
      case "completed":
        return "text-green-600 bg-green-100"
      case "pending":
        return "text-yellow-600 bg-yellow-100"
      case "ongoing":
        return "text-blue-600 bg-blue-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">Aperçu de votre activité</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <CalendarIcon className="w-4 h-4" />
          <span>Dernière mise à jour: {new Date().toLocaleDateString("fr-FR")}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+12%</span>
            <span className="text-gray-500 ml-1">ce mois</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BuildingIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-blue-600">{stats.activeProjects} en cours</span>
            <span className="text-gray-500 ml-1">• {stats.completedProjects} terminés</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Articles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileTextIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <EyeIcon className="w-4 h-4 text-gray-400 mr-1" />
            <span className="text-gray-500">2.4k vues ce mois</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSignIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+8%</span>
            <span className="text-gray-500 ml-1">vs mois dernier</span>
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Activité récente</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    {activity.status && (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(activity.status)}`}
                      >
                        {activity.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Actions rapides</h2>
          </div>
          <div className="p-6 space-y-4">
            <Button variant="primary" className="w-full">
              <BuildingIcon className="w-4 h-4 mr-2" />
              Nouveau projet
            </Button>
            <Button variant="secondary" className="w-full">
              <FileTextIcon className="w-4 h-4 mr-2" />
              Nouvel article
            </Button>
            <Button variant="ghost" className="w-full">
              <UsersIcon className="w-4 h-4 mr-2" />
              Inviter un utilisateur
            </Button>
            <Button variant="ghost" className="w-full">
              <MailIcon className="w-4 h-4 mr-2" />
              Voir les contacts ({stats.pendingContacts})
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Overview */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Projets en cours</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Centre Commercial de la Place", progress: 85, status: "En cours" },
              { name: "Complexe Résidentiel Les Jardins", progress: 70, status: "En cours" },
              { name: "Centre Médical Avancé", progress: 95, status: "Finalisation" },
            ].map((project, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{project.name}</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progression</span>
                  <span className="text-sm font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
