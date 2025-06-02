"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useNotification } from "../contexts/NotificationContext"
import { UserIcon, MailIcon, ShieldIcon, EditIcon, SaveIcon, KeyIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import { Button } from "../components/ui/Button"

export function Profile() {
  const { user, updateProfile } = useAuth()
  const { success, error } = useNotification()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await updateProfile(formData)
      setIsEditing(false)
      success("Profil mis à jour", "Vos informations ont été mises à jour avec succès.")
    } catch (err: any) {
      error("Erreur de mise à jour", err.message || "Impossible de mettre à jour le profil.")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error("Erreur de mot de passe", "Les nouveaux mots de passe ne correspondent pas.")
      return
    }

    if (passwordData.newPassword.length < 8) {
      error("Mot de passe trop court", "Le nouveau mot de passe doit contenir au moins 8 caractères.")
      return
    }

    try {
      setLoading(true)
      await updateProfile({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setIsChangingPassword(false)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      success("Mot de passe mis à jour", "Votre mot de passe a été modifié avec succès.")
    } catch (err: any) {
      error("Erreur de changement", err.message || "Impossible de changer le mot de passe.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    })
    setIsEditing(false)
  }

  const handleCancelPassword = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setIsChangingPassword(false)
  }

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles et votre sécurité</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="primary" size="sm">
                <EditIcon className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" isLoading={loading}>
                  <SaveIcon className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nom</p>
                    <p className="text-lg text-gray-900">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MailIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-lg text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <ShieldIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rôle</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role === "admin" ? "Administrateur" : "Éditeur"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 text-gray-400">📅</div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Membre depuis</p>
                    <p className="text-lg text-gray-900">{new Date(user.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
              </div>

              {user.permissions && user.permissions.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Permissions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {user.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {permission.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sécurité */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
            {!isChangingPassword && (
              <Button onClick={() => setIsChangingPassword(true)} variant="primary" size="sm">
                <KeyIcon className="w-4 h-4 mr-2" />
                Changer le mot de passe
              </Button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {showPasswords.current ? (
                      <EyeOffIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {showPasswords.new ? (
                      <EyeOffIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPasswords.confirm ? (
                      <EyeOffIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="ghost" onClick={handleCancelPassword}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" isLoading={loading}>
                  <SaveIcon className="w-4 h-4 mr-2" />
                  Changer le mot de passe
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Mot de passe</h4>
                <p className="text-sm text-gray-600">
                  Votre mot de passe a été mis à jour pour la dernière fois le{" "}
                  {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString("fr-FR") : "jamais"}.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Conseils de sécurité</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Utilisez un mot de passe unique et complexe</li>
                  <li>• Changez votre mot de passe régulièrement</li>
                  <li>• Ne partagez jamais vos identifiants</li>
                  <li>• Déconnectez-vous après chaque session</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
