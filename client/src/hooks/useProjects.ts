"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api"

interface UseProjectsOptions {
  featured?: boolean
  limit?: number
}

export function useProjects(options: UseProjectsOptions = {}) {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiService.getProjects()
        let projectsList = response.projects || []

        if (options.featured) {
          projectsList = projectsList.filter((project: any) => project.featured)
        }

        if (options.limit) {
          projectsList = projectsList.slice(0, options.limit)
        }

        setProjects(projectsList)
      } catch (err: any) {
        console.error("Error fetching projects:", err)
        setError(err.message || "Erreur lors du chargement des projets")
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [options.featured, options.limit])

  return { projects, loading, error }
}
