"use client"

import { useState, useEffect } from "react"
import {
  SaveIcon,
  BellIcon,
  ShieldIcon,
  GlobeIcon,
  MailIcon,
  DatabaseIcon,
  PaletteIcon,
  TestTubeIcon,
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { useNotification } from "../contexts/NotificationContext"
import { apiService } from "../services/api"

interface GeneralSettings {
  site_name: string
  site_description: string
  site_url: string
  admin_email: string
  phone?: string
  address?: string
  city?: string
  logo_url?: string
  favicon_url?: string
  facebook_url?: string
  twitter_url?: string
  linkedin_url?: string
  youtube_url?: string
  instagram_url?: string
  whatsapp_number?: string
  timezone: string
  language: string
  maintenance_mode: boolean
}

interface EmailSettings {
  smtp_host: string
  smtp_port: number
  smtp_username: string
  smtp_password: string
  smtp_encryption: string
  from_email: string
  from_name: string
}

interface SecuritySettings {
  two_factor_auth: boolean
  session_timeout: number
  password_min_length: number
  require_password_change: boolean
  login_attempts: number
  lockout_duration: number
}

interface NotificationSettings {
  email_notifications: boolean
  new_contact_notifications: boolean
  project_update_notifications: boolean
  system_notifications: boolean
  weekly_reports: boolean
}

export function Settings() {
  const [activeTab, setActiveTab] = useState("general")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [testEmailLoading, setTestEmailLoading] = useState(false)
  const { success, error, info } = useNotification()

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    site_name: "",
    site_description: "",
    site_url: "",
    admin_email: "",
    timezone: "Africa/Douala",
    language: "fr",
    maintenance_mode: false,
  })

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    smtp_encryption: "tls",
    from_email: "",
    from_name: "",
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    two_factor_auth: false,
    session_timeout: 120,
    password_min_length: 8,
    require_password_change: false,
    login_attempts: 5,
    lockout_duration: 15,
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    new_contact_notifications: true,
    project_update_notifications: true,
    system_notifications: true,
    weekly_reports: false,
  })

  // Charger les paramètres au démarrage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setInitialLoading(true)
        const response = await apiService.getSettings()

        if (response.success && response.data) {
          // Charger les paramètres généraux
          if (response.data.general) {
            setGeneralSettings((prev) => ({ ...prev, ...response.data.general }))
          }

          // Charger les paramètres email
          if (response.data.email) {
            setEmailSettings((prev) => ({ ...prev, ...response.data.email }))
          }

          // Charger les paramètres de sécurité
          if (response.data.security) {
            setSecuritySettings((prev) => ({ ...prev, ...response.data.security }))
          }

          // Charger les paramètres de notifications
          if (response.data.notifications) {
            setNotificationSettings((prev) => ({ ...prev, ...response.data.notifications }))
          }
        }
      } catch (err: any) {
        error("Erreur de chargement", err.message || "Impossible de charger les paramètres")
      } finally {
        setInitialLoading(false)
      }
    }

    loadSettings()
  }, [error])

  const handleSaveSettings = async (settingsType: string) => {
    try {
      setLoading(true)

      let dataToSave = {}
      let categoryName = ""

      switch (settingsType) {
        case "general":
          dataToSave = generalSettings
          categoryName = "général"
          break
        case "email":
          dataToSave = emailSettings
          categoryName = "email"
          break
        case "security":
          dataToSave = securitySettings
          categoryName = "sécurité"
          break
        case "notifications":
          dataToSave = notificationSettings
          categoryName = "notifications"
          break
        default:
          throw new Error("Type de paramètres non reconnu")
      }

      const response = await apiService.updateSettings(settingsType, dataToSave)

      if (response.success) {
        success("Paramètres sauvegardés", `Les paramètres ${categoryName} ont été mis à jour avec succès`)
      } else {
        throw new Error(response.message || "Erreur lors de la sauvegarde")
      }
    } catch (err: any) {
      error("Erreur de sauvegarde", err.message || `Impossible de sauvegarder les paramètres ${settingsType}`)
    } finally {
      setLoading(false)
    }
  }

  const handleTestEmail = async () => {
    try {
      setTestEmailLoading(true)

      const response = await apiService.testEmailSettings({
        ...emailSettings,
        test_email: generalSettings.admin_email,
      })

      if (response.success) {
        success("Test email réussi", "L'email de test a été envoyé avec succès")
      } else {
        throw new Error(response.message || "Erreur lors du test")
      }
    } catch (err: any) {
      error("Erreur test email", err.message || "Impossible d'envoyer l'email de test")
    } finally {
      setTestEmailLoading(false)
    }
  }

  const handleDatabaseAction = async (action: string) => {
    try {
      setLoading(true)
      let response

      switch (action) {
        case "backup":
          response = await apiService.backupDatabase()
          success("Sauvegarde créée", "La sauvegarde de la base de données a été créée avec succès")
          break
        case "optimize":
          response = await apiService.optimizeDatabase()
          success("Base optimisée", "La base de données a été optimisée avec succès")
          break
        case "clear-cache":
          response = await apiService.clearCache()
          success("Cache vidé", "Le cache a été vidé avec succès")
          break
        case "reset":
          if (
            window.confirm(
              "Êtes-vous sûr de vouloir réinitialiser tous les paramètres ? Cette action est irréversible.",
            )
          ) {
            response = await apiService.resetSettings()
            success("Paramètres réinitialisés", "Tous les paramètres ont été réinitialisés")
            window.location.reload()
          }
          break
      }
    } catch (err: any) {
      error("Erreur d'action", err.message || "Impossible d'exécuter l'action")
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: "general", name: "Général", icon: <GlobeIcon className="w-4 h-4" /> },
    { id: "email", name: "Email", icon: <MailIcon className="w-4 h-4" /> },
    { id: "security", name: "Sécurité", icon: <ShieldIcon className="w-4 h-4" /> },
    { id: "notifications", name: "Notifications", icon: <BellIcon className="w-4 h-4" /> },
    { id: "appearance", name: "Apparence", icon: <PaletteIcon className="w-4 h-4" /> },
    { id: "database", name: "Base de données", icon: <DatabaseIcon className="w-4 h-4" /> },
  ]

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600">Configurez votre application</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="bg-white rounded-lg shadow-sm p-4">
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition ${
                      activeTab === tab.id ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab.icon}
                    <span className="ml-3">{tab.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Paramètres généraux</h2>
                  <Button onClick={() => handleSaveSettings("general")} variant="primary" isLoading={loading}>
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>

                <div className="space-y-8">
                  {/* Site Information */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Informations du site</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du site</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={generalSettings.site_name}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, site_name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL du site</label>
                        <input
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={generalSettings.site_url}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, site_url: e.target.value })}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description du site</label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          value={generalSettings.site_description}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, site_description: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Informations de contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email principal</label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={generalSettings.admin_email}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, admin_email: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={generalSettings.phone || ""}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
                          placeholder="+237 695 674 827"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={generalSettings.address || ""}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                          placeholder="Akwa-Douala"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={generalSettings.city || ""}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, city: e.target.value })}
                          placeholder="Douala, Cameroun"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo and Branding */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Logo et image de marque</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL du logo</label>
                        <input
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={generalSettings.logo_url || ""}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, logo_url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
                        <input
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={generalSettings.favicon_url || ""}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, favicon_url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Réseaux sociaux</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                        <input
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={generalSettings.facebook_url || ""}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, facebook_url: e.target.value })}
                          placeholder="https://facebook.com/..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                        <input
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={generalSettings.twitter_url || ""}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, twitter_url: e.target.value })}
                          placeholder="https://twitter.com/..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                        <input
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={generalSettings.linkedin_url || ""}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, linkedin_url: e.target.value })}
                          placeholder="https://linkedin.com/..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
                        <input
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={generalSettings.youtube_url || ""}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, youtube_url: e.target.value })}
                          placeholder="https://youtube.com/..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                        <input
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={generalSettings.instagram_url || ""}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, instagram_url: e.target.value })}
                          placeholder="https://instagram.com/..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={generalSettings.whatsapp_number || ""}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, whatsapp_number: e.target.value })}
                          placeholder="237695674827"
                        />
                      </div>
                    </div>
                  </div>

                  {/* System Settings */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Paramètres système</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fuseau horaire</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={generalSettings.timezone}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                        >
                          <option value="Africa/Douala">Africa/Douala</option>
                          <option value="Europe/Paris">Europe/Paris</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={generalSettings.language}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                        >
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={generalSettings.maintenance_mode}
                            onChange={(e) =>
                              setGeneralSettings({ ...generalSettings, maintenance_mode: e.target.checked })
                            }
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">Mode maintenance</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Active le mode maintenance pour le site public</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === "email" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Configuration email</h2>
                  <div className="flex space-x-2">
                    <Button onClick={handleTestEmail} variant="secondary" isLoading={testEmailLoading}>
                      <TestTubeIcon className="w-4 h-4 mr-2" />
                      Tester
                    </Button>
                    <Button onClick={() => handleSaveSettings("email")} variant="primary" isLoading={loading}>
                      <SaveIcon className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Serveur SMTP</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={emailSettings.smtp_host}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Port SMTP</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={emailSettings.smtp_port}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: Number(e.target.value) })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={emailSettings.smtp_username}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtp_username: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={emailSettings.smtp_password}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtp_password: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chiffrement</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={emailSettings.smtp_encryption}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtp_encryption: e.target.value })}
                      >
                        <option value="tls">TLS</option>
                        <option value="ssl">SSL</option>
                        <option value="none">Aucun</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email expéditeur</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={emailSettings.from_email}
                        onChange={(e) => setEmailSettings({ ...emailSettings, from_email: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom expéditeur</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={emailSettings.from_name}
                        onChange={(e) => setEmailSettings({ ...emailSettings, from_name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Assurez-vous que votre serveur SMTP est correctement configuré pour éviter
                      que les emails soient marqués comme spam.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Paramètres de sécurité</h2>
                  <Button onClick={() => handleSaveSettings("security")} variant="primary" isLoading={loading}>
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={securitySettings.two_factor_auth}
                          onChange={(e) =>
                            setSecuritySettings({ ...securitySettings, two_factor_auth: e.target.checked })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Authentification à deux facteurs</span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={securitySettings.require_password_change}
                          onChange={(e) =>
                            setSecuritySettings({ ...securitySettings, require_password_change: e.target.checked })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Forcer le changement de mot de passe</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timeout de session (minutes)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={securitySettings.session_timeout}
                        onChange={(e) =>
                          setSecuritySettings({ ...securitySettings, session_timeout: Number(e.target.value) })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longueur minimale du mot de passe
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={securitySettings.password_min_length}
                        onChange={(e) =>
                          setSecuritySettings({ ...securitySettings, password_min_length: Number(e.target.value) })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tentatives de connexion max
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={securitySettings.login_attempts}
                        onChange={(e) =>
                          setSecuritySettings({ ...securitySettings, login_attempts: Number(e.target.value) })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durée de verrouillage (minutes)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={securitySettings.lockout_duration}
                        onChange={(e) =>
                          setSecuritySettings({ ...securitySettings, lockout_duration: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === "notifications" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Paramètres de notifications</h2>
                  <Button onClick={() => handleSaveSettings("notifications")} variant="primary" isLoading={loading}>
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={notificationSettings.email_notifications}
                          onChange={(e) =>
                            setNotificationSettings({ ...notificationSettings, email_notifications: e.target.checked })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Notifications par email</span>
                      </label>
                      <p className="text-xs text-gray-500 ml-6">Recevoir toutes les notifications par email</p>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={notificationSettings.new_contact_notifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              new_contact_notifications: e.target.checked,
                            })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Nouveaux contacts</span>
                      </label>
                      <p className="text-xs text-gray-500 ml-6">Notification lors de nouveaux messages de contact</p>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={notificationSettings.project_update_notifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              project_update_notifications: e.target.checked,
                            })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Mises à jour de projets</span>
                      </label>
                      <p className="text-xs text-gray-500 ml-6">Notification lors de mises à jour de projets</p>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={notificationSettings.system_notifications}
                          onChange={(e) =>
                            setNotificationSettings({ ...notificationSettings, system_notifications: e.target.checked })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Notifications système</span>
                      </label>
                      <p className="text-xs text-gray-500 ml-6">Notifications importantes du système</p>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={notificationSettings.weekly_reports}
                          onChange={(e) =>
                            setNotificationSettings({ ...notificationSettings, weekly_reports: e.target.checked })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Rapports hebdomadaires</span>
                      </label>
                      <p className="text-xs text-gray-500 ml-6">Recevoir un rapport d'activité chaque semaine</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Apparence</h2>
                  <Button onClick={() => handleSaveSettings("appearance")} variant="primary" isLoading={loading}>
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="text-center py-8">
                    <PaletteIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Personnalisation de l'apparence</h3>
                    <p className="text-gray-600">
                      Les options de personnalisation de l'apparence seront disponibles dans une prochaine version.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Database Settings */}
            {activeTab === "database" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Base de données</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-blue-900 mb-2">Sauvegarde</h3>
                      <p className="text-sm text-blue-700 mb-4">Créer une sauvegarde complète de la base de données</p>
                      <Button
                        onClick={() => handleDatabaseAction("backup")}
                        variant="primary"
                        size="sm"
                        isLoading={loading}
                      >
                        <DatabaseIcon className="w-4 h-4 mr-2" />
                        Créer une sauvegarde
                      </Button>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-yellow-900 mb-2">Optimisation</h3>
                      <p className="text-sm text-yellow-700 mb-4">Optimiser les tables de la base de données</p>
                      <Button
                        onClick={() => handleDatabaseAction("optimize")}
                        variant="warning"
                        size="sm"
                        isLoading={loading}
                      >
                        <DatabaseIcon className="w-4 h-4 mr-2" />
                        Optimiser
                      </Button>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-red-900 mb-2">Zone de danger</h3>
                    <p className="text-sm text-red-700 mb-4">
                      Actions irréversibles qui peuvent affecter votre application
                    </p>
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleDatabaseAction("clear-cache")}
                        variant="danger"
                        size="sm"
                        isLoading={loading}
                      >
                        Vider le cache
                      </Button>
                      <Button
                        onClick={() => handleDatabaseAction("reset")}
                        variant="danger"
                        size="sm"
                        isLoading={loading}
                      >
                        Réinitialiser les paramètres
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
