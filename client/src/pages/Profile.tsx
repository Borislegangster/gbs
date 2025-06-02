"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useNotification } from "../contexts/NotificationContext"
import { apiService } from "../services/api"
import { SEO } from "../components/SEO"
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  ShieldIcon,
  ClockIcon,
  MonitorIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  HistoryIcon,
} from "lucide-react"

interface Session {
  id: number
  ip_address: string
  user_agent: string
  login_at: string
  logout_at?: string
  is_active: boolean
}

interface ProfileHistory {
  id: number
  field_changed: string
  old_value?: string
  new_value?: string
  ip_address: string
  changed_at: string
}

export function Profile() {
  const { user, updateUser, changePassword } = useAuth()
  const { success, error } = useNotification()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [profileHistory, setProfileHistory] = useState<ProfileHistory[]>([])
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone || "",
      })
    }
    loadSessions()
    loadProfileHistory()
  }, [user])

  const loadSessions = async () => {
    try {
      const sessionsData = await apiService.getUserSessions()
      setSessions(sessionsData)
    } catch (error) {
      console.error("Failed to load sessions:", error)
    }
  }

  const loadProfileHistory = async () => {
    try {
      const historyData = await apiService.request("/auth/profile-history")
      setProfileHistory(historyData)
    } catch (error) {
      console.error("Failed to load profile history:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateUser(formData)
      setIsEditing(false)
      loadProfileHistory() // Recharger l'historique
    } catch (err: any) {
      // Erreur gérée dans le contexte
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error("Erreur", "Les nouveaux mots de passe ne correspondent pas")
      return
    }

    if (passwordData.newPassword.length < 8) {
      error("Erreur", "Le nouveau mot de passe doit contenir au moins 8 caractères")
      return
    }

    setIsLoading(true)

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setShowPasswordForm(false)
      loadProfileHistory() // Recharger l'historique
    } catch (err: any) {
      // Erreur gérée dans le contexte
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const getBrowserName = (userAgent: string) => {
    if (userAgent.includes("Chrome")) return "Chrome"
    if (userAgent.includes("Firefox")) return "Firefox"
    if (userAgent.includes("Safari")) return "Safari"
    if (userAgent.includes("Edge")) return "Edge"
    return "Navigateur inconnu"
  }

  const getDeviceType = (userAgent: string) => {
    if (userAgent.includes("Mobile")) return "Mobile"
    if (userAgent.includes("Tablet")) return "Tablette"
    return "Ordinateur"
  }

  const getFieldLabel = (field: string) => {
    switch (field) {
      case "name":
        return "Nom"
      case "phone":
        return "Téléphone"
      case "password":
        return "Mot de passe"
      default:
        return field
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498db]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEO
        title="Mon Profil - AME Construction"
        description="Gérez votre profil et vos paramètres de compte AME Construction."
      />

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#0a1e37] text-white p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[#3498db] rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-300">{user.email}</p>
                <div className="flex items-center mt-2">
                  {user.email_verified_at ? (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                      <ShieldIcon className="w-3 h-3 mr-1" />
                      Email vérifié
                    </span>
                  ) : (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">Email non vérifié</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "profile"
                    ? "border-[#3498db] text-[#3498db]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <UserIcon className="w-4 h-4 inline mr-2" />
                Profil
              </button>
              <button
                onClick={() => setActiveTab("sessions")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "sessions"
                    ? "border-[#3498db] text-[#3498db]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <MonitorIcon className="w-4 h-4 inline mr-2" />
                Sessions
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "history"
                    ? "border-[#3498db] text-[#3498db]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <HistoryIcon className="w-4 h-4 inline mr-2" />
                Historique
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Information */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#0a1e37]">Informations du profil</h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-[#3498db] text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                      >
                        Modifier
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                        <div className="relative">
                          <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="bg-[#3498db] text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                        >
                          {isLoading ? "Enregistrement..." : "Enregistrer"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false)
                            setFormData({
                              name: user.name,
                              phone: user.phone || "",
                            })
                          }}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Nom</p>
                          <p className="font-medium">{user.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MailIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <PhoneIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Téléphone</p>
                          <p className="font-medium">{user.phone || "Non renseigné"}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Membre depuis</p>
                          <p className="font-medium">{new Date(user.created_at).toLocaleDateString("fr-FR")}</p>
                        </div>
                      </div>

                      {user.last_login_at && (
                        <div className="flex items-center space-x-3">
                          <ClockIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Dernière connexion</p>
                            <p className="font-medium">{new Date(user.last_login_at).toLocaleString("fr-FR")}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Password Change */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#0a1e37]">Sécurité</h2>
                    {!showPasswordForm && (
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                      >
                        <LockIcon className="w-4 h-4 inline mr-2" />
                        Changer le mot de passe
                      </button>
                    )}
                  </div>

                  {showPasswordForm ? (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                        <div className="relative">
                          <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("current")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.current ? (
                              <EyeOffIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                        <div className="relative">
                          <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent"
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("new")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.new ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmer le nouveau mot de passe
                        </label>
                        <div className="relative">
                          <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent"
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("confirm")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.confirm ? (
                              <EyeOffIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50 transition-colors"
                        >
                          {isLoading ? "Modification..." : "Modifier le mot de passe"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordForm(false)
                            setPasswordData({
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            })
                          }}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <LockIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Mot de passe</p>
                          <p className="font-medium">••••••••</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Pour votre sécurité, changez régulièrement votre mot de passe.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "sessions" && (
              <div>
                <h2 className="text-xl font-semibold text-[#0a1e37] mb-6">Historique des connexions</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 rounded-lg border ${
                        session.is_active ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <MonitorIcon className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-sm">
                            {getBrowserName(session.user_agent)} - {getDeviceType(session.user_agent)}
                          </span>
                        </div>
                        {session.is_active && (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">Actuelle</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>IP: {session.ip_address}</p>
                        <p>Connexion: {new Date(session.login_at).toLocaleString("fr-FR")}</p>
                        {session.logout_at && <p>Déconnexion: {new Date(session.logout_at).toLocaleString("fr-FR")}</p>}
                      </div>
                    </div>
                  ))}

                  {sessions.length === 0 && <p className="text-gray-500 text-center py-4">Aucune session trouvée</p>}
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div>
                <h2 className="text-xl font-semibold text-[#0a1e37] mb-6">Historique des modifications</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {profileHistory.map((history) => (
                    <div key={history.id} className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <HistoryIcon className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-sm">
                            Modification du champ : {getFieldLabel(history.field_changed)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(history.changed_at).toLocaleString("fr-FR")}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {history.field_changed !== "password" ? (
                          <>
                            <p>Ancienne valeur: {history.old_value || "Non renseigné"}</p>
                            <p>Nouvelle valeur: {history.new_value || "Non renseigné"}</p>
                          </>
                        ) : (
                          <p>Mot de passe modifié (détails masqués pour sécurité)</p>
                        )}
                        <p>IP: {history.ip_address}</p>
                      </div>
                    </div>
                  ))}

                  {profileHistory.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Aucune modification trouvée</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
