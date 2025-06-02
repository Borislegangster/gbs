"use client"

import { Link } from "react-router-dom"
import { useProjects } from "../hooks/useProjects"
import { useHomeContent } from "../hooks/useApi"
import { ArrowRightIcon, MapPinIcon, CalendarIcon } from "lucide-react"

export function ProjectShowcase() {
  const { projects, loading: projectsLoading, error: projectsError } = useProjects({ featured: true, limit: 6 })
  const { data: content, loading: contentLoading, error: contentError } = useHomeContent()

  if (projectsLoading || contentLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498db] mx-auto"></div>
        </div>
      </section>
    )
  }

  if (projectsError) {
    console.warn("Projects section error:", projectsError)
  }

  if (contentError) {
    console.warn("Projects content error:", contentError)
  }

  const projectsContent = content?.projects || {
    title: "Nos Réalisations",
    subtitle: "Découvrez quelques-uns de nos projets les plus remarquables",
    description: null,
    cta_text: "Voir tous nos projets",
    cta_url: "/projects",
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a1e37] mb-4">{projectsContent.title}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{projectsContent.subtitle}</p>
          {projectsContent.description && (
            <p className="text-gray-600 max-w-3xl mx-auto mt-4">{projectsContent.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project: any) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {project.featured_image && (
                <img
                  src={project.featured_image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-[#3498db] text-white px-3 py-1 rounded-full text-sm">{project.category}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      project.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : project.status === "ongoing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {project.status === "completed"
                      ? "Terminé"
                      : project.status === "ongoing"
                        ? "En cours"
                        : "Planifié"}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-[#0a1e37] mb-3">{project.title}</h3>

                <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>

                <div className="space-y-2 mb-4">
                  {project.location && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {project.location}
                    </div>
                  )}
                  {project.end_date && (
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {new Date(project.end_date).toLocaleDateString("fr-FR")}
                    </div>
                  )}
                </div>

                {project.progress !== undefined && project.status === "ongoing" && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progression</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#3498db] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <Link
                  to={`/projects/${project.slug}`}
                  className="inline-flex items-center text-[#3498db] hover:text-blue-600 font-medium"
                >
                  Voir le projet
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to={projectsContent.cta_url}
            className="bg-[#3498db] text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center"
          >
            {projectsContent.cta_text}
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
