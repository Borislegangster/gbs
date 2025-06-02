import { useHomeContent } from "../hooks/useApi"

export function StatsSection() {
  const { data: content, loading, error } = useHomeContent()

  if (loading) {
    return (
      <div className="py-16 bg-[#0a1e37]">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498db] mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error) {
    console.warn("Stats section error:", error)
  }

  const statsContent = content?.stats || {
    projects_completed: 150,
    years_experience: 15,
    happy_clients: 200,
    team_members: 25,
  }

  const stats = [
    {
      number: statsContent.projects_completed || 150,
      label: "Projets réalisés",
      suffix: "+",
    },
    {
      number: statsContent.years_experience || 15,
      label: "Années d'expérience",
      suffix: "",
    },
    {
      number: statsContent.happy_clients || 200,
      label: "Clients satisfaits",
      suffix: "+",
    },
    {
      number: statsContent.team_members || 25,
      label: "Membres de l'équipe",
      suffix: "",
    },
  ]

  return (
    <section className="py-16 bg-[#0a1e37]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center text-white">
              <div className="text-4xl md:text-5xl font-bold text-[#3498db] mb-2">
                {stat.number}
                {stat.suffix}
              </div>
              <div className="text-lg text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
