import { Link } from "react-router-dom"
import { useSiteSettings } from "../hooks/useApi"
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  InstagramIcon,
  YoutubeIcon,
} from "lucide-react"

export function Footer() {
  const { data: siteSettings, loading: settingsLoading } = useSiteSettings()

  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: "Accueil", href: "/" },
    { name: "À Propos", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Projets", href: "/projects" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ]

  const legalLinks = [
    { name: "Mentions Légales", href: "/terms" },
    { name: "Politique de Confidentialité", href: "/privacy" },
    { name: "Politique des Cookies", href: "/cookies" },
    { name: "FAQ", href: "/faq" },
    { name: "Aide", href: "/help" },
  ]

  const socialLinks = [
    {
      name: "Facebook",
      href: siteSettings?.facebook_url || "#",
      icon: FacebookIcon,
      show: !!siteSettings?.facebook_url,
    },
    {
      name: "Twitter",
      href: siteSettings?.twitter_url || "#",
      icon: TwitterIcon,
      show: !!siteSettings?.twitter_url,
    },
    {
      name: "LinkedIn",
      href: siteSettings?.linkedin_url || "#",
      icon: LinkedinIcon,
      show: !!siteSettings?.linkedin_url,
    },
    {
      name: "Instagram",
      href: siteSettings?.instagram_url || "#",
      icon: InstagramIcon,
      show: !!siteSettings?.instagram_url,
    },
    {
      name: "YouTube",
      href: siteSettings?.youtube_url || "#",
      icon: YoutubeIcon,
      show: !!siteSettings?.youtube_url,
    },
  ].filter((social) => social.show)

  if (settingsLoading) {
    return (
      <footer className="bg-[#0a1e37] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-6 bg-gray-600 rounded w-3/4"></div>
                  <div className="space-y-2">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-700 rounded w-full"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-[#0a1e37] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {siteSettings?.logo_url ? (
                <img
                  src={siteSettings.logo_url || "/placeholder.svg"}
                  alt={siteSettings.site_name || "AME Construction"}
                  className="h-8 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.nextElementSibling?.classList.remove("hidden")
                  }}
                />
              ) : null}
              <div className={`text-2xl font-bold ${siteSettings?.logo_url ? "hidden" : ""}`}>
                {siteSettings?.site_name || "AME Construction"}
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              {siteSettings?.site_description ||
                "Expert en construction et rénovation au Cameroun. Plus de 20 ans d'expérience dans la réalisation de projets de qualité."}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-[#3498db] transition-colors"
                      aria-label={social.name}
                    >
                      <IconComponent className="h-5 w-5" />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-gray-300 hover:text-[#3498db] transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informations Légales</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-gray-300 hover:text-[#3498db] transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              {siteSettings?.address && (
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="h-5 w-5 text-[#3498db] mt-0.5 flex-shrink-0" />
                  <div className="text-gray-300 text-sm">
                    <p>{siteSettings.address}</p>
                    {siteSettings.city && <p>{siteSettings.city}</p>}
                  </div>
                </div>
              )}

              {(siteSettings?.phone || siteSettings?.whatsapp_number) && (
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-[#3498db] flex-shrink-0" />
                  <div className="text-gray-300 text-sm">
                    {siteSettings?.phone && <p>{siteSettings.phone}</p>}
                    {siteSettings?.whatsapp_number && siteSettings.whatsapp_number !== siteSettings.phone && (
                      <p>WhatsApp: {siteSettings.whatsapp_number}</p>
                    )}
                  </div>
                </div>
              )}

              {siteSettings?.admin_email && (
                <div className="flex items-center space-x-3">
                  <MailIcon className="h-5 w-5 text-[#3498db] flex-shrink-0" />
                  <div className="text-gray-300 text-sm">
                    <p>{siteSettings.admin_email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © {currentYear} {siteSettings?.site_name || "AME Construction"}. Tous droits réservés.
            </p>
            <p className="text-gray-300 text-sm mt-2 md:mt-0">
              Développé avec ❤️ par {siteSettings?.site_name || "AME Construction"}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
