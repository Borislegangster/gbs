"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api"

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
        setData(response || [])
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
        let testimonials = response || []

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

export function useHomeContent() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHomeContent = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getHomeContent()
      setData(response.content)
    } catch (err: any) {
      console.error("Error fetching home content:", err)
      setError(err.message || "Erreur lors du chargement du contenu")
      // Définir des valeurs par défaut en cas d'erreur
      setData({
        hero: {
          title: "Construisons l'avenir ensemble",
          subtitle:
            "AME Construction, votre partenaire de confiance pour tous vos projets de construction et de rénovation",
          background_image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1",
          cta_text: "Obtenir un devis",
          cta_url: "/contact",
          secondary_cta_text: "Voir nos projets",
          secondary_cta_url: "/projects",
        },
        stats: {
          projects_completed: 150,
          years_experience: 15,
          happy_clients: 200,
          team_members: 25,
        },
        features: {
          title: null,
          subtitle: null,
          items: [
            {
              icon: "UserIcon",
              title: "Qualité Professionnelle",
              description:
                "Nos experts qualifiés s'engagent à fournir des services de construction de la plus haute qualité pour tous vos projets.",
              link_text: "En savoir plus",
              link_url: "#",
            },
            {
              icon: "AwardIcon",
              title: "Travail De Qualité",
              description:
                "Nous nous engageons à fournir un travail exceptionnel, en utilisant les meilleurs matériaux et techniques de construction.",
              link_text: "En savoir plus",
              link_url: "#",
            },
            {
              icon: "PhoneIcon",
              title: "Assistance 24/7",
              description:
                "Notre équipe est disponible à tout moment pour répondre à vos questions et résoudre vos problèmes rapidement.",
              link_text: "En savoir plus",
              link_url: "#",
            },
          ],
        },
        experience: {
          title: "20 Ans D'expériences",
          subtitle: "Notre Histoire et Notre Expérience",
          description:
            "Depuis plus de deux décennies, notre entreprise s'est imposée comme un leader dans le secteur de la construction. Nous avons acquis une expertise inégalée dans la réalisation de projets de toutes tailles, des résidences privées aux grands complexes commerciaux.\n\nNotre équipe de professionnels qualifiés s'engage à fournir des services de construction de la plus haute qualité, en respectant les délais et les budgets convenus.",
          images: ["/assets/ex1.jpg", "/assets/ex2.jfif", "/assets/ex3.jfif", "/assets/ex4.jfif"],
          cta_text: "En Savoir Plus",
          cta_url: "/about",
        },
        promise: {
          title: "Notre promesse",
          description:
            "Chez AME, nous nous engageons à fournir des services de construction et de gestion de projets de la plus haute qualité. Notre équipe de professionnels qualifiés travaille avec précision et attention aux détails pour garantir que chaque projet soit livré à temps et dans le respect du budget. Nous utilisons des matériaux de qualité supérieure et des techniques de construction modernes pour créer des structures durables et esthétiques.",
          video_id: "YOUR_VIDEO_ID",
          background_image: "/assets/pro1.jpg",
          cta_text: "En Savoir Plus",
          cta_url: "https://youtube.com/@ameConstruction",
        },
        newsletter: {
          title: "Newsletter",
          description: "Restez informé de nos dernières actualités et projets. Abonnez-vous à notre newsletter.",
          placeholder_text: "Votre email",
          button_text: "Soumettre",
        },
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHomeContent()
  }, [])

  const refetch = async () => {
    await fetchHomeContent()
  }

  return { data, loading, error, refetch }
}

export function useSiteSettings() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiService.getSiteSettings()
        setData(response.data || {})
      } catch (err: any) {
        console.error("Error fetching site settings:", err)
        setError(err.message || "Erreur lors du chargement des paramètres")
        setData({})
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { data, loading, error }
}

export function useService(slug: string) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchService = async () => {
      if (!slug) return

      try {
        setLoading(true)
        setError(null)
        const response = await apiService.getService(slug)
        setData(response.data)
      } catch (err: any) {
        console.error("Error fetching service:", err)
        setError(err.message || "Erreur lors du chargement du service")
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [slug])

  return { data, loading, error }
}

export function useServices(options: { featured?: boolean; limit?: number } = {}) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiService.getServices()
        let servicesList = response.data || []

        if (options.featured) {
          servicesList = servicesList.filter((service: any) => service.featured)
        }

        if (options.limit) {
          servicesList = servicesList.slice(0, options.limit)
        }

        setData(servicesList)
      } catch (err: any) {
        console.error("Error fetching services:", err)
        setError(err.message || "Erreur lors du chargement des services")
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [options.featured, options.limit])

  return { data, loading, error }
}

export function useStaticPage(slug: string) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return

      try {
        setLoading(true)
        setError(null)
        const response = await apiService.getStaticPage(slug)
        setData(response)
      } catch (err: any) {
        console.error("Error fetching static page:", err)
        setError(err.message || "Erreur lors du chargement de la page")
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [slug])

  return { data, loading, error }
}