import { SEO } from "../components/SEO"
import { useStaticPage } from "../hooks/useApi"
import { FileTextIcon } from "lucide-react"

export function Terms() {
  const { data: pageData, loading } = useStaticPage("terms")

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
        title={pageData?.meta_title || "Conditions d'Utilisation - AME Construction"}
        description={pageData?.meta_description || "Consultez nos conditions d'utilisation et nos termes de service."}
      />

      <div className="bg-[#0a1e37] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <FileTextIcon className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold text-center">{pageData?.title || "Conditions d'Utilisation"}</h1>
          <p className="text-center mt-4 max-w-2xl mx-auto">
            {pageData?.excerpt || "Nos conditions d'utilisation et termes de service"}
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
                <p>Les conditions d'utilisation seront bientôt disponibles.</p>
                <p>Pour toute question, veuillez nous contacter.</p>
              `,
            }}
          />
        </div>
      </div>
    </div>
  )
}
