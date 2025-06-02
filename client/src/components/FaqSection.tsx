"use client"

import { useState } from "react"
import { useFAQs } from "../hooks/useApi"
import { useHomeContent } from "../hooks/useApi"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

export function FaqSection() {
  const { data: faqs, loading: faqsLoading } = useFAQs()
  const { data: content, loading: contentLoading } = useHomeContent()
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  if (faqsLoading || contentLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498db] mx-auto"></div>
        </div>
      </section>
    )
  }

  if (!faqs || faqs.length === 0) {
    return null
  }

  const faqContent = content?.faq || {
    title: "Questions Fréquentes",
    subtitle: "Trouvez rapidement les réponses à vos questions",
    cta_text: "Voir toutes les questions",
    cta_url: "/faq",
  }

  // Show only featured FAQs on home page
  const featuredFaqs = faqs.filter((faq: any) => faq.featured).slice(0, 6)

  if (featuredFaqs.length === 0) {
    return null
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a1e37] mb-4">{faqContent.title}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{faqContent.subtitle}</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {featuredFaqs.map((faq: any, index: number) => (
              <div key={faq.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-[#0a1e37] pr-4">{faq.question}</h3>
                  {openItems.includes(index) ? (
                    <ChevronUpIcon className="h-5 w-5 text-[#3498db] flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-[#3498db] flex-shrink-0" />
                  )}
                </button>

                {openItems.includes(index) && (
                  <div className="px-6 pb-4">
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href={faqContent.cta_url}
              className="text-[#3498db] hover:text-blue-600 font-medium inline-flex items-center"
            >
              {faqContent.cta_text}
              <ChevronDownIcon className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
