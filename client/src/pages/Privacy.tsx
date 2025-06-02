import { SEO } from "../components/SEO"
import { useStaticPage } from "../hooks/useApi"
import { ShieldIcon } from "lucide-react"

export function Privacy() {
  const { data: pageData, loading } = useStaticPage("privacy")

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498db]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={pageData?.meta_title || "Politique de Confidentialité - AME Construction"}
        description={
          pageData?.meta_description ||
          "Consultez notre politique de confidentialité et la protection de vos données personnelles."
        }
      />

      <div className="bg-[#0a1e37] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <ShieldIcon className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold text-center">{pageData?.title || "Politique de Confidentialité"}</h1>
          <p className="text-center mt-4 max-w-2xl mx-auto">
            {pageData?.excerpt || "Protection et utilisation de vos données personnelles"}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg p-8 shadow-sm">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html:
                pageData?.content ||
                `
                <p>Notre politique de confidentialité sera bientôt disponible.</p>
                <p>Nous nous engageons à protéger vos données personnelles.</p>
              `,
            }}
          />
        </div>
      </div>
    </div>
  )
}
