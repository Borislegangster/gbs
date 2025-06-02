"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ClockIcon, CheckCircleIcon } from "lucide-react"
import { SEO } from "../components/SEO"
import { apiService } from "../services/api"
import { useNotification } from "../contexts/NotificationContext"

type ProjectStatus = "all" | "ongoing" | "completed" | "paused" | "planning"
type ProjectCategory = "Industriel" | "Commercial" | "Résidentiel" | "Institutionnel" | "Médical"

interface Project {
  id: string
  title: string
  slug: string
  description: string
  featured_image: string
  category: ProjectCategory
  status: "ongoing" | "completed" | "paused" | "planning"
  progress: number
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ProjectStatus>("all")
  const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | "all">("all")
  const { addNotification } = useNotification()

  const categories: ProjectCategory[] = ["Industriel", "Commercial", "Résidentiel", "Institutionnel", "Médical"]

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
    const statusMatch = statusFilter === "all" || project.status === statusFilter
    const categoryMatch = categoryFilter === "all" || project.category === categoryFilter
    return statusMatch && categoryMatch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Nos Projets de Construction"
        description="Explorez nos réalisations en construction et rénovation. Des projets résidentiels et commerciaux qui témoignent de notre expertise et savoir-faire."
        image="https://images.unsplash.com/photo-1621275471769-e6aa44457232"
      />

      <div className="bg-[#0a1e37] text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center">Nos Projets</h1>
          <p className="text-center mt-4 max-w-2xl mx-auto">
            Découvrez nos réalisations et projets en cours dans le domaine de la construction
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filter By Category */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-6 py-2 rounded-full transition-colors ${
              categoryFilter === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Toutes catégories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-6 py-2 rounded-full transition-colors ${
                categoryFilter === category ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Filter By Status */}
        <div className="flex justify-center space-x-4 mb-12">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-6 py-2 rounded-full ${
              statusFilter === "all" ? "bg-[#3498db] text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Tous les projets
          </button>
          <button
            onClick={() => setStatusFilter("ongoing")}
            className={`px-6 py-2 rounded-full ${
              statusFilter === "ongoing" ? "bg-[#3498db] text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            En cours
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-6 py-2 rounded-full ${
              statusFilter === "completed" ? "bg-[#3498db] text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Terminés
          </button>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucun projet trouvé pour les filtres sélectionnés.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.slug}`}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={project.featured_image || "/placeholder.svg?height=200&width=300"}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    {project.status === "ongoing" ? (
                      <div className="bg-yellow-500 text-white px-3 py-1 rounded-full flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        En cours
                      </div>
                    ) : project.status === "completed" ? (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full flex items-center">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Terminé
                      </div>
                    ) : project.status === "paused" ? (
                      <div className="bg-orange-500 text-white px-3 py-1 rounded-full flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        En pause
                      </div>
                    ) : (
                      <div className="bg-gray-500 text-white px-3 py-1 rounded-full flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Planification
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#0a1e37] mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-2 line-clamp-3">{project.description}</p>
                  <p className="text-sm text-gray-500 mb-4">Catégorie: {project.category}</p>
                  {project.status === "ongoing" && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progression</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#3498db] h-2 rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  )}
                  <span className="text-[#3498db] font-medium">Voir les détails →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
