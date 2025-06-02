"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  HeartIcon,
  MessageCircleIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  ImageIcon,
  TagIcon,
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { apiService } from "../services/api"
import { useNotification } from "../contexts/NotificationContext"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  gallery: string[]
  author: string
  category: string
  tags: string[]
  status: "draft" | "published" | "archived"
  featured: boolean
  likes_count: number
  comments_count: number
  views: number
  reading_time: number
  seo_title: string
  seo_description: string
  published_at: string | null
  created_at: string
  updated_at: string
}

interface BlogFormData {
  title: string
  excerpt: string
  content: string
  featured_image: string
  gallery: string[]
  author: string
  category: string
  tags: string[]
  status: "draft" | "published" | "archived"
  featured: boolean
  seo_title: string
  seo_description: string
}

const categories = ["Construction", "Rénovation", "Architecture", "Tendances", "Conseils", "Actualités"]

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    excerpt: "",
    content: "",
    featured_image: "",
    gallery: [],
    author: "",
    category: "Construction",
    tags: [],
    status: "draft",
    featured: false,
    seo_title: "",
    seo_description: "",
  })
  const [newTag, setNewTag] = useState("")
  const [newGalleryImage, setNewGalleryImage] = useState("")

  const { success, error } = useNotification()

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const response = await apiService.getBlogPosts()
      setPosts(response.posts || [])
    } catch (err) {
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
    const matchesStatus = statusFilter === "all" || post.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleCreatePost = () => {
    setEditingPost(null)
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      featured_image: "",
      gallery: [],
      author: "",
      category: "Construction",
      tags: [],
      status: "draft",
      featured: false,
      seo_title: "",
      seo_description: "",
    })
    setShowModal(true)
  }

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      featured_image: post.featured_image,
      gallery: post.gallery,
      author: post.author,
      category: post.category,
      tags: post.tags,
      status: post.status,
      featured: post.featured,
      seo_title: post.seo_title,
      seo_description: post.seo_description,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPost) {
        await apiService.updateBlogPost(editingPost.id, formData)
        success("Article mis à jour", "L'article a été modifié avec succès")
      } else {
        await apiService.createBlogPost(formData)
        success("Article créé", "Le nouvel article a été créé avec succès")
      }
      await loadPosts()
      setShowModal(false)
    } catch (err: any) {
      error("Erreur de sauvegarde", err.message || "Impossible de sauvegarder l'article")
      console.error("Failed to save blog post:", err)
    }
  }

  const handleToggleFeatured = async (postId: string) => {
    try {
      const post = posts.find((p) => p.id === postId)
      if (post) {
        await apiService.updateBlogPost(postId, { featured: !post.featured })
        success(
          post.featured ? "Article retiré de la une" : "Article mis à la une",
          post.featured ? "L'article n'est plus en vedette" : "L'article est maintenant en vedette",
        )
        await loadPosts()
      }
    } catch (err: any) {
      error("Erreur", err.message || "Impossible de modifier le statut vedette")
      console.error("Failed to toggle featured status:", err)
    }
  }

  const handleToggleStatus = async (postId: string) => {
    try {
      await apiService.toggleBlogPostStatus(postId)
      success("Statut modifié", "Le statut de publication a été modifié")
      await loadPosts()
    } catch (err: any) {
      error("Erreur", err.message || "Impossible de modifier le statut")
      console.error("Failed to toggle status:", err)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      try {
        await apiService.deleteBlogPost(postId)
        success("Article supprimé", "L'article a été supprimé avec succès")
        await loadPosts()
      } catch (err: any) {
        error("Erreur de suppression", err.message || "Impossible de supprimer l'article")
        console.error("Failed to delete blog post:", err)
      }
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((tag) => tag !== tagToRemove) })
  }

  const addGalleryImage = () => {
    if (newGalleryImage.trim() && !formData.gallery.includes(newGalleryImage.trim())) {
      setFormData({ ...formData, gallery: [...formData.gallery, newGalleryImage.trim()] })
      setNewGalleryImage("")
    }
  }

  const removeGalleryImage = (imageToRemove: string) => {
    setFormData({ ...formData, gallery: formData.gallery.filter((img) => img !== imageToRemove) })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non publié"
    return new Date(dateString).toLocaleDateString("fr-FR")
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion du blog</h1>
          <p className="text-gray-600">Gérez vos articles et publications</p>
        </div>
        <Button onClick={handleCreatePost} variant="primary">
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouvel article
        </Button>
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

          <select className="input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="published">Publié</option>
            <option value="draft">Brouillon</option>
            <option value="archived">Archivé</option>
          </select>

          <Button variant="ghost">
            <FilterIcon className="w-4 h-4 mr-2" />
            Filtres avancés
          </Button>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statistiques
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={post.featured_image || "/placeholder.svg"}
                          alt={post.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{post.title}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{post.excerpt}</div>
                        <div className="flex items-center mt-1">
                          <CalendarIcon className="w-3 h-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">{formatDate(post.published_at)}</span>
                          {post.featured && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              À la une
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{post.author}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}
                    >
                      {post.status === "published" ? "Publié" : post.status === "draft" ? "Brouillon" : "Archivé"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        {post.views}
                      </div>
                      <div className="flex items-center">
                        <HeartIcon className="w-4 h-4 mr-1" />
                        {post.likes_count}
                      </div>
                      <div className="flex items-center">
                        <MessageCircleIcon className="w-4 h-4 mr-1" />
                        {post.comments_count}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditPost(post)}>
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(post.id)}>
                        {post.status === "published" ? (
                          <ToggleRightIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <ToggleLeftIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleFeatured(post.id)}>
                        {post.featured ? (
                          <ToggleRightIcon className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <ToggleLeftIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)}>
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
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingPost ? "Modifier l'article" : "Nouvel article"}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    className="input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Article à la une</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Extrait</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                  <textarea
                    className="input"
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image principale (URL)</label>
                  <input
                    type="url"
                    className="input"
                    value={formData.featured_image}
                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        <TagIcon className="w-3 h-3 mr-1" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input flex-1"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Ajouter un tag..."
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="ghost">
                      Ajouter
                    </Button>
                  </div>
                </div>

                {/* Gallery */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Galerie d'images</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                    {formData.gallery.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(image)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      className="input flex-1"
                      value={newGalleryImage}
                      onChange={(e) => setNewGalleryImage(e.target.value)}
                      placeholder="URL de l'image..."
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addGalleryImage())}
                    />
                    <Button type="button" onClick={addGalleryImage} variant="ghost">
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre SEO</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.seo_title}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description SEO</label>
                  <textarea
                    className="input"
                    rows={2}
                    value={formData.seo_description}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  {editingPost ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
