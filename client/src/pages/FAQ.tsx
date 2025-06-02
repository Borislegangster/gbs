"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { SEO } from "../components/SEO"
import { useFAQs } from "../hooks/useApi"
import { SearchIcon, ChevronDownIcon, ChevronUpIcon, HelpCircleIcon, ArrowRightIcon } from "lucide-react"

export function FAQ() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [openQuestions, setOpenQuestions] = useState<number[]>([])
  const { data: faqs, loading, error } = useFAQs()

  const toggleQuestion = (index: number) => {
    setOpenQuestions((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const categories = [
    { id: "all", label: "Toutes les questions" },
    { id: "general", label: "Général" },
    { id: "construction", label: "Construction" },
    { id: "services", label: "Services" },
    { id: "delais", label: "Délais" },
    { id: "payment", label: "Paiement" },
    { id: "garanties", label: "Garanties" },
  ]

  const filteredFaqs =
    faqs?.filter((faq: any) => {
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = activeCategory === "all" || faq.category === activeCategory
      return matchesSearch && matchesCategory
    }) || []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498db]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Questions Fréquentes - AME Construction"
        description="Trouvez les réponses à vos questions sur nos services de construction et rénovation. FAQ complète sur nos prestations, processus et garanties."
      />

      {/* Hero Section */}
      <div className="bg-[#0a1e37] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <HelpCircleIcon className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold text-center mb-6">Questions Fréquentes</h1>
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-lg text-gray-900 pr-12"
            />
            <SearchIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center px-6 py-3 rounded-full transition ${
                activeCategory === category.id ? "bg-[#3498db] text-white" : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto">
          {filteredFaqs.map((faq: any, index: number) => (
            <div key={faq.id} className="mb-4">
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition flex justify-between items-center text-left"
              >
                <span className="font-semibold text-[#0a1e37] pr-4">{faq.question}</span>
                {openQuestions.includes(index) ? (
                  <ChevronUpIcon className="w-5 h-5 text-[#3498db] flex-shrink-0" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-[#3498db] flex-shrink-0" />
                )}
              </button>
              {openQuestions.includes(index) && (
                <div className="bg-white px-6 py-4 rounded-b-lg shadow-sm border-t">
                  <div
                    className="text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              )}
            </div>
          ))}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune question trouvée</h3>
              <p className="text-gray-600">Essayez de modifier vos critères de recherche.</p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="max-w-3xl mx-auto mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4 text-[#0a1e37]">Vous n'avez pas trouvé votre réponse ?</h2>
          <p className="text-gray-600 mb-6">Notre équipe est là pour répondre à toutes vos questions.</p>
          <Link
            to="/contact"
            className="bg-[#3498db] hover:bg-[#0a1e37] text-white px-8 py-3 rounded transition inline-flex items-center"
          >
            Contactez-nous
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  )
}
