import { useParams } from 'react-router-dom'

export default function BrandSubdomainPage() {
  const { brandSlug } = useParams()
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0F0F1A', color: '#F1FAEE' }}>
      <h1 className="text-2xl font-bold">Brand Subdomain: {brandSlug}</h1>
    </div>
  )
}
