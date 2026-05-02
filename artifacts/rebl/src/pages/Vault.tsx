import { useParams } from 'react-router-dom'

export default function Vault() {
  const { username } = useParams()
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0F0F1A', color: '#F1FAEE' }}>
      <h1 className="text-2xl font-bold">Vault: {username}</h1>
    </div>
  )
}
