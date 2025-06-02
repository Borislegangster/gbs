export interface Project {
  id: string
  title: string
  slug: string
  description: string
  status: "ongoing" | "completed" | "paused" | "planning"
  progress: number
  location: string
  start_date: string
  end_date: string
  featured_image: string
  gallery: string[]
  specifications: {
    surface: string
    duration: string
  }
  budget: number
  team_size: number
  client_name: string
  category: string
  milestones: Array<{
    title: string
    date: string
    completed: boolean
  }>
}

export type ProjectStatus = "all" | "ongoing" | "completed" | "paused" | "planning"
export type ProjectCategory = "Industriel" | "Commercial" | "Résidentiel" | "Institutionnel" | "Médical"
