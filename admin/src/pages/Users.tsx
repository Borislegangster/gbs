"use client"
import { useState, useEffect } from "react"
import {
  SearchIcon,
  FilterIcon,
  TrashIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  ShieldIcon,
  AlertTriangleIcon,
  PowerIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { apiService } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { useNotification } from "../contexts/NotificationContext"

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: "admin" | "editor" | "user"
  status: "active" | "inactive"
  is_active: boolean
  email_verified_at: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export function Users() {
  const { isAdmin } = useAuth()
  const { success, error, warning, info } = useNotification()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showBanModal, setShowBanModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [banReason, setBanReason] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Rediriger les editors vers le dashboard
  useEffect(() => {
    if (!isAdmin()) {
      warning("Accès refusé", "Seuls les administrateurs peuvent accéder à la gestion des utilisateurs.")
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 2000)
      return
    }
  }, [isAdmin, warning])

  useEffect(() => {
    if (isAdmin()) {
      loadUsers()
    }
  }, [isAdmin])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getUsers()
      setUsers(response.users || [])
      info("Utilisateurs chargés", `${response.users?.length || 0} utilisateurs trouvés.`)
    } catch (err: any) {
      console.error("Failed to load users:", err)
      error("Erreur de chargement", "Impossible de charger la liste des utilisateurs.")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleUpdateRole = async (userId: string, newRole: "user" | "editor" | "admin") => {
    try {
      setActionLoading(`role-${userId}`)
      const user = users.find((u) => u.id === userId)
      await apiService.updateUserRole(userId, newRole)
      await loadUsers()
      success(
        "Rôle mis à jour",
        `Le rôle de ${user?.name} a été changé vers "${newRole === "admin" ? "Administrateur" : newRole === "editor" ? "Éditeur" : "Utilisateur"}".`,
      )
    } catch (err: any) {
      console.error("Failed to update user role:", err)
      error("Erreur de mise à jour", err.message || "Impossible de mettre à jour le rôle de l'utilisateur.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateStatus = async (userId: string, newStatus: "active" | "inactive") => {
    try {
      setActionLoading(`status-${userId}`)
      const user = users.find((u) => u.id === userId)
      await apiService.updateUserStatus(userId, newStatus)
      await loadUsers()
      success("Statut mis à jour", `${user?.name} est maintenant ${newStatus === "active" ? "actif" : "inactif"}.`)
    } catch (err: any) {
      console.error("Failed to update user status:", err)
      error("Erreur de mise à jour", err.message || "Impossible de mettre à jour le statut de l'utilisateur.")
    } finally {
      setActionLoading(null)
    }
  }

  // NOUVELLE FONCTION pour activer/désactiver le compte
  const handleToggleAccount = async (userId: string, isActive: boolean) => {
    try {
      setActionLoading(`account-${userId}`)
      const user = users.find((u) => u.id === userId)
      await apiService.toggleUserAccount(userId, isActive)
      await loadUsers()
      success(
        `Compte ${isActive ? "activé" : "désactivé"}`,
        `Le compte de ${user?.name} a été ${isActive ? "activé" : "désactivé"} avec succès.`,
      )
    } catch (err: any) {
      console.error("Failed to toggle user account:", err)
      error("Erreur d'activation", err.message || "Impossible de modifier l'état du compte.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleBanUser = async () => {
    if (!selectedUser) return

    try {
      setActionLoading(`ban-${selectedUser.id}`)
      await apiService.banUser(selectedUser.id, banReason)
      await loadUsers()
      setShowBanModal(false)
      setSelectedUser(null)
      setBanReason("")
      success(
        "Utilisateur banni",
        `${selectedUser.name} a été banni définitivement. Il ne pourra plus se connecter ou créer un nouveau compte.`,
      )
    } catch (err: any) {
      console.error("Failed to ban user:", err)
      error("Erreur de bannissement", err.message || "Impossible de bannir l'utilisateur.")
    } finally {
      setActionLoading(null)
    }
  }

  const openBanModal = (user: User) => {
    setSelectedUser(user)
    setShowBanModal(true)
    warning("Action critique", "Vous êtes sur le point de bannir définitivement un utilisateur.")
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "editor":
        return "bg-blue-100 text-blue-800"
      case "user":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getAccountColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Jamais"
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  // Redirection si pas admin
  if (!isAdmin()) {
    return (
      <div className="text-center py-12">
        <AlertTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
        <p className="text-gray-600">Seuls les administrateurs peuvent accéder à la gestion des utilisateurs.</p>
        <p className="text-sm text-gray-500 mt-2">Redirection en cours...</p>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-600">Gérez les utilisateurs et leurs permissions (Admin uniquement)</p>
        </div>
        <div className="flex items-center space-x-2">
          <ShieldIcon className="w-5 h-5 text-red-500" />
          <span className="text-sm font-medium text-red-600">Accès Administrateur</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateur</option>
            <option value="editor">Éditeur</option>
            <option value="user">Utilisateur</option>
          </select>

          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>

          <Button variant="ghost">
            <FilterIcon className="w-4 h-4 mr-2" />
            Filtres avancés
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">
                          Créé le {formatDate(user.created_at)}
                          {user.email_verified_at && <span className="ml-2 text-green-600">✓ Vérifié</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <MailIcon className="w-4 h-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value as any)}
                      disabled={actionLoading === `role-${user.id}`}
                      className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${getRoleColor(user.role)} border-0 cursor-pointer`}
                    >
                      <option value="user">Utilisateur</option>
                      <option value="editor">Éditeur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleUpdateStatus(user.id, user.status === "active" ? "inactive" : "active")}
                      disabled={actionLoading === `status-${user.id}`}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${getStatusColor(user.status)}`}
                    >
                      {user.status === "active" ? "Actif" : "Inactif"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleAccount(user.id, !user.is_active)}
                      disabled={actionLoading === `account-${user.id}`}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${getAccountColor(user.is_active)}`}
                    >
                      {user.is_active ? (
                        <>
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Activé
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-3 h-3 mr-1" />
                          Désactivé
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(user.last_login_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleAccount(user.id, !user.is_active)}
                        disabled={actionLoading === `account-${user.id}`}
                        title={user.is_active ? "Désactiver le compte" : "Activer le compte"}
                      >
                        <PowerIcon className={`w-4 h-4 ${user.is_active ? "text-red-600" : "text-green-600"}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openBanModal(user)}
                        disabled={actionLoading === `ban-${user.id}` || user.role === "admin"}
                      >
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

      {/* Ban Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600">Bannir l'utilisateur</h2>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir bannir <strong>{selectedUser.name}</strong> ({selectedUser.email}) ?
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Cette action est irréversible. L'utilisateur ne pourra plus se connecter ou créer un nouveau compte avec
              cette adresse email ou ce numéro de téléphone.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Raison du bannissement</label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Expliquez la raison du bannissement..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowBanModal(false)
                  setSelectedUser(null)
                  setBanReason("")
                }}
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleBanUser}
                isLoading={actionLoading === `ban-${selectedUser.id}`}
                className="bg-red-600 hover:bg-red-700"
              >
                Bannir définitivement
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
