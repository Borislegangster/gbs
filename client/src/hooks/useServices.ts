"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api"

interface UseServicesOptions {
  featured?: boolean
  limit?: number
}

export function useServices(options: UseServicesOptions = {}) {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiService.getServices()
        let servicesList = response.services || []

        if (options.featured) {
          servicesList = servicesList.filter((service: any) => service.featured)
        }

        if (options.limit) {
          servicesList = servicesList.slice(0, options.limit)
        }

        setServices(servicesList)
      } catch (err: any) {
        console.error("Error fetching services:", err)
        setError(err.message || "Erreur lors du chargement des services")
        setServices([])
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [options.featured, options.limit])

  return { services, loading, error }
}
