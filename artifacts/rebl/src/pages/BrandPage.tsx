import { useParams } from 'react-router-dom'

export default function BrandPage() {
  const { slug } = useParams()
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0F0F1A', color: '#F1FAEE' }}>
      <h1 className="text-2xl font-bold">Brand: {slug}</h1>
    </div>
  )
}
