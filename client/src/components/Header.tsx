"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useSiteSettings } from "../hooks/useApi"
import { MenuIcon, XIcon, UserIcon, LogOutIcon, SettingsIcon } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { data: siteSettings, loading: settingsLoading } = useSiteSettings()

  const navigation = [
    { name: "Accueil", href: "/" },
    { name: "À Propos", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Projets", href: "/projects" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
      setIsUserMenuOpen(false)
    } catch (error) {
      navigate("/")
      setIsUserMenuOpen(false)
    }
  }

  useEffect(() => {
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [location])

  // Affichage du logo ou nom du site depuis les paramètres
  const renderLogo = () => {
    if (settingsLoading) {
      return <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
    }

    if (siteSettings?.logo_url) {
      return (
        <img
          src={siteSettings.logo_url || "/placeholder.svg"}
          alt={siteSettings.site_name || "AME Construction"}
          className="h-10 w-auto"
          onError={(e) => {
            // Fallback si l'image ne charge pas
            e.currentTarget.style.display = "none"
            e.currentTarget.nextElementSibling?.classList.remove("hidden")
          }}
        />
      )
    }

    return <div className="text-2xl font-bold text-[#0a1e37]">{siteSettings?.site_name || "AME Construction"}</div>
  }

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            {renderLogo()}
            {siteSettings?.logo_url && (
              <div className="hidden text-2xl font-bold text-[#0a1e37]">
                {siteSettings?.site_name || "AME Construction"}
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-gray-700 hover:text-[#3498db] transition-colors font-medium ${
                  location.pathname === item.href ? "text-[#3498db]" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-[#3498db] transition-colors"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">{user.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Mon Profil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOutIcon className="h-4 w-4 mr-2" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-[#3498db] transition-colors font-medium">
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-[#3498db] text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 hover:text-[#3498db] transition-colors"
            >
              {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-gray-700 hover:text-[#3498db] transition-colors font-medium ${
                    location.pathname === item.href ? "text-[#3498db]" : ""
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {!user && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Link to="/login" className="text-gray-700 hover:text-[#3498db] transition-colors font-medium">
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#3498db] text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-center"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
