"use client"

import { useState } from "react"
import { PlayIcon } from "lucide-react"
import { YoutubeModal } from "./YoutubeModal"
import { useHomeContent } from "../hooks/useApi"

export function PromiseSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: content, loading, error } = useHomeContent()

  if (loading) {
    return (
      <section className="py-20 bg-[#0a1e37] text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498db] mx-auto"></div>
        </div>
      </section>
    )
  }

  if (error) {
    console.warn("Promise section error:", error)
  }

  const promiseContent = content?.promise || {
    title: "Notre promesse",
    description:
      "Chez AME, nous nous engageons à fournir des services de construction et de gestion de projets de la plus haute qualité. Notre équipe de professionnels qualifiés travaille avec précision et attention aux détails pour garantir que chaque projet soit livré à temps et dans le respect du budget. Nous utilisons des matériaux de qualité supérieure et des techniques de construction modernes pour créer des structures durables et esthétiques.",
    video_id: "YOUR_VIDEO_ID",
    background_image: "/assets/pro1.jpg",
    cta_text: "En Savoir Plus",
    cta_url: "https://youtube.com/@ameConstruction",
  }

  return (
    <section className="py-20 bg-[#0a1e37] text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold mb-6">{promiseContent.title}</h2>
            <div className="mb-6 text-gray-300">
              {promiseContent.description ? (
                promiseContent.description.split("\n").map(
                  (paragraph, index) =>
                    paragraph.trim() && (
                      <p key={index} className="mb-4">
                        {paragraph.trim()}
                      </p>
                    ),
                )
              ) : (
                <p>Contenu de promesse non disponible.</p>
              )}
            </div>
            <a
              href={promiseContent.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#3498db] hover:bg-white hover:text-[#0a1e37] text-white px-6 py-3 rounded transition inline-block"
            >
              {promiseContent.cta_text}
            </a>
          </div>
          <div className="w-full md:w-1/2 md:pl-12 flex justify-center">
            <div className="relative w-full max-w-md aspect-video bg-gray-800 flex items-center justify-center rounded-lg overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-50"
                style={{
                  backgroundImage: `url('${promiseContent.background_image}')`,
                }}
              ></div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="relative z-10 bg-white rounded-full p-4 hover:bg-gray-200 transition"
                disabled={!promiseContent.video_id || promiseContent.video_id === "YOUR_VIDEO_ID"}
              >
                <PlayIcon className="h-8 w-8 text-[#3498db]" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {promiseContent.video_id && promiseContent.video_id !== "YOUR_VIDEO_ID" && (
        <YoutubeModal videoId={promiseContent.video_id} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </section>
  )
}
