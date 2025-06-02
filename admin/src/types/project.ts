export interface Project {
  id: string
  title: string
  slug: string
  description: string
  category: string
  status: "ongoing" | "completed" | "paused" | "planning"
  progress: number
  location: string
  start_date: string
  end_date: string
  budget: number
  team_size: number
  client_name: string
  featured_image: string
  gallery: string[]
  specifications: {
    surface: string
    duration: string
  }
  milestones: Array<{
    title: string
    date: string
    completed: boolean
  }>
  featured: boolean
  published: boolean
  created_at: string
  updated_at: string
}

export interface ProjectFormData {
  title: string
  description: string
  category: string
  status: "ongoing" | "completed" | "paused" | "planning"
  progress: number
  location: string
  start_date: string
  end_date: string
  budget: number
  team_size: number
  client_name: string
  featured_image: string
  gallery: string[]
  specifications: {
    surface: string
    duration: string
  }
  milestones: Array<{
    title: string
    date: string
    completed: boolean
  }>
  featured: boolean
  published: boolean
}

export type ProjectStatus = "ongoing" | "completed" | "paused" | "planning"
export type ProjectCategory = "Résidentiel" | "Commercial" | "Industriel" | "Institutionnel" | "Médical"
