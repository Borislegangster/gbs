import { Helmet } from "react-helmet-async"

interface SEOProps {
  title: string
  description: string
  image?: string
  url?: string
  type?: string
}

export function SEO({ title, description, image, url, type = "website" }: SEOProps) {
  const siteTitle = "AME Construction"
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const siteUrl = process.env.REACT_APP_SITE_URL || "https://ameconstruction.com"
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl
  const defaultImage = `${siteUrl}/assets/logo.png`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || defaultImage} />

      {/* Additional */}
      <link rel="canonical" href={fullUrl} />
      <meta name="robots" content="index, follow" />
    </Helmet>
  )
}
