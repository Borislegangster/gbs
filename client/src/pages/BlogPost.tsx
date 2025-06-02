"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { SEO } from "../components/SEO"
import { apiService } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { useNotification } from "../contexts/NotificationContext"
import {
  HeartIcon,
  MessageCircleIcon,
  ShareIcon,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  SendIcon,
  ReplyIcon,
  EyeIcon,
  ClockIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
} from "lucide-react"

interface BlogComment {
  id: string
  content: string
  user_id: string
  User: {
    id: string
    name: string
  }
  likes_count: number
  userLiked: boolean
  replies: BlogComment[]
  created_at: string
}

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  featured_image: string
  gallery: string[]
  author: string
  category: string
  tags: string[]
  likes_count: number
  comments_count: number
  views: number
  reading_time: number
  userLiked: boolean
  comments: BlogComment[]
  published_at: string
  seo_title?: string
  seo_description?: string
}

export function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error } = useNotification()

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [showShare, setShowShare] = useState(false)
  const [comment, setComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (slug) {
      loadPost()
    }
  }, [slug])

  const loadPost = async () => {
    try {
      setLoading(true)
      const postData = await apiService.getBlogPost(slug!)
      setPost(postData)
      setIsLiked(postData.userLiked)
      setLikesCount(postData.likes_count)
    } catch (err: any) {
      error("Erreur de chargement", "Impossible de charger l'article")
      console.error("Failed to load blog post:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      error("Connexion requise", "Vous devez être connecté pour aimer un article")
      navigate("/login", { state: { from: window.location.pathname } })
      return
    }

    try {
      const response = await apiService.likeBlogPost(slug!)
      setIsLiked(response.liked)
      setLikesCount(response.likes)

      if (response.liked) {
        success("Article aimé", "Vous avez aimé cet article")
      }
    } catch (err: any) {
      error("Erreur", err.message || "Impossible d'aimer l'article")
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      error("Connexion requise", "Vous devez être connecté pour commenter")
      navigate("/login", { state: { from: window.location.pathname } })
      return
    }

    if (!comment.trim()) return

    try {
      setSubmittingComment(true)
      await apiService.addBlogComment(slug!, { content: comment.trim() })
      setComment("")
      success("Commentaire ajouté", "Votre commentaire a été publié")
      await loadPost() // Reload to get updated comments
    } catch (err: any) {
      error("Erreur", err.message || "Impossible d'ajouter le commentaire")
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleReplySubmit = async (commentId: string) => {
    if (!user) {
      error("Connexion requise", "Vous devez être connecté pour répondre")
      navigate("/login", { state: { from: window.location.pathname } })
      return
    }

    if (!replyContent.trim()) return

    try {
      await apiService.addBlogComment(slug!, {
        content: replyContent.trim(),
        parentId: commentId,
      })
      setReplyContent("")
      setReplyTo(null)
      success("Réponse ajoutée", "Votre réponse a été publiée")
      await loadPost()
    } catch (err: any) {
      error("Erreur", err.message || "Impossible d'ajouter la réponse")
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (!user) {
      error("Connexion requise", "Vous devez être connecté pour aimer un commentaire")
      navigate("/login", { state: { from: window.location.pathname } })
      return
    }

    try {
      await apiService.likeBlogComment(commentId)
      await loadPost() // Reload to get updated likes
    } catch (err: any) {
      error("Erreur", err.message || "Impossible d'aimer le commentaire")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498db]"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article non trouvé</h1>
          <Link to="/blog" className="text-[#3498db] hover:underline">
            Retour au blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={post.seo_title || post.title}
        description={post.seo_description || post.content.substring(0, 160)}
        image={post.featured_image}
        article={true}
      />

      {/* Hero Section */}
      <div className="bg-[#0a1e37] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <Link to="/blog" className="text-blue-300 hover:text-white">
                Blog
              </Link>
              <span className="mx-2">›</span>
              <span className="text-blue-300">{post.category}</span>
              <span className="mx-2">›</span>
              <span>{post.title}</span>
            </nav>

            {/* Category */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white mb-4">
              {post.category}
            </span>

            {/* Title */}
            <h1 className="text-4xl font-bold mb-6">{post.title}</h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-blue-200">
              <div className="flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                <span>Par {post.author}</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                <span>{new Date(post.published_at).toLocaleDateString("fr-FR")}</span>
              </div>
              {post.reading_time && (
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  <span>{post.reading_time} min de lecture</span>
                </div>
              )}
              <div className="flex items-center">
                <EyeIcon className="w-5 h-5 mr-2" />
                <span>{post.views} vues</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          <img
            src={post.featured_image || "/placeholder.svg?height=400&width=800"}
            alt={post.title}
            className="w-full h-[400px] object-cover rounded-lg mb-8 shadow-lg"
          />

          {/* Article Content */}
          <article className="bg-white rounded-lg p-8 mb-8 shadow-sm">
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                    >
                      <TagIcon className="w-4 h-4 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Gallery */}
          {post.gallery && post.gallery.length > 0 && (
            <div className="bg-white rounded-lg p-8 mb-8 shadow-sm">
              <h3 className="text-xl font-bold mb-4">Galerie</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {post.gallery.map((image, index) => (
                  <img
                    key={index}
                    src={image || "/placeholder.svg"}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Interaction Bar */}
          <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 ${isLiked ? "text-red-500" : "text-gray-500"} hover:text-red-500 transition-colors`}
                >
                  <HeartIcon className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} />
                  <span>{likesCount}</span>
                </button>
                <div className="flex items-center space-x-2 text-gray-500">
                  <MessageCircleIcon className="w-6 h-6" />
                  <span>{post.comments.length}</span>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowShare(!showShare)}
                  className="text-gray-500 hover:text-[#3498db] transition-colors"
                >
                  <ShareIcon className="w-6 h-6" />
                </button>
                {showShare && (
                  <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20">
                    <a href="#" className="flex items-center px-4 py-2 hover:bg-gray-100">
                      <FacebookIcon className="w-5 h-5 mr-3" />
                      Facebook
                    </a>
                    <a href="#" className="flex items-center px-4 py-2 hover:bg-gray-100">
                      <TwitterIcon className="w-5 h-5 mr-3" />
                      Twitter
                    </a>
                    <a href="#" className="flex items-center px-4 py-2 hover:bg-gray-100">
                      <LinkedinIcon className="w-5 h-5 mr-3" />
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div id="comments" className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-[#0a1e37]">Commentaires ({post.comments.length})</h2>

            {/* Comment Form */}
            <div className="mb-8">
              {user ? (
                <form onSubmit={handleCommentSubmit}>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3498db] resize-none"
                    rows={4}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={submittingComment || !comment.trim()}
                      className="bg-[#3498db] hover:bg-blue-600 text-white px-6 py-2 rounded transition flex items-center disabled:opacity-50"
                    >
                      <SendIcon className="w-4 h-4 mr-2" />
                      {submittingComment ? "Envoi..." : "Envoyer"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">Connectez-vous pour laisser un commentaire</p>
                  <Link
                    to="/login"
                    state={{ from: window.location.pathname }}
                    className="bg-[#3498db] hover:bg-blue-600 text-white px-6 py-2 rounded transition"
                  >
                    Se connecter
                  </Link>
                </div>
              )}
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {post.comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-[#0a1e37]">{comment.User.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        className={`flex items-center ${comment.userLiked ? "text-red-500" : "text-gray-500"} hover:text-red-500 transition-colors`}
                      >
                        <HeartIcon className="w-4 h-4 mr-1" fill={comment.userLiked ? "currentColor" : "none"} />
                        <span className="text-sm">{comment.likes_count}</span>
                      </button>
                      {user && (
                        <button
                          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                          className="text-gray-500 hover:text-[#3498db] transition-colors"
                        >
                          <ReplyIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{comment.content}</p>

                  {/* Reply Form */}
                  {replyTo === comment.id && (
                    <div className="ml-6 mt-4">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Répondre à ce commentaire..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3498db] resize-none"
                        rows={3}
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={() => setReplyTo(null)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleReplySubmit(comment.id)}
                          disabled={!replyContent.trim()}
                          className="bg-[#3498db] hover:bg-blue-600 text-white px-4 py-2 rounded transition disabled:opacity-50"
                        >
                          Répondre
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-6 mt-4 space-y-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-[#0a1e37]">{reply.User.name}</h4>
                              <p className="text-xs text-gray-500">
                                {new Date(reply.created_at).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCommentLike(reply.id)}
                              className={`flex items-center ${reply.userLiked ? "text-red-500" : "text-gray-500"} hover:text-red-500 transition-colors`}
                            >
                              <HeartIcon className="w-3 h-3 mr-1" fill={reply.userLiked ? "currentColor" : "none"} />
                              <span className="text-xs">{reply.likes_count}</span>
                            </button>
                          </div>
                          <p className="text-gray-600 text-sm">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Empty State */}
            {post.comments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageCircleIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucun commentaire pour le moment</p>
                <p className="text-sm">Soyez le premier à commenter cet article !</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
