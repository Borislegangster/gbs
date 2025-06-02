import { useTestimonials } from "../hooks/useApi"
import { useHomeContent } from "../hooks/useApi"
import { StarIcon, QuoteIcon } from "lucide-react"

export function TestimonialSection() {
  const { data: testimonials, loading: testimonialsLoading } = useTestimonials(true)
  const { data: content, loading: contentLoading } = useHomeContent()

  if (testimonialsLoading || contentLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498db] mx-auto"></div>
        </div>
      </section>
    )
  }

  if (!testimonials || testimonials.length === 0) {
    return null
  }

  const testimonialsContent = content?.testimonials || {
    title: "Ce que disent nos clients",
    subtitle: "Découvrez les témoignages de nos clients satisfaits",
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a1e37] mb-4">{testimonialsContent.title}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{testimonialsContent.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.slice(0, 6).map((testimonial: any) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-lg p-6 relative">
              <QuoteIcon className="absolute top-4 right-4 h-8 w-8 text-[#3498db] opacity-20" />

              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>

              <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>

              <div className="flex items-center">
                {testimonial.client_photo ? (
                  <img
                    src={testimonial.client_photo || "/placeholder.svg"}
                    alt={testimonial.client_name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#3498db] flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.client_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-[#0a1e37]">{testimonial.client_name}</h4>
                  {testimonial.client_position && testimonial.client_company && (
                    <p className="text-sm text-gray-500">
                      {testimonial.client_position} chez {testimonial.client_company}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
