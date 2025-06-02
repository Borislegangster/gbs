import {
  UserIcon,
  AwardIcon,
  PhoneIcon,
  BuildingIcon,
  PenToolIcon as ToolIcon,
  ShieldIcon,
  ClockIcon,
  CheckIcon,
  StarIcon,
  HeartIcon,
} from "lucide-react"
import { useHomeContent } from "../hooks/useApi"

export function FeaturesSection() {
  const { data: content, loading, error } = useHomeContent()

  if (loading) {
    return (
      <section className="bg-[#3498db] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </section>
    )
  }

  if (error) {
    console.warn("Features section error:", error)
  }

  const featuresContent = content?.features || {
    title: null,
    subtitle: null,
    items: [
      {
        icon: "UserIcon",
        title: "Qualité Professionnelle",
        description:
          "Nos experts qualifiés s'engagent à fournir des services de construction de la plus haute qualité pour tous vos projets.",
        link_text: "En savoir plus",
        link_url: "#",
      },
      {
        icon: "AwardIcon",
        title: "Travail De Qualité",
        description:
          "Nous nous engageons à fournir un travail exceptionnel, en utilisant les meilleurs matériaux et techniques de construction.",
        link_text: "En savoir plus",
        link_url: "#",
      },
      {
        icon: "PhoneIcon",
        title: "Assistance 24/7",
        description:
          "Notre équipe est disponible à tout moment pour répondre à vos questions et résoudre vos problèmes rapidement.",
        link_text: "En savoir plus",
        link_url: "#",
      },
    ],
  }

  const getIcon = (iconName: string) => {
    const iconMap = {
      UserIcon,
      AwardIcon,
      PhoneIcon,
      BuildingIcon,
      ToolIcon,
      ShieldIcon,
      ClockIcon,
      CheckIcon,
      StarIcon,
      HeartIcon,
    }
    return iconMap[iconName as keyof typeof iconMap] || UserIcon
  }

  return (
    <section className="bg-[#3498db] text-white py-12">
      <div className="container mx-auto px-4">
        {(featuresContent.title || featuresContent.subtitle) && (
          <div className="text-center mb-8">
            {featuresContent.title && <h2 className="text-3xl font-bold mb-4">{featuresContent.title}</h2>}
            {featuresContent.subtitle && <p className="text-xl text-blue-100">{featuresContent.subtitle}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuresContent.items.map((feature, index) => {
            const IconComponent = getIcon(feature.icon)
            return (
              <div key={index} className="flex p-6 hover:bg-blue-600 transition">
                <div className="mr-4">
                  <div className="bg-white p-3 rounded-full">
                    <IconComponent className="h-8 w-8 text-[#3498db]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm mb-4">{feature.description}</p>
                  {feature.link_text && feature.link_url && (
                    <a href={feature.link_url} className="text-sm underline hover:no-underline">
                      {feature.link_text}
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
