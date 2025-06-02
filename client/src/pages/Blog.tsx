"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { SEO } from "../components/SEO"
import { apiService } from "../services/api"
import { useNotification } from "../contexts/NotificationContext"
import {
  HeartIcon,
  MessageCircleIcon,
  ShareIcon,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  EyeIcon,
  ClockIcon,
} from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string
  author: string
  category: string
  tags: string[]
  status: string
  featured: boolean
  likes_count: number
  comments_count: number
  views: number
  reading_time: number
  published_at: string
  created_at: string
}

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showShare, setShowShare] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const { error } = useNotification()

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const response = await apiService.getBlogPosts()
      setPosts(response.posts || [])
    } catch (err: any) {
      error("Erreur de chargement", "Impossible de charger les articles")
      console.error("Failed to load blog posts:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = ["Construction", "Rénovation", "Architecture", "Tendances", "Conseils", "Actualités"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498db]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Blog Construction et Rénovation"
        description="Découvrez nos articles sur les dernières tendances et innovations dans le domaine de la construction, rénovation et architecture. Conseils d'experts et actualités du secteur."
        image="https://images.unsplash.com/photo-1541888946425-d81bb19240f5"
      />

      {/* Hero Section */}
      <div className="bg-[#0a1e37] text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center">Notre Blog</h1>
          <p className="text-center mt-4 max-w-2xl mx-auto">
            Actualités, conseils et innovations dans le domaine de la construction
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Rechercher un article..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3498db]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3498db]"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-sm">
                {filteredPosts.length} article{filteredPosts.length > 1 ? "s" : ""} trouvé
                {filteredPosts.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <Link to={`/blog/${post.slug}`}>
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.featured_image || "/placeholder.svg?height=200&width=400"}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>

              <div className="p-6">
                {/* Category and Reading Time */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {post.category}
                  </span>
                  {post.reading_time && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {post.reading_time} min
                    </div>
                  )}
                </div>

                {/* Meta Info */}
                <div className="text-sm text-gray-500 mb-2">
                  {new Date(post.published_at).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  • Par {post.author}
                </div>

                {/* Title */}
                <Link to={`/blog/${post.slug}`}>
                  <h3 className="text-xl font-semibold text-[#0a1e37] mb-2 hover:text-[#3498db] line-clamp-2">
                    {post.title}
                  </h3>
                </Link>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
                      >
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && <span className="text-xs text-gray-500">+{post.tags.length - 3}</span>}
                  </div>
                )}

                {/* Stats and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <HeartIcon className="w-4 h-4" />
                      <span className="text-sm">{post.likes_count}</span>
                    </div>
                    <Link
                      to={`/blog/${post.slug}#comments`}
                      className="flex items-center space-x-1 text-gray-500 hover:text-[#3498db]"
                    >
                      <MessageCircleIcon className="w-4 h-4" />
                      <span className="text-sm">{post.comments_count}</span>
                    </Link>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <EyeIcon className="w-4 h-4" />
                      <span className="text-sm">{post.views}</span>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowShare(showShare === post.id ? null : post.id)}
                      className="text-gray-500 hover:text-[#3498db]"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </button>
                    {showShare === post.id && (
                      <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20">
                        <a href="#" className="flex items-center px-4 py-2 hover:bg-gray-100">
                          <FacebookIcon className="w-4 h-4 mr-3" />
                          Facebook
                        </a>
                        <a href="#" className="flex items-center px-4 py-2 hover:bg-gray-100">
                          <TwitterIcon className="w-4 h-4 mr-3" />
                          Twitter
                        </a>
                        <a href="#" className="flex items-center px-4 py-2 hover:bg-gray-100">
                          <LinkedinIcon className="w-4 h-4 mr-3" />
                          LinkedIn
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">Aucun article trouvé</div>
            <p className="text-gray-400">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>
    </div>
  )
}
