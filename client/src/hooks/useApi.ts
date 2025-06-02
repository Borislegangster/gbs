"use client"

import { useState, useEffect } from "react"

// Assuming you have an apiService defined elsewhere, e.g., in 'src/services/apiService'
import * as apiService from "../services/apiService" // Adjust the path as needed

export function useFAQs() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiService.getFAQs()
        setData(response.faqs || [])
      } catch (err: any) {
        console.error("Error fetching FAQs:", err)
        setError(err.message || "Erreur lors du chargement des FAQs")
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchFAQs()
  }, [])

  return { data, loading, error }
}

export function useTestimonials(featuredOnly = false) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiService.getTestimonials()
        let testimonials = response.testimonials || []

        if (featuredOnly) {
          testimonials = testimonials.filter((t: any) => t.featured)
        }

        setData(testimonials)
      } catch (err: any) {
        console.error("Error fetching testimonials:", err)
        setError(err.message || "Erreur lors du chargement des témoignages")
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [featuredOnly])

  return { data, loading, error }
}
