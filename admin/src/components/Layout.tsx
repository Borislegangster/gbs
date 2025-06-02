"use client"

import { useState } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  WrenchIcon,
  FileTextIcon,
  MailIcon,
  ImageIcon,
  StarIcon,
  HelpCircleIcon,
  SendIcon,
  FileIcon,
  SettingsIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
  LayoutDashboardIcon,
  UserIcon,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboardIcon },
  { name: "Contenu Accueil", href: "/home-content", icon: HomeIcon },
  { name: "Utilisateurs", href: "/users", icon: UsersIcon },
  { name: "Projets", href: "/projects", icon: FolderIcon },
  { name: "Services", href: "/services", icon: WrenchIcon },
  { name: "Blog", href: "/blog", icon: FileTextIcon },
  { name: "Contacts", href: "/contacts", icon: MailIcon },
  { name: "Médias", href: "/media", icon: ImageIcon },
  { name: "Témoignages", href: "/testimonials", icon: StarIcon },
  { name: "FAQ", href: "/faq", icon: HelpCircleIcon },
  { name: "Newsletter", href: "/newsletter", icon: SendIcon },
  { name: "Pages statiques", href: "/static-pages", icon: FileIcon },
  { name: "Paramètres", href: "/settings", icon: SettingsIcon },
]

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isCurrentPath = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <h1 className="text-xl font-semibold text-gray-900">
                {navigation.find((item) => item.href === location.pathname)?.name || "Dashboard"}
              </h1>
            </div>

            <div className="ml-4 flex items-center md:ml-6">
              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <button
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <span className="ml-3 text-gray-700 text-sm font-medium hidden md:block">{user?.name}</span>
                  </button>
                </div>

                {profileDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-gray-500">{user?.email}</div>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Mon profil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOutIcon className="inline h-4 w-4 mr-2" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )

  function SidebarContent() {
    return (
      <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link to="/" className="text-primary text-2xl font-bold">
              <span className="bg-primary text-white px-2 py-1 rounded">AME</span>
              <span className="ml-2 text-gray-900">Admin</span>
            </Link>
          </div>

          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const current = isCurrentPath(item.href)

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    current ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      current ? "text-white" : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    )
  }
}
